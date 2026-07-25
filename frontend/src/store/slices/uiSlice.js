import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  activeRouteTitle: 'Dashboard',
  notificationsOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setActiveRouteTitle: (state, action) => {
      state.activeRouteTitle = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setActiveRouteTitle, toggleNotifications } = uiSlice.actions;

export default uiSlice.reducer;
