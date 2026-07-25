import Attendance from '../models/Attendance.js';
import Branch from '../models/Branch.js';
import DailyActionPlan from '../models/DailyActionPlan.js';
import { calculateHaversineDistance } from '../utils/haversine.js';
import mongoose from 'mongoose';

// Initial pre-seeded branches for InterSkill Solutions
let INITIAL_BRANCHES = [
  {
    _id: '65b210f9a843e90088990001',
    branchName: 'Thane Branch',
    branchCode: 'IS-THN-01',
    address: 'Gladiola Tower, Near Station, Thane West, Maharashtra',
    latitude: 19.1972,
    longitude: 72.9722,
    allowedRadius: 100,
    isActive: true,
  },
  {
    _id: '65b210f9a843e90088990002',
    branchName: 'Andheri Branch',
    branchCode: 'IS-ADH-02',
    address: 'Solitaire Corporate Park, Andheri East, Mumbai, Maharashtra',
    latitude: 19.1197,
    longitude: 72.8464,
    allowedRadius: 100,
    isActive: true,
  },
  {
    _id: '65b210f9a843e90088990003',
    branchName: 'Head Office / Main Campus',
    branchCode: 'IS-HQ-00',
    address: 'InterSkill HQ Campus, Tech Hub Sector 5, Cyber City',
    latitude: 28.6139,
    longitude: 77.209,
    allowedRadius: 100,
    isActive: true,
  },
];

const MOCK_ATTENDANCE_MAP = new Map();

const getTodayDateKey = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

class AttendanceService {
  /**
   * Get all active company branches
   */
  static async getActiveBranches() {
    if (mongoose.connection.readyState === 1) {
      try {
        let branches = await Branch.find({ isActive: true });
        if (!branches || branches.length === 0) {
          branches = await Branch.insertMany(INITIAL_BRANCHES);
        }
        return branches;
      } catch (err) {
        console.warn('[Attendance Service Warning]: DB branch query failed, using mock fallback:', err.message);
      }
    }
    return INITIAL_BRANCHES.filter((b) => b.isActive);
  }

  /**
   * Get ALL company branches (including inactive for admin)
   */
  static async getAllBranches() {
    if (mongoose.connection.readyState === 1) {
      try {
        let branches = await Branch.find({});
        if (!branches || branches.length === 0) {
          branches = await Branch.insertMany(INITIAL_BRANCHES);
        }
        return branches;
      } catch (err) {
        console.warn('[Attendance Service Warning]: DB branch query failed:', err.message);
      }
    }
    return INITIAL_BRANCHES;
  }

  /**
   * Create a new company branch (Admin function)
   */
  static async createBranch({ branchName, branchCode, address, latitude, longitude, allowedRadius }) {
    const newBranchData = {
      branchName: branchName.trim(),
      branchCode: (branchCode || `IS-${Date.now().toString().slice(-4)}`).toUpperCase().trim(),
      address: address.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      allowedRadius: Number(allowedRadius || 100),
      isActive: true,
    };

    if (mongoose.connection.readyState === 1) {
      const created = await Branch.create(newBranchData);
      return created;
    }

    const mockObj = {
      _id: `br_${Date.now()}`,
      ...newBranchData,
    };
    INITIAL_BRANCHES.push(mockObj);
    return mockObj;
  }

  /**
   * Toggle branch active status (Admin function)
   */
  static async toggleBranchStatus(branchId, isActive) {
    if (mongoose.connection.readyState === 1) {
      const updated = await Branch.findByIdAndUpdate(branchId, { isActive }, { new: true });
      return updated;
    }

    const found = INITIAL_BRANCHES.find((b) => String(b._id || b.id) === String(branchId));
    if (found) {
      found.isActive = isActive;
      return found;
    }
    return null;
  }

