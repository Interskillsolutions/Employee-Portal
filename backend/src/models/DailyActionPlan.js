import mongoose from 'mongoose';

const taskSubSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Calls',
        'Messages',
        'Emails',
        'Follow Up',
        'Meeting',
        'Visit',
        'Admission',
        'Documentation',
        'CRM Update',
        'Other',
      ],
      default: 'Other',
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    assignedBy: {
      type: String,
      default: '',
    },
    approvalStatus: {
      type: String,
      enum: ['Self', 'PendingApproval', 'Accepted', 'Rejected'],
      default: 'Self',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const dailyActionPlanSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      index: true,
    },
    planDate: {
      type: Date,
      required: [true, 'Plan date is required'],
    },
    dailyCallsTarget: { type: Number, default: 30, min: 0 },
    dailyCallsCompleted: { type: Number, default: 0, min: 0 },

    dailyWhatsappTarget: { type: Number, default: 50, min: 0 },
    dailyWhatsappCompleted: { type: Number, default: 0, min: 0 },

    dailyExpectedAdmissions: { type: Number, default: 2, min: 0 },
    dailyAdmissionsCompleted: { type: Number, default: 0, min: 0 },

    dailyExpectedEnquiryPipeline: { type: Number, default: 10, min: 0 },
    dailyEnquiryPipelineCompleted: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ['Draft', 'In Progress', 'Completed'],
      default: 'In Progress',
    },
    completionPercentage: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    pendingTasks: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
    tasks: [taskSubSchema],
  },
  { timestamps: true }
);

dailyActionPlanSchema.index({ employeeId: 1, planDate: 1 }, { unique: true });

dailyActionPlanSchema.pre('save', function (next) {
  if (this.tasks && this.tasks.length > 0) {
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter((t) => t.status === 'Completed').length;
    this.pendingTasks = this.totalTasks - this.completedTasks;
    this.completionPercentage = Math.round((this.completedTasks / this.totalTasks) * 100);

    if (this.completedTasks === this.totalTasks && this.totalTasks > 0) {
      this.status = 'Completed';
    } else {
      this.status = 'In Progress';
    }
  } else {
    this.totalTasks = 0;
    this.completedTasks = 0;
    this.pendingTasks = 0;
    this.completionPercentage = 0;
    this.status = 'Draft';
  }
  next();
});

const DailyActionPlan = mongoose.model('DailyActionPlan', dailyActionPlanSchema);

export default DailyActionPlan;
