import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ActionPlanService from '../services/actionPlanService.js';

export const getEmployeeDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : 'demo_user';
  const todayPlan = await ActionPlanService.getTodayPlan(userId);

  const summary = {
    employee: {
      name: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Alex Morgan',
      avatarUrl: req.user?.profileImage || '',
    },
    actionPlan: todayPlan || null,
    attendance: {
      status: 'Present',
      checkInTime: '09:15 AM',
      checkOutTime: null,
      workingHours: '05h 42m',
      isClockedIn: true,
    },
    activities: [
      { id: 'a1', title: 'Updated Action Plan Commitments', time: 'Just now', category: 'Task' },
      { id: 'a2', title: 'Clocked In for Morning Shift (09:15 AM)', time: 'Today', category: 'Attendance' },
    ],
    announcements: [
      {
        id: 'ann1',
        title: 'Q3 Productivity Townhall Meeting',
        content: 'All team members are invited to join the Q3 performance townhall tomorrow at 3:00 PM.',
        date: 'July 24, 2026',
        tag: 'Important',
      },
      {
        id: 'ann2',
        title: 'Scheduled System Maintenance',
        content: 'The employee portal server will undergo scheduled maintenance on Sunday from 2 AM to 4 AM.',
        date: 'July 23, 2026',
        tag: 'System',
      },
    ],
  };

  res.status(200).json(new ApiResponse(200, summary, 'Employee dashboard summary retrieved successfully'));
});
