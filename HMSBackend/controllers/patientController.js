const { PrismaClient } = require('@prisma/client');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

// Create new patient (Receptionist)
const createPatient = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      bloodGroup,
      emergencyContact
    } = req.body;

    // Get receptionist ID from authenticated user
    const receptionist = await prisma.receptionist.findUnique({
      where: { userId: req.user.id }
    });

    if (!receptionist) {
      return res.status(403).json({
        success: false,
        message: 'Receptionist profile not found'
      });
    }

    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        address,
        bloodGroup,
        emergencyContact,
        registeredBy: receptionist.id
      },
      include: {
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
      message: 'Patient registered successfully',
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// Get all patients with pagination and search
const getAllPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = { isDeleted: false }; // Exclude soft-deleted patients

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take,
        include: {
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
          assignedDoctor: {
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
      prisma.patient.count({ where })
    ]);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(patients, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get patient by ID
const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
      include: {
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
        appointments: {
          include: {
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
          },
          orderBy: { appointmentDate: 'desc' },
          take: 5
        },
        medicalRecords: {
          orderBy: { recordDate: 'desc' },
          take: 5
        },
        labReports: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// Update patient
const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      bloodGroup,
      emergencyContact
    } = req.body;

    const patient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        address,
        bloodGroup,
        emergencyContact
      }
    });

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// Delete patient (soft delete)
const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete - mark as deleted instead of removing from database
    await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get patient's medical history
const getPatientMedicalHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: { patientId: parseInt(id) },
      orderBy: { recordDate: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: medicalRecords
    });
  } catch (error) {
    next(error);
  }
};

// Add medical record
const addMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { recordType, description, recordDate } = req.body;

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId: parseInt(id),
        recordType,
        description,
        recordDate: new Date(recordDate)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Medical record added successfully',
      data: medicalRecord
    });
  } catch (error) {
    next(error);
  }
};

// Assign doctor to patient
const assignDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { doctorId } = req.body;

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

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(doctorId) },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            isActive: true
          }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (!doctor.user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Doctor account is inactive'
      });
    }

    // Assign doctor to patient
    const updatedPatient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        assignedDoctorId: parseInt(doctorId)
      },
      include: {
        assignedDoctor: {
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
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Doctor assigned successfully',
      data: updatedPatient
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientMedicalHistory,
  addMedicalRecord,
  assignDoctor
};
