import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import {
  Users,
  CheckSquare,
  AlertTriangle,
  FolderMinus,
  DollarSign,
  TrendingUp,
  Award,
  CalendarCheck2,
  ListTodo,
  CalendarHeart,
} from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user?.role === 'Admin') {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Admin Console</h1>
          <p className="text-slate-400 text-sm font-medium">Overview of the company's human capital analytics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            icon={Users}
            color="bg-blue-500/10 text-blue-600"
            subtext="Registered staff members"
          />
          <StatCard
            title="Present Today"
            value={stats?.presentToday || 0}
            icon={CheckSquare}
            color="bg-emerald-500/10 text-emerald-600"
            subtext="Active in-office"
          />
          <StatCard
            title="Absent Today"
            value={stats?.absentToday || 0}
            icon={AlertTriangle}
            color="bg-rose-500/10 text-rose-600"
            subtext="Unexcused / Missing checks"
          />
          <StatCard
            title="Pending Leaves"
            value={stats?.pendingLeaves || 0}
            icon={FolderMinus}
            color="bg-amber-500/10 text-amber-600"
            subtext="Requiring HR decision"
          />
          <StatCard
            title="Monthly Payroll"
            value={`$${(stats?.totalPayrollCost || 0).toLocaleString()}`}
            icon={DollarSign}
            color="bg-violet-500/10 text-violet-600"
            subtext="Settled Net Salaries"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/employees"
                className="p-4 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 border border-slate-100 hover:border-primary-100 rounded-xl transition font-bold text-slate-700 text-sm flex flex-col gap-2"
              >
                <Users className="w-5 h-5 text-primary-500" />
                Add Employee
              </Link>
              <Link
                to="/leaves"
                className="p-4 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 border border-slate-100 hover:border-primary-100 rounded-xl transition font-bold text-slate-700 text-sm flex flex-col gap-2"
              >
                <FolderMinus className="w-5 h-5 text-amber-500" />
                Review Leaves
              </Link>
              <Link
                to="/payroll"
                className="p-4 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 border border-slate-100 hover:border-primary-100 rounded-xl transition font-bold text-slate-700 text-sm flex flex-col gap-2"
              >
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Process Salaries
              </Link>
              <Link
                to="/holidays"
                className="p-4 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 border border-slate-100 hover:border-primary-100 rounded-xl transition font-bold text-slate-700 text-sm flex flex-col gap-2"
              >
                <CalendarHeart className="w-5 h-5 text-indigo-500" />
                Manage Holidays
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Company Metrics</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Operational Summary</h3>
              <p className="text-slate-500 text-sm">
                The current employee presence rate is{' '}
                <strong className="text-slate-800">
                  {stats?.totalEmployees > 0
                    ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
                    : 0}
                  %
                </strong>{' '}
                for today. Keep an eye on pending leaves to prevent payroll bottlenecks at the end of the month.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-500 flex items-center gap-3">
              <Award className="w-6 h-6 text-primary-600 font-bold" />
              All corporate calendars, leaves, and holidays remain automatically calculated into payroll deductions.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Workspace</h1>
        <p className="text-slate-400 text-sm font-medium">Keep track of your performance and calendar details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Days Present"
          value={stats?.attendance?.present || 0}
          icon={CalendarCheck2}
          color="bg-blue-500/10 text-blue-600"
          subtext="This month"
        />
        <StatCard
          title="Days Absent"
          value={stats?.attendance?.absent || 0}
          icon={AlertTriangle}
          color="bg-rose-500/10 text-rose-600"
          subtext="Calculated as deduction days"
        />
        <StatCard
          title="Days on Leave"
          value={stats?.attendance?.leave || 0}
          icon={FolderMinus}
          color="bg-amber-500/10 text-amber-600"
          subtext="Excused paid days off"
        />
        <StatCard
          title="Leaves Status"
          value={`${stats?.leaves?.approved || 0}/${stats?.leaves?.total || 0}`}
          icon={ListTodo}
          color="bg-violet-500/10 text-violet-600"
          subtext="Approved / Applied leaves"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6 lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800">Last Paid Salary</h3>
          
          {stats?.salarySummary ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-bold uppercase">Settled Month</span>
                <span className="text-sm font-bold text-slate-700">
                  {stats.salarySummary.month}/{stats.salarySummary.year}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-400">Basic Salary</span>
                  <span className="text-slate-700">${stats.salarySummary.basicSalary.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-rose-500">
                  <span>Deductions</span>
                  <span>-${stats.salarySummary.deductions.toFixed(2)}</span>
                </div>
                <hr className="border-slate-100 my-1" />
                <div className="flex justify-between text-base font-extrabold text-emerald-600">
                  <span>Net Salary</span>
                  <span>${stats.salarySummary.netSalary.toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/payroll"
                className="w-full text-center py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-primary-200"
              >
                View History
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase">No Paid Payroll Logs</p>
              <p className="text-[11px] text-slate-400 mt-1">Salary history is calculated at month-end by HR.</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800">Upcoming Holidays</h3>
          <div className="flex flex-col gap-2">
            {stats?.upcomingHolidays && stats.upcomingHolidays.length > 0 ? (
              stats.upcomingHolidays.map((h) => (
                <div
                  key={h._id}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition duration-150"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{h.name}</span>
                    <span className="text-xs text-slate-400 font-semibold">{h.type} Holiday</span>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-xl font-bold">
                    {new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-bold">No upcoming holidays scheduled.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
