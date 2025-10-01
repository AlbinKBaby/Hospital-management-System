const { Patient, Receptionist, Doctor, MedicalRecord, Appointment, LabReport } = require('../models');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

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
    const receptionist = await Receptionist.findOne({ userId: req.user.id });

    if (!receptionist) {
      return res.status(403).json({
        success: false,
        message: 'Receptionist profile not found'
      });
    }

    const patient = await Patient.create({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      address,
      bloodGroup,
      emergencyContact,
      registeredBy: receptionist._id
    });

    await patient.populate({
      path: 'registeredBy',
      populate: {
        path: 'userId',
        select: 'firstName lastName'
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
      where.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [patients, total] = await Promise.all([
      Patient.find(where)
        .skip(skip)
        .limit(take)
        .populate({
          path: 'registeredBy',
          populate: {
            path: 'userId',
            select: 'firstName lastName'
          }
        })
        .populate({
          path: 'assignedDoctorId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        })
        .sort({ createdAt: -1 }),
      Patient.countDocuments(where)
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

    const patient = await Patient.findById(id)
      .populate({
        path: 'registeredBy',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get related data
    const [appointments, medicalRecords, labReports] = await Promise.all([
      Appointment.find({ patientId: id })
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'firstName lastName'
          }
        })
        .sort({ appointmentDate: -1 })
        .limit(5),
      MedicalRecord.find({ patientId: id })
        .sort({ recordDate: -1 })
        .limit(5),
      LabReport.find({ patientId: id })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const patientData = patient.toObject();
    patientData.appointments = appointments;
    patientData.medicalRecords = medicalRecords;
    patientData.labReports = labReports;

    res.status(200).json({
      success: true,
      data: patientData
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

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;

    const patient = await Patient.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

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
    await Patient.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
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

    const medicalRecords = await MedicalRecord.find({ patientId: id })
      .sort({ recordDate: -1 });

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

    const medicalRecord = await MedicalRecord.create({
      patientId: id,
      recordType,
      description,
      recordDate: new Date(recordDate)
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
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId).populate({
      path: 'userId',
      select: 'firstName lastName isActive'
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (!doctor.userId.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Doctor account is inactive'
      });
    }

    // Assign doctor to patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { assignedDoctorId: doctorId },
      { new: true }
    ).populate({
      path: 'assignedDoctorId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email phone'
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
