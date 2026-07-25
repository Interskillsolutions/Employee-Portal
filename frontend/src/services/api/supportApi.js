import axiosInstance from '../axiosInstance';

export const createSupportTicketApi = async (payload) => {
  return await axiosInstance.post('/support/tickets', payload);
};

export const getAllSupportTicketsApi = async () => {
  return await axiosInstance.get('/support/tickets');
};

export const updateSupportTicketStatusApi = async (id, status) => {
  return await axiosInstance.patch(`/support/tickets/${id}/status`, { status });
};

export const sendDirectMessageApi = async (payload) => {
  return await axiosInstance.post('/support/messages', payload);
};

export const getConversationApi = async (partnerId) => {
  return await axiosInstance.get(`/support/messages/${partnerId}`);
};
