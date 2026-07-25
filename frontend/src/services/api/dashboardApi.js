import axiosInstance from '../axiosInstance';

export const fetchEmployeeDashboardSummary = async () => {
  return await axiosInstance.get('/dashboard/employee/summary');
};
