const express = require('express');
const router = express.Router();
const engagementController = require('../controllers/engagementController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Comments – public GET, auth-required POST/DELETE
router.get('/resources/:resourceId/comments', engagementController.getComments);
router.post('/resources/:resourceId/comments', authenticateToken, engagementController.addComment);
router.delete('/comments/:id', authenticateToken, engagementController.deleteComment);

// Ratings – auth required
router.post('/resources/:resourceId/rate', authenticateToken, engagementController.rateResource);
router.get('/resources/:resourceId/my-rating', authenticateToken, engagementController.getMyRating);

module.exports = router;
