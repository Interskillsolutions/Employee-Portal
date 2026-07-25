import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';

// Async thunk to fetch team overview
export const getTeamOverview = createAsyncThunk('manager/getTeamOverview', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/manager/team');
    return response.data || response;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch team overview');
  }
});

// Async thunk to fetch single employee detail & action plan
export const getEmployeeDetail = createAsyncThunk('manager/getEmployeeDetail', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/manager/employee/${id}`);
    return response.data || response;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch employee details');
  }
});

// Async thunk to assign a task to an employee
export const assignTaskToEmployee = createAsyncThunk('manager/assignTaskToEmployee', async ({ id, taskData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`/manager/employee/${id}/assign`, taskData);
    return response.data || response;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to assign task');
  }
});

// Async thunks for Staff Management (Admin)
export const getAllStaff = createAsyncThunk('manager/getAllStaff', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/manager/staff');
    return response.data || response;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch staff list');
  }
});

export const createEmployee = createAsyncThunk('manager/createEmployee', async (empData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/manager/staff', empData);
    return response.data || response;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to create employee');
  }
});

export const updateEmployee = createAsyncThunk('manager/updateEmployee', async ({ id, empData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/manager/staff/${id}`, empData);
    return response.data || response;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update employee');
  }
});

export const deleteEmployee = createAsyncThunk('manager/deleteEmployee', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/manager/staff/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete employee');
  }
});

const managerSlice = createSlice({
  name: 'manager',
  initialState: {
    team: [],
    staffList: [],
    selectedEmployeeDetail: null,
    isLoading: false,
    isSubmitting: false,
    isAssigning: false,
    error: null,
  },
  reducers: {
    clearSelectedEmployee: (state) => {
      state.selectedEmployeeDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getTeamOverview
      .addCase(getTeamOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTeamOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.team = action.payload;
      })
      .addCase(getTeamOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // getEmployeeDetail
      .addCase(getEmployeeDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEmployeeDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEmployeeDetail = action.payload;
      })
      .addCase(getEmployeeDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // assignTaskToEmployee
      .addCase(assignTaskToEmployee.pending, (state) => {
        state.isAssigning = true;
      })
      .addCase(assignTaskToEmployee.fulfilled, (state, action) => {
        state.isAssigning = false;
        if (state.selectedEmployeeDetail && action.payload) {
          state.selectedEmployeeDetail.todayPlan = action.payload;
        }
      })
      .addCase(assignTaskToEmployee.rejected, (state, action) => {
        state.isAssigning = false;
      })
      // getAllStaff
      .addCase(getAllStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffList = action.payload;
      })
      .addCase(getAllStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // createEmployee
      .addCase(createEmployee.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.staffList.unshift(action.payload);
      })
      .addCase(createEmployee.rejected, (state) => {
        state.isSubmitting = false;
      })
      // updateEmployee
      .addCase(updateEmployee.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const updated = action.payload;
        if (updated) {
          const index = state.staffList.findIndex((u) => u._id === updated._id || u.employeeId === updated.employeeId);
          if (index !== -1) {
            state.staffList[index] = updated;
          }
        }
      })
      .addCase(updateEmployee.rejected, (state) => {
        state.isSubmitting = false;
      })
      // deleteEmployee
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.staffList = state.staffList.filter((u) => u._id !== deletedId && u.employeeId !== deletedId);
      });
  },
});

export const { clearSelectedEmployee } = managerSlice.actions;
export default managerSlice.reducer;

