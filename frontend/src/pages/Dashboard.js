import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  BellIcon,
  CakeIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    monthlyPayroll: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalEmployees: 156,
        presentToday: 142,
        pendingLeaves: 8,
        monthlyPayroll: 2450000
      });
      setLoading(false);
    }, 1000);
  }, []);

  const attendanceData = [
    { name: 'Mon', present: 45, absent: 5 },
    { name: 'Tue', present: 48, absent: 2 },
    { name: 'Wed', present: 46, absent: 4 },
    { name: 'Thu', present: 49, absent: 1 },
    { name: 'Fri', present: 47, absent: 3 },
    { name: 'Sat', present: 25, absent: 0 },
    { name: 'Sun', present: 20, absent: 0 }
  ];

  const leaveData = [
    { name: 'Annual', value: 45, color: '#3B82F6' },
    { name: 'Sick', value: 15, color: '#EF4444' },
    { name: 'Maternity', value: 8, color: '#10B981' },
    { name: 'Casual', value: 12, color: '#F59E0B' }
  ];

  const recentActivities = [
    { id: 1, type: 'leave', message: 'Alemayehu Kebede requested annual leave', time: '2 hours ago' },
    { id: 2, type: 'attendance', message: 'Meron Tesfaye checked in late', time: '3 hours ago' },
    { id: 3, type: 'payroll', message: 'December payroll generated', time: '1 day ago' },
    { id: 4, type: 'employee', message: 'New employee Dawit Hailu added', time: '2 days ago' }
  ];

  const upcomingBirthdays = [
    { name: 'Hirut Gebre', date: 'Dec 25', department: 'Marketing' },
    { name: 'Yonas Tadesse', date: 'Dec 28', department: 'IT' },
    { name: 'Selam Hailu', date: 'Jan 2', department: 'Finance' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {loading ? '...' : value}
          </p>
          {change && (
            <p className="text-sm text-green-600 dark:text-green-400">
              +{change}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          {t('dashboard.welcome')}, {user?.employeeId?.personalInfo?.firstName}!
        </h1>
        <p className="text-primary-100 mt-1">
          Here's what's happening in your HR system today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.totalEmployees')}
          value={stats.totalEmployees}
          icon={UsersIcon}
          color="bg-blue-500"
          change={5.2}
        />
        <StatCard
          title={t('dashboard.presentToday')}
          value={stats.presentToday}
          icon={ClockIcon}
          color="bg-green-500"
          change={2.1}
        />
        <StatCard
          title={t('dashboard.pendingLeaves')}
          value={stats.pendingLeaves}
          icon={CalendarDaysIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title={t('dashboard.monthlyPayroll')}
          value={`ETB ${stats.monthlyPayroll.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="bg-purple-500"
          change={3.8}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Overview */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('dashboard.attendanceOverview')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('dashboard.leaveRequests')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leaveData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {leaveData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('dashboard.recentActivities')}
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <BellIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('dashboard.upcomingBirthdays')}
          </h3>
          <div className="space-y-3">
            {upcomingBirthdays.map((person, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                    <CakeIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {person.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {person.date} • {person.department}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
