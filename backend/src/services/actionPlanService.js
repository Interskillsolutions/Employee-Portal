import DailyActionPlan from '../models/DailyActionPlan.js';
import ApiError from '../utils/apiError.js';
import mongoose from 'mongoose';

const getTodayDateRange = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

const getNormalizedToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const MOCK_ACTION_PLANS = new Map();

// Pre-seed sample daily plan for Alex Morgan so manager sees live "Daily Plan Submitted" state
const seedAlexPlan = () => {
  const todayDate = getNormalizedToday();
  const alexKey = `65b210f9a843e90011223341_${todayDate.toISOString()}`;
  const mockAlexData = {
    _id: 'plan_alex_101',
    employeeId: '65b210f9a843e90011223341',
    planDate: todayDate,
    dailyCallsTarget: 35,
    dailyCallsCompleted: 18,
    dailyWhatsappTarget: 50,
    dailyWhatsappCompleted: 32,
    dailyExpectedAdmissions: 2,
    dailyAdmissionsCompleted: 1,
    dailyExpectedEnquiryPipeline: 12,
    dailyEnquiryPipelineCompleted: 8,
    tasks: [
      {
        _id: 'task_alex_1',
        title: 'Follow up with 15 high-intent prospective students',
        description: 'Call leads from yesterday enquiry batch',
        category: 'Calls',
        priority: 'High',
        status: 'Completed',
        assignedBy: '',
        approvalStatus: 'Self',
      },
      {
        _id: 'task_alex_2',
        title: 'Conduct course orientation demo session',
        description: 'Live interactive Q&A session at 2:00 PM',
        category: 'Meeting',
        priority: 'High',
        status: 'Pending',
        assignedBy: '',
        approvalStatus: 'Self',
      },
      {
        _id: 'task_alex_3',
        title: 'Update daily enquiry pipeline CRM entries',
        description: 'Record admissions progress in database',
        category: 'Admission',
        priority: 'Medium',
        status: 'Pending',
        assignedBy: '',
        approvalStatus: 'Self',
      },
    ],
    totalTasks: 3,
    completedTasks: 1,
    pendingTasks: 2,
    completionPercentage: 33,
    status: 'In Progress',
  };
  MOCK_ACTION_PLANS.set(alexKey, mockAlexData);
};
seedAlexPlan();

class ActionPlanService {
  static async getTodayPlan(userId) {
    const { startOfDay, endOfDay } = getTodayDateRange();
    const cleanUserId = String(userId);

    if (mongoose.connection.readyState === 1) {
      try {
        let plan = await DailyActionPlan.findOne({
          employeeId: cleanUserId,
          planDate: { $gte: startOfDay, $lte: endOfDay },
        });

        if (!plan) {
          plan = await DailyActionPlan.findOne({ employeeId: cleanUserId }).sort({ createdAt: -1 });
          if (plan) {
            const planCreatedDate = new Date(plan.createdAt).toDateString();
            const todayStr = new Date().toDateString();
            if (planCreatedDate !== todayStr) {
              plan = null;
            }
          }
        }

        if (plan) return plan;
      } catch (err) {
        console.warn('[ActionPlan Warning]: getTodayPlan MongoDB query failed:', err.message);
      }
    }

    const todayDate = getNormalizedToday();
    const userKey = `${cleanUserId}_${todayDate.toISOString()}`;
    return MOCK_ACTION_PLANS.get(userKey) || null;
  }

