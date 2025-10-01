const express = require('express');
const router = express.Router();
const labReportController = require('../controllers/labReportController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { upload } = require('../utils/s3Upload');
const {
  createLabReportValidation,
  updateLabReportValidation
} = require('../validators/labReportValidators');

// All routes require authentication
router.use(authenticate);

// Receptionist, Doctor, and Admin can create lab reports
router.post(
  '/',
  authorize('RECEPTIONIST', 'DOCTOR', 'ADMIN'),
  createLabReportValidation,
  validate,
  labReportController.createLabReport
);

// All authenticated users can view lab reports
router.get('/', labReportController.getAllLabReports);
router.get('/pending', authorize('LAB_STAFF', 'ADMIN'), labReportController.getPendingLabReports);
router.get('/lab-staff/my-reports', authorize('LAB_STAFF'), labReportController.getLabStaffReports);
router.get('/:id', labReportController.getLabReportById);

// Lab Staff can update lab reports (with optional file upload)
router.put(
  '/:id',
  authorize('LAB_STAFF', 'ADMIN'),
  upload.single('file'),
  updateLabReportValidation,
  validate,
  labReportController.updateLabReport
);

// Upload lab report file (Lab Staff)
router.post(
  '/:id/upload',
  authorize('LAB_STAFF', 'ADMIN'),
  upload.single('file'),
  labReportController.uploadLabReportFile
);

// Download lab report file
router.get('/:id/download', labReportController.downloadLabReportFile);

// Admin can delete lab reports
router.delete(
  '/:id',
  authorize('ADMIN'),
  labReportController.deleteLabReport
);

module.exports = router;
