import AttendanceService from '../services/attendanceService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

// GET /api/v1/attendance/today - get logged-in employee's today attendance status
export const getTodayAttendance = asyncHandler(async (req, res) => {
  const employeeId = req.user?._id || req.user?.id || '65b210f9a843e90011223341';
  const attendance = await AttendanceService.getTodayAttendance(employeeId);
  res.status(200).json(new ApiResponse(200, attendance, 'Today attendance fetched'));
});

// POST /api/v1/attendance/clock-in - clock in with GPS validation
export const clockIn = asyncHandler(async (req, res) => {
  const employeeId = req.user?._id || req.user?.id || '65b210f9a843e90011223341';
  const { latitude, longitude, device, browser, ipAddress } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: 'GPS latitude and longitude coordinates are required for clock-in verification.',
    });
  }

  try {
    const attendance = await AttendanceService.clockIn(employeeId, {
      latitude: Number(latitude),
      longitude: Number(longitude),
      device: device || req.headers['user-agent'] || 'Web Client',
      browser: browser || 'Chrome/Edge',
      ipAddress: ipAddress || req.ip || '127.0.0.1',
    });

    res.status(200).json(new ApiResponse(200, attendance, 'Clock-in successful! Attendance marked as Present.'));
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// POST /api/v1/attendance/clock-out - clock out with GPS validation
export const clockOut = asyncHandler(async (req, res) => {
  const employeeId = req.user?._id || req.user?.id || '65b210f9a843e90011223341';
  const { latitude, longitude, tasksCompletedSummary, tomorrowTasks, remarks, dailyCallsCompleted, dailyWhatsappCompleted, dailyAdmissionsCompleted, dailyEnquiryPipelineCompleted } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: 'GPS latitude and longitude coordinates are required for clock-out verification.',
    });
  }

  try {
    const attendance = await AttendanceService.clockOut(employeeId, {
      latitude: Number(latitude),
      longitude: Number(longitude),
      tasksCompletedSummary,
      tomorrowTasks,
      remarks,
      dailyCallsCompleted,
      dailyWhatsappCompleted,
      dailyAdmissionsCompleted,
      dailyEnquiryPipelineCompleted,
    });

    res.status(200).json(new ApiResponse(200, attendance, 'Clock-out successful! EOD Report submitted and attendance updated.'));
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// POST /api/v1/attendance/validate-gps - check location without clocking in
export const validateGpsLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude required.',
    });
  }

  const result = await AttendanceService.validateLocation(Number(latitude), Number(longitude));
  res.status(200).json(new ApiResponse(200, result, 'GPS Location validated against active branches'));
});

// POST /api/v1/attendance/reset-today - Secret test reset today's attendance (Admin/Testing override)
export const resetTodayAttendanceController = asyncHandler(async (req, res) => {
  const employeeId = req.user?._id || req.user?.id || '65b210f9a843e90011223341';
  await AttendanceService.resetTodayAttendance(employeeId);
  res.status(200).json(new ApiResponse(200, { success: true }, "Today's attendance has been successfully reset."));
});


