import mongoose from 'mongoose';

const weeklyTargetSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
    },
    weekEndDate: {
      type: Date,
      required: [true, 'Week end date is required'],
    },
    callsTarget: { type: Number, default: 50 },
    callsCompleted: { type: Number, default: 0 },
    messagesTarget: { type: Number, default: 100 },
    messagesCompleted: { type: Number, default: 0 },
    emailsTarget: { type: Number, default: 30 },
    emailsCompleted: { type: Number, default: 0 },
    enquiriesTarget: { type: Number, default: 20 },
    enquiriesCompleted: { type: Number, default: 0 },
    visitsTarget: { type: Number, default: 5 },
    visitsCompleted: { type: Number, default: 0 },
    admissionsTarget: { type: Number, default: 3 },
    admissionsCompleted: { type: Number, default: 0 },
    overallProgress: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Unique index enforcing 1 target per employee per week
weeklyTargetSchema.index({ employeeId: 1, weekStartDate: 1 }, { unique: true });

// Auto-calculate overall progress before saving
weeklyTargetSchema.pre('save', function (next) {
  const metrics = [
    { target: this.callsTarget, completed: this.callsCompleted },
    { target: this.messagesTarget, completed: this.messagesCompleted },
    { target: this.emailsTarget, completed: this.emailsCompleted },
    { target: this.enquiriesTarget, completed: this.enquiriesCompleted },
    { target: this.visitsTarget, completed: this.visitsCompleted },
    { target: this.admissionsTarget, completed: this.admissionsCompleted },
  ];

  let totalPercentSum = 0;
  metrics.forEach((m) => {
    const percent = m.target > 0 ? Math.min((m.completed / m.target) * 100, 100) : 0;
    totalPercentSum += percent;
  });

  this.overallProgress = Math.round(totalPercentSum / metrics.length);
  next();
});

const WeeklyTarget = mongoose.model('WeeklyTarget', weeklyTargetSchema);

export default WeeklyTarget;
