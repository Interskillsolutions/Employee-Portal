import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ManagerTeamPage from '../pages/manager/ManagerTeamPage';
import ManagerEmployeeDetailPage from '../pages/manager/ManagerEmployeeDetailPage';
import AdminStaffManagementPage from '../pages/admin/AdminStaffManagementPage';
import AdminBranchManagementPage from '../pages/admin/AdminBranchManagementPage';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import EmployeeDashboardPage from '../pages/employee/EmployeeDashboardPage';
import DailyPlannerPage from '../pages/employee/DailyPlannerPage';
import WeeklyTargetsPage from '../pages/employee/WeeklyTargetsPage';
import ProfilePage from '../pages/employee/ProfilePage';
import EmployeeAnnouncementsPage from '../pages/employee/EmployeeAnnouncementsPage';
import AttendancePage from '../pages/employee/AttendancePage';
import ReportsPage from '../pages/employee/ReportsPage';
import PageHeader from '../components/common/PageHeader';
import CustomCard from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import { Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

// Phase 1 Foundation Route Placeholder Shell Component
const Phase1PlaceholderPage = ({ title, subtitle }) => (
  <Box>
    <PageHeader title={title} subtitle={subtitle} />
    <CustomCard title={`${title} Module Baseline`}>
      <EmptyState
        title={`${title} Module Ready for Phase Integration`}
        description="Phase 1, 2, 3, 4 & 5 initialized successfully. Feature functionality will be integrated in subsequent phases."
      />
    </CustomCard>
  </Box>
);

const LogoutAction = () => {
  const { logout } = useAuth();
  React.useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Portal Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Phase 3 Employee Dashboard */}
        <Route path="/dashboard" element={<EmployeeDashboardPage />} />

        {/* Phase 4 & 5 Employee Productivity Pages */}
        <Route path="/daily-planner" element={<DailyPlannerPage />} />
        <Route path="/weekly-target" element={<WeeklyTargetsPage />} />
        
        {/* Fully Functional Attendance Module */}
        <Route path="/attendance" element={<AttendancePage />} />
        
        {/* Fully Functional Edit Profile Page */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* EOD Reports Screen */}
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/announcements" element={<EmployeeAnnouncementsPage />} />

        {/* Manager & Admin Protected Routes */}
        <Route element={<RoleBasedRoute allowedRoles={['Manager', 'Admin']} />}>
          <Route path="/manager/employees" element={<ManagerTeamPage />} />
          <Route path="/manager/employee/:id" element={<ManagerEmployeeDetailPage />} />
          <Route path="/admin/staff" element={<AdminStaffManagementPage />} />
          <Route path="/admin/branches" element={<AdminBranchManagementPage />} />
          <Route path="/manager/analytics" element={<Phase1PlaceholderPage title="Analytics" subtitle="Departmental Performance Metrics" />} />
          <Route path="/manager/performance" element={<Phase1PlaceholderPage title="Performance" subtitle="KPI Scorecards & Team Target Review" />} />
          <Route path="/settings" element={<Phase1PlaceholderPage title="Settings" subtitle="System Preferences & Customizations" />} />
        </Route>
      </Route>

      {/* Logout Route */}
      <Route path="/logout" element={<LogoutAction />} />

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
