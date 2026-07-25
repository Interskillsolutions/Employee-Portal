import AttendanceService from '../services/attendanceService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

// GET /api/v1/branches/active - list all active registered company branches (Employee / Manager / Admin)
export const getActiveBranches = asyncHandler(async (req, res) => {
  const branches = await AttendanceService.getActiveBranches();
  res.status(200).json(new ApiResponse(200, branches, 'Active branches fetched successfully'));
});

// GET /api/v1/branches/all - list all registered company branches (Admin control panel)
export const getAllBranches = asyncHandler(async (req, res) => {
  const branches = await AttendanceService.getAllBranches();
  res.status(200).json(new ApiResponse(200, branches, 'All company branches fetched successfully'));
});

// POST /api/v1/branches - create a new company branch with coordinates & radius (Admin ONLY)
export const createBranch = asyncHandler(async (req, res) => {
  const { branchName, branchCode, address, latitude, longitude, allowedRadius } = req.body;

  if (!branchName || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Branch Name, Latitude, and Longitude are required fields.',
    });
  }

  const newBranch = await AttendanceService.createBranch({
    branchName,
    branchCode,
    address,
    latitude: Number(latitude),
    longitude: Number(longitude),
    allowedRadius: Number(allowedRadius || 100),
  });

  res.status(201).json(new ApiResponse(201, newBranch, 'New Company Branch created successfully!'));
});

// DELETE /api/v1/branches/:id - permanently remove a branch (Admin ONLY)
export const deleteBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await AttendanceService.deleteBranch(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Branch not found.' });
  }
  res.status(200).json(new ApiResponse(200, deleted, 'Branch deleted successfully.'));
});

// PUT /api/v1/branches/:id/toggle - toggle branch active status (Admin ONLY)
export const toggleBranchStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const updated = await AttendanceService.toggleBranchStatus(id, Boolean(isActive));
  res.status(200).json(new ApiResponse(200, updated, 'Branch active status updated'));
});
