import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import actionPlanReducer from './slices/actionPlanSlice';
import managerReducer from './slices/managerSlice';
import weeklyTargetReducer from './slices/weeklyTargetSlice';
import announcementReducer from './slices/announcementSlice';
import attendanceReducer from './slices/attendanceSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
    actionPlan: actionPlanReducer,
    manager: managerReducer,
    weeklyTarget: weeklyTargetReducer,
    announcements: announcementReducer,
    attendance: attendanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
