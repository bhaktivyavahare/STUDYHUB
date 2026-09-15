const { pool } = require('../config/db');

async function findUserByEmail(email) {
  const query = `
    SELECT u.id, u.name, u.email, u.password_hash, u.role_id, u.branch_id, u.semester_id,
           u.profile_image, u.bio, u.created_at, u.updated_at,
           r.name AS role_name, b.name AS branch_name, s.name AS semester_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN branches b ON u.branch_id = b.id
    LEFT JOIN semesters s ON u.semester_id = s.id
    WHERE LOWER(u.email) = LOWER(?) OR (LOWER(u.name) = LOWER(?) AND r.name = 'ADMIN')
  `;
  const [rows] = await pool.query(query, [email, email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const query = `
    SELECT u.id, u.name, u.email, u.role_id, u.branch_id, u.semester_id,
           u.profile_image, u.bio, u.created_at, u.updated_at,
           r.name AS role_name, b.name AS branch_name, s.name AS semester_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN branches b ON u.branch_id = b.id
    LEFT JOIN semesters s ON u.semester_id = s.id
    WHERE u.id = ?
  `;
  const [rows] = await pool.query(query, [id]);
  return rows[0] || null;
}

async function createUser(userData) {
  const { name, email, password_hash, role_id, branch_id, semester_id, bio } = userData;
  const query = `
    INSERT INTO users (name, email, password_hash, role_id, branch_id, semester_id, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(query, [
    name,
    email,
    password_hash,
    role_id,
    branch_id || null,
    semester_id || null,
    bio || null,
  ]);
  return result.insertId;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
};
