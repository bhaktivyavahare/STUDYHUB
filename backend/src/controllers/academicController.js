const academicModel = require('../models/academicModel');
const { successResponse } = require('../utils/response');

async function handleGetBranches(req, res, next) {
  try {
    const branches = await academicModel.getAllBranches();
    return successResponse(res, 'Academic branches retrieved', { branches }, 200);
  } catch (error) {
    next(error);
  }
}

async function handleGetSemesters(req, res, next) {
  try {
    const { branchId } = req.params;
    const semesters = await academicModel.getSemestersByBranch(branchId);
    return successResponse(res, 'Branch semesters retrieved', { semesters }, 200);
  } catch (error) {
    next(error);
  }
}

async function handleGetSubjects(req, res, next) {
  try {
    const { semesterId } = req.params;
    const subjects = await academicModel.getSubjectsBySemester(semesterId);
    return successResponse(res, 'Semester subjects retrieved', { subjects }, 200);
  } catch (error) {
    next(error);
  }
}

async function handleGetUnits(req, res, next) {
  try {
    const { subjectId } = req.params;
    const units = await academicModel.getUnitsBySubject(subjectId);
    return successResponse(res, 'Subject units retrieved', { units }, 200);
  } catch (error) {
    next(error);
  }
}

async function handleGetResourceTypes(req, res, next) {
  try {
    const resourceTypes = await academicModel.getAllResourceTypes();
    return successResponse(res, 'Resource types retrieved', { resourceTypes }, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetBranches,
  handleGetSemesters,
  handleGetSubjects,
  handleGetUnits,
  handleGetResourceTypes
};
