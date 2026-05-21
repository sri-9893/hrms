import express from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getTodayStatus,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/my', getMyAttendance);
router.get('/today', getTodayStatus);
router.get('/all', authorize('Admin'), getAllAttendance);

export default router;
