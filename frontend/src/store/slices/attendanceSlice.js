import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getTodayAttendanceApi,
  clockInApi,
  clockOutApi,
  getActiveBranchesApi,
} from '../../services/api/attendanceApi';

export const fetchTodayAttendance = createAsyncThunk(
  'attendance/fetchTodayAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getTodayAttendanceApi();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchActiveBranches = createAsyncThunk(
  'attendance/fetchActiveBranches',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getActiveBranchesApi();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const clockInThunk = createAsyncThunk(
  'attendance/clockIn',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await clockInApi(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const clockOutThunk = createAsyncThunk(
  'attendance/clockOut',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await clockOutApi(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  todayRecord: null,
  activeBranches: [],
  isClockedIn: false,
  status: 'Absent',
  isLoading: false,
  isClockingIn: false,
  isClockingOut: false,
  error: null,
  successMessage: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
    clearAttendanceSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Today Attendance
      .addCase(fetchTodayAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayRecord = action.payload;
        if (action.payload && action.payload.clockInTime) {
          state.isClockedIn = true;
          state.status = action.payload.status || 'Present';
        } else {
          state.isClockedIn = false;
          state.status = 'Absent';
        }
      })
      .addCase(fetchTodayAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Active Branches
      .addCase(fetchActiveBranches.fulfilled, (state, action) => {
        state.activeBranches = action.payload || [];
      })
      // Clock In
      .addCase(clockInThunk.pending, (state) => {
        state.isClockingIn = true;
        state.error = null;
      })
      .addCase(clockInThunk.fulfilled, (state, action) => {
        state.isClockingIn = false;
        state.todayRecord = action.payload;
        state.isClockedIn = true;
        state.status = 'Present';
        state.successMessage = 'Clock-In successful! Attendance marked as Present.';
      })
      .addCase(clockInThunk.rejected, (state, action) => {
        state.isClockingIn = false;
        state.error = action.payload;
      })
      // Clock Out
      .addCase(clockOutThunk.pending, (state) => {
        state.isClockingOut = true;
        state.error = null;
      })
      .addCase(clockOutThunk.fulfilled, (state, action) => {
        state.isClockingOut = false;
        state.todayRecord = action.payload;
        state.successMessage = 'Clock-Out successful! Shift time recorded.';
      })
      .addCase(clockOutThunk.rejected, (state, action) => {
        state.isClockingOut = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendanceError, clearAttendanceSuccess } = attendanceSlice.actions;
export default attendanceSlice.reducer;
