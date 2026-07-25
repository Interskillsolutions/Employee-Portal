import ActionPlanService from '../services/actionPlanService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getTodayActionPlan = asyncHandler(async (req, res) => {
  const plan = await ActionPlanService.getTodayPlan(req.user._id);
  res.status(200).json(new ApiResponse(200, { plan }, 'Today action plan retrieved successfully'));
});

export const saveBulkActionPlan = asyncHandler(async (req, res) => {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Please add at least one task to save your Daily Action Plan.',
    });
  }

  const plan = await ActionPlanService.saveBulkPlan(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, { plan }, 'Daily Action Plan saved successfully'));
});

export const updateTargetProgress = asyncHandler(async (req, res) => {
  const { metricKey, value } = req.body;
  const plan = await ActionPlanService.updateTargetProgress(req.user._id, metricKey, value);
  res.status(200).json(new ApiResponse(200, { plan }, 'Target progress updated successfully'));
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { taskId, status } = req.body;
  const plan = await ActionPlanService.updateTaskStatus(req.user._id, taskId, status);
  res.status(200).json(new ApiResponse(200, { plan }, 'Task status updated successfully'));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const plan = await ActionPlanService.deleteTask(req.user._id, taskId);
  res.status(200).json(new ApiResponse(200, { plan }, 'Task deleted successfully'));
});

export const assignTaskToEmployee = asyncHandler(async (req, res) => {
  const { employeeId, title, description, category, priority } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }

  const managerName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Manager Sarah';
  const plan = await ActionPlanService.assignManagerTask(employeeId || req.user._id, { title, description, category, priority }, managerName);

  res.status(200).json(new ApiResponse(200, { plan }, 'Task assigned to employee successfully'));
});

export const respondToTaskApproval = asyncHandler(async (req, res) => {
  const { taskId, action, rejectionReason } = req.body;
  if (!taskId || !action) {
    return res.status(400).json({ success: false, message: 'taskId and action are required' });
  }

  const plan = await ActionPlanService.respondToTask(req.user._id, taskId, action, rejectionReason);
  res.status(200).json(new ApiResponse(200, { plan }, `Task ${action}ed successfully`));
});
