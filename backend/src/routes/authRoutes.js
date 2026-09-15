const express = require('express');
const { handleRegister, handleLogin, handleGetMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.get('/me', authenticateToken, handleGetMe);

module.exports = router;
