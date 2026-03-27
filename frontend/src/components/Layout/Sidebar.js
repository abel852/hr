import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('nav.employees'), href: '/employees', icon: UsersIcon },
    { name: 'Messages', href: '/messages', icon: UserGroupIcon },
    { name: t('nav.attendance'), href: '/attendance', icon: ClockIcon },
    { name: t('nav.leave'), href: '/leave', icon: CalendarDaysIcon },
    { name: t('nav.payroll'), href: '/payroll', icon: CurrencyDollarIcon },
    { name: t('nav.reports'), href: '/reports', icon: ChartBarIcon },
    { name: t('nav.performance'), href: '/performance', icon: UserGroupIcon },
    { name: t('nav.settings'), href: '/settings', icon: CogIcon },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
            <h1 className="text-xl font-bold text-white">HR System</h1>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.employeeId?.personalInfo?.firstName} {user?.employeeId?.personalInfo?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    sidebar-item group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive ? 'sidebar-item active' : ''}
                  `}
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

// commit-126: feat(layout): add navigation menu items

// commit-127: feat(layout): add sidebar collapse toggle
