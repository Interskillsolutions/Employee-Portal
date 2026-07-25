import axiosInstance from '../axiosInstance';

export const fetchTodayActionPlanApi = async () => {
  return await axiosInstance.get('/action-plan/today');
};

export const saveBulkActionPlanApi = async (payload) => {
  return await axiosInstance.post('/action-plan', payload);
};

export const updateTargetProgressApi = async (metricKey, value) => {
  return await axiosInstance.patch('/action-plan/target-progress', { metricKey, value });
};

export const updateTaskStatusApi = async (taskId, status) => {
  return await axiosInstance.patch('/action-plan/task-status', { taskId, status });
};

export const deleteTaskApi = async (taskId) => {
  return await axiosInstance.delete(`/action-plan/task/${taskId}`);
};

export const assignTaskApi = async (payload) => {
  return await axiosInstance.post('/action-plan/assign-task', payload);
};

export const respondToTaskApi = async (payload) => {
  return await axiosInstance.patch('/action-plan/respond-task', payload);
};
