const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error(`[Error Handler] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode, err.errors || null);
}

module.exports = errorHandler;
