const { Prescription, Doctor, Appointment, Patient } = require('../models');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

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
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Verify appointment exists and belongs to this doctor
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only create prescriptions for your own appointments'
      });
    }

    // Check if prescription already exists for this appointment
    const existingPrescription = await Prescription.findOne({ appointmentId });

    if (existingPrescription) {
      return res.status(400).json({
        success: false,
        message: 'Prescription already exists for this appointment'
      });
    }

    const prescription = await Prescription.create({
      appointmentId,
      patientId,
      doctorId: doctor._id,
      diagnosis,
      medicines: JSON.stringify(medicines),
      instructions,
      followUpDate: followUpDate ? new Date(followUpDate) : null
    });

    await prescription.populate([
      { path: 'appointmentId' },
      { path: 'patientId' },
      { path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName email' } }
    ]);

    // Update appointment status to completed
    await Appointment.findByIdAndUpdate(appointmentId, { status: 'COMPLETED' });

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
      Prescription.find(where)
        .skip(skip)
        .limit(take)
        .populate('patientId')
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName email' } })
        .populate('appointmentId')
        .sort({ createdAt: -1 }),
      Prescription.countDocuments(where)
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

    const prescription = await Prescription.findById(id)
      .populate('patientId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName email phone' } })
      .populate('appointmentId');

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
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Verify prescription belongs to this doctor
    const existingPrescription = await Prescription.findById(id);

    if (!existingPrescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    if (existingPrescription.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own prescriptions'
      });
    }

    const updateData = {};
    if (diagnosis) updateData.diagnosis = diagnosis;
    if (medicines) updateData.medicines = JSON.stringify(medicines);
    if (instructions) updateData.instructions = instructions;
    if (followUpDate) updateData.followUpDate = new Date(followUpDate);

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('patientId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName' } });

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
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const [prescriptions, total] = await Promise.all([
      Prescription.find({ doctorId: doctor._id })
        .skip(skip)
        .limit(take)
        .populate('patientId')
        .populate('appointmentId')
        .sort({ createdAt: -1 }),
      Prescription.countDocuments({ doctorId: doctor._id })
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
