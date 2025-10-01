const { LabReport, Patient, LabStaff } = require('../models');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');
const { uploadToS3, deleteFromS3, getSignedUrl } = require('../utils/s3Upload');

// Create lab report (Receptionist or Doctor can request)
const createLabReport = async (req, res, next) => {
  try {
    const { patientId, testName, testType, remarks } = req.body;

    // Verify patient exists
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const labReport = await LabReport.create({
      patientId,
      testName,
      testType,
      remarks,
      status: 'PENDING'
    });

    await labReport.populate('patientId');

    res.status(201).json({
      success: true,
      message: 'Lab report requested successfully',
      data: labReport
    });
  } catch (error) {
    next(error);
  }
};

// Get all lab reports with filters
const getAllLabReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, patientId, testType } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = parseInt(patientId);
    }

    if (testType) {
      where.testType = { $regex: testType, $options: 'i' };
    }

    const [labReports, total] = await Promise.all([
      LabReport.find(where)
        .skip(skip)
        .limit(take)
        .populate('patientId')
        .populate({ path: 'conductedBy', populate: { path: 'userId', select: 'firstName lastName email' } })
        .sort({ createdAt: -1 }),
      LabReport.countDocuments(where)
    ]);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(labReports, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get lab report by ID
const getLabReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const labReport = await LabReport.findById(id)
      .populate('patientId')
      .populate({ path: 'conductedBy', populate: { path: 'userId', select: 'firstName lastName email phone' } });

    if (!labReport) {
      return res.status(404).json({
        success: false,
        message: 'Lab report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: labReport
    });
  } catch (error) {
    next(error);
  }
};

// Update lab report (Lab Staff) - with file upload
const updateLabReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, results, remarks, reportDate } = req.body;

    // Get lab staff profile
    const labStaff = await prisma.labStaff.findUnique({
      where: { userId: req.user.id }
    });

    if (!labStaff) {
      return res.status(403).json({
        success: false,
        message: 'Lab staff profile not found'
      });
    }

    const updateData = {
      status,
      results,
      remarks,
      reportDate: reportDate ? new Date(reportDate) : undefined
    };

    // Handle file upload if present
    if (req.file) {
      try {
        const uploadResult = await uploadToS3(req.file, 'lab-reports');
        updateData.fileUrl = uploadResult.fileUrl;
        updateData.fileName = uploadResult.fileName;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'File upload failed',
          error: uploadError.message
        });
      }
    }

    // If status is being changed to IN_PROGRESS or COMPLETED, assign the lab staff
    if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
      updateData.conductedBy = labStaff._id;
    }

    const labReport = await LabReport.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('patientId')
      .populate({ path: 'conductedBy', populate: { path: 'userId', select: 'firstName lastName' } });

    res.status(200).json({
      success: true,
      message: 'Lab report updated successfully',
      data: labReport
    });
  } catch (error) {
    next(error);
  }
};

// Delete lab report (Admin only)
const deleteLabReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    await LabReport.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Lab report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get lab staff's reports
const getLabStaffReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { skip, take } = getPagination(page, limit);

    // Get lab staff profile
    const labStaff = await LabStaff.findOne({ userId: req.user.id });

    if (!labStaff) {
      return res.status(403).json({
        success: false,
        message: 'Lab staff profile not found'
      });
    }

    const where = { conductedBy: labStaff._id };

    if (status) {
      where.status = status;
    }

    const [labReports, total] = await Promise.all([
      LabReport.find(where)
        .skip(skip)
        .limit(take)
        .populate('patientId')
        .sort({ createdAt: -1 }),
      LabReport.countDocuments(where)
    ]);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(labReports, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get pending lab reports (Lab Staff)
const getPendingLabReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { skip, take } = getPagination(page, limit);

    const [labReports, total] = await Promise.all([
      LabReport.find({ status: 'PENDING' })
        .skip(skip)
        .limit(take)
        .populate('patientId')
        .sort({ createdAt: 1 }),
      LabReport.countDocuments({ status: 'PENDING' })
    ]);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(labReports, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Upload lab report file (Lab Staff)
const uploadLabReportFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get lab staff profile
    const labStaff = await LabStaff.findOne({ userId: req.user.id });

    if (!labStaff) {
      return res.status(403).json({
        success: false,
        message: 'Lab staff profile not found'
      });
    }

    // Verify lab report exists
    const existingReport = await LabReport.findById(id);

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Lab report not found'
      });
    }

    // Upload file to S3
    try {
      const uploadResult = await uploadToS3(req.file, 'lab-reports');

      // Update lab report with file URL
      const labReport = await LabReport.findByIdAndUpdate(
        id,
        {
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          status: 'COMPLETED',
          conductedBy: labStaff._id,
          reportDate: new Date()
        },
        { new: true }
      )
        .populate('patientId')
        .populate({ path: 'conductedBy', populate: { path: 'userId', select: 'firstName lastName' } });

      res.status(200).json({
        success: true,
        message: 'Lab report file uploaded successfully',
        data: labReport
      });
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: 'File upload to S3 failed',
        error: uploadError.message
      });
    }
  } catch (error) {
    next(error);
  }
};

// Download lab report file
const downloadLabReportFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const labReport = await LabReport.findById(id);

    if (!labReport) {
      return res.status(404).json({
        success: false,
        message: 'Lab report not found'
      });
    }

    if (!labReport.fileUrl) {
      return res.status(404).json({
        success: false,
        message: 'No file attached to this lab report'
      });
    }

    // Extract S3 key from URL
    const fileKey = labReport.fileUrl.split('.com/')[1];

    if (!fileKey) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file URL'
      });
    }

    // Generate presigned URL for download
    try {
      const signedUrl = await getSignedUrl(fileKey, 3600); // URL valid for 1 hour

      res.status(200).json({
        success: true,
        message: 'Download URL generated successfully',
        data: {
          downloadUrl: signedUrl,
          fileName: labReport.fileName,
          expiresIn: 3600 // seconds
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate download URL',
        error: error.message
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLabReport,
  getAllLabReports,
  getLabReportById,
  updateLabReport,
  deleteLabReport,
  getLabStaffReports,
  getPendingLabReports,
  uploadLabReportFile,
  downloadLabReportFile
};
