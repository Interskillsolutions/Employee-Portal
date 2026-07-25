import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    attendanceDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent'],
      default: 'Present',
    },
    clockInTime: {
      type: String,
      required: true,
    },
    clockOutTime: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    distanceFromBranch: {
      type: Number,
      required: true,
    },
    device: {
      type: String,
      default: 'Desktop/Mobile',
    },
    browser: {
      type: String,
      default: 'Chrome/Edge',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    tasksCompletedSummary: {
      type: String,
      default: '',
    },
    tomorrowTasks: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// One attendance record per employee per day
attendanceSchema.index({ employeeId: 1, attendanceDate: 1 }, { unique: true });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

export default Attendance;
