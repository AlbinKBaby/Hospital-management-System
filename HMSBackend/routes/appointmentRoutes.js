const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  createAppointmentValidation,
  updateAppointmentValidation
} = require('../validators/appointmentValidators');

// All routes require authentication
router.use(authenticate);

// Receptionist and Admin can create appointments
router.post(
  '/',
  authorize('RECEPTIONIST', 'ADMIN'),
  createAppointmentValidation,
  validate,
  appointmentController.createAppointment
);

// All authenticated users can view appointments
router.get('/', appointmentController.getAllAppointments);
router.get('/doctor/my-appointments', authorize('DOCTOR'), appointmentController.getDoctorAppointments);
router.get('/:id', appointmentController.getAppointmentById);

// Receptionist, Doctor, and Admin can update appointments
router.put(
  '/:id',
  authorize('RECEPTIONIST', 'DOCTOR', 'ADMIN'),
  updateAppointmentValidation,
  validate,
  appointmentController.updateAppointment
);

// Cancel appointment
router.patch(
  '/:id/cancel',
  authorize('RECEPTIONIST', 'ADMIN'),
  appointmentController.cancelAppointment
);

module.exports = router;
