function validateRegisterInput(data) {
  const errors = [];
  const { name, email, password, confirmPassword, roleId } = data;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full name is required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (password !== confirmPassword) {
    errors.push('Password and confirm password do not match.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateLoginInput(data) {
  const errors = [];
  const { email, password } = data;

  if (!email) {
    errors.push('Email is required.');
  }

  if (!password) {
    errors.push('Password is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
