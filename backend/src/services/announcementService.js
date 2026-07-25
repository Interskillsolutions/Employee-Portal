import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const MOCK_ANNOUNCEMENTS = [];

class AnnouncementService {
  static async createAnnouncement(sender, payload) {
    const { title, message, type = 'General', targetEmployeeIds = [], priority = 'Normal' } = payload;

    const cleanSenderId = String(sender._id || sender.id || 'IS-MGR-201');
    
    let senderName = 'Portal Manager';
    if (sender) {
      if (sender.firstName || sender.lastName) {
        senderName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim();
      } else if (sender.name) {
        senderName = sender.name;
      }
    }

    if (mongoose.connection.readyState === 1 && cleanSenderId && cleanSenderId !== '65b210f9a843e90011223341') {
      try {
        const dbUser = await User.findById(cleanSenderId).catch(() => null);
        if (dbUser) {
          senderName = `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || dbUser.email;
        }
      } catch (e) {
        console.warn('Sender user lookup warning:', e.message);
      }
    }

    const cleanTargets = (targetEmployeeIds || []).map((id) => String(id));

    if (mongoose.connection.readyState === 1) {
      try {
        const announcement = await Announcement.create({
          title,
          message,
          type,
          targetEmployeeIds: cleanTargets,
          senderId: cleanSenderId,
          senderName,
          senderRole: sender.role || 'Manager',
          priority,
          acknowledgedBy: [],
          snoozedBy: [],
        });
        return announcement;
      } catch (err) {
        console.warn('[Announcement Warning]: MongoDB create failed:', err.message);
      }
    }

    const mockItem = {
      _id: `ann_${Date.now()}`,
      title,
      message,
      type,
      targetEmployeeIds: cleanTargets,
      senderId: cleanSenderId,
      senderName,
      senderRole: sender.role || 'Manager',
      priority,
      acknowledgedBy: [],
      snoozedBy: [],
      createdAt: new Date().toISOString(),
    };
    MOCK_ANNOUNCEMENTS.unshift(mockItem);
    return mockItem;
  }

  static async getAnnouncementsForEmployee(employeeId) {
    const cleanEmpId = String(employeeId);

    if (mongoose.connection.readyState === 1) {
      try {
        const list = await Announcement.find({
          $or: [
            { type: 'General' },
            { targetEmployeeIds: cleanEmpId },
          ],
        }).sort({ createdAt: -1 });

        return list;
      } catch (err) {
        console.warn('[Announcement Warning]: MongoDB find failed:', err.message);
      }
    }

    return MOCK_ANNOUNCEMENTS.filter(
      (a) => a.type === 'General' || (a.targetEmployeeIds && a.targetEmployeeIds.includes(cleanEmpId))
    );
  }

  static async acknowledgeAnnouncement(employeeId, announcementId) {
    const cleanEmpId = String(employeeId);

    if (mongoose.connection.readyState === 1) {
      try {
        const announcement = await Announcement.findById(announcementId);
        if (announcement) {
          if (!announcement.acknowledgedBy.includes(cleanEmpId)) {
            announcement.acknowledgedBy.push(cleanEmpId);
            announcement.snoozedBy = announcement.snoozedBy.filter((id) => id !== cleanEmpId);
            await announcement.save();
          }
          return announcement;
        }
      } catch (err) {
        console.warn('[Announcement Warning]: Acknowledge failed:', err.message);
      }
    }

    const item = MOCK_ANNOUNCEMENTS.find((a) => String(a._id) === String(announcementId));
    if (item) {
      if (!item.acknowledgedBy.includes(cleanEmpId)) {
        item.acknowledgedBy.push(cleanEmpId);
        item.snoozedBy = item.snoozedBy.filter((id) => id !== cleanEmpId);
      }
      return item;
    }
    return null;
  }

  static async snoozeAnnouncement(employeeId, announcementId) {
    const cleanEmpId = String(employeeId);

    if (mongoose.connection.readyState === 1) {
      try {
        const announcement = await Announcement.findById(announcementId);
        if (announcement) {
          if (!announcement.snoozedBy.includes(cleanEmpId)) {
            announcement.snoozedBy.push(cleanEmpId);
            await announcement.save();
          }
          return announcement;
        }
      } catch (err) {
        console.warn('[Announcement Warning]: Snooze failed:', err.message);
      }
    }

    const item = MOCK_ANNOUNCEMENTS.find((a) => String(a._id) === String(announcementId));
    if (item) {
      if (!item.snoozedBy.includes(cleanEmpId)) {
        item.snoozedBy.push(cleanEmpId);
      }
      return item;
    }
    return null;
  }
}

export default AnnouncementService;
