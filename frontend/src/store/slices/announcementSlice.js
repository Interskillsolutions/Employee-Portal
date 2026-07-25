import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createAnnouncementApi,
  getEmployeeAnnouncementsApi,
  acknowledgeAnnouncementApi,
  snoozeAnnouncementApi,
} from '../../services/api/announcementApi';

const initialState = {
  announcements: [],
  isLoading: false,
  error: null,
};

const extractData = (res) => {
  if (!res) return null;
  if (res.data && res.data.announcements) return res.data.announcements;
  if (res.data && res.data.announcement) return res.data.announcement;
  if (res.announcement) return res.announcement;
  if (res.announcements) return res.announcements;
  return res.data || res;
};

export const fetchAnnouncements = createAsyncThunk('announcements/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await getEmployeeAnnouncementsApi();
    return extractData(response);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch announcements');
  }
});

export const publishAnnouncement = createAsyncThunk('announcements/publish', async (payload, { rejectWithValue }) => {
  try {
    const response = await createAnnouncementApi(payload);
    return extractData(response);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to publish announcement');
  }
});

export const acknowledgeAnnouncement = createAsyncThunk('announcements/acknowledge', async (id, { rejectWithValue }) => {
  try {
    const response = await acknowledgeAnnouncementApi(id);
    return { id, data: extractData(response) };
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to acknowledge announcement');
  }
});

export const snoozeAnnouncement = createAsyncThunk('announcements/snooze', async (id, { rejectWithValue }) => {
  try {
    const response = await snoozeAnnouncementApi(id);
    return { id, data: extractData(response) };
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to snooze announcement');
  }
});

export const announcementSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.announcements = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(publishAnnouncement.fulfilled, (state, action) => {
        if (action.payload) {
          state.announcements.unshift(action.payload);
        }
      })
      .addCase(acknowledgeAnnouncement.fulfilled, (state, action) => {
        const { id } = action.payload;
        const item = state.announcements.find((a) => (a._id || a.id) === id);
        if (item) {
          if (!item.acknowledgedBy) item.acknowledgedBy = [];
          item.acknowledgedBy.push('current');
        }
      })
      .addCase(snoozeAnnouncement.fulfilled, (state, action) => {
        const { id } = action.payload;
        const item = state.announcements.find((a) => (a._id || a.id) === id);
        if (item) {
          if (!item.snoozedBy) item.snoozedBy = [];
          item.snoozedBy.push('current');
        }
      });
  },
});

export default announcementSlice.reducer;
