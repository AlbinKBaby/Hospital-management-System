const { PrismaClient } = require('@prisma/client');
const { formatUserResponse, getPagination, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

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
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          doctor: true,
          receptionist: true,
          labStaff: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
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

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        doctor: true,
        receptionist: true,
        labStaff: true
      }
    });

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

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        phone,
        isActive
      },
      include: {
        doctor: true,
        receptionist: true,
        labStaff: true
      }
    });

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

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

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

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: !user.isActive },
      include: {
        doctor: true,
        receptionist: true,
        labStaff: true
      }
    });

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
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      pendingLabReports,
      completedAppointments
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      prisma.labReport.count({
        where: { status: 'PENDING' }
      }),
      prisma.appointment.count({
        where: { status: 'COMPLETED' }
      })
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
      where.specialization = { contains: specialization };
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.doctor.count({ where })
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
      dateFilter.gte = new Date(startDate);
      dateFilter.lte = new Date(endDate);
    }

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
      prisma.patient.count({ where: { isDeleted: false } }),
      prisma.patient.count({
        where: {
          isDeleted: false,
          createdAt: dateFilter.gte ? { gte: dateFilter.gte, lte: dateFilter.lte } : undefined
        }
      }),
      prisma.patient.groupBy({
        by: ['gender'],
        where: { isDeleted: false },
        _count: true
      }),
      
      // Doctors
      prisma.doctor.count(),
      prisma.doctor.groupBy({
        by: ['specialization'],
        _count: true
      }),
      
      // Appointments
      prisma.appointment.count({
        where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined
      }),
      prisma.appointment.groupBy({
        by: ['status'],
        where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined,
        _count: true
      }),
      prisma.appointment.count({
        where: {
          status: 'COMPLETED',
          ...(dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : {})
        }
      }),
      
      // Lab Reports
      prisma.labReport.count({
        where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined
      }),
      prisma.labReport.groupBy({
        by: ['status'],
        where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined,
        _count: true
      }),
      prisma.labReport.count({
        where: {
          status: 'COMPLETED',
          ...(dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : {})
        }
      }),
      
      // Revenue
      prisma.billing.aggregate({
        _sum: { totalAmount: true },
        where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined
      }),
      prisma.billing.aggregate({
        _sum: { paidAmount: true },
        where: {
          status: 'PAID',
          ...(dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : {})
        }
      }),
      prisma.billing.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: 'PENDING',
          ...(dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : {})
        }
      }),
      prisma.billing.groupBy({
        by: ['status'],
        where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined,
        _count: true,
        _sum: { totalAmount: true, paidAmount: true }
      }),
      
      // Treatments
      prisma.treatment.count({
        where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined
      }),
      
      // Users
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      })
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
            gender: g.gender,
            count: g._count
          }))
        },
        doctors: {
          total: totalDoctors,
          bySpecialization: doctorsBySpecialization.map(d => ({
            specialization: d.specialization,
            count: d._count
          }))
        },
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          byStatus: appointmentsByStatus.map(a => ({
            status: a.status,
            count: a._count
          }))
        },
        labReports: {
          total: totalLabReports,
          completed: completedLabReports,
          byStatus: labReportsByStatus.map(l => ({
            status: l.status,
            count: l._count
          }))
        },
        revenue: {
          total: totalRevenue._sum.totalAmount || 0,
          paid: paidRevenue._sum.paidAmount || 0,
          pending: pendingRevenue._sum.totalAmount || 0,
          byStatus: billingByStatus.map(b => ({
            status: b.status,
            count: b._count,
            totalAmount: b._sum.totalAmount || 0,
            paidAmount: b._sum.paidAmount || 0
          }))
        },
        treatments: {
          total: totalTreatments
        },
        users: {
          active: activeUsers,
          byRole: usersByRole.map(u => ({
            role: u.role,
            count: u._count
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
        const patients = await prisma.patient.findMany({
          where: {
            isDeleted: false,
            ...(dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : {})
          },
          include: {
            receptionist: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            },
            assignedDoctor: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        reportData = {
          title: 'Patients Report',
          type: 'patients',
          data: patients
        };
        break;

      case 'revenue':
        // Get revenue report
        const billings = await prisma.billing.findMany({
          where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined,
          include: {
            patient: {
              select: { firstName: true, lastName: true, phone: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        
        const revenueStats = await prisma.billing.aggregate({
          _sum: { totalAmount: true, paidAmount: true },
          _count: true,
          where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined
        });

        reportData = {
          title: 'Revenue Report',
          type: 'revenue',
          statistics: {
            totalBillings: revenueStats._count,
            totalRevenue: revenueStats._sum.totalAmount || 0,
            totalPaid: revenueStats._sum.paidAmount || 0,
            totalPending: (revenueStats._sum.totalAmount || 0) - (revenueStats._sum.paidAmount || 0)
          },
          data: billings.map(b => ({
            ...b,
            services: JSON.parse(b.services)
          }))
        };
        break;

      case 'appointments':
        // Get appointments report
        const appointments = await prisma.appointment.findMany({
          where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined,
          include: {
            patient: {
              select: { firstName: true, lastName: true, phone: true }
            },
            doctor: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          },
          orderBy: { appointmentDate: 'desc' }
        });
        reportData = {
          title: 'Appointments Report',
          type: 'appointments',
          data: appointments
        };
        break;

      case 'lab-reports':
        // Get lab reports
        const labReports = await prisma.labReport.findMany({
          where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined,
          include: {
            patient: {
              select: { firstName: true, lastName: true, phone: true }
            },
            labStaff: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
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
  const [
    totalPatients,
    totalDoctors,
    totalAppointments,
    totalLabReports,
    totalRevenue,
    paidRevenue
  ] = await Promise.all([
    prisma.patient.count({ where: { isDeleted: false } }),
    prisma.doctor.count(),
    prisma.appointment.count({
      where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined
    }),
    prisma.labReport.count({
      where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined
    }),
    prisma.billing.aggregate({
      _sum: { totalAmount: true },
      where: dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : undefined
    }),
    prisma.billing.aggregate({
      _sum: { paidAmount: true },
      where: {
        status: 'PAID',
        ...(dateFilter.gte ? { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } } : {})
      }
    })
  ]);

  return {
    totalPatients,
    totalDoctors,
    totalAppointments,
    totalLabReports,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    paidRevenue: paidRevenue._sum.paidAmount || 0,
    pendingRevenue: (totalRevenue._sum.totalAmount || 0) - (paidRevenue._sum.paidAmount || 0)
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
