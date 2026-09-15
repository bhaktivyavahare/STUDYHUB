const { pool } = require('../config/db');

async function getAllBranches() {
  const [rows] = await pool.query('SELECT id, name, code FROM branches ORDER BY name ASC');
  return rows;
}

async function getSemestersByBranch(branchId) {
  const [rows] = await pool.query(
    'SELECT id, branch_id, number, name FROM semesters WHERE branch_id = ? ORDER BY number ASC',
    [branchId]
  );
  return rows;
}

async function getSubjectsBySemester(semesterId) {
  const [rows] = await pool.query(
    'SELECT id, semester_id, name, code FROM subjects WHERE semester_id = ? ORDER BY name ASC',
    [semesterId]
  );
  return rows;
}

async function getUnitsBySubject(subjectId) {
  const [rows] = await pool.query(
    'SELECT id, subject_id, number, name FROM units WHERE subject_id = ? ORDER BY number ASC',
    [subjectId]
  );
  return rows;
}

async function getAllResourceTypes() {
  const [rows] = await pool.query('SELECT id, name FROM resource_types ORDER BY name ASC');
  return rows;
}

module.exports = {
  getAllBranches,
  getSemestersByBranch,
  getSubjectsBySemester,
  getUnitsBySubject,
  getAllResourceTypes
};
