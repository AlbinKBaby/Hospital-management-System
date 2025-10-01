const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  createBillingValidation,
  updateBillingValidation
} = require('../validators/billingValidators');

// All routes require authentication
router.use(authenticate);

// Receptionist and Admin can create billing
router.post(
  '/',
  authorize('RECEPTIONIST', 'ADMIN'),
  createBillingValidation,
  validate,
  billingController.createBilling
);

// All authenticated users can view billings
router.get('/', billingController.getAllBillings);
router.get('/:id', billingController.getBillingById);

// Generate PDF invoice
router.get('/:id/pdf', billingController.generatePDF);

// Receptionist and Admin can update billing
router.put(
  '/:id',
  authorize('RECEPTIONIST', 'ADMIN'),
  updateBillingValidation,
  validate,
  billingController.updateBilling
);

// Admin can delete billing
router.delete(
  '/:id',
  authorize('ADMIN'),
  billingController.deleteBilling
);

module.exports = router;
