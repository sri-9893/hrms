import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Trash2, Plus, X, AlertCircle } from 'lucide-react';

const Holidays = () => {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('National');

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/holidays');
      if (res.data.success) {
        setHolidays(res.data.holidays);
      }
    } catch (err) {
      setError('Failed to fetch holidays logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/holidays', { name, date, type });
      if (res.data.success) {
        setSuccess('Holiday created successfully. Attendance records synced.');
        setShowAddModal(false);
        setName('');
        setDate('');
        setType('National');
        fetchHolidays();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create holiday');
    }
  };

  const handleDelete = async (id, holidayName) => {
    if (window.confirm(`Are you sure you want to remove "${holidayName}"? This won't retroactively clear past attendance entries.`)) {
      setError('');
      setSuccess('');
      try {
        const res = await api.delete(`/holidays/${id}`);
        if (res.data.success) {
          setSuccess('Holiday removed successfully.');
          fetchHolidays();
          setTimeout(() => setSuccess(''), 4000);
        }
      } catch (err) {
        setError('Failed to delete holiday');
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Holiday Calendar</h1>
          <p className="text-slate-400 text-sm font-medium">Corporate and National scheduled non-working days.</p>
        </div>

        {user.role === 'Admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 cursor-pointer transition duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Add Holiday</span>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : holidays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holidays.map((h) => (
            <div
              key={h._id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-800 text-sm leading-snug">{h.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {h.type} Holiday
                  </span>
                  <span className="text-xs text-primary-600 font-bold mt-1">
                    {new Date(h.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC'
                    })}
                  </span>
                </div>
              </div>

              {user.role === 'Admin' && (
                <button
                  onClick={() => handleDelete(h._id, h.name)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="Remove holiday"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400 font-semibold text-sm">
          No holidays listed.
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Add Holiday</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Holiday Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Christmas Day"
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Holiday Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500 cursor-pointer"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Holiday Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer"
                  required
                >
                  <option value="National">National Holiday</option>
                  <option value="Company">Company Holiday</option>
                </select>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-200 cursor-pointer"
                >
                  Create Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;
