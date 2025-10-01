const { body } = require('express-validator');

const createLabReportValidation = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isInt()
    .withMessage('Patient ID must be a number'),
  body('testName')
    .trim()
    .notEmpty()
    .withMessage('Test name is required'),
  body('testType')
    .trim()
    .notEmpty()
    .withMessage('Test type is required'),
  body('remarks')
    .optional()
    .trim()
];

const updateLabReportValidation = [
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Invalid status'),
  body('results')
    .optional()
    .trim(),
  body('remarks')
    .optional()
    .trim(),
  body('reportDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
];

module.exports = {
  createLabReportValidation,
  updateLabReportValidation
};