  /**
   * Delete a company branch permanently (Admin function)
   */
  static async deleteBranch(branchId) {
    if (mongoose.connection.readyState === 1) {
      const deleted = await Branch.findByIdAndDelete(branchId);
      return deleted;
    }

    const idx = INITIAL_BRANCHES.findIndex((b) => String(b._id || b.id) === String(branchId));
    if (idx !== -1) {
      const removed = INITIAL_BRANCHES.splice(idx, 1);
      return removed[0];
    }
    return null;
  }

  /**
   * Validate GPS coordinates against ALL active branches
   */
  static async validateLocation(userLat, userLng) {
    const activeBranches = await this.getActiveBranches();

    let nearestBranch = null;
    let minDistance = Infinity;
    let isWithinAnyRadius = false;

    for (const branch of activeBranches) {
      const bObj = branch.toObject ? branch.toObject() : branch;
      const dist = calculateHaversineDistance(userLat, userLng, bObj.latitude, bObj.longitude);

      if (dist < minDistance) {
        minDistance = dist;
        nearestBranch = bObj;
      }

      if (dist <= (bObj.allowedRadius || 100)) {
        isWithinAnyRadius = true;
      }
    }

    return {
      isWithinRadius: isWithinAnyRadius,
      nearestBranch,
      distanceFromBranch: minDistance,
      allowedRadius: nearestBranch?.allowedRadius || 100,
    };
  }

  /**
   * Get today's attendance record for an employee
   */
  static async getTodayAttendance(employeeId) {
    const cleanId = String(employeeId);
    const today = getTodayDateKey();

    if (mongoose.connection.readyState === 1) {
      try {
        const startOfDay = new Date(today);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const record = await Attendance.findOne({
          employeeId: cleanId,
          attendanceDate: { $gte: startOfDay, $lte: endOfDay },
        }).populate('branchId');

        if (record) return record;
      } catch (err) {
        console.warn('[Attendance Warning]: Fetch today attendance failed:', err.message);
      }
    }

    const key = `${cleanId}_${today.toISOString()}`;
    return MOCK_ATTENDANCE_MAP.get(key) || null;
  }

  /**
   * Clock In employee after validating geo-fencing against active branches
   */
  static async clockIn(employeeId, { latitude, longitude, device, browser, ipAddress }) {
    const cleanId = String(employeeId);
    const today = getTodayDateKey();

    const existing = await this.getTodayAttendance(cleanId);
    if (existing && existing.clockInTime) {
      throw new Error("Already clocked in for today. Clock In is allowed only once per day.");
    }

    const geoResult = await this.validateLocation(latitude, longitude);
    if (!geoResult.isWithinRadius) {
      throw new Error(
        `You are currently outside all registered InterSkill Solutions branches. Please visit any company branch to mark attendance.`
      );
    }

    const clockInTimeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newRecordData = {
      employeeId: cleanId,
      branchId: geoResult.nearestBranch._id || geoResult.nearestBranch.id,
      attendanceDate: today,
      status: 'Present',
      clockInTime: clockInTimeStr,
      clockOutTime: '',
      latitude,
      longitude,
      distanceFromBranch: geoResult.distanceFromBranch,
      device: device || 'Web Browser',
      browser: browser || 'Chrome/Edge',
      ipAddress: ipAddress || '127.0.0.1',
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await Attendance.create(newRecordData);
        const populated = await Attendance.findById(created._id).populate('branchId');
        return populated;
      } catch (err) {
        console.warn('[Attendance Warning]: DB clockIn failed, saving in memory:', err.message);
      }
    }

    const mockRecord = {
      _id: `att_${Date.now()}`,
      ...newRecordData,
      branchId: geoResult.nearestBranch,
    };

