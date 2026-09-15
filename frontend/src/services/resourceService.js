import api from './api';

export const getResources = async (params) => {
  return await api.get('/resources', { params });
};

export const getResourceById = async (id) => {
  return await api.get(`/resources/${id}`);
};

export const uploadResource = async (formData) => {
  return await api.post('/resources/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const downloadResource = async (id) => {
  // We can initiate download by navigating or fetching blob
  return await api.get(`/resources/${id}/download`, { responseType: 'blob' });
};

export const getMyBookmarks = async () => {
  return await api.get('/resources/me/bookmarks');
};

export const addBookmark = async (id) => {
  return await api.post(`/resources/${id}/bookmark`);
};

export const removeBookmark = async (id) => {
  return await api.delete(`/resources/${id}/bookmark`);
};

export const verifyResource = async (id, data) => {
  return await api.put(`/resources/${id}/verify`, data);
};

export const deleteResource = async (id) => {
  return await api.delete(`/resources/${id}`);
};

export const getSubjects = async (semesterId) => {
  return await api.get(`/academic/subjects/${semesterId}`); // Needs backend endpoint
};

export const getUnits = async (subjectId) => {
  return await api.get(`/academic/units/${subjectId}`); // Needs backend endpoint
};

export const getResourceTypes = async () => {
  return await api.get(`/academic/resource-types`); // Needs backend endpoint
};
