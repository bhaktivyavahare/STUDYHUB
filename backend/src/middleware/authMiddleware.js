const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 'Access token required. Please log in.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_studyhub_jwt_key_2026');
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired authentication token.', 401);
  }
}

module.exports = {
  authenticateToken,
};
