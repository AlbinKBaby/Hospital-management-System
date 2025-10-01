const { body } = require('express-validator');

const createAppointmentValidation = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isInt()
    .withMessage('Patient ID must be a number'),
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isInt()
    .withMessage('Doctor ID must be a number'),
  body('appointmentDate')
    .notEmpty()
    .withMessage('Appointment date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('appointmentTime')
    .notEmpty()
    .withMessage('Appointment time is required'),
  body('reason')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
];

const updateAppointmentValidation = [
  body('appointmentDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('appointmentTime')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS'])
    .withMessage('Invalid status'),
  body('reason')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
];

module.exports = {
  createAppointmentValidation,
  updateAppointmentValidation
};
