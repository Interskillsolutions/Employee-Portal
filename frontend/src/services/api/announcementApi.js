import axiosInstance from '../axiosInstance';

export const createAnnouncementApi = async (payload) => {
  return await axiosInstance.post('/announcements', payload);
};

export const getEmployeeAnnouncementsApi = async () => {
  return await axiosInstance.get('/announcements');
};

export const acknowledgeAnnouncementApi = async (id) => {
  return await axiosInstance.patch(`/announcements/${id}/acknowledge`);
};

export const snoozeAnnouncementApi = async (id) => {
  return await axiosInstance.patch(`/announcements/${id}/snooze`);
};
