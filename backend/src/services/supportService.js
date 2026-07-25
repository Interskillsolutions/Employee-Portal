import SupportTicket from '../models/SupportTicket.js';
import DirectMessage from '../models/DirectMessage.js';
import mongoose from 'mongoose';

const MOCK_TICKETS = [
  {
    _id: 'ticket_seed_101',
    senderId: '65b210f9a843e90011223341',
    senderName: 'Alex Morgan',
    senderEmail: 'alex.morgan@interskill.com',
    senderRole: 'Employee',
    subject: 'Attendance Shift Time Update Request',
    message: 'Need help correcting my clock-in time for yesterday morning session.',
    priority: 'Normal',
    status: 'Open',
    supportPhone: '8799903365',
    createdAt: new Date().toISOString(),
  },
];

const MOCK_MESSAGES = [];

class SupportService {
  static async createTicket(sender, payload) {
    const { subject, message, priority = 'Normal' } = payload;
    const cleanSenderId = String(sender._id || sender.id || 'demo_employee');
    const senderName = sender.firstName && sender.lastName ? `${sender.firstName} ${sender.lastName}` : sender.name || 'Portal User';

    if (mongoose.connection.readyState === 1) {
      try {
        const ticket = await SupportTicket.create({
          senderId: cleanSenderId,
          senderName,
          senderEmail: sender.email || 'user@interskill.com',
          senderRole: sender.role || 'Employee',
          subject,
          message,
          priority,
          status: 'Open',
          supportPhone: '8799903365',
        });
        return ticket;
      } catch (err) {
        console.warn('[Support Warning]: MongoDB create ticket failed:', err.message);
      }
    }

    const mockItem = {
      _id: `ticket_${Date.now()}`,
      senderId: cleanSenderId,
      senderName,
      senderEmail: sender.email || 'user@interskill.com',
      senderRole: sender.role || 'Employee',
      subject,
      message,
      priority,
      status: 'Open',
      supportPhone: '8799903365',
      createdAt: new Date().toISOString(),
    };
    MOCK_TICKETS.unshift(mockItem);
    return mockItem;
  }

  static async getAllTickets() {
    if (mongoose.connection.readyState === 1) {
      try {
        return await SupportTicket.find({}).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('[Support Warning]: MongoDB find tickets failed:', err.message);
      }
    }
    return MOCK_TICKETS;
  }

  static async updateTicketStatus(ticketId, status) {
    if (mongoose.connection.readyState === 1) {
      try {
        const ticket = await SupportTicket.findById(ticketId);
        if (ticket) {
          ticket.status = status;
          await ticket.save();
          return ticket;
        }
      } catch (err) {
        console.warn('[Support Warning]: Update ticket status failed:', err.message);
      }
    }

    const item = MOCK_TICKETS.find((t) => String(t._id) === String(ticketId));
    if (item) {
      item.status = status;
      return item;
    }
    return null;
  }

  static async sendDirectMessage(sender, payload) {
    const { recipientId, recipientName, message } = payload;
    const cleanSenderId = String(sender._id || sender.id || 'demo_employee');
    const senderName = sender.firstName && sender.lastName ? `${sender.firstName} ${sender.lastName}` : sender.name || 'Portal User';
    const cleanRecipientId = String(recipientId);

    if (mongoose.connection.readyState === 1) {
      try {
        const msg = await DirectMessage.create({
          senderId: cleanSenderId,
          senderName,
          recipientId: cleanRecipientId,
          recipientName: recipientName || 'Teammate',
          message,
          read: false,
        });
        return msg;
      } catch (err) {
        console.warn('[Support Warning]: DirectMessage create failed:', err.message);
      }
    }

    const mockMsg = {
      _id: `msg_${Date.now()}`,
      senderId: cleanSenderId,
      senderName,
      recipientId: cleanRecipientId,
      recipientName: recipientName || 'Teammate',
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    MOCK_MESSAGES.push(mockMsg);
    return mockMsg;
  }

  static async getConversation(userId, partnerId) {
    const cleanUserId = String(userId);
    const cleanPartnerId = String(partnerId);

    if (mongoose.connection.readyState === 1) {
      try {
        return await DirectMessage.find({
          $or: [
            { senderId: cleanUserId, recipientId: cleanPartnerId },
            { senderId: cleanPartnerId, recipientId: cleanUserId },
          ],
        }).sort({ createdAt: 1 });
      } catch (err) {
        console.warn('[Support Warning]: DirectMessage find failed:', err.message);
      }
    }

    return MOCK_MESSAGES.filter(
      (m) =>
        (m.senderId === cleanUserId && m.recipientId === cleanPartnerId) ||
        (m.senderId === cleanPartnerId && m.recipientId === cleanUserId)
    );
  }
}

export default SupportService;
