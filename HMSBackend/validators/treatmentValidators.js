const { body } = require('express-validator');

const addTreatmentValidation = [
  body('diagnosis')
    .trim()
    .notEmpty()
    .withMessage('Diagnosis is required'),
  body('treatment')
    .trim()
    .notEmpty()
    .withMessage('Treatment description is required'),
  body('medications')
    .optional()
    .isArray()
    .withMessage('Medications must be an array'),
  body('medications.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  body('medications.*.dosage')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Medication dosage is required'),
  body('medications.*.frequency')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Medication frequency is required'),
  body('medications.*.duration')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Medication duration is required'),
  body('notes')
    .optional()
    .trim(),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid follow-up date'),
  body('treatmentDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid treatment date')
];

const updateTreatmentValidation = [
  body('diagnosis')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Diagnosis cannot be empty'),
  body('treatment')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Treatment description cannot be empty'),
  body('medications')
    .optional()
    .isArray()
    .withMessage('Medications must be an array'),
  body('notes')
    .optional()
    .trim(),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid follow-up date')
];

module.exports = {
  addTreatmentValidation,
  updateTreatmentValidation
};
