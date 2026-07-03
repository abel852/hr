import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChartBarIcon, DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';

const Reports = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('reports.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Generate comprehensive reports and analytics
        </p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-8 h-8 text-blue-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('reports.employeeReport')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate detailed employee reports with personal and employment information.
          </p>
          <button className="btn btn-primary w-full">
            Generate Report
          </button>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-8 h-8 text-green-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('reports.attendanceReport')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create attendance reports with statistics and trends.
          </p>
          <button className="btn btn-primary w-full">
            Generate Report
          </button>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-8 h-8 text-purple-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('reports.payrollReport')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate payroll reports with tax and deduction details.
          </p>
          <button className="btn btn-primary w-full">
            Generate Report
          </button>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-8 h-8 text-yellow-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('reports.leaveReport')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create leave usage and balance reports.
          </p>
          <button className="btn btn-primary w-full">
            Generate Report
          </button>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-8 h-8 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('reports.performanceReport')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate performance evaluation reports.
          </p>
          <button className="btn btn-primary w-full">
            Generate Report
          </button>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <DocumentArrowDownIcon className="w-8 h-8 text-indigo-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Custom Report
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create custom reports with specific criteria.
          </p>
          <button className="btn btn-primary w-full">
            Create Custom
          </button>
        </div>
      </div>

      {/* Report Features */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Report Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Export Formats
            </h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <DocumentArrowDownIcon className="w-4 h-4 mr-2 text-red-500" />
                PDF Reports
              </li>
              <li className="flex items-center">
                <DocumentArrowDownIcon className="w-4 h-4 mr-2 text-green-500" />
                Excel Spreadsheets
              </li>
              <li className="flex items-center">
                <DocumentArrowDownIcon className="w-4 h-4 mr-2 text-blue-500" />
                CSV Files
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Report Types
            </h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Monthly/Weekly/Daily reports</li>
              <li>• Department-wise analysis</li>
              <li>• Employee-specific reports</li>
              <li>• Compliance reports</li>
              <li>• Trend analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
