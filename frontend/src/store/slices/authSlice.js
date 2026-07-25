import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginApi,
  logoutApi,
  getMeApi,
  updateProfileApi,
  changePasswordApi,
  forgotPasswordApi,
  resetPasswordApi,
} from '../../services/api/authApi';

const storedToken = localStorage.getItem('access_token');
const storedUser = localStorage.getItem('user_profile') ? JSON.parse(localStorage.getItem('user_profile')) : null;

const initialState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
  successMessage: null,
};

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await loginApi(credentials);
    const user = response.data?.user || response.user;
    const accessToken = response.data?.accessToken || response.accessToken;
    const refreshToken = response.data?.refreshToken || response.refreshToken;

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_profile', JSON.stringify(user));

    return { user, token: accessToken };
  } catch (error) {
    return rejectWithValue(error.message || 'Login failed. Please check your credentials.');
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await logoutApi();
  } catch (error) {
    // Continue local cleanup
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await getMeApi();
    const user = response.data?.user || response.user;
    localStorage.setItem('user_profile', JSON.stringify(user));
    return user;
  } catch (error) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    return rejectWithValue(error.message || 'Session expired');
  }
});

export const updateUserProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const response = await updateProfileApi(profileData);
    const updatedUser = response.data?.user || response.user;
    localStorage.setItem('user_profile', JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to update profile.');
  }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (passwordData, { rejectWithValue }) => {
  try {
    const response = await changePasswordApi(passwordData);
    return response.message || 'Password changed successfully.';
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to change password.');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (data, { rejectWithValue }) => {
  try {
    const response = await forgotPasswordApi(data);
    return response.message;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to send password reset email.');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (data, { rejectWithValue }) => {
  try {
    const response = await resetPasswordApi(data);
    return response.message;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to reset password.');
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      // Fetch Profile
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.successMessage = 'Profile updated successfully!';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Forgot Password
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      });
  },
});

export const { clearAuthError, clearSuccessMessage } = authSlice.actions;
export default authSlice.reducer;
