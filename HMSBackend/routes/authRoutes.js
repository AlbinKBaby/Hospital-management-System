const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../validators/authValidators');

// Public routes
router.post('/login', loginValidation, validate, authController.login);

// Protected routes - Admin only can register new users
router.post('/register', authenticate, authorize('ADMIN'), registerValidation, validate, authController.register);

// Protected routes - All authenticated users
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, validate, authController.updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, validate, authController.changePassword);

module.exports = router;
