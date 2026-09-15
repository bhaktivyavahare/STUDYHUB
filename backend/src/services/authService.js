const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const roleModel = require('../models/roleModel');
const { validateRegisterInput, validateLoginInput } = require('../validators/authValidator');

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role_id: user.role_id,
    role_name: user.role_name,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_studyhub_jwt_key_2026', {
    expiresIn: '7d',
  });
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

async function register(data) {
  const validation = validateRegisterInput(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors.join(' '));
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const { name, email, password, roleName = 'STUDENT', roleId, branchId, semesterId, bio } = data;

  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  let role;
  if (roleId) {
    role = await roleModel.findRoleById(roleId);
  } else {
    role = await roleModel.findRoleByName(roleName);
  }

  if (!role) {
    const error = new Error('Specified user role does not exist.');
    error.statusCode = 400;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const userId = await userModel.createUser({
    name,
    email,
    password_hash,
    role_id: role.id,
    branch_id: branchId ? Number(branchId) : null,
    semester_id: semesterId ? Number(semesterId) : null,
    bio,
  });

  const freshUser = await userModel.findUserById(userId);
  const safeUser = sanitizeUser(freshUser);
  const token = generateToken(freshUser);

  return { token, user: safeUser };
}

async function login(data) {
  const validation = validateLoginInput(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors.join(' '));
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const { email, password } = data;
  const user = await userModel.findUserByEmail(email);

  if (!user) {
    const error = new Error('Invalid email or password credentials.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password credentials.');
    error.statusCode = 401;
    throw error;
  }

  const safeUser = sanitizeUser(user);
  const token = generateToken(user);

  return { token, user: safeUser };
}

async function getMe(userId) {
  const user = await userModel.findUserById(userId);
  if (!user) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    throw error;
  }
  return sanitizeUser(user);
}

module.exports = {
  register,
  login,
  getMe,
};
