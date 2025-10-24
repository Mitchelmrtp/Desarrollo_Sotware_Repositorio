// 🔒 Public Route Component - Route guard for auth pages
// Following Single Responsibility Principle

import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks';

const PublicRoute = ({ 
  children, 
  redirectPath = '/',
  restricted = true, // If true, authenticated users will be redirected
  ...props 
}) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If route is restricted and user is authenticated, redirect
  if (restricted && isAuthenticated) {
    const from = location.state?.from?.pathname;
    return (
      <Navigate 
        to={from || redirectPath} 
        replace 
      />
    );
  }

  // Render the public component
  return children;
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectPath: PropTypes.string,
  restricted: PropTypes.bool,
};

export default PublicRoute;