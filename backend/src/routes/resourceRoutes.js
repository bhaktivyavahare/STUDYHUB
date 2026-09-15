const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public endpoints (or authenticated but publicly accessible data)
// Some endpoints require user optionally, but we'll protect them if needed. 
// Let's assume resources are public, but downloading needs auth.
// Public endpoints
router.get('/', resourceController.getResources);

// Specific named routes (must come BEFORE /:id parameter route)
router.get('/me/bookmarks', authenticateToken, resourceController.getMyBookmarks);

router.get('/:id', resourceController.getResourceById);

// Protected endpoints below this line
router.use(authenticateToken);

// Upload resource (Student/Faculty/Admin)
router.post('/upload', requireRole('STUDENT', 'FACULTY', 'ADMIN'), upload.single('file'), resourceController.uploadResource);

// Bookmark endpoints
router.post('/:id/bookmark', resourceController.addBookmark);
router.delete('/:id/bookmark', resourceController.removeBookmark);

// Download endpoint
router.get('/:id/download', resourceController.downloadResource);

// Delete resource (Uploader or Admin)
router.delete('/:id', resourceController.deleteResource);

// Admin/Faculty Verification
router.put('/:id/verify', requireRole('ADMIN', 'FACULTY'), resourceController.verifyResource);

module.exports = router;
