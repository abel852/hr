import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentArrowUpIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import client from '../api/client';

const Employees = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';

  const loadDepartments = async () => {
    try {
      const { data } = await client.get('/employees/departments');
      setDepartments(Array.isArray(data) ? data : []);
    } catch (e) {
      setDepartments([]);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedDepartment) params.department = selectedDepartment;
      if (selectedStatus) params.status = selectedStatus;
      const { data } = await client.get('/employees', { params });
      setEmployees(Array.isArray(data.employees) ? data.employees : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadEmployees();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedDepartment, selectedStatus]);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || employee.employmentInfo.department === selectedDepartment;
    const matchesStatus = !selectedStatus || employee.employmentInfo.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleAddEmployee = () => {
    setShowAddModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = async (employee) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await client.delete(`/employees/${employee._id}`);
        toast.success('Employee deactivated successfully');
        loadEmployees();
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to delete employee');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-active',
      inactive: 'status-inactive',
      terminated: 'status-rejected'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-inactive'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
            {t('employees.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your organization's employees
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {isAdmin && (
            <button
              onClick={handleAddEmployee}
              className="btn btn-primary flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              {t('employees.addEmployee')}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="input"
          >
            <option value="">{t('employees.department')}</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input"
          >
            <option value="">{t('employees.status')}</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
          
          <button className="btn btn-secondary flex items-center justify-center">
            <FunnelIcon className="w-5 h-5 mr-2" />
            {t('common.filter')}
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{t('employees.employeeId')}</th>
                <th>{t('employees.fullName')}</th>
                <th>{t('employees.email')}</th>
                <th>{t('employees.department')}</th>
                <th>{t('employees.position')}</th>
                <th>{t('employees.status')}</th>
                <th>{t('employees.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee._id}>
                  <td className="font-medium">{employee.employeeId}</td>
                  <td>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {employee.personalInfo.phone}
                      </div>
                    </div>
                  </td>
                  <td>{employee.personalInfo.email}</td>
                  <td>{employee.employmentInfo?.department}</td>
                  <td>{employee.employmentInfo.position}</td>
                  <td>{getStatusBadge(employee.employmentInfo.status)}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View/Edit"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No employees found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Add Employee Modal (Admin) */}
      {showAddModal && isAdmin && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); loadEmployees(); }}
          departments={departments}
          saving={saving}
          setSaving={setSaving}
        />
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('employees.editEmployee')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Edit form for {selectedEmployee.personalInfo.firstName} {selectedEmployee.personalInfo.lastName}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  toast.success('Employee updated successfully');
                }}
                className="btn btn-primary"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

// Admin Add Employee Modal component
const AddEmployeeModal = ({ onClose, onSaved, departments, saving, setSaving }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'male',
    department: departments?.[0] || '',
    position: '',
    hireDate: new Date().toISOString().slice(0,10),
    contractType: 'permanent',
    basicSalary: '',
    role: 'employee',
    sendEmail: false
  });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async () => {
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.department || !form.position || !form.hireDate || !form.basicSalary) {
      setError('Please fill all required fields');
      return;
    }
    try {
      setSaving(true);
      const fd = new FormData();
      // Personal
      fd.append('personalInfo.firstName', form.firstName);
      fd.append('personalInfo.lastName', form.lastName);
      fd.append('personalInfo.email', form.email);
      fd.append('personalInfo.phone', form.phone);
      fd.append('personalInfo.gender', form.gender);
      // Employment
      fd.append('employmentInfo.department', form.department);
      fd.append('employmentInfo.position', form.position);
      fd.append('employmentInfo.hireDate', form.hireDate);
      fd.append('employmentInfo.contractType', form.contractType);
      // Salary
      fd.append('salary.basicSalary', String(form.basicSalary));
      // Account
      fd.append('account.role', form.role);
      fd.append('account.sendEmail', String(form.sendEmail));
      if (photo) fd.append('photo', photo);

      await client.post('/employees', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSaved?.();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Employee</h2>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">First Name</label>
            <input name="firstName" value={form.firstName} onChange={onChange} className="input" />
          </div>
          <div>
            <label className="label">Last Name</label>
            <input name="lastName" value={form.lastName} onChange={onChange} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} className="input" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} className="input" />
          </div>
          <div>
            <label className="label">Gender</label>
            <select name="gender" value={form.gender} onChange={onChange} className="input">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">ID/Photo</label>
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="label">Department</label>
            <select name="department" value={form.department} onChange={onChange} className="input">
              <option value="">Select department</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Position</label>
            <input name="position" value={form.position} onChange={onChange} className="input" />
          </div>
          <div>
            <label className="label">Hire Date</label>
            <input type="date" name="hireDate" value={form.hireDate} onChange={onChange} className="input" />
          </div>
          <div>
            <label className="label">Contract Type</label>
            <select name="contractType" value={form.contractType} onChange={onChange} className="input">
              <option value="permanent">Permanent</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
              <option value="part-time">Part-time</option>
            </select>
          </div>
          <div>
            <label className="label">Basic Salary</label>
            <input type="number" name="basicSalary" value={form.basicSalary} onChange={onChange} className="input" />
          </div>
          <div>
            <label className="label">Role</label>
            <select name="role" value={form.role} onChange={onChange} className="input">
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="sendEmail" type="checkbox" name="sendEmail" checked={form.sendEmail} onChange={onChange} />
            <label htmlFor="sendEmail" className="text-sm">Email credentials to employee</label>
          </div>
        </div>

        {error && <div className="rounded-md bg-red-50 dark:bg-red-900 p-3 text-sm text-red-700 dark:text-red-300">{error}</div>}

        <div className="flex justify-end gap-3">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};



