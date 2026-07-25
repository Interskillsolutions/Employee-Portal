import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchEmployeeDashboardSummary } from '../../services/api/dashboardApi';

const initialState = {
  summary: null,
  isLoading: false,
  error: null,
  hasActionPlan: true, // UI state toggle capability
};

export const getDashboardSummary = createAsyncThunk(
  'dashboard/getSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchEmployeeDashboardSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load dashboard statistics');
    }
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    toggleTaskCompletion: (state, action) => {
      const taskId = action.payload;
      if (state.summary?.actionPlan?.tasks) {
        const task = state.summary.actionPlan.tasks.find((t) => t.id === taskId);
        if (task) {
          task.isCompleted = !task.isCompleted;
        }
      }
    },
    toggleActionPlanExist: (state) => {
      state.hasActionPlan = !state.hasActionPlan;
      if (state.summary?.actionPlan) {
        state.summary.actionPlan.hasPlan = state.hasActionPlan;
      }
    },
    createMockActionPlan: (state) => {
      state.hasActionPlan = true;
      if (state.summary?.actionPlan) {
        state.summary.actionPlan.hasPlan = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
        state.hasActionPlan = action.payload.actionPlan?.hasPlan ?? true;
      })
      .addCase(getDashboardSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { toggleTaskCompletion, toggleActionPlanExist, createMockActionPlan } = dashboardSlice.actions;
export default dashboardSlice.reducer;
