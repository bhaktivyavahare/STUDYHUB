const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
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

async function ensureAdminUser(adminId, adminPass) {
  // 1. Try to find user by email or username 'admin'
  let user = await userModel.findUserByEmail(adminId);
  if (!user && adminId.toLowerCase() !== 'admin') {
    user = await userModel.findUserByEmail('admin');
  }

  // 2. If not found, check if any user with role ADMIN exists in the database
  if (!user) {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role_id,
              r.name AS role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE r.name = 'ADMIN'
       ORDER BY u.id ASC
       LIMIT 1`
    );
    if (rows && rows.length > 0) {
      user = rows[0];
    }
  }

  // 3. If still no admin exists, create an admin user in DB so foreign keys work
  if (!user) {
    const role = await roleModel.findRoleByName('ADMIN');
    const roleId = role ? role.id : 3;
    const dummyHash = await bcrypt.hash(adminPass, 10);
    const newId = await userModel.createUser({
      name: 'System Administrator',
      email: adminId.includes('@') ? adminId : `${adminId}@studyhub.com`,
      password_hash: dummyHash,
      role_id: roleId,
      bio: 'StudyHub Platform Administrator',
    });
    user = await userModel.findUserById(newId);
  }

  return user;
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
  const inputId = (email || '').trim().toLowerCase();
  const inputPass = (password || '').trim();

  // ─── Environment-Based Admin Authentication ──────────────────────────────
  const envAdminId = (process.env.ADMIN_ID || process.env.ADMIN_EMAIL || 'admin').trim().toLowerCase();
  const envAdminPass = (process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || '').trim();

  const isAdminLogin =
    Boolean(envAdminPass) &&
    (inputId === envAdminId ||
     inputId === 'admin' ||
     (envAdminId.includes('@') && inputId === envAdminId.split('@')[0]));

  if (isAdminLogin) {
    if (inputPass !== envAdminPass) {
      const error = new Error('Invalid email or password credentials.');
      error.statusCode = 401;
      throw error;
    }

    const adminUser = await ensureAdminUser(envAdminId, envAdminPass);
    adminUser.role_name = 'ADMIN';

    const safeUser = sanitizeUser(adminUser);
    const token = generateToken(adminUser);

    return { token, user: safeUser };
  }

  // ─── Standard Database User Authentication ───────────────────────────────
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
