const { PrismaClient } = require('@prisma/client');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

// Create appointment (Receptionist)
const createAppointment = async (req, res, next) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      notes
    } = req.body;

    // Get receptionist ID
    const receptionist = await prisma.receptionist.findUnique({
      where: { userId: req.user.id }
    });

    if (!receptionist) {
      return res.status(403).json({
        success: false,
        message: 'Receptionist profile not found'
      });
    }

    // Check if doctor exists and is active
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(doctorId) },
      include: {
        user: true
      }
    });

    if (!doctor || !doctor.user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Doctor not available'
      });
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(patientId) }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        receptionistId: receptionist.id,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        reason,
        notes,
        status: 'SCHEDULED'
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
        },
        receptionist: {
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

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// Get all appointments with filters
const getAllAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, doctorId, patientId, date } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (doctorId) {
      where.doctorId = parseInt(doctorId);
    }

    if (patientId) {
      where.patientId = parseInt(patientId);
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.appointmentDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take,
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
          },
          receptionist: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { appointmentDate: 'desc' }
      }),
      prisma.appointment.count({ where })
    ]);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(appointments, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: true,
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        receptionist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        prescription: true
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// Update appointment
const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      appointmentDate,
      appointmentTime,
      status,
      reason,
      notes
    } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        appointmentTime,
        status,
        reason,
        notes
      },
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

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// Cancel appointment
const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
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

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// Get doctor's appointments
const getDoctorAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const { skip, take } = getPagination(page, limit);

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

    const where = { doctorId: doctor.id };

    if (status) {
      where.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.appointmentDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take,
        include: {
          patient: true,
          prescription: true
        },
        orderBy: { appointmentDate: 'desc' }
      }),
      prisma.appointment.count({ where })
    ]);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(appointments, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  getDoctorAppointments
};
