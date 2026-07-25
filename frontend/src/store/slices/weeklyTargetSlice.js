import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchCurrentWeeklyTargetApi,
  updateWeeklyTargetApi,
  fetchWeeklyTargetHistoryApi,
} from '../../services/api/weeklyTargetApi';

const initialState = {
  currentTarget: null,
  history: [],
  isLoading: false,
  error: null,
};

const extractTargetData = (res) => {
  if (!res) return null;
  if (res.data && res.data.target) return res.data.target;
  if (res.target) return res.target;
  if (res.data && res.data.data && res.data.data.target) return res.data.data.target;
  return res.data || res;
};

export const getCurrentTarget = createAsyncThunk('weeklyTarget/getCurrent', async (_, { rejectWithValue }) => {
  try {
    const response = await fetchCurrentWeeklyTargetApi();
    return extractTargetData(response);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch weekly target');
  }
});

export const updateTargetProgress = createAsyncThunk('weeklyTarget/updateProgress', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await updateWeeklyTargetApi(id, payload);
    return extractTargetData(response);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to update weekly target');
  }
});

export const weeklyTargetSlice = createSlice({
  name: 'weeklyTarget',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentTarget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentTarget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTarget = action.payload;
      })
      .addCase(getCurrentTarget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateTargetProgress.fulfilled, (state, action) => {
        state.currentTarget = action.payload;
      });
  },
});

export default weeklyTargetSlice.reducer;
