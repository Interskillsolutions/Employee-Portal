import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Announcement message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['General', 'Personal'],
      default: 'General',
    },
    targetEmployeeIds: [
      {
        type: String,
      },
    ],
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      default: 'Manager',
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    acknowledgedBy: [
      {
        type: String,
      },
    ],
    snoozedBy: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
