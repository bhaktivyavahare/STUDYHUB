const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 404) {
    console.warn(`[404 Not Found] ${req.method} ${req.originalUrl || req.url}`);
  } else {
    console.error(`[Error Handler] ${req.method} ${req.originalUrl || req.url}:`, err);
  }

  return errorResponse(res, message, statusCode, err.errors || null);
}

module.exports = errorHandler;
