// Dev:        VITE_API_URL is not set → Vite dev server proxies /api → localhost:5000
// Production: Set VITE_API_URL=https://your-backend.onrender.com/api in frontend .env
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const ROLES = {
  STUDENT: 'STUDENT',
  FACULTY: 'FACULTY',
  ADMIN: 'ADMIN',
};

export const ROLE_DASHBOARDS = {
  STUDENT: '/student/dashboard',
  FACULTY: '/faculty/dashboard',
  ADMIN: '/admin/dashboard',
};
