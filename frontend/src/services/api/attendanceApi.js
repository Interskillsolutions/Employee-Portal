import axiosInstance from '../axiosInstance';

/**
 * Fetch today's attendance status for logged-in employee
 */
export const getTodayAttendanceApi = async () => {
  const response = await axiosInstance.get('/attendance/today');
  return response.data?.data || response.data;
};

/**
 * Clock In with GPS latitude, longitude, device info
 */
export const clockInApi = async (payload) => {
  const response = await axiosInstance.post('/attendance/clock-in', payload);
  return response.data?.data || response.data;
};

/**
 * Clock Out with GPS latitude, longitude
 */
export const clockOutApi = async (payload) => {
  const response = await axiosInstance.post('/attendance/clock-out', payload);
  return response.data?.data || response.data;
};

/**
 * Fetch all active registered company branches (employees / clock-in)
 */
export const getActiveBranchesApi = async () => {
  const response = await axiosInstance.get('/branches/active');
  return response.data?.data || response.data;
};

/**
 * ADMIN: Fetch ALL registered company branches (including inactive)
 */
export const getAllBranchesApi = async () => {
  const response = await axiosInstance.get('/branches/all');
  return response.data?.data || response.data;
};

/**
 * ADMIN: Create a new registered company branch with geo-coordinates
 */
export const createBranchApi = async (payload) => {
  const response = await axiosInstance.post('/branches', payload);
  return response.data?.data || response.data;
};

/**
 * ADMIN: Toggle branch active / inactive status
 */
export const toggleBranchStatusApi = async (branchId, isActive) => {
  const response = await axiosInstance.put(`/branches/${branchId}/toggle`, { isActive });
  return response.data?.data || response.data;
};

/**
 * ADMIN: Permanently delete a company branch
 */
export const deleteBranchApi = async (branchId) => {
  const response = await axiosInstance.delete(`/branches/${branchId}`);
  return response.data?.data || response.data;
};

/**
 * Secret test reset today's attendance (triggered via click backdoor)
 */
export const resetTodayAttendanceApi = async () => {
  const response = await axiosInstance.post('/attendance/reset-today');
  return response.data?.data || response.data;
};


