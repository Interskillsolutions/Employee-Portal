import express from 'express';
import {
  createSupportTicket,
  getAllSupportTickets,
  updateSupportTicketStatus,
  sendDirectMessage,
  getConversation,
} from '../controllers/supportController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/tickets', createSupportTicket);
router.get('/tickets', getAllSupportTickets);
router.patch('/tickets/:id/status', updateSupportTicketStatus);
router.post('/messages', sendDirectMessage);
router.get('/messages/:partnerId', getConversation);

export default router;
