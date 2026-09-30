// Dev:        VITE_API_URL is not set → Vite dev server proxies /api → localhost:5000
// Production: Set VITE_API_URL=https://<your-render-service>.onrender.com/api in Netlify env
const rawApiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim() : '';

export const API_BASE_URL = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '').endsWith('/api')
    ? rawApiUrl.replace(/\/+$/, '')
    : `${rawApiUrl.replace(/\/+$/, '')}/api`
  : '/api';

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
