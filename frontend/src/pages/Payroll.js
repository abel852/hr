import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CurrencyDollarIcon, DocumentArrowDownIcon, PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Payroll = () => {
  const { t } = useTranslation();
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('payroll.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage employee payroll and generate payslips
          </p>
        </div>
        <div className="mt-4 sm:mt-0 space-x-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {t('payroll.generatePayroll')}
          </button>
        </div>
      </div>

      {/* Payroll Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Payroll
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ETB 2,450,000
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Employees Paid
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">156</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <DocumentArrowDownIcon className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Payslips Generated
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">156</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Salary
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ETB 15,705
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Payroll Management System
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This page will contain the complete payroll management functionality including:
        </p>
        <ul className="mt-4 list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
          <li>Ethiopian tax calculations (PAYE)</li>
          <li>Pension deductions (7% employee + 11% employer)</li>
          <li>Overtime calculations</li>
          <li>Allowances and deductions management</li>
          <li>PDF payslip generation</li>
          <li>Bank transfer sheet export (CSV/XLSX)</li>
          <li>Integration with attendance and leave systems</li>
          <li>Compliance with ERCA regulations</li>
        </ul>
      </div>

      {/* Generate Modal Placeholder */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('payroll.generatePayroll')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Payroll generation form would be implemented here.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="btn btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="btn btn-primary"
              >
                {t('common.generate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;


