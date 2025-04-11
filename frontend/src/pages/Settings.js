import React from 'react';
import { useTranslation } from 'react-i18next';
import { CogIcon, BuildingOfficeIcon, CalendarDaysIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Configure system settings and preferences
        </p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-blue-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.company')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage company information, address, and contact details.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Company name, address, phone, email
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center mb-4">
            <CalendarDaysIcon className="w-8 h-8 text-green-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.holidays')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Configure national, religious, and company holidays.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Ethiopian holidays, company holidays
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="w-8 h-8 text-purple-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.departments')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage departments, positions, and organizational structure.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Departments, positions, hierarchy
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center mb-4">
            <CogIcon className="w-8 h-8 text-yellow-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.taxSettings')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Configure tax rates and payroll settings.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            PAYE rates, pension rates, allowances
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center mb-4">
            <CogIcon className="w-8 h-8 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.systemSettings')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Configure system-wide settings and preferences.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Working hours, notifications, security
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center mb-4">
            <CalendarDaysIcon className="w-8 h-8 text-indigo-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.leaveTypes')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Configure leave types and their policies.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Annual, sick, maternity, casual leave
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Application Details
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div>Version: 1.0.0</div>
              <div>Build: 2024.01.15</div>
              <div>Environment: Production</div>
              <div>Database: MongoDB</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Compliance
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div>✓ ERCA Tax Compliance</div>
              <div>✓ Social Security Integration</div>
              <div>✓ Ethiopian Labor Law</div>
              <div>✓ Data Protection (GDPR)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

// commit-124: feat(settings): add user profile settings
