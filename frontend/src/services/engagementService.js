import api from './api';

// Comments
export const getComments = (resourceId) => api.get(`/engage/resources/${resourceId}/comments`);
export const addComment = (resourceId, content) => api.post(`/engage/resources/${resourceId}/comments`, { content });
export const deleteComment = (commentId) => api.delete(`/engage/comments/${commentId}`);

// Ratings
export const rateResource = (resourceId, rating) => api.post(`/engage/resources/${resourceId}/rate`, { rating });
export const getMyRating = (resourceId) => api.get(`/engage/resources/${resourceId}/my-rating`);

// User profile & stats
export const getMyProfile = () => api.get('/users/me');
export const updateMyProfile = (data) => api.put('/users/me', data);
export const getMyUploads = (params) => api.get('/users/me/uploads', { params });
export const getDashboardStats = () => api.get('/users/me/stats');

// Admin
export const getPendingResources = (params) => api.get('/users/admin/pending-resources', { params });
export const getAllUsers = () => api.get('/users/admin/users');
