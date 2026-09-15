import api from './api';

export const loginUser = async (credentials) => {
  return await api.post('/auth/login', credentials);
};

export const registerUser = async (userData) => {
  return await api.post('/auth/register', userData);
};

export const fetchCurrentUser = async () => {
  return await api.get('/auth/me');
};

export const fetchBranches = async () => {
  return await api.get('/academic/branches');
};

export const fetchSemesters = async (branchId) => {
  return await api.get(`/academic/semesters/${branchId}`);
};
