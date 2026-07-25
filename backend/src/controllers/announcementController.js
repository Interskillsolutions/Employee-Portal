import AnnouncementService from '../services/announcementService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Announcement title and message are required' });
  }

  const announcement = await AnnouncementService.createAnnouncement(req.user, req.body);
  res.status(201).json(new ApiResponse(201, { announcement }, 'Announcement published successfully'));
});

export const getEmployeeAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await AnnouncementService.getAnnouncementsForEmployee(req.user._id);
  res.status(200).json(new ApiResponse(200, { announcements }, 'Announcements retrieved successfully'));
});

export const acknowledgeAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const announcement = await AnnouncementService.acknowledgeAnnouncement(req.user._id, id);
  res.status(200).json(new ApiResponse(200, { announcement }, 'Announcement acknowledged successfully'));
});

export const snoozeAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const announcement = await AnnouncementService.snoozeAnnouncement(req.user._id, id);
  res.status(200).json(new ApiResponse(200, { announcement }, 'Announcement snoozed successfully'));
});
