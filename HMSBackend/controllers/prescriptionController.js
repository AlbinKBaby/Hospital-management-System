const { PrismaClient } = require('@prisma/client');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

// Create prescription (Doctor only)
const createPrescription = async (req, res, next) => {
  try {
    const {
      appointmentId,
      patientId,
      diagnosis,
      medicines,
      instructions,
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

    // Verify appointment exists and belongs to this doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointmentId) }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.doctorId !== doctor.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only create prescriptions for your own appointments'
      });
    }

    // Check if prescription already exists for this appointment
    const existingPrescription = await prisma.prescription.findUnique({
      where: { appointmentId: parseInt(appointmentId) }
    });

    if (existingPrescription) {
      return res.status(400).json({
        success: false,
        message: 'Prescription already exists for this appointment'
      });
    }

    const prescription = await prisma.prescription.create({
      data: {
        appointmentId: parseInt(appointmentId),
        patientId: parseInt(patientId),
        doctorId: doctor.id,
        diagnosis,
        medicines: JSON.stringify(medicines),
        instructions,
        followUpDate: followUpDate ? new Date(followUpDate) : null
      },
      include: {
        appointment: true,
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

    // Update appointment status to completed
    await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: { status: 'COMPLETED' }
    });

    // Parse medicines back to JSON for response
    const prescriptionData = {
      ...prescription,
      medicines: JSON.parse(prescription.medicines)
    };

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescriptionData
    });
  } catch (error) {
    next(error);
  }
};

// Get all prescriptions
const getAllPrescriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, patientId, doctorId } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {};

    if (patientId) {
      where.patientId = parseInt(patientId);
    }

    if (doctorId) {
      where.doctorId = parseInt(doctorId);
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
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
          appointment: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.prescription.count({ where })
    ]);

    // Parse medicines JSON
    const prescriptionsData = prescriptions.map(p => ({
      ...p,
      medicines: JSON.parse(p.medicines)
    }));

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(prescriptionsData, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get prescription by ID
const getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const prescription = await prisma.prescription.findUnique({
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
        appointment: true
      }
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Parse medicines JSON
    const prescriptionData = {
      ...prescription,
      medicines: JSON.parse(prescription.medicines)
    };

    res.status(200).json({
      success: true,
      data: prescriptionData
    });
  } catch (error) {
    next(error);
  }
};

// Update prescription (Doctor only)
const updatePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { diagnosis, medicines, instructions, followUpDate } = req.body;

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

    // Verify prescription belongs to this doctor
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPrescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    if (existingPrescription.doctorId !== doctor.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own prescriptions'
      });
    }

    const prescription = await prisma.prescription.update({
      where: { id: parseInt(id) },
      data: {
        diagnosis,
        medicines: medicines ? JSON.stringify(medicines) : undefined,
        instructions,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined
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

    // Parse medicines back to JSON
    const prescriptionData = {
      ...prescription,
      medicines: JSON.parse(prescription.medicines)
    };

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: prescriptionData
    });
  } catch (error) {
    next(error);
  }
};

// Get doctor's prescriptions
const getDoctorPrescriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
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

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where: { doctorId: doctor.id },
        skip,
        take,
        include: {
          patient: true,
          appointment: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.prescription.count({ where: { doctorId: doctor.id } })
    ]);

    // Parse medicines JSON
    const prescriptionsData = prescriptions.map(p => ({
      ...p,
      medicines: JSON.parse(p.medicines)
    }));

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(prescriptionsData, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  getDoctorPrescriptions
};
