const { body } = require('express-validator');

const createPatientValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('gender')
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Invalid gender'),
  body('address')
    .optional()
    .trim(),
  body('bloodGroup')
    .optional()
    .trim(),
  body('emergencyContact')
    .optional()
    .trim()
];

const updatePatientValidation = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Invalid gender')
];

const addMedicalRecordValidation = [
  body('recordType')
    .trim()
    .notEmpty()
    .withMessage('Record type is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('recordDate')
    .notEmpty()
    .withMessage('Record date is required')
    .isISO8601()
    .withMessage('Please provide a valid date')
];

module.exports = {
  createPatientValidation,
  updatePatientValidation,
  addMedicalRecordValidation
};
