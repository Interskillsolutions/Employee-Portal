import axiosInstance from '../axiosInstance';

export const fetchCurrentWeeklyTargetApi = async () => {
  return await axiosInstance.get('/weekly-target/current');
};

export const updateWeeklyTargetApi = async (id, payload) => {
  return await axiosInstance.put(`/weekly-target/${id}`, payload);
};

export const fetchWeeklyTargetHistoryApi = async () => {
  return await axiosInstance.get('/weekly-target/history');
};
