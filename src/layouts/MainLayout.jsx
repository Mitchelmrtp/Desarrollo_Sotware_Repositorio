// 🏗️ Main Layout - Template Method Pattern implementation
// Following Template Method Pattern and Composition principles

import { useState } from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useGlobalState } from '../store';

const MainLayout = ({ 
  children, 
  showSidebar = true, 
  showFooter = true,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const globalState = useGlobalState();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`} {...props}>
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={handleSidebarClose}
        />
      )}

      {/* Main content area */}
      <div className={showSidebar ? 'lg:pl-72' : ''}>
        {/* Top navigation */}
        <Navbar
          onSidebarToggle={handleSidebarToggle}
          showSidebar={showSidebar}
          notifications={globalState.notifications}
        />

        {/* Main content */}
        <main className="flex-1">
          <div className={`py-6 ${containerClassName}`}>
            {children}
          </div>
        </main>

        {/* Footer */}
        {showFooter && <Footer />}
      </div>
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showSidebar: PropTypes.bool,
  showFooter: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};

export default MainLayout;