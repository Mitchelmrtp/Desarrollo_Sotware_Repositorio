// 🛣️ App Routes Configuration - Main routing setup
// Following Single Responsibility Principle

import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Lazy load components for better performance
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));

const ResourcesPage = lazy(() => import('../pages/resources/ResourcesPage'));
const ResourceDetailPage = lazy(() => import('../pages/resources/ResourceDetailPage'));
const UploadResourcePage = lazy(() => import('../pages/resources/UploadResourcePage'));
const MyResourcesPage = lazy(() => import('../pages/resources/MyResourcesPage'));

const SearchPage = lazy(() => import('../pages/search/SearchPage'));
const AdvancedSearchPage = lazy(() => import('../pages/search/AdvancedSearchPage'));

const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/user/SettingsPage'));

const HelpPage = lazy(() => import('../pages/help/HelpPage'));
const FAQPage = lazy(() => import('../pages/help/FAQPage'));
const ContactPage = lazy(() => import('../pages/help/ContactPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminModerationPage = lazy(() => import('../pages/admin/AdminModerationPage'));
const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage'));

// Error pages
const NotFoundPage = lazy(() => import('../pages/error/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/error/UnauthorizedPage'));
const ErrorPage = lazy(() => import('../pages/error/ErrorPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicRoute restricted={false}>
              <HomePage />
            </PublicRoute>
          } 
        />

        {/* Authentication Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password/:token" 
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          } 
        />

        {/* Protected User Routes */}
        <Route 
          path="/resources" 
          element={
            <ProtectedRoute>
              <ResourcesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resources/:id" 
          element={
            <ProtectedRoute>
              <ResourceDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resources/upload" 
          element={
            <ProtectedRoute>
              <UploadResourcePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resources/my" 
          element={
            <ProtectedRoute>
              <MyResourcesPage />
            </ProtectedRoute>
          } 
        />

        {/* Search Routes */}
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/search/advanced" 
          element={
            <ProtectedRoute>
              <AdvancedSearchPage />
            </ProtectedRoute>
          } 
        />

        {/* User Profile Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />

        {/* Help Routes */}
        <Route 
          path="/help" 
          element={
            <PublicRoute restricted={false}>
              <HelpPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/help/faq" 
          element={
            <PublicRoute restricted={false}>
              <FAQPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/help/contact" 
          element={
            <PublicRoute restricted={false}>
              <ContactPage />
            </PublicRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/moderation" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminModerationPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminReportsPage />
            </ProtectedRoute>
          } 
        />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Catch all route - redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;