import { useSelector, useDispatch } from 'react-redux';
import {
  getTodayPlan,
  saveBulkPlan,
  updateMetricProgress,
  toggleTaskStatus,
  removeTask,
} from '../store/slices/actionPlanSlice';

export const useActionPlan = () => {
  const dispatch = useDispatch();
  const { todayPlan, isLoading, error } = useSelector((state) => state.actionPlan);

  return {
    todayPlan,
    isLoading,
    error,
    fetchTodayPlan: () => dispatch(getTodayPlan()),
    savePlan: (payload) => dispatch(saveBulkPlan(payload)),
    updateMetric: (metricKey, value) => dispatch(updateMetricProgress({ metricKey, value })),
    updateStatus: (taskId, status) => dispatch(toggleTaskStatus({ taskId, status })),
    deleteTask: (taskId) => dispatch(removeTask(taskId)),
  };
};

export default useActionPlan;
