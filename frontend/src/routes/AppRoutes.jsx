import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import StudentDashboard from '../pages/StudentDashboard';
import FacultyDashboard from '../pages/FacultyDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ExploreResources from '../pages/ExploreResources';
import ResourceDetails from '../pages/ResourceDetails';
import UploadResource from '../pages/UploadResource';
import MyBookmarks from '../pages/MyBookmarks';
import MyUploads from '../pages/MyUploads';
import MyProfile from '../pages/MyProfile';
import AdminPanel from '../pages/AdminPanel';
import ProtectedRoute from '../components/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Semi-Public Resource Routes */}
        <Route path="/explore" element={<ExploreResources />} />
        {/* NOTE: /resources/upload must come BEFORE /resources/:id to prevent route conflict */}
        <Route
          path="/resources/upload"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'ADMIN']}>
              <UploadResource />
            </ProtectedRoute>
          }
        />
        <Route path="/resources/:id" element={<ResourceDetails />} />

        {/* Protected User Routes */}
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'ADMIN']}>
              <MyBookmarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-uploads"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'ADMIN']}>
              <MyUploads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'ADMIN']}>
              <MyProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin / Faculty Panel */}
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/dashboard"
          element={
            <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes;
