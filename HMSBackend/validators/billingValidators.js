const { body } = require('express-validator');

const createBillingValidation = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isInt()
    .withMessage('Patient ID must be a number'),
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service is required'),
  body('services.*.name')
    .trim()
    .notEmpty()
    .withMessage('Service name is required'),
  body('services.*.price')
    .notEmpty()
    .withMessage('Service price is required')
    .isFloat({ min: 0 })
    .withMessage('Service price must be a positive number'),
  body('services.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Service quantity must be at least 1'),
  body('totalAmount')
    .notEmpty()
    .withMessage('Total amount is required')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('paidAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Paid amount must be a positive number'),
  body('paymentMethod')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
];

const updateBillingValidation = [
  body('services')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one service is required'),
  body('totalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('paidAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Paid amount must be a positive number'),
  body('status')
    .optional()
    .isIn(['PENDING', 'PAID', 'CANCELLED'])
    .withMessage('Invalid status'),
  body('paymentMethod')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
];

const assignDoctorValidation = [
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isInt()
    .withMessage('Doctor ID must be a number')
];

module.exports = {
  createBillingValidation,
  updateBillingValidation,
  assignDoctorValidation
};
