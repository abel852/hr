import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDaysIcon, PlusIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Leave = () => {
  const { t } = useTranslation();
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('leave.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage leave requests and approvals
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {t('leave.requestLeave')}
          </button>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <CalendarDaysIcon className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('leave.annual')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">15/21</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('leave.sick')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2/7</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('leave.casual')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">3/5</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <XCircleIcon className="w-8 h-8 text-gray-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('leave.emergency')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">1/3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Leave Management System
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This page will contain the complete leave management functionality including:
        </p>
        <ul className="mt-4 list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
          <li>Leave request form with validation</li>
          <li>Leave balance tracking</li>
          <li>Approval workflow for managers</li>
          <li>Leave calendar view</li>
          <li>Leave history and reports</li>
          <li>Integration with attendance system</li>
        </ul>
      </div>

      {/* Request Modal Placeholder */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('leave.requestLeave')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Leave request form would be implemented here.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="btn btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                className="btn btn-primary"
              >
                {t('common.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;


