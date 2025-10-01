const { User, Doctor, Patient, Appointment, LabReport, Billing, Treatment, Receptionist, LabStaff } = require('../models');
const { formatUserResponse, getPagination, formatPaginationResponse } = require('../utils/helpers');

// Get all users with pagination and filters
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(where)
        .skip(skip)
        .limit(take)
        .populate('doctor')
        .populate('receptionist')
        .populate('labStaff')
        .sort({ createdAt: -1 }),
      User.countDocuments(where)
    ]);

    const formattedUsers = users.map(formatUserResponse);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(formattedUsers, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('doctor')
      .populate('receptionist')
      .populate('labStaff');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, phone, isActive },
      { new: true }
    )
      .populate('doctor')
      .populate('receptionist')
      .populate('labStaff');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: formatUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle user active status
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive: !user.isActive },
      { new: true }
    )
      .populate('doctor')
      .populate('receptionist')
      .populate('labStaff');

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      data: formatUserResponse(updatedUser)
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      pendingLabReports,
      completedAppointments
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: {
          $gte: today,
          $lt: tomorrow
        }
      }),
      LabReport.countDocuments({ status: 'PENDING' }),
      Appointment.countDocuments({ status: 'COMPLETED' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        pendingLabReports,
        completedAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all doctors
const getAllDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, specialization } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {};
    if (specialization) {
      where.specialization = { $regex: specialization, $options: 'i' };
    }

    const [doctors, total] = await Promise.all([
      Doctor.find(where)
        .skip(skip)
        .limit(take)
        .populate({ path: 'userId', select: 'email firstName lastName phone isActive' })
        .sort({ createdAt: -1 }),
      Doctor.countDocuments(where)
    ]);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(doctors, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital-wide summary report
const getHospitalSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Date range setup
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.$gte = new Date(startDate);
      dateFilter.$lte = new Date(endDate);
    }

    // Build date query
    const dateQuery = dateFilter.$gte ? { createdAt: dateFilter } : {};

    // Get comprehensive statistics
    const [
      // Patient statistics
      totalPatients,
      newPatientsCount,
      patientsByGender,
      
      // Doctor statistics
      totalDoctors,
      doctorsBySpecialization,
      
      // Appointment statistics
      totalAppointments,
      appointmentsByStatus,
      completedAppointments,
      
      // Lab report statistics
      totalLabReports,
      labReportsByStatus,
      completedLabReports,
      
      // Revenue statistics
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      billingByStatus,
      
      // Treatment statistics
      totalTreatments,
      
      // User statistics
      activeUsers,
      usersByRole
    ] = await Promise.all([
      // Patients
      Patient.countDocuments({ isDeleted: false }),
      Patient.countDocuments({ isDeleted: false, ...dateQuery }),
      Patient.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]),
      
      // Doctors
      Doctor.countDocuments(),
      Doctor.aggregate([
        { $group: { _id: '$specialization', count: { $sum: 1 } } }
      ]),
      
      // Appointments
      Appointment.countDocuments(dateQuery),
      Appointment.aggregate([
        ...(dateFilter.$gte ? [{ $match: dateQuery }] : []),
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Appointment.countDocuments({ status: 'COMPLETED', ...dateQuery }),
      
      // Lab Reports
      LabReport.countDocuments(dateQuery),
      LabReport.aggregate([
        ...(dateFilter.$gte ? [{ $match: dateQuery }] : []),
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      LabReport.countDocuments({ status: 'COMPLETED', ...dateQuery }),
      
      // Revenue
      Billing.aggregate([
        ...(dateFilter.$gte ? [{ $match: dateQuery }] : []),
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Billing.aggregate([
        { $match: { status: 'PAID', ...dateQuery } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]),
      Billing.aggregate([
        { $match: { status: 'PENDING', ...dateQuery } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Billing.aggregate([
        ...(dateFilter.$gte ? [{ $match: dateQuery }] : []),
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' }
        }}
      ]),
      
      // Treatments
      Treatment.countDocuments(dateQuery),
      
      // Users
      User.countDocuments({ isActive: true }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        dateRange: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        },
        patients: {
          total: totalPatients,
          newPatients: newPatientsCount,
          byGender: patientsByGender.map(g => ({
            gender: g._id,
            count: g.count
          }))
        },
        doctors: {
          total: totalDoctors,
          bySpecialization: doctorsBySpecialization.map(d => ({
            specialization: d._id,
            count: d.count
          }))
        },
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          byStatus: appointmentsByStatus.map(a => ({
            status: a._id,
            count: a.count
          }))
        },
        labReports: {
          total: totalLabReports,
          completed: completedLabReports,
          byStatus: labReportsByStatus.map(l => ({
            status: l._id,
            count: l.count
          }))
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          paid: paidRevenue[0]?.total || 0,
          pending: pendingRevenue[0]?.total || 0,
          byStatus: billingByStatus.map(b => ({
            status: b._id,
            count: b.count,
            totalAmount: b.totalAmount || 0,
            paidAmount: b.paidAmount || 0
          }))
        },
        treatments: {
          total: totalTreatments
        },
        users: {
          active: activeUsers,
          byRole: usersByRole.map(u => ({
            role: u._id,
            count: u.count
          }))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate PDF report data
const generatePDFReport = async (req, res, next) => {
  try {
    const { reportType = 'summary', startDate, endDate } = req.query;

    // Date range setup
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate);
      dateFilter.lte = new Date(endDate);
    }

    let reportData = {};

    switch (reportType) {
      case 'summary':
        // Get summary data (same as hospital summary)
        const summaryData = await getHospitalSummaryData(dateFilter);
        reportData = {
          title: 'Hospital Summary Report',
          type: 'summary',
          ...summaryData
        };
        break;

      case 'patients':
        // Get detailed patient report
        const patients = await Patient.find({
          isDeleted: false,
          ...dateQuery
        })
          .populate({ path: 'registeredBy', populate: { path: 'userId', select: 'firstName lastName' } })
          .populate({ path: 'assignedDoctorId', populate: { path: 'userId', select: 'firstName lastName' } })
          .sort({ createdAt: -1 });
        reportData = {
          title: 'Patients Report',
          type: 'patients',
          data: patients
        };
        break;

      case 'revenue':
        // Get revenue report
        const billings = await Billing.find(dateQuery)
          .populate({ path: 'patientId', select: 'firstName lastName phone' })
          .sort({ createdAt: -1 });
        
        const revenueStats = await Billing.aggregate([
          ...(dateFilter.$gte ? [{ $match: dateQuery }] : []),
          { $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            paidAmount: { $sum: '$paidAmount' }
          }}
        ]);

        const stats = revenueStats[0] || { count: 0, totalAmount: 0, paidAmount: 0 };
        reportData = {
          title: 'Revenue Report',
          type: 'revenue',
          statistics: {
            totalBillings: stats.count,
            totalRevenue: stats.totalAmount,
            totalPaid: stats.paidAmount,
            totalPending: stats.totalAmount - stats.paidAmount
          },
          data: billings.map(b => ({
            ...b.toObject(),
            services: JSON.parse(b.services)
          }))
        };
        break;

      case 'appointments':
        // Get appointments report
        const appointments = await Appointment.find(dateQuery)
          .populate({ path: 'patientId', select: 'firstName lastName phone' })
          .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName' } })
          .sort({ appointmentDate: -1 });
        reportData = {
          title: 'Appointments Report',
          type: 'appointments',
          data: appointments
        };
        break;

      case 'lab-reports':
        // Get lab reports
        const labReports = await LabReport.find(dateQuery)
          .populate({ path: 'patientId', select: 'firstName lastName phone' })
          .populate({ path: 'conductedBy', populate: { path: 'userId', select: 'firstName lastName' } })
          .sort({ createdAt: -1 });
        reportData = {
          title: 'Lab Reports Summary',
          type: 'lab-reports',
          data: labReports
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Use: summary, patients, revenue, appointments, or lab-reports'
        });
    }

    // Add metadata
    reportData.metadata = {
      generatedAt: new Date().toISOString(),
      generatedBy: `${req.user.firstName} ${req.user.lastName}`,
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time'
      }
    };

    // Return data for PDF generation (frontend or backend PDF library can use this)
    res.status(200).json({
      success: true,
      message: 'Report data generated. Use a PDF library to convert this data to PDF.',
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

// Helper function for summary data
async function getHospitalSummaryData(dateFilter) {
  const dateQuery = dateFilter.$gte ? { createdAt: dateFilter } : {};

  const [
    totalPatients,
    totalDoctors,
    totalAppointments,
    totalLabReports,
    totalRevenue,
    paidRevenue
  ] = await Promise.all([
    Patient.countDocuments({ isDeleted: false }),
    Doctor.countDocuments(),
    Appointment.countDocuments(dateQuery),
    LabReport.countDocuments(dateQuery),
    Billing.aggregate([
      ...(dateFilter.$gte ? [{ $match: dateQuery }] : []),
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Billing.aggregate([
      { $match: { status: 'PAID', ...dateQuery } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ])
  ]);

  const totalRev = totalRevenue[0]?.total || 0;
  const paidRev = paidRevenue[0]?.total || 0;

  return {
    totalPatients,
    totalDoctors,
    totalAppointments,
    totalLabReports,
    totalRevenue: totalRev,
    paidRevenue: paidRev,
    pendingRevenue: totalRev - paidRev
  };
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getDashboardStats,
  getAllDoctors,
  getHospitalSummary,
  generatePDFReport
};
