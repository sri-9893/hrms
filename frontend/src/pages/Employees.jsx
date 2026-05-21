import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedId, setSelectedId] = useState(null);

  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [salary, setSalary] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Employee');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees', {
        params: {
          search,
          department: departmentFilter,
          role: roleFilter,
        },
      });
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, departmentFilter, roleFilter]);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedId(null);
    setEmployeeId('');
    setName('');
    setEmail('');
    setPassword('');
    setDepartment('');
    setDesignation('');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setSalary('');
    setPhone('');
    setRole('Employee');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setModalMode('edit');
    setSelectedId(emp._id);
    setEmployeeId(emp.employeeId);
    setName(emp.name);
    setEmail(emp.email);
    setPassword('');
    setDepartment(emp.department || '');
    setDesignation(emp.designation || '');
    setJoiningDate(emp.joiningDate ? emp.joiningDate.split('T')[0] : '');
    setSalary(emp.salary || '');
    setPhone(emp.phone || '');
    setRole(emp.role || 'Employee');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      employeeId,
      name,
      email,
      department,
      designation,
      joiningDate,
      salary: parseFloat(salary) || 0,
      phone,
      role,
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (modalMode === 'add') {
        const res = await api.post('/employees', payload);
        if (res.data.success) {
          setSuccess('Employee registered successfully and welcome email queued.');
          setShowModal(false);
          fetchEmployees();
          setTimeout(() => setSuccess(''), 5000);
        }
      } else {
        const res = await api.put(`/employees/${selectedId}`, payload);
        if (res.data.success) {
          setSuccess('Employee updated successfully.');
          setShowModal(false);
          fetchEmployees();
          setTimeout(() => setSuccess(''), 5000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (empId, empName) => {
    if (window.confirm(`Are you sure you want to delete employee "${empName}"? This action is irreversible.`)) {
      try {
        const res = await api.delete(`/employees/${empId}`);
        if (res.data.success) {
          setSuccess('Employee removed successfully.');
          fetchEmployees();
          setTimeout(() => setSuccess(''), 4000);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Deletion failed');
        setTimeout(() => setError(''), 4000);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Employee Directory</h1>
          <p className="text-slate-400 text-sm font-medium">Manage corporate employees and credentials.</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 cursor-pointer transition duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold px-4 py-3 rounded-2xl">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold placeholder-slate-400 text-xs focus:outline-none focus:border-primary-500 transition"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer transition flex-1 md:flex-none"
          >
            <option value="">All Departments</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="HR Operations">HR Operations</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Product Management">Product Management</option>
            <option value="Marketing">Marketing</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer transition flex-1 md:flex-none"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : employees.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department & Role</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Salary</th>
                  <th className="px-6 py-4">Joining Date</th>
                  {user?.role === 'Admin' && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/55 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{emp.employeeId}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{emp.name}</span>
                        <span className="text-slate-400 text-[11px] font-semibold">{emp.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-800">{emp.designation || 'N/A'}</span>
                        <div className="flex gap-1.5 items-center">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {emp.department || 'No Dept'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            emp.role === 'Admin'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {emp.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{emp.phone || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">${emp.salary?.toLocaleString() || '0'}</td>
                    <td className="px-6 py-4 text-slate-400 font-semibold">
                      {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}
                    </td>
                    {user?.role === 'Admin' && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Edit details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp._id, emp.name)}
                            disabled={user.id === emp._id}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 cursor-pointer"
                            title="Remove employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400 font-semibold text-sm">
          No employees found matching the filters.
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                {modalMode === 'add' ? 'Add New Employee' : 'Edit Employee Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee ID</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="TM001"
                    disabled={modalMode === 'edit'}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500 disabled:opacity-50"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Password {modalMode === 'edit' && '(Leave blank to keep unchanged)'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={modalMode === 'add' ? 'Leave blank for default (ID@123)' : '••••••••'}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="HR Operations">HR Operations</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="MERN Stack Lead"
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Base Salary ($)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="75000"
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joining Date</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0150"
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Access Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer"
                    required
                  >
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-200 cursor-pointer"
                >
                  {modalMode === 'add' ? 'Register Employee' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
