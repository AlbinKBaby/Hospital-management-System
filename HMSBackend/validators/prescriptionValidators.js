const { body } = require('express-validator');

const createPrescriptionValidation = [
  body('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isInt()
    .withMessage('Appointment ID must be a number'),
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isInt()
    .withMessage('Patient ID must be a number'),
  body('diagnosis')
    .trim()
    .notEmpty()
    .withMessage('Diagnosis is required'),
  body('medicines')
    .isArray({ min: 1 })
    .withMessage('At least one medicine is required'),
  body('medicines.*.name')
    .trim()
    .notEmpty()
    .withMessage('Medicine name is required'),
  body('medicines.*.dosage')
    .trim()
    .notEmpty()
    .withMessage('Medicine dosage is required'),
  body('medicines.*.frequency')
    .trim()
    .notEmpty()
    .withMessage('Medicine frequency is required'),
  body('medicines.*.duration')
    .trim()
    .notEmpty()
    .withMessage('Medicine duration is required'),
  body('instructions')
    .optional()
    .trim(),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid follow-up date')
];

const updatePrescriptionValidation = [
  body('diagnosis')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Diagnosis cannot be empty'),
  body('medicines')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one medicine is required'),
  body('instructions')
    .optional()
    .trim(),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid follow-up date')
];

module.exports = {
  createPrescriptionValidation,
  updatePrescriptionValidation
};
