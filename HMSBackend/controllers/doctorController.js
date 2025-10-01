const { PrismaClient } = require('@prisma/client');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

// Get doctor's dashboard - List patients assigned to doctor
const getDoctorDashboard = async (req, res, next) => {
  try {
    // Get doctor profile
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.id }
    });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get assigned patients
    const assignedPatients = await prisma.patient.findMany({
      where: {
        assignedDoctorId: doctor.id,
        isDeleted: false
      },
      include: {
        appointments: {
          where: {
            doctorId: doctor.id,
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
          },
          orderBy: { appointmentDate: 'asc' },
          take: 1
        },
        treatments: {
          where: { doctorId: doctor.id },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        labReports: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        appointmentDate: {
          gte: today,
          lt: tomorrow
        },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      include: {
        patient: true
      },
      orderBy: { appointmentTime: 'asc' }
    });

    // Get statistics
    const [totalPatients, totalAppointments, pendingLabReports] = await Promise.all([
      prisma.patient.count({
        where: {
          assignedDoctorId: doctor.id,
          isDeleted: false
        }
      }),
      prisma.appointment.count({
        where: { doctorId: doctor.id }
      }),
      prisma.labReport.count({
        where: {
          patient: {
            assignedDoctorId: doctor.id
          },
          status: 'PENDING'
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        doctor: {
          id: doctor.id,
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
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.id }
    });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const treatmentRecord = await prisma.treatment.create({
      data: {
        patientId: parseInt(id),
        doctorId: doctor.id,
        diagnosis,
        treatment,
        medications: medications ? JSON.stringify(medications) : null,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        treatmentDate: treatmentDate ? new Date(treatmentDate) : new Date()
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

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
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const where = { patientId: parseInt(id) };

    if (search) {
      where.OR = [
        { diagnosis: { contains: search } },
        { treatment: { contains: search } },
        { notes: { contains: search } }
      ];
    }

    const [treatments, total] = await Promise.all([
      prisma.treatment.findMany({
        where,
        skip,
        take,
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { treatmentDate: 'desc' }
      }),
      prisma.treatment.count({ where })
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
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const where = { patientId: parseInt(id) };

    if (status) {
      where.status = status;
    }

    if (testType) {
      where.testType = { contains: testType };
    }

    const [labResults, total] = await Promise.all([
      prisma.labReport.findMany({
        where,
        skip,
        take,
        include: {
          labStaff: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.labReport.count({ where })
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
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.id }
    });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Verify treatment exists and belongs to this doctor
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id: parseInt(treatmentId) }
    });

    if (!existingTreatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment record not found'
      });
    }

    if (existingTreatment.doctorId !== doctor.id) {
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

    const updatedTreatment = await prisma.treatment.update({
      where: { id: parseInt(treatmentId) },
      data: updateData,
      include: {
        patient: true,
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

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
