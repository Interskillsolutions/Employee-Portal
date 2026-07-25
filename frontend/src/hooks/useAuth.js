import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser, clearAuthError, clearSuccessMessage } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const handleLogin = async (credentials) => {
    return await dispatch(loginUser(credentials));
  };

  const handleLogout = async () => {
    return await dispatch(logoutUser());
  };

  const handleClearError = () => {
    dispatch(clearAuthError());
  };

  const handleClearSuccess = () => {
    dispatch(clearSuccessMessage());
  };

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    successMessage: authState.successMessage,
    login: handleLogin,
    logout: handleLogout,
    clearError: handleClearError,
    clearSuccess: handleClearSuccess,
  };
};

export default useAuth;
