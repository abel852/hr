import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import client from '../api/client';

const Attendance = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const isEmployee = user?.role === 'employee';
  const showEmployeeColumn = !isEmployee;

  const todayIsoDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, []);

  const findTodayRecord = (records) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return records.find(r => {
      const d = new Date(r.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  };

  const canCheckIn = useMemo(() => {
    if (!isEmployee) return false;
    const todayRecord = findTodayRecord(attendance) || null;
    if (!todayRecord) return true;
    return !(todayRecord.checkIn && todayRecord.checkIn.time);
  }, [attendance, isEmployee]);

  const canCheckOut = useMemo(() => {
    if (!isEmployee) return false;
    const todayRecord = findTodayRecord(attendance) || null;
    if (!todayRecord) return false;
    const hasCheckIn = !!(todayRecord.checkIn && todayRecord.checkIn.time);
    const hasCheckOut = !!(todayRecord.checkOut && todayRecord.checkOut.time);
    return hasCheckIn && !hasCheckOut;
  }, [attendance, isEmployee]);

  const formatTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await client.get('/attendance', { params: { limit: 50 } });
      setAttendance(Array.isArray(data.attendance) ? data.attendance : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load attendance');
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const { data } = await client.post('/attendance/checkin', {
        location: 'Web',
        method: 'manual'
      });
      setAttendance(prev => {
        const others = prev.filter(r => {
          const d = new Date(r.date); d.setHours(0,0,0,0);
          const td = new Date(data.date); td.setHours(0,0,0,0);
          return d.getTime() !== td.getTime();
        });
        return [data, ...others].sort((a, b) => new Date(b.date) - new Date(a.date));
      });
      toast.success('Checked in successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to check in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    try {
      const { data } = await client.post('/attendance/checkout', {
        location: 'Web',
        method: 'manual'
      });
      setAttendance(prev => {
        const updated = prev.map(r => {
          const d = new Date(r.date); d.setHours(0,0,0,0);
          const td = new Date(data.date); td.setHours(0,0,0,0);
          if (d.getTime() === td.getTime()) return data;
          return r;
        });
        const hasToday = updated.some(r => {
          const d = new Date(r.date); d.setHours(0,0,0,0);
          const td = new Date(data.date); td.setHours(0,0,0,0);
          return d.getTime() === td.getTime();
        });
        return (hasToday ? updated : [data, ...updated]).sort((a, b) => new Date(b.date) - new Date(a.date));
      });
      toast.success('Checked out successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to check out');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'late':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'absent':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      present: 'status-present',
      late: 'status-late',
      absent: 'status-absent'
    };
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-inactive'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || '-'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('attendance.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {isEmployee ? 'Track your daily attendance and working hours' : 'View organization-wide attendance records'}
          </p>
        </div>
      </div>

      {/* Check In/Out Section - Employees only */}
      {isEmployee && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check In Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('attendance.checkIn')}
              </h3>
              <ClockIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Current time: {new Date().toLocaleTimeString()}
              </p>
              <button
                onClick={handleCheckIn}
                disabled={!canCheckIn || isCheckingIn}
                className={`btn btn-primary w-full ${
                  !canCheckIn ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isCheckingIn ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking In...
                  </div>
                ) : (
                  t('attendance.checkIn')
                )}
              </button>
            </div>
          </div>

          {/* Check Out Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('attendance.checkOut')}
              </h3>
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                End your workday
              </p>
              <button
                onClick={handleCheckOut}
                disabled={!canCheckOut || isCheckingOut}
                className={`btn btn-success w-full ${
                  !canCheckOut ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isCheckingOut ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking Out...
                  </div>
                ) : (
                  t('attendance.checkOut')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEmployee ? t('attendance.attendanceStats') : 'All Attendance Records'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{t('attendance.date')}</th>
                {showEmployeeColumn && <th>Employee</th>}
                <th>{t('attendance.checkInTime')}</th>
                <th>{t('attendance.checkOutTime')}</th>
                <th>{t('attendance.totalHours')}</th>
                <th>{t('attendance.overtime')}</th>
                <th>{t('attendance.status')}</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  {showEmployeeColumn && (
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {record.employee?.personalInfo?.firstName} {record.employee?.personalInfo?.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {record.employee?.employmentInfo?.department}
                        </span>
                      </div>
                    </td>
                  )}
                  <td>
                    {record.checkIn && record.checkIn.time ? (
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span className="ml-2">{formatTime(record.checkIn.time)}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {record.checkOut && record.checkOut.time ? (
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="ml-2">{formatTime(record.checkOut.time)}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{(record.totalHours || 0)} hrs</td>
                  <td>{(record.overtime || 0)} hrs</td>
                  <td>{getStatusBadge(record.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {attendance.length === 0 && (
        <div className="text-center py-12">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            {isEmployee ? 'No attendance records found' : 'No attendance records available'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isEmployee ? 'Your attendance records will appear here once you start checking in.' : 'Records will appear as employees check in/out.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Attendance;
