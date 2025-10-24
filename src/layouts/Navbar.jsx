// 🧭 Navigation Bar Layout - Responsive header component
// Following Single Responsibility Principle

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Avatar, Button } from '../components/atoms';
import { SearchBar } from '../components/molecules';
import { useAuth, useGlobalDispatch, ActionTypes } from '../store';

const Navbar = ({ 
  onSidebarToggle, 
  showSidebar = true, 
  className = '',
  notifications = [],
  ...props 
}) => {
  const [authState] = useAuth();
  const dispatch = useGlobalDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthenticated } = authState;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleSearch = (query) => {
    dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query });
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    // Logout logic will be handled by auth hook
    navigate('/login');
  };

  const navigation = [
    { name: 'Inicio', href: '/', current: false },
    { name: 'Recursos', href: '/resources', current: false },
    { name: 'Búsqueda', href: '/search', current: false },
    { name: 'Ayuda', href: '/help', current: false },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Usuarios', href: '/admin/users' },
    { name: 'Moderación', href: '/admin/moderation' },
    { name: 'Reportes', href: '/admin/reports' },
  ];

  return (
    <nav className={`bg-white shadow-sm border-b border-gray-200 ${className}`} {...props}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Left side - Logo and navigation */}
          <div className="flex items-center">
            {/* Sidebar toggle for mobile */}
            {showSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSidebarToggle}
                className="mr-2 md:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </Button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="Logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RS</span>
                </div>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                Resource Share
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Search bar (hidden on mobile) */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Buscar recursos..."
              className="w-full"
            />
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => navigate('/search')}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="icon">
                    <BellIcon className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </Button>
                </div>

                {/* User menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <Avatar
                      src={user?.avatar}
                      alt={user?.name}
                      fallback={user?.name?.charAt(0)?.toUpperCase()}
                      size="sm"
                    />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-gray-500">{user?.email}</div>
                      </div>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <UserCircleIcon className="mr-2 h-4 w-4" />
                            Mi Perfil
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/settings"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <Cog6ToothIcon className="mr-2 h-4 w-4" />
                            Configuración
                          </Link>
                        )}
                      </Menu.Item>

                      {user?.role === 'admin' && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Administración
                          </div>
                          {adminNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  to={item.href}
                                  className={`${
                                    active ? 'bg-gray-100' : ''
                                  } block px-4 py-2 text-sm text-gray-700`}
                                >
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Registrarse</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition
        show={mobileMenuOpen}
        enter="transition duration-200 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-in"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <div className="md:hidden">
          <div className="border-t border-gray-200 bg-white px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="border-t border-gray-200 pt-4 pb-3 mt-4">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Buscar recursos..."
                className="px-3"
              />
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  );
};

Navbar.propTypes = {
  onSidebarToggle: PropTypes.func,
  showSidebar: PropTypes.bool,
  className: PropTypes.string,
  notifications: PropTypes.array,
};

export default Navbar;