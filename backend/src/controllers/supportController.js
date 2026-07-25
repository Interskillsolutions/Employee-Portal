import SupportService from '../services/supportService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createSupportTicket = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'Subject and message are required for support requests' });
  }

  const ticket = await SupportService.createTicket(req.user, req.body);
  res.status(201).json(new ApiResponse(201, { ticket }, 'Support query submitted to Admin queue successfully'));
});

export const getAllSupportTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportService.getAllTickets();
  res.status(200).json(new ApiResponse(200, { tickets, supportPhone: '8799903365' }, 'Support tickets retrieved successfully'));
});

export const updateSupportTicketStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ticket = await SupportService.updateTicketStatus(id, status);
  res.status(200).json(new ApiResponse(200, { ticket }, 'Ticket status updated successfully'));
});

export const sendDirectMessage = asyncHandler(async (req, res) => {
  const { recipientId, message } = req.body;
  if (!recipientId || !message) {
    return res.status(400).json({ success: false, message: 'recipientId and message text are required' });
  }

  const msg = await SupportService.sendDirectMessage(req.user, req.body);
  res.status(201).json(new ApiResponse(201, { message: msg }, 'Direct message sent successfully'));
});

export const getConversation = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;
  const conversation = await SupportService.getConversation(req.user._id, partnerId);
  res.status(200).json(new ApiResponse(200, { conversation }, 'Conversation history retrieved successfully'));
});
