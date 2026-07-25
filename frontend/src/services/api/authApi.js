import axiosInstance from '../axiosInstance';

export const loginApi = async (credentials) => {
  return await axiosInstance.post('/auth/login', credentials);
};

export const logoutApi = async () => {
  return await axiosInstance.post('/auth/logout');
};

export const getMeApi = async () => {
  return await axiosInstance.get('/auth/me');
};

export const updateProfileApi = async (profileData) => {
  return await axiosInstance.put('/auth/profile', profileData);
};

export const changePasswordApi = async (passwordData) => {
  return await axiosInstance.put('/auth/change-password', passwordData);
};

export const forgotPasswordApi = async (data) => {
  return await axiosInstance.post('/auth/forgot-password', data);
};

export const resetPasswordApi = async (data) => {
  return await axiosInstance.post('/auth/reset-password', data);
};
