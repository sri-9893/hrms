import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  PlaneTakeoff,
  Wallet,
  CalendarDays,
  Calendar,
  LogOut,
  Building2,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Employee'] },
    { name: 'Employees', path: '/employees', icon: Users, roles: ['Admin'] },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['Admin', 'Employee'] },
    { name: 'Leaves', path: '/leaves', icon: PlaneTakeoff, roles: ['Admin', 'Employee'] },
    { name: 'Payroll', path: '/payroll', icon: Wallet, roles: ['Admin', 'Employee'] },
    { name: 'Holidays', path: '/holidays', icon: CalendarDays, roles: ['Admin', 'Employee'] },
    { name: 'Calendar', path: '/calendar', icon: Calendar, roles: ['Admin', 'Employee'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shadow-xl shrink-0">
      <div className="flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <img
            src="/logo.jpg.jpeg"
            alt="Company Logo"
            className="w-16 h-14 object-contain"
          />
          <div>
            <h1 className="text-white font-extrabold text-lg tracking-wider">Tech Minds IT Solutions </h1>
            <span className="text-[10px] uppercase font-bold text-slate-500">HRMS Portal</span>
          </div>
        </div>

        {user && (
          <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-primary-900/30 ring-2 ring-primary-500/25">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
              <span className="text-xs text-primary-400 font-medium">{user.role}</span>
            </div>
          </div>
        )}

        <nav className="p-4 flex flex-col gap-1">
          {links
            .filter((link) => link.roles.includes(user?.role))
            .map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/10'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-sm font-bold transition duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
