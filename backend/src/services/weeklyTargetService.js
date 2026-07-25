import WeeklyTarget from '../models/WeeklyTarget.js';
import DailyActionPlan from '../models/DailyActionPlan.js';
import mongoose from 'mongoose';

const getWeekDateRange = () => {
  const curr = new Date();
  const day = curr.getDay();
  const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday

  const weekStartDate = new Date(curr.setDate(diff));
  weekStartDate.setHours(0, 0, 0, 0);

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);

  return { weekStartDate, weekEndDate };
};

const MOCK_WEEKLY_TARGETS = new Map();

class WeeklyTargetService {
  static async getCurrentTarget(userId) {
    const { weekStartDate, weekEndDate } = getWeekDateRange();
    const cleanUserId = String(userId);

    let callsCompleted = 0;
    let messagesCompleted = 0;
    let admissionsCompleted = 0;
    let enquiriesCompleted = 0;
    let emailsCompleted = 0;
    let visitsCompleted = 0;

    // 1. Calculate live cumulative progress by summing daily action plans for this week
    if (mongoose.connection.readyState === 1) {
      try {
        const dailyPlans = await DailyActionPlan.find({
          employeeId: cleanUserId,
          planDate: { $gte: weekStartDate, $lte: weekEndDate },
        });

        dailyPlans.forEach((plan) => {
          callsCompleted += Number(plan.dailyCallsCompleted) || 0;
          messagesCompleted += Number(plan.dailyWhatsappCompleted) || 0;
          admissionsCompleted += Number(plan.dailyAdmissionsCompleted) || 0;
          enquiriesCompleted += Number(plan.dailyEnquiryPipelineCompleted) || 0;
        });
      } catch (e) {
        console.warn('[WeeklyTarget Warning]: Live daily aggregation failed:', e.message);
      }

      let target = await WeeklyTarget.findOne({
        employeeId: cleanUserId,
        weekStartDate: { $gte: weekStartDate, $lte: weekEndDate },
      });

      if (!target) {
        target = await WeeklyTarget.create({
          employeeId: userId,
          weekStartDate,
          weekEndDate,
          callsTarget: 150,
          callsCompleted,
          messagesTarget: 250,
          messagesCompleted,
          emailsTarget: 30,
          emailsCompleted,
          enquiriesTarget: 50,
          enquiriesCompleted,
          visitsTarget: 5,
          visitsCompleted,
          admissionsTarget: 10,
          admissionsCompleted,
          isSubmitted: false,
          weeklyGoals: [],
        });
      } else {
        // Update live aggregated completed counts from daily plans
        target.callsCompleted = callsCompleted;
        target.messagesCompleted = messagesCompleted;
        target.admissionsCompleted = admissionsCompleted;
        target.enquiriesCompleted = enquiriesCompleted;

        // Calculate dynamic overall progress percentage
        const totalTarget = (target.callsTarget || 1) + (target.messagesTarget || 1) + (target.admissionsTarget || 1) + (target.enquiriesTarget || 1);
        const totalDone = callsCompleted + messagesCompleted + admissionsCompleted + enquiriesCompleted;
        target.overallProgress = Math.min(100, Math.round((totalDone / totalTarget) * 100));
        await target.save();
      }

      return target;
    }

    // Memory Fallback - Pure Dynamic Calculation from Memory Fallback
    const userKey = `${userId}_target`;
    if (!MOCK_WEEKLY_TARGETS.has(userKey)) {
      MOCK_WEEKLY_TARGETS.set(userKey, {
        _id: 'weekly_target_001',
        employeeId: userId,
        weekStartDate,
        weekEndDate,
        callsTarget: 150,
        callsCompleted: 0,
        messagesTarget: 250,
        messagesCompleted: 0,
        emailsTarget: 30,
        emailsCompleted: 0,
        enquiriesTarget: 50,
        enquiriesCompleted: 0,
        visitsTarget: 5,
        visitsCompleted: 0,
        admissionsTarget: 10,
        admissionsCompleted: 0,
        isSubmitted: false,
        weeklyGoals: [],
        overallProgress: 0,
      });
    }

    const cached = MOCK_WEEKLY_TARGETS.get(userKey);
    return cached;
  }

  static async updateTargetProgress(userId, targetId, payload) {
    const { weekStartDate, weekEndDate } = getWeekDateRange();

    if (mongoose.connection.readyState === 1) {
      let target = await WeeklyTarget.findOne({ employeeId: userId, weekStartDate: { $gte: weekStartDate } });
      if (!target) {
        target = await WeeklyTarget.create({
          employeeId: userId,
          weekStartDate,
          weekEndDate,
          ...payload,
        });
      } else {
        Object.assign(target, payload);
        await target.save();
      }
      return target;
    }

    const target = await this.getCurrentTarget(userId);
    Object.assign(target, payload);
    return target;
  }

  static async getTargetHistory(userId) {
    if (mongoose.connection.readyState === 1) {
      return await WeeklyTarget.find({ employeeId: userId }).sort({ weekStartDate: -1 }).limit(12);
    }
    const current = await this.getCurrentTarget(userId);
    return [current];
  }
}

export default WeeklyTargetService;
