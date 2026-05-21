import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Check, AlertCircle } from 'lucide-react';

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('Casual');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const endpoint = user.role === 'Admin' ? '/leaves' : '/leaves/my';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setLeaves(res.data.leaves);
      }
    } catch (err) {
      setError('Failed to fetch leaves logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/leaves', {
        startDate,
        endDate,
        type,
        reason,
      });

      if (res.data.success) {
        setSuccess('Leave request submitted successfully. Awaiting HR review.');
        setShowApplyModal(false);
        setStartDate('');
        setEndDate('');
        setType('Casual');
        setReason('');
        fetchLeaves();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleStatusUpdate = async (leaveId, status) => {
    setError('');
    setSuccess('');
    const comment = status === 'Rejected' ? window.prompt('Please enter a rejection reason:') : '';
    
    if (status === 'Rejected' && comment === null) return;

    try {
      const res = await api.patch(`/leaves/${leaveId}/status`, {
        status,
        adminComment: comment || undefined,
      });

      if (res.data.success) {
        setSuccess(`Leave application ${status.toLowerCase()} successfully.`);
        fetchLeaves();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave status');
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Leave Applications</h1>
          <p className="text-slate-400 text-sm font-medium">
            {user.role === 'Admin'
              ? 'Review, approve, and manage staff leave requests.'
              : 'Submit leaves and review approvals.'}
          </p>
        </div>

        {user.role === 'Employee' && (
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 cursor-pointer transition duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Request Leave</span>
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
      ) : leaves.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  {user.role === 'Admin' && <th className="px-6 py-4">Employee</th>}
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  {user.role === 'Admin' && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/55 transition">
                    {user.role === 'Admin' && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{leave.user?.name || 'Deleted Staff'}</span>
                          <span className="text-slate-400 text-[10px] font-semibold">{leave.user?.employeeId}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {leave.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">
                      <div className="flex flex-col">
                        <span>
                          {new Date(leave.startDate).toLocaleDateString(undefined, { timeZone: 'UTC' })} to{' '}
                          {new Date(leave.endDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {Math.round((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-500" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 w-max ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-600'
                              : leave.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {leave.status}
                        </span>
                        {leave.adminComment && (
                          <span className="text-[10px] text-slate-400 italic">Comment: {leave.adminComment}</span>
                        )}
                      </div>
                    </td>
                    {user.role === 'Admin' && (
                      <td className="px-6 py-4 text-right">
                        {leave.status === 'Pending' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition cursor-pointer"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Settled</span>
                        )}
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
          No leave applications logged.
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Request Leave</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500 cursor-pointer"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leave Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer"
                  required
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Paid Leave">Paid Leave</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason for Request</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you require this time off..."
                  rows="3"
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:border-primary-500 resize-none"
                  required
                ></textarea>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-200 cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
