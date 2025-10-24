// 🛡️ Protected Route Component - Route guard implementation
// Following Decorator Pattern and Single Responsibility Principle

import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermissions = [], 
  fallbackPath = '/login',
  ...props 
}) => {
  const location = useLocation();
  const { isAuthenticated, user, hasRole, hasPermission, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );

    if (!hasAllPermissions) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ from: location }} 
          replace 
        />
      );
    }
  }

  // Render the protected component
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  fallbackPath: PropTypes.string,
};

export default ProtectedRoute;