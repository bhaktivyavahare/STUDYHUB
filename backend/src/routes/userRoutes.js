const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All user routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/me', userController.getMyProfile);
router.put('/me', userController.updateMyProfile);
router.get('/me/uploads', userController.getMyUploads);
router.get('/me/stats', userController.getDashboardStats);

// Admin-only routes
router.get('/admin/pending-resources', requireRole('ADMIN', 'FACULTY'), userController.getPendingResources);
router.get('/admin/users', requireRole('ADMIN'), userController.getAllUsers);

module.exports = router;