  static async saveBulkPlan(userId, payload) {
    const { startOfDay, endOfDay } = getTodayDateRange();
    const todayDate = getNormalizedToday();
    const cleanUserId = String(userId);

    const {
      dailyCallsTarget = 30,
      dailyWhatsappTarget = 50,
      dailyExpectedAdmissions = 2,
      dailyExpectedEnquiryPipeline = 10,
      tasks = [],
    } = payload;

    const formattedTasks = tasks.map((t, idx) => ({
      _id: t._id || t.id || new mongoose.Types.ObjectId().toString(),
      title: t.title,
      description: t.description || '',
      category: t.category || 'Other',
      priority: t.priority || 'Medium',
      status: t.status || 'Pending',
      assignedBy: t.assignedBy || '',
      approvalStatus: t.approvalStatus || 'Self',
      rejectionReason: t.rejectionReason || '',
      displayOrder: idx,
    }));

    if (mongoose.connection.readyState === 1) {
      try {
        let plan = await DailyActionPlan.findOne({
          employeeId: cleanUserId,
          planDate: { $gte: startOfDay, $lte: endOfDay },
        });

        if (!plan) {
          const latestPlan = await DailyActionPlan.findOne({ employeeId: cleanUserId }).sort({ createdAt: -1 });
          if (latestPlan) {
            const planCreatedDate = new Date(latestPlan.createdAt).toDateString();
            const todayStr = new Date().toDateString();
            if (planCreatedDate === todayStr) {
              plan = latestPlan;
            }
          }
        }

        if (plan) {
          plan.dailyCallsTarget = dailyCallsTarget;
          plan.dailyWhatsappTarget = dailyWhatsappTarget;
          plan.dailyExpectedAdmissions = dailyExpectedAdmissions;
          plan.dailyExpectedEnquiryPipeline = dailyExpectedEnquiryPipeline;
          plan.tasks = formattedTasks;
          await plan.save();
        } else {
          plan = await DailyActionPlan.create({
            employeeId: cleanUserId,
            planDate: todayDate,
            dailyCallsTarget,
            dailyWhatsappTarget,
            dailyExpectedAdmissions,
            dailyExpectedEnquiryPipeline,
            tasks: formattedTasks,
          });
        }

        // Cache in memory map for fallback sync
        const userKey = `${cleanUserId}_${todayDate.toISOString()}`;
        MOCK_ACTION_PLANS.set(userKey, plan.toObject ? plan.toObject() : plan);

        return plan;
      } catch (err) {
        console.warn('[ActionPlan Warning]: saveBulkPlan MongoDB write failed:', err.message);
      }
    }

    const userKey = `${cleanUserId}_${todayDate.toISOString()}`;
    const completedTasks = formattedTasks.filter((t) => t.status === 'Completed').length;
    const totalTasks = formattedTasks.length;
    const pendingTasks = totalTasks - completedTasks;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const mockPlan = {
      _id: `plan_${Date.now()}`,
      employeeId: cleanUserId,
      planDate: todayDate,
      dailyCallsTarget,
      dailyCallsCompleted: 0,
      dailyWhatsappTarget,
      dailyWhatsappCompleted: 0,
      dailyExpectedAdmissions,
      dailyAdmissionsCompleted: 0,
      dailyExpectedEnquiryPipeline,
      dailyEnquiryPipelineCompleted: 0,
      tasks: formattedTasks,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionPercentage,
      status: completionPercentage === 100 && totalTasks > 0 ? 'Completed' : 'In Progress',
    };

    MOCK_ACTION_PLANS.set(userKey, mockPlan);
    return mockPlan;
  }

  static async updateTargetProgress(userId, metricKey, value) {
    const cleanUserId = String(userId);
    const plan = await this.getTodayPlan(cleanUserId);

    if (mongoose.connection.readyState === 1 && plan && plan.save) {
      plan[metricKey] = value;
      await plan.save();
      return plan;
    }

    const userKey = `${cleanUserId}_${getNormalizedToday().toISOString()}`;
    const cachedPlan = MOCK_ACTION_PLANS.get(userKey);
    if (cachedPlan) {
      cachedPlan[metricKey] = value;
    }
    return cachedPlan || plan;
  }

  static async updateTaskStatus(userId, taskId, status) {
    const cleanUserId = String(userId);
    const plan = await this.getTodayPlan(cleanUserId);

    if (mongoose.connection.readyState === 1 && plan && plan.save) {
      const task = plan.tasks.id(taskId) || plan.tasks.find((t) => t._id.toString() === taskId || t.id === taskId);
      if (task) {
        task.status = status;
        if (status === 'Completed') {
          task.completedAt = new Date();
        }
        await plan.save();
        return plan;
      }
    }

    const userKey = `${cleanUserId}_${getNormalizedToday().toISOString()}`;
    const cachedPlan = MOCK_ACTION_PLANS.get(userKey);
    if (cachedPlan) {
      const task = cachedPlan.tasks.find((t) => t._id === taskId || t.id === taskId);
      if (task) {
        task.status = status;
      }
      cachedPlan.completedTasks = cachedPlan.tasks.filter((t) => t.status === 'Completed').length;
      cachedPlan.pendingTasks = cachedPlan.totalTasks - cachedPlan.completedTasks;
      cachedPlan.completionPercentage = Math.round((cachedPlan.completedTasks / cachedPlan.totalTasks) * 100);
      cachedPlan.status = cachedPlan.completionPercentage === 100 ? 'Completed' : 'In Progress';
    }
    return cachedPlan || plan;
  }

