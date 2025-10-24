// 🔒 Auth Layout - Layout for authentication pages
// Following Template Method Pattern

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const AuthLayout = ({ 
  children, 
  title,
  subtitle,
  showLogo = true,
  className = '',
  ...props 
}) => {
  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 ${className}`} {...props}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {showLogo && (
          <div className="flex justify-center">
            <Link to="/" className="flex items-center">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">RS</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900 hidden sm:block">
                Resource Share
              </span>
            </Link>
          </div>
        )}
        
        {title && (
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
        )}
        
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>

      {/* Additional links or footer for auth pages */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Resource Share. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showLogo: PropTypes.bool,
  className: PropTypes.string,
};

export default AuthLayout;