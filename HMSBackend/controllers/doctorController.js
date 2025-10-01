const { Doctor, Patient, Appointment, Treatment, LabReport } = require('../models');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

// Get doctor's dashboard - List patients assigned to doctor
const getDoctorDashboard = async (req, res, next) => {
  try {
    // Get doctor profile
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get assigned patients
    const assignedPatients = await Patient.find({
      assignedDoctorId: doctor._id,
      isDeleted: false
    }).sort({ createdAt: -1 });

    // Fetch related data for each patient
    for (let patient of assignedPatients) {
      const [appointments, treatments, labReports] = await Promise.all([
        Appointment.find({
          patientId: patient._id,
          doctorId: doctor._id,
          status: { $in: ['SCHEDULED', 'IN_PROGRESS'] }
        }).sort({ appointmentDate: 1 }).limit(1),
        Treatment.find({
          patientId: patient._id,
          doctorId: doctor._id
        }).sort({ createdAt: -1 }).limit(1),
        LabReport.find({
          patientId: patient._id,
          status: { $in: ['PENDING', 'IN_PROGRESS'] }
        }).sort({ createdAt: -1 }).limit(3)
      ]);
      patient.appointments = appointments;
      patient.treatments = treatments;
      patient.labReports = labReports;
    }

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $in: ['SCHEDULED', 'IN_PROGRESS'] }
    })
      .populate('patientId')
      .sort({ appointmentTime: 1 });

    // Get statistics
    const assignedPatientIds = await Patient.find({
      assignedDoctorId: doctor._id,
      isDeleted: false
    }).distinct('_id');

    const [totalPatients, totalAppointments, pendingLabReports] = await Promise.all([
      Patient.countDocuments({
        assignedDoctorId: doctor._id,
        isDeleted: false
      }),
      Appointment.countDocuments({ doctorId: doctor._id }),
      LabReport.countDocuments({
        patientId: { $in: assignedPatientIds },
        status: 'PENDING'
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        doctor: {
          id: doctor._id,
          specialization: doctor.specialization,
          qualification: doctor.qualification,
          experience: doctor.experience
        },
        statistics: {
          totalPatients,
          totalAppointments,
          pendingLabReports,
          todayAppointments: todayAppointments.length
        },
        assignedPatients,
        todayAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add treatment record
const addTreatment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      diagnosis,
      treatment,
      medications,
      notes,
      followUpDate,
      treatmentDate
    } = req.body;

    // Get doctor profile
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const treatmentRecord = await Treatment.create({
      patientId: id,
      doctorId: doctor._id,
      diagnosis,
      treatment,
      medications: medications ? JSON.stringify(medications) : null,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      treatmentDate: treatmentDate ? new Date(treatmentDate) : new Date()
    });

    await treatmentRecord.populate([
      { path: 'patientId' },
      { path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName email' } }
    ]);

    // Parse medications back to JSON
    const treatmentData = {
      ...treatmentRecord,
      medications: treatmentRecord.medications ? JSON.parse(treatmentRecord.medications) : null
    };

    res.status(201).json({
      success: true,
      message: 'Treatment record added successfully',
      data: treatmentData
    });
  } catch (error) {
    next(error);
  }
};

// Get treatment history for a patient
const getTreatmentHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, search } = req.query;
    const { skip, take } = getPagination(page, limit);

    // Verify patient exists
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const where = { patientId: id };

    if (search) {
      where.$or = [
        { diagnosis: { $regex: search, $options: 'i' } },
        { treatment: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const [treatments, total] = await Promise.all([
      Treatment.find(where)
        .skip(skip)
        .limit(take)
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName email' } })
        .sort({ treatmentDate: -1 }),
      Treatment.countDocuments(where)
    ]);

    // Parse medications JSON
    const treatmentsData = treatments.map(t => ({
      ...t,
      medications: t.medications ? JSON.parse(t.medications) : null
    }));

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(treatmentsData, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get lab results for a patient
const getLabResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status, testType } = req.query;
    const { skip, take } = getPagination(page, limit);

    // Verify patient exists
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const where = { patientId: id };

    if (status) {
      where.status = status;
    }

    if (testType) {
      where.testType = { $regex: testType, $options: 'i' };
    }

    const [labResults, total] = await Promise.all([
      LabReport.find(where)
        .skip(skip)
        .limit(take)
        .populate({ path: 'conductedBy', populate: { path: 'userId', select: 'firstName lastName email' } })
        .sort({ createdAt: -1 }),
      LabReport.countDocuments(where)
    ]);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(labResults, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Update treatment record
const updateTreatment = async (req, res, next) => {
  try {
    const { id, treatmentId } = req.params;
    const {
      diagnosis,
      treatment,
      medications,
      notes,
      followUpDate
    } = req.body;

    // Get doctor profile
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Verify treatment exists and belongs to this doctor
    const existingTreatment = await Treatment.findById(treatmentId);

    if (!existingTreatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment record not found'
      });
    }

    if (existingTreatment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own treatment records'
      });
    }

    const updateData = {};
    if (diagnosis) updateData.diagnosis = diagnosis;
    if (treatment) updateData.treatment = treatment;
    if (medications) updateData.medications = JSON.stringify(medications);
    if (notes) updateData.notes = notes;
    if (followUpDate) updateData.followUpDate = new Date(followUpDate);

    const updatedTreatment = await Treatment.findByIdAndUpdate(
      treatmentId,
      updateData,
      { new: true }
    )
      .populate('patientId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName' } });

    // Parse medications back to JSON
    const treatmentData = {
      ...updatedTreatment,
      medications: updatedTreatment.medications ? JSON.parse(updatedTreatment.medications) : null
    };

    res.status(200).json({
      success: true,
      message: 'Treatment record updated successfully',
      data: treatmentData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorDashboard,
  addTreatment,
  getTreatmentHistory,
  getLabResults,
  updateTreatment
};
