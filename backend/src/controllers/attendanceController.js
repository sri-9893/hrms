import Attendance from '../models/Attendance.js';
import Holiday from '../models/Holiday.js';
import Leave from '../models/Leave.js';
import User from '../models/User.js';

// Normalize date to YYYY-MM-DD midnight UTC
const getNormalizedDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Check if day is weekend (0 = Sunday, 6 = Saturday in UTC)
const isWeekend = (date) => {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
};

export const checkIn = async (req, res, next) => {
  try {
    const today = getNormalizedDate();
    const now = new Date();
    const checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isWeekend(today)) {
      return res.status(400).json({ success: false, message: 'Today is a weekend. Attendance cannot be punched.' });
    }

    const holiday = await Holiday.findOne({ date: today });
    if (holiday) {
      return res.status(400).json({ success: false, message: `Today is a holiday: ${holiday.name}` });
    }

    const leave = await Leave.findOne({
      user: req.user.id,
      status: 'Approved',
      startDate: { $lte: today },
      endDate: { $gte: today },
    });
    if (leave) {
      return res.status(400).json({ success: false, message: `You are on approved leave (${leave.type}) today.` });
    }

    let attendance = await Attendance.findOne({ user: req.user.id, date: today });
    if (attendance) {
      return res.status(400).json({ success: false, message: 'You have already checked in for today.' });
    }

    attendance = await Attendance.create({
      user: req.user.id,
      date: today,
      status: 'Present',
      checkIn: checkInTime,
    });

    res.status(201).json({
      success: true,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const today = getNormalizedDate();
    const now = new Date();
    const checkOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let attendance = await Attendance.findOne({ user: req.user.id, date: today });
    if (!attendance) {
      return res.status(400).json({ success: false, message: 'You have not checked in today yet.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'You have already checked out for today.' });
    }

    attendance.checkOut = checkOutTime;
    await attendance.save();

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query; // 1-indexed (1-12)
    const userId = req.user.id;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Please provide month and year' });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0)); // last day of month

    const records = await Attendance.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    const searchDate = date ? getNormalizedDate(date) : getNormalizedDate();

    const records = await Attendance.find({ date: searchDate }).populate('user', 'name employeeId department designation');

    res.status(200).json({
      success: true,
      date: searchDate,
      records,
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayStatus = async (req, res, next) => {
  try {
    const today = getNormalizedDate();
    const record = await Attendance.findOne({ user: req.user.id, date: today });

    res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    next(error);
  }
};
