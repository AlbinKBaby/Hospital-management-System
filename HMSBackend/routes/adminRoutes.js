const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes are protected and require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

// Doctor management
router.get('/doctors', adminController.getAllDoctors);

// Reports APIs
router.get('/reports/summary', adminController.getHospitalSummary);
router.get('/reports/pdf', adminController.generatePDFReport);

module.exports = router;
