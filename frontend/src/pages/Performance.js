import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserGroupIcon, PlusIcon, ChartBarIcon, StarIcon } from '@heroicons/react/24/outline';

const Performance = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('performance.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Track and evaluate employee performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn btn-primary flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" />
            {t('performance.addEvaluation')}
          </button>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Evaluations
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">45</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <StarIcon className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Rating
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">4.2</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Excellent Ratings
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">18</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Reviews
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Performance Management System
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This page will contain the complete performance management functionality including:
        </p>
        <ul className="mt-4 list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
          <li>KPI definition and tracking</li>
          <li>Performance evaluation forms</li>
          <li>Manager and peer reviews</li>
          <li>Goal setting and tracking</li>
          <li>Training history management</li>
          <li>Performance analytics and reports</li>
          <li>360-degree feedback system</li>
          <li>Performance improvement plans</li>
        </ul>
      </div>

      {/* Performance Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
            Evaluation Process
          </h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">1</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Set KPIs and goals</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">2</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Self-evaluation</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">3</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Manager review</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">4</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Final rating and feedback</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
            Rating Scale
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Excellent</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Good</span>
              <div className="flex">
                {[...Array(4)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <StarIcon className="w-4 h-4 text-gray-300" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Satisfactory</span>
              <div className="flex">
                {[...Array(3)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                {[...Array(2)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-gray-300" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
