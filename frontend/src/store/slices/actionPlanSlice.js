import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchTodayActionPlanApi,
  saveBulkActionPlanApi,
  updateTargetProgressApi,
  updateTaskStatusApi,
  deleteTaskApi,
  assignTaskApi,
  respondToTaskApi,
} from '../../services/api/actionPlanApi';

const initialState = {
  todayPlan: null,
  isLoading: false,
  isFetched: false,
  error: null,
};

const extractPlanData = (res) => {
  if (!res) return null;
  if (res.data && res.data.plan) return res.data.plan;
  if (res.plan) return res.plan;
  if (res.data && res.data.data && res.data.data.plan) return res.data.data.plan;
  return res.data || res;
};

export const getTodayPlan = createAsyncThunk('actionPlan/getToday', async (_, { rejectWithValue }) => {
  try {
    const response = await fetchTodayActionPlanApi();
    return extractPlanData(response);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch today action plan');
  }
});

export const saveBulkPlan = createAsyncThunk('actionPlan/saveBulk', async (payload, { rejectWithValue }) => {
  try {
    const response = await saveBulkActionPlanApi(payload);
    return extractPlanData(response);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to save daily action plan');
  }
});

export const updateMetricProgress = createAsyncThunk('actionPlan/updateMetricProgress', async ({ metricKey, value }, { rejectWithValue }) => {
  try {
    const response = await updateTargetProgressApi(metricKey, value);
    return extractPlanData(response);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to update target progress');
  }
});

export const toggleTaskStatus = createAsyncThunk('actionPlan/toggleStatus', async ({ taskId, status }, { rejectWithValue }) => {
  try {
    const response = await updateTaskStatusApi(taskId, status);
    return extractPlanData(response);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to update task status');
  }
});

export const removeTask = createAsyncThunk('actionPlan/removeTask', async (taskId, { rejectWithValue }) => {
  try {
    const response = await deleteTaskApi(taskId);
    return extractPlanData(response);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to delete task');
  }
});

export const assignTaskToEmployee = createAsyncThunk('actionPlan/assignTask', async (payload, { rejectWithValue }) => {
  try {
    const response = await assignTaskApi(payload);
    return extractPlanData(response);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to assign task to employee');
  }
});

export const respondToTask = createAsyncThunk('actionPlan/respondToTask', async ({ taskId, action, rejectionReason }, { rejectWithValue }) => {
  try {
    const response = await respondToTaskApi({ taskId, action, rejectionReason });
    return extractPlanData(response);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to respond to task');
  }
});

export const actionPlanSlice = createSlice({
  name: 'actionPlan',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTodayPlan.pending, (state) => {
        state.isLoading = true;
        state.isFetched = false;
        state.error = null;
      })
      .addCase(getTodayPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isFetched = true;
        state.todayPlan = action.payload;
      })
      .addCase(getTodayPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.isFetched = true;
        state.error = action.payload;
      })
      .addCase(saveBulkPlan.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveBulkPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isFetched = true;
        state.todayPlan = action.payload;
      })
      .addCase(saveBulkPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.isFetched = true;
        state.error = action.payload;
      })
      .addCase(updateMetricProgress.fulfilled, (state, action) => {
        state.todayPlan = action.payload;
      })
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        state.todayPlan = action.payload;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.todayPlan = action.payload;
      })
      .addCase(assignTaskToEmployee.fulfilled, (state, action) => {
        state.todayPlan = action.payload;
      })
      .addCase(respondToTask.fulfilled, (state, action) => {
        state.todayPlan = action.payload;
      });
  },
});

export default actionPlanSlice.reducer;
