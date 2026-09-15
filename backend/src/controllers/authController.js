const authService = require('../services/authService');
const { successResponse } = require('../utils/response');

async function handleRegister(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
}

async function handleLogin(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, 'User logged in successfully', result, 200);
  } catch (error) {
    next(error);
  }
}

async function handleGetMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, 'Authenticated user profile retrieved', { user }, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleRegister,
  handleLogin,
  handleGetMe,
};
