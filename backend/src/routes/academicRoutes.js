const express = require('express');
const { handleGetBranches, handleGetSemesters, handleGetSubjects, handleGetUnits, handleGetResourceTypes } = require('../controllers/academicController');

const router = express.Router();

router.get('/branches', handleGetBranches);
router.get('/semesters/:branchId', handleGetSemesters);
router.get('/subjects/:semesterId', handleGetSubjects);
router.get('/units/:subjectId', handleGetUnits);
router.get('/resource-types', handleGetResourceTypes);

module.exports = router;
