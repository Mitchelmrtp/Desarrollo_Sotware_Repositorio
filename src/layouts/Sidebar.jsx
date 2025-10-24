// 📱 Sidebar Layout - Responsive navigation sidebar
// Following Single Responsibility Principle

import { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../utils/classNames';
import { useAuth } from '../store';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  className = '',
  ...props 
}) => {
  const location = useLocation();
  const [authState] = useAuth();
  const [expandedSections, setExpandedSections] = useState({});
  
  const { user } = authState;
  const isAdmin = user?.role === 'admin';

  const navigation = [
    {
      name: 'Inicio',
      href: '/',
      icon: HomeIcon,
      current: location.pathname === '/',
    },
    {
      name: 'Recursos',
      href: '/resources',
      icon: DocumentIcon,
      current: location.pathname.startsWith('/resources'),
      children: [
        { name: 'Ver Todos', href: '/resources' },
        { name: 'Mis Recursos', href: '/resources/my' },
        { name: 'Subir Recurso', href: '/resources/upload' },
      ],
    },
    {
      name: 'Búsqueda',
      href: '/search',
      icon: MagnifyingGlassIcon,
      current: location.pathname.startsWith('/search'),
      children: [
        { name: 'Búsqueda Simple', href: '/search' },
        { name: 'Búsqueda Avanzada', href: '/search/advanced' },
      ],
    },
    {
      name: 'Ayuda',
      href: '/help',
      icon: QuestionMarkCircleIcon,
      current: location.pathname.startsWith('/help'),
      children: [
        { name: 'FAQ', href: '/help/faq' },
        { name: 'Contacto', href: '/help/contact' },
        { name: 'Guías', href: '/help/guides' },
      ],
    },
  ];

  const adminNavigation = [
    {
      name: 'Administración',
      icon: CogIcon,
      children: [
        {
          name: 'Dashboard',
          href: '/admin/dashboard',
          icon: ChartBarIcon,
          current: location.pathname === '/admin/dashboard',
        },
        {
          name: 'Usuarios',
          href: '/admin/users',
          icon: UserGroupIcon,
          current: location.pathname.startsWith('/admin/users'),
        },
        {
          name: 'Moderación',
          href: '/admin/moderation',
          icon: DocumentIcon,
          current: location.pathname.startsWith('/admin/moderation'),
        },
        {
          name: 'Reportes',
          href: '/admin/reports',
          icon: ChartBarIcon,
          current: location.pathname.startsWith('/admin/reports'),
        },
      ],
    },
  ];

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const renderNavigationItem = (item, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections[item.name];
    const Icon = item.icon;

    return (
      <div key={item.name}>
        <div className="group">
          {hasChildren ? (
            <button
              onClick={() => toggleSection(item.name)}
              className={cn(
                'w-full flex items-center justify-between p-2 text-sm font-medium rounded-md transition-colors',
                item.current
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                depth > 0 && 'ml-4'
              )}
            >
              <div className="flex items-center">
                {Icon && <Icon className="mr-3 h-5 w-5 flex-shrink-0" />}
                {item.name}
              </div>
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
          ) : (
            <Link
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center p-2 text-sm font-medium rounded-md transition-colors group',
                item.current
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                depth > 0 && 'ml-4'
              )}
            >
              {Icon && <Icon className="mr-3 h-5 w-5 flex-shrink-0" />}
              {item.name}
            </Link>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => renderNavigationItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo section */}
      <div className="flex h-16 items-center px-4 border-b border-gray-200">
        <Link to="/" className="flex items-center" onClick={onClose}>
          <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">RS</span>
          </div>
          <span className="ml-2 text-lg font-bold text-gray-900">
            Resource Share
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => renderNavigationItem(item))}
        </div>

        {/* Admin section */}
        {isAdmin && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="space-y-1">
              {adminNavigation.map((item) => renderNavigationItem(item))}
            </div>
          </div>
        )}
      </nav>

      {/* User info section */}
      {user && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className={cn("flex grow flex-col gap-y-5 overflow-y-auto bg-white", className)}>
                  <SidebarContent />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Desktop sidebar */}
      <div className={cn("hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col", className)} {...props}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default Sidebar;