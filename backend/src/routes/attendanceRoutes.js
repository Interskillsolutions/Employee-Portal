import express from 'express';
import {
  getTodayAttendance,
  clockIn,
  clockOut,
  validateGpsLocation,
  resetTodayAttendanceController,
} from '../controllers/attendanceController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/today', getTodayAttendance);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/validate-gps', validateGpsLocation);
router.post('/reset-today', resetTodayAttendanceController);

export default router;
