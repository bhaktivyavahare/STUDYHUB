const { successResponse } = require('../utils/response');

function checkHealth(req, res) {
  return successResponse(res, 'StudyHub API is running', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  checkHealth,
};