    const key = `${cleanId}_${today.toISOString()}`;
    MOCK_ATTENDANCE_MAP.set(key, mockRecord);
    return mockRecord;
  }

  /**
   * Clock Out employee after verifying geo-fencing against active branches
   */
  static async clockOut(employeeId, { latitude, longitude, tasksCompletedSummary, tomorrowTasks, remarks, dailyCallsCompleted, dailyWhatsappCompleted, dailyAdmissionsCompleted, dailyEnquiryPipelineCompleted }) {
    const cleanId = String(employeeId);
    const existing = await this.getTodayAttendance(cleanId);

    if (!existing || !existing.clockInTime) {
      throw new Error("No Clock In record found for today. Clock Out is allowed only after Clock In.");
    }

    if (existing.clockOutTime) {
      throw new Error("Already clocked out for today.");
    }

    const geoResult = await this.validateLocation(latitude, longitude);
    if (!geoResult.isWithinRadius) {
      throw new Error(
        `You are currently outside all registered InterSkill Solutions branches. Please visit any company branch to mark attendance.`
      );
    }

    const clockOutTimeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Update Daily Action Plan remarks and metrics if exists
    if (mongoose.connection.readyState === 1) {
      try {
        const today = getTodayDateKey();
        const startOfDay = new Date(today);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Find today's daily action plan
        const plan = await DailyActionPlan.findOne({
          employeeId: cleanId,
          planDate: { $gte: startOfDay, $lte: endOfDay }
        });
        if (plan) {
          plan.remarks = remarks || '';
          if (dailyCallsCompleted !== undefined) plan.dailyCallsCompleted = Number(dailyCallsCompleted);
          if (dailyWhatsappCompleted !== undefined) plan.dailyWhatsappCompleted = Number(dailyWhatsappCompleted);
          if (dailyAdmissionsCompleted !== undefined) plan.dailyAdmissionsCompleted = Number(dailyAdmissionsCompleted);
          if (dailyEnquiryPipelineCompleted !== undefined) plan.dailyEnquiryPipelineCompleted = Number(dailyEnquiryPipelineCompleted);
          await plan.save();
        }
      } catch (err) {
        console.warn('[Attendance Warning]: Failed to update DailyActionPlan EOD details:', err.message);
      }
    }

    if (mongoose.connection.readyState === 1 && existing.save) {
      existing.clockOutTime = clockOutTimeStr;
      existing.tasksCompletedSummary = tasksCompletedSummary || '';
      existing.tomorrowTasks = tomorrowTasks || '';
      existing.remarks = remarks || '';
      await existing.save();
      return existing;
    }

    const today = getTodayDateKey();
    const key = `${cleanId}_${today.toISOString()}`;
    const cached = MOCK_ATTENDANCE_MAP.get(key) || existing;
    cached.clockOutTime = clockOutTimeStr;
    cached.tasksCompletedSummary = tasksCompletedSummary || '';
    cached.tomorrowTasks = tomorrowTasks || '';
    cached.remarks = remarks || '';
    MOCK_ATTENDANCE_MAP.set(key, cached);
    return cached;
  }

  /**
   * Reset/Delete today's attendance for testing purposes
   */
  static async resetTodayAttendance(employeeId) {
    const cleanId = String(employeeId);
    const today = getTodayDateKey();

    if (mongoose.connection.readyState === 1) {
      try {
        const startOfDay = new Date(today);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Delete attendance
        await Attendance.deleteOne({
          employeeId: cleanId,
          attendanceDate: { $gte: startOfDay, $lte: endOfDay },
        });

        // Reset Daily Action Plan remarks
        const plan = await DailyActionPlan.findOne({
          employeeId: cleanId,
          planDate: { $gte: startOfDay, $lte: endOfDay }
        });
        if (plan) {
          plan.remarks = '';
          await plan.save();
        }
      } catch (err) {
        console.warn('[Attendance Warning]: DB resetTodayAttendance failed:', err.message);
      }
    }

    const key = `${cleanId}_${today.toISOString()}`;
    MOCK_ATTENDANCE_MAP.delete(key);
    return { success: true };
  }
}

export default AttendanceService;
