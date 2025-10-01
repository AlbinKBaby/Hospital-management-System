const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  createPatientValidation,
  updatePatientValidation,
  addMedicalRecordValidation
} = require('../validators/patientValidators');
const { assignDoctorValidation } = require('../validators/billingValidators');

// All routes require authentication
router.use(authenticate);

// Receptionist and Admin can create patients
router.post(
  '/',
  authorize('RECEPTIONIST', 'ADMIN'),
  createPatientValidation,
  validate,
  patientController.createPatient
);

// All authenticated users can view patients
router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatientById);

// Receptionist and Admin can update/delete patients
router.put(
  '/:id',
  authorize('RECEPTIONIST', 'ADMIN'),
  updatePatientValidation,
  validate,
  patientController.updatePatient
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  patientController.deletePatient
);

// Medical records
router.get('/:id/medical-history', patientController.getPatientMedicalHistory);
router.post(
  '/:id/medical-records',
  authorize('DOCTOR', 'ADMIN'),
  addMedicalRecordValidation,
  validate,
  patientController.addMedicalRecord
);

// Assign doctor to patient
router.post(
  '/:id/assign-doctor',
  authorize('RECEPTIONIST', 'ADMIN'),
  assignDoctorValidation,
  validate,
  patientController.assignDoctor
);

module.exports = router;
