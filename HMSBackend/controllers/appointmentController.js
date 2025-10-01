const { Appointment, Patient, Doctor, Receptionist, Prescription } = require('../models');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

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
    const receptionist = await Receptionist.findOne({ userId: req.user.id });

    if (!receptionist) {
      return res.status(403).json({
        success: false,
        message: 'Receptionist profile not found'
      });
    }

    // Check if doctor exists and is active
    const doctor = await Doctor.findById(doctorId).populate('userId');

    if (!doctor || !doctor.userId.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Doctor not available'
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      receptionistId: receptionist._id,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason,
      notes,
      status: 'SCHEDULED'
    });

    await appointment.populate([
      { path: 'patientId' },
      { path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName email' } },
      { path: 'receptionistId', populate: { path: 'userId', select: 'firstName lastName' } }
    ]);

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
      where.doctorId = doctorId;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.appointmentDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(where)
        .skip(skip)
        .limit(take)
        .populate('patientId')
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName email' } })
        .populate({ path: 'receptionistId', populate: { path: 'userId', select: 'firstName lastName' } })
        .sort({ appointmentDate: -1 }),
      Appointment.countDocuments(where)
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

    const appointment = await Appointment.findById(id)
      .populate('patientId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName email phone' } })
      .populate({ path: 'receptionistId', populate: { path: 'userId', select: 'firstName lastName' } });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Get prescription if exists
    const prescription = await Prescription.findOne({ appointmentId: id });
    const appointmentData = appointment.toObject();
    appointmentData.prescription = prescription;

    res.status(200).json({
      success: true,
      data: appointmentData
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

    const updateData = {};
    if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
    if (appointmentTime) updateData.appointmentTime = appointmentTime;
    if (status) updateData.status = status;
    if (reason !== undefined) updateData.reason = reason;
    if (notes !== undefined) updateData.notes = notes;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('patientId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName' } });

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

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'CANCELLED' },
      { new: true }
    )
      .populate('patientId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName' } });

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
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const where = { doctorId: doctor._id };

    if (status) {
      where.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.appointmentDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(where)
        .skip(skip)
        .limit(take)
        .populate('patientId')
        .sort({ appointmentDate: -1 }),
      Appointment.countDocuments(where)
    ]);

    // Get prescriptions for appointments
    const appointmentIds = appointments.map(a => a._id);
    const prescriptions = await Prescription.find({ appointmentId: { $in: appointmentIds } });
    
    const appointmentsWithPrescriptions = appointments.map(apt => {
      const aptObj = apt.toObject();
      aptObj.prescription = prescriptions.find(p => p.appointmentId.toString() === apt._id.toString());
      return aptObj;
    });

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(appointmentsWithPrescriptions, total, parseInt(page), parseInt(limit))
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
