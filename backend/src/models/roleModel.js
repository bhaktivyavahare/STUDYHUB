const { pool } = require('../config/db');

async function findRoleByName(name) {
  const [rows] = await pool.query('SELECT * FROM roles WHERE UPPER(name) = UPPER(?)', [name]);
  return rows[0] || null;
}

async function findRoleById(id) {
  const [rows] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
  return rows[0] || null;
}

async function getAllRoles() {
  const [rows] = await pool.query('SELECT * FROM roles ORDER BY id ASC');
  return rows;
}

module.exports = {
  findRoleByName,
  findRoleById,
  getAllRoles,
};
