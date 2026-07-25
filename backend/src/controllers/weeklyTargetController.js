import WeeklyTargetService from '../services/weeklyTargetService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCurrentWeeklyTarget = asyncHandler(async (req, res) => {
  const target = await WeeklyTargetService.getCurrentTarget(req.user._id);
  res.status(200).json(new ApiResponse(200, { target }, 'Current weekly target retrieved successfully'));
});

export const createWeeklyTarget = asyncHandler(async (req, res) => {
  const target = await WeeklyTargetService.updateTargetProgress(req.user._id, req.body.id || 'current', req.body);
  res.status(201).json(new ApiResponse(201, { target }, 'Weekly target created or updated successfully'));
});

export const updateWeeklyTarget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const target = await WeeklyTargetService.updateTargetProgress(req.user._id, id, req.body);
  res.status(200).json(new ApiResponse(200, { target }, 'Weekly target updated successfully'));
});

export const getWeeklyTargetHistory = asyncHandler(async (req, res) => {
  const history = await WeeklyTargetService.getTargetHistory(req.user._id);
  res.status(200).json(new ApiResponse(200, { history }, 'Weekly target history retrieved successfully'));
});
