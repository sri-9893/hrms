import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data.success) {
        setAttendance(res.data.record);
      }
    } catch (err) {
      console.error('Error fetching today status:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTodayStatus();
    }
  }, [user]);

  const handlePunchIn = async () => {
    setPunchLoading(true);
    setMessage('');
    try {
      const res = await api.post('/attendance/checkin');
      if (res.data.success) {
        setAttendance(res.data.attendance);
        setMessage('Checked in successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-in failed');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setPunchLoading(true);
    setMessage('');
    try {
      const res = await api.post('/attendance/checkout');
      if (res.data.success) {
        setAttendance(res.data.attendance);
        setMessage('Checked out successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-out failed');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setPunchLoading(false);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shadow-sm shrink-0">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Welcome back, <span className="text-primary-600">{user?.name}</span>
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          {message && (
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium transition duration-200">
              {message}
            </span>
          )}

          {user?.role === 'Employee' && (
            <div className="flex items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-2xl gap-3">
              <Clock className="w-4 h-4 text-slate-400" />
              
              {!attendance ? (
                <button
                  onClick={handlePunchIn}
                  disabled={punchLoading}
                  className="flex items-center gap-1.5 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition duration-150 cursor-pointer shadow-sm shadow-primary-200 disabled:opacity-50"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Punch In</span>
                </button>
              ) : !attendance.checkOut ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-semibold">
                    In: {attendance.checkIn}
                  </span>
                  <button
                    onClick={handlePunchOut}
                    disabled={punchLoading}
                    className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition duration-150 cursor-pointer shadow-sm shadow-red-200 disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Punch Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Punched Out ({attendance.checkIn} - {attendance.checkOut})</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
            {user?.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-bold text-slate-700">{user?.name}</span>
            <span className="text-xs text-slate-400 font-semibold">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
