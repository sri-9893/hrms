import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Download, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

const Payroll = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [previewData, setPreviewData] = useState([]);
  const [payrollHistory, setPayrollHistory] = useState([]);

  const fetchPayrollHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/payroll/history');
      if (res.data.success) {
        setPayrollHistory(res.data.history || []);
      }
    } catch (error) {
      console.error('Failed to load payroll history', error);
    } finally {
      setHistoryLoading(false);
    }
  };


  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        await fetchPayrollHistory();
      } catch (e) {
        // handled inside fetchPayrollHistory
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);


  const handlePreview = async () => {
    setLoading(true);
    setError('');
    setPreviewData([]);
    try {
      // Backend preview currently accepts userId, month, year.
      const res = await api.get('/payroll/preview', {
        params: {
          userId: user.id,
          month: selectedMonth,
          year: selectedYear,
        },
      });

      if (res.data.success) {
        const stats = res.data.stats;
        // Normalize to the table shape expected by the UI.
        setPreviewData([
          {
            userId: user.id,
            name: user.name || user.email || 'Employee',
            basicSalary: stats.basicSalary,
            workDaysInMonth: stats.workingDays,
            presentDays: stats.presentDays,
            approvedLeaves: stats.approvedLeaves,
            holidaysCount: stats.holidays,
            absentDays: stats.absentDays,
            deductions: stats.deductions,
            netSalary: stats.netSalary,
          },
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payroll preview.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!window.confirm(`Are you sure you want to process and lock payroll for ${selectedMonth}/${selectedYear}? This will send payslips via email to all employees.`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/payroll/generate', {
        month: selectedMonth,
        year: selectedYear,
      });

      if (res.data.success) {
        setSuccess(`Payroll for ${selectedMonth}/${selectedYear} has been generated and emails are sent.`);
        setPreviewData([]);
        fetchPayrollHistory();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate payroll.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (payslipId, month, year) => {
    try {
      const res = await api.get(`/payslips/${payslipId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Payslip_${month}_${year}.pdf`;
      link.click();
    } catch (err) {
      alert('Failed to download PDF payslip.');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Payroll Processing</h1>
        <p className="text-slate-400 text-sm font-medium">
          {user.role === 'Admin'
            ? 'Generate monthly employee payroll and issue payslip PDFs.'
            : 'Download and review your monthly payslips.'}
        </p>
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

      {user.role === 'Admin' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6">
          <h3 className="text-lg font-bold text-slate-800">Process New Month</h3>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString(undefined, { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                disabled={loading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Preview Calculations</span>
              </button>

              {previewData.length > 0 && (
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-primary-200 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lock & Distribute Payslips</span>
                </button>
              )}
            </div>
          </div>

          {previewData.length > 0 && (
            <div className="border border-slate-100 rounded-xl overflow-hidden mt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Basic Salary</th>
                      <th className="px-4 py-3 text-center">Work Days</th>
                      <th className="px-4 py-3 text-center">Present</th>
                      <th className="px-4 py-3 text-center">Leaves</th>
                      <th className="px-4 py-3 text-center">Holidays</th>
                      <th className="px-4 py-3 text-center">Absent</th>
                      <th className="px-4 py-3">Deductions</th>
                      <th className="px-4 py-3">Estimated Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                    {previewData.map((row) => (
                      <tr key={row.userId} className="hover:bg-slate-50/55">
                        <td className="px-4 py-3 font-bold text-slate-800">{row.name}</td>
                        <td className="px-4 py-3 text-slate-500">${row.basicSalary.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{row.workDaysInMonth}</td>
                        <td className="px-4 py-3 text-center text-blue-600 font-bold">{row.presentDays}</td>
                        <td className="px-4 py-3 text-center text-amber-600 font-bold">{row.approvedLeaves}</td>
                        <td className="px-4 py-3 text-center text-emerald-600 font-bold">{row.holidaysCount}</td>
                        <td className="px-4 py-3 text-center text-rose-500 font-bold">{row.absentDays}</td>
                        <td className="px-4 py-3 text-rose-500">-${row.deductions.toFixed(2)}</td>
                        <td className="px-4 py-3 text-emerald-600 font-black">${row.netSalary.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-800">
          {user.role === 'Admin' ? 'Processed Payroll History' : 'My Payslips'}
        </h3>

        {historyLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (payrollHistory?.length ?? 0) > 0 ? (
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Period</th>
                    {user.role === 'Admin' && <th className="px-6 py-4">Employee</th>}
                    <th className="px-6 py-4">Basic Salary</th>
                    <th className="px-6 py-4">Deductions</th>
                    <th className="px-6 py-4">Net Salary Paid</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                  {payrollHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/55 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {new Date(0, item.month - 1).toLocaleString(undefined, { month: 'long' })} {item.year}
                      </td>
                      {user.role === 'Admin' && (
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{item.user?.name || 'Deleted Staff'}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{item.user?.employeeId}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-500 font-semibold">${item.basicSalary.toLocaleString()}</td>
                      <td className="px-6 py-4 text-rose-500 font-semibold">-${item.deductions.toFixed(2)}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">${item.netSalary.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDownloadPDF(item._id, item.month, item.year)}
                          className="px-3.5 py-2 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 border border-slate-150 rounded-xl text-slate-600 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Payslip</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs font-bold">
            No payroll runs processed yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;
