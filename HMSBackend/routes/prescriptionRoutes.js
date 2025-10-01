const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  createPrescriptionValidation,
  updatePrescriptionValidation
} = require('../validators/prescriptionValidators');

// All routes require authentication
router.use(authenticate);

// Doctor can create prescriptions
router.post(
  '/',
  authorize('DOCTOR'),
  createPrescriptionValidation,
  validate,
  prescriptionController.createPrescription
);

// All authenticated users can view prescriptions
router.get('/', prescriptionController.getAllPrescriptions);
router.get('/doctor/my-prescriptions', authorize('DOCTOR'), prescriptionController.getDoctorPrescriptions);
router.get('/:id', prescriptionController.getPrescriptionById);

// Doctor can update their own prescriptions
router.put(
  '/:id',
  authorize('DOCTOR'),
  updatePrescriptionValidation,
  validate,
  prescriptionController.updatePrescription
);

module.exports = router;
