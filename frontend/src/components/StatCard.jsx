import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => {
  return (
    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition duration-200">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</span>
        {subtext && <span className="text-xs text-slate-400 font-semibold">{subtext}</span>}
      </div>
      <div className={`p-4 rounded-2xl ${color} flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatCard;
