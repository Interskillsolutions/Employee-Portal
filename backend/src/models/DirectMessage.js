import mongoose from 'mongoose';

const directMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    recipientId: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);

export default DirectMessage;
