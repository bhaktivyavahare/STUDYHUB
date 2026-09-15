const { errorResponse } = require('../utils/response');

function requireRole(...allowedRoles) {
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    if (!req.user || !req.user.role_name) {
      return errorResponse(res, 'User identity not found. Please log in.', 401);
    }

    const userRole = req.user.role_name.toUpperCase();
    const hasRole = roles.some((role) => role.toUpperCase() === userRole);

    if (!hasRole) {
      return errorResponse(res, `Forbidden: Require one of [${roles.join(', ')}] role to perform this action.`, 403);
    }

    next();
  };
}

module.exports = {
  requireRole,
};
