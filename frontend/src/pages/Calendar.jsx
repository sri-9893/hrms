import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';

// ✅ FIXED IMPORT (this is the main error fix)
import enUS from 'date-fns/locale/en-US';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // Load employees (Admin only)
  // ---------------------------
  const fetchEmployeesList = async () => {
    try {
      const res = await api.get('/employees');
      if (res.data?.success) {
        setEmployeesList(res.data.employees || []);
      }
    } catch (err) {
      console.error('Failed to load employee list', err);
    }
  };

  // ---------------------------
  // Load calendar events
  // ---------------------------
  const fetchEvents = async (dateVal, employeeId) => {
    setLoading(true);
    try {
      const month = dateVal.getMonth() + 1;
      const year = dateVal.getFullYear();

      const res = await api.get('/calendar', {
        params: {
          month,
          year,
          userId: employeeId || undefined,
        },
      });

      if (res.data?.success) {
        const mappedEvents = (res.data.events || []).map((evt) => ({
          ...evt,

          // IMPORTANT: react-big-calendar requires title
          title: evt.title || evt.name || 'Event',

          start: new Date(evt.start),
          end: new Date(evt.end),
        }));

        setEvents(mappedEvents);
      }
    } catch (err) {
      console.error('Failed to fetch calendar events', err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Load employees once
  // ---------------------------
  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchEmployeesList();
    }
  }, [user]);

  // ---------------------------
  // Reload events when date/user changes
  // ---------------------------
  useEffect(() => {
    fetchEvents(currentDate, selectedEmployee);
  }, [currentDate, selectedEmployee]);

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  // ---------------------------
  // Event styling
  // ---------------------------
  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color || '#3B82F6',
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
    },
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Interactive Calendar
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Unified view of holidays, leaves, and schedules.
          </p>
        </div>

        {user?.role === 'Admin' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">
              Inspect Staff:
            </span>

            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs rounded-xl shadow-sm"
            >
              <option value="">All Events</option>
              {employeesList.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={['month']}
            defaultView="month"
            date={currentDate}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
          />
        </div>
      )}
    </div>
  );
};

export default Calendar;