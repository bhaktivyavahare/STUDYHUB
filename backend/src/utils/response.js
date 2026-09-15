/**
 * Standardized API response formatters
 */

function successResponse(res, message = 'Operation successful', data = null, statusCode = 200) {
  const payload = {
    success: true,
    message,
  };
  if (data !== null && data !== undefined) {
    payload.data = data;
  }
  return res.status(statusCode).json(payload);
}

function errorResponse(res, message = 'An error occurred', statusCode = 500, errors = null) {
  const payload = {
    success: false,
    message,
  };
  if (errors) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
}

module.exports = {
  successResponse,
  errorResponse,
  sendResponse: successResponse,
  sendSuccess: successResponse,
  sendError: errorResponse
};
