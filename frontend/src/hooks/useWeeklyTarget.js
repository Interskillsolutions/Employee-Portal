import { useSelector, useDispatch } from 'react-redux';
import { getCurrentTarget, updateTargetProgress } from '../store/slices/weeklyTargetSlice';

export const useWeeklyTarget = () => {
  const dispatch = useDispatch();
  const { currentTarget, isLoading, error } = useSelector((state) => state.weeklyTarget);

  return {
    currentTarget,
    isLoading,
    error,
    fetchCurrentTarget: () => dispatch(getCurrentTarget()),
    updateProgress: (id, payload) => dispatch(updateTargetProgress({ id, payload })),
  };
};

export default useWeeklyTarget;
