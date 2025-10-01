const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  addTreatmentValidation,
  updateTreatmentValidation
} = require('../validators/treatmentValidators');

// All routes require authentication and DOCTOR role
router.use(authenticate, authorize('DOCTOR'));

// Dashboard
router.get('/dashboard', doctorController.getDoctorDashboard);

// Treatment APIs
router.post(
  '/patients/:id/treatments',
  addTreatmentValidation,
  validate,
  doctorController.addTreatment
);

router.get('/patients/:id/treatments', doctorController.getTreatmentHistory);

router.put(
  '/patients/:id/treatments/:treatmentId',
  updateTreatmentValidation,
  validate,
  doctorController.updateTreatment
);

// Lab Results API
router.get('/patients/:id/lab-results', doctorController.getLabResults);

module.exports = router;
