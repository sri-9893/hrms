import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, CheckSquare, XSquare, AlertTriangle, CalendarDays } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeesList, setEmployeesList] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchEmployeesList = async () => {
    try {
      const res = await api.get('/employees');
      if (res.data.success) {
        setEmployeesList(res.data.employees);
      }
    } catch (err) {
      console.error('Failed to load employee list');
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      if (user.role === 'Admin') {
        // Backend expects /attendance/all for Admin
        const res = await api.get('/attendance/all', {
          params: {
            date: selectedDate,
          },
        });
        if (res.data.success) {
          setRecords(res.data.records);
        }
      } else {
        const res = await api.get('/attendance/history', {
          params: {
            month: selectedMonth,
            year: selectedYear,
          },
        });
        if (res.data.success) {
          setRecords(res.data.history);
        }
      }
    } catch (err) {
      setError('Failed to fetch attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchEmployeesList();
    }
  }, [user]);

  useEffect(() => {
    fetchRecords();
  }, [selectedDate, selectedEmployee, selectedMonth, selectedYear]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Attendance Logs</h1>
        <p className="text-slate-400 text-sm font-medium">
          {user.role === 'Admin'
            ? 'Track check-ins, worked hours, and employee logs.'
            : 'Review your monthly attendance history and work log.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {user.role === 'Admin' ? (
          <>
            <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>Track Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="ml-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter Staff:</span>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="">All Employees</option>
                {employeesList.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 w-full justify-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Period:</span>
            
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString(undefined, { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : records.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  {user.role === 'Admin' && <th className="px-6 py-4">Employee</th>}
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Hours Worked</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/55 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {new Date(rec.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC'
                      })}
                    </td>
                    {user.role === 'Admin' && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{rec.user?.name || 'Deleted User'}</span>
                          <span className="text-slate-400 text-[10px] font-semibold">{rec.user?.employeeId}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-slate-600 font-semibold">{rec.checkIn || '--:--'}</td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">{rec.checkOut || '--:--'}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {rec.workedHours ? `${rec.workedHours.toFixed(2)} hrs` : '0.00 hrs'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          rec.status === 'Present'
                            ? 'bg-blue-100 text-blue-600'
                            : rec.status === 'Absent'
                            ? 'bg-red-100 text-red-600'
                            : rec.status === 'Leave'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {rec.status === 'Present' && <CheckSquare className="w-3.5 h-3.5" />}
                        {rec.status === 'Absent' && <XSquare className="w-3.5 h-3.5" />}
                        {rec.status === 'Leave' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {rec.status === 'Holiday' && <CalendarDays className="w-3.5 h-3.5" />}
                        <span>{rec.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400 font-semibold text-sm">
          No attendance logs recorded for this selection.
        </div>
      )}
    </div>
  );
};

export default Attendance;