  static async deleteTask(userId, taskId) {
    const cleanUserId = String(userId);
    const plan = await this.getTodayPlan(cleanUserId);

    if (mongoose.connection.readyState === 1 && plan && plan.save) {
      plan.tasks = plan.tasks.filter((t) => t._id.toString() !== taskId && t.id !== taskId);
      await plan.save();
      return plan;
    }

    const userKey = `${cleanUserId}_${getNormalizedToday().toISOString()}`;
    const cachedPlan = MOCK_ACTION_PLANS.get(userKey);
    if (cachedPlan) {
      cachedPlan.tasks = cachedPlan.tasks.filter((t) => t._id !== taskId && t.id !== taskId);
      cachedPlan.totalTasks = cachedPlan.tasks.length;
      cachedPlan.completedTasks = cachedPlan.tasks.filter((t) => t.status === 'Completed').length;
      cachedPlan.pendingTasks = cachedPlan.totalTasks - cachedPlan.completedTasks;
      cachedPlan.completionPercentage = cachedPlan.totalTasks > 0 ? Math.round((cachedPlan.completedTasks / cachedPlan.totalTasks) * 100) : 0;
    }
    return cachedPlan || plan;
  }

  static async assignManagerTask(targetUserId, taskData, managerName) {
    const cleanUserId = String(targetUserId);
    const newTask = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: taskData.title,
      description: taskData.description || '',
      category: taskData.category || 'Other',
      priority: taskData.priority || 'Medium',
      status: 'Pending',
      assignedBy: managerName || 'Manager Sarah',
      approvalStatus: 'PendingApproval',
      rejectionReason: '',
      displayOrder: 99,
    };

    let plan = await this.getTodayPlan(cleanUserId);

    if (mongoose.connection.readyState === 1 && plan && plan.save) {
      plan.tasks.push(newTask);
      await plan.save();
      return plan;
    }

    if (!plan) {
      const todayDate = getNormalizedToday();
      plan = {
        _id: `plan_${Date.now()}`,
        employeeId: cleanUserId,
        planDate: todayDate,
        dailyCallsTarget: 30,
        dailyCallsCompleted: 0,
        dailyWhatsappTarget: 50,
        dailyWhatsappCompleted: 0,
        dailyExpectedAdmissions: 2,
        dailyAdmissionsCompleted: 0,
        dailyExpectedEnquiryPipeline: 10,
        dailyEnquiryPipelineCompleted: 0,
        tasks: [newTask],
        totalTasks: 1,
        completedTasks: 0,
        pendingTasks: 1,
        completionPercentage: 0,
        status: 'In Progress',
      };
    } else {
      plan.tasks.push(newTask);
      plan.totalTasks = plan.tasks.length;
      plan.pendingTasks = plan.totalTasks - plan.completedTasks;
    }

    const userKey = `${cleanUserId}_${getNormalizedToday().toISOString()}`;
    MOCK_ACTION_PLANS.set(userKey, plan);
    return plan;
  }

  static async respondToTask(userId, taskId, action, rejectionReason = '') {
    const cleanUserId = String(userId);
    const plan = await this.getTodayPlan(cleanUserId);

    if (mongoose.connection.readyState === 1 && plan && plan.save) {
      const task = plan.tasks.id(taskId) || plan.tasks.find((t) => t._id.toString() === taskId || t.id === taskId);
      if (task) {
        if (action === 'accept') {
          task.approvalStatus = 'Accepted';
        } else if (action === 'reject') {
          task.approvalStatus = 'Rejected';
          task.rejectionReason = rejectionReason;
        }
        await plan.save();
        return plan;
      }
    }

    const userKey = `${cleanUserId}_${getNormalizedToday().toISOString()}`;
    const cachedPlan = MOCK_ACTION_PLANS.get(userKey);
    if (cachedPlan) {
      const task = cachedPlan.tasks.find((t) => t._id === taskId || t.id === taskId);
      if (task) {
        if (action === 'accept') {
          task.approvalStatus = 'Accepted';
        } else if (action === 'reject') {
          task.approvalStatus = 'Rejected';
          task.rejectionReason = rejectionReason;
        }
      }
    }
    return cachedPlan || plan;
  }

  static async getEmployeeHistory(employeeId) {
    const cleanEmpId = String(employeeId);
    if (mongoose.connection.readyState === 1) {
      try {
        const history = await DailyActionPlan.find({ employeeId: cleanEmpId })
          .sort({ planDate: -1, createdAt: -1 })
          .limit(30);
        return history;
      } catch (err) {
        console.warn('[ActionPlan Warning]: Fetch history failed:', err.message);
      }
    }

    const results = [];
    for (const [key, plan] of MOCK_ACTION_PLANS.entries()) {
      if (String(plan.employeeId) === cleanEmpId) {
        results.push(plan);
      }
    }
    return results.sort((a, b) => new Date(b.planDate) - new Date(a.planDate));
  }
}

export default ActionPlanService;
