import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, useTheme, useMediaQuery } from '@mui/material';
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  Target,
  FileText,
  Megaphone,
  User,
  Users,
  BarChart3,
  TrendingUp,
  Settings,
  ShieldAlert,
  LogOut,
  MapPin,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveRouteTitle, toggleSidebar } from '../../store/slices/uiSlice';

const SIDEBAR_WIDTH = 260;

const employeeMenuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { title: 'Daily Planner', path: '/daily-planner', icon: ClipboardList },
  { title: 'Weekly Target', path: '/weekly-target', icon: Target },
  { title: 'Reports', path: '/reports', icon: FileText },
  { title: 'Announcements', path: '/announcements', icon: Megaphone },
  { title: 'Profile', path: '/profile', icon: User },
];

const managerMenuItems = [
  { title: 'Team Directory', path: '/manager/employees', icon: Users },
  { title: 'Team Analytics', path: '/manager/analytics', icon: BarChart3 },
  { title: 'Performance Review', path: '/manager/performance', icon: TrendingUp },
];

const adminMenuItems = [
  { title: 'Manage Staff', path: '/admin/staff', icon: Users },
  { title: 'Manage Branches', path: '/admin/branches', icon: MapPin },
  { title: 'System Settings', path: '/settings', icon: Settings },
  { title: 'Admin Controls', path: '/admin/controls', icon: ShieldAlert },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const user = useSelector((state) => state.auth.user);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const roleName = user?.role?.name || user?.role || 'Employee';
  const isManager = roleName === 'Manager' || roleName === 'Admin';
  const isAdmin = roleName === 'Admin';

  const handleNavigation = (path, title) => {
    dispatch(setActiveRouteTitle(title));
    navigate(path);
    if (isMobile && sidebarOpen) {
      dispatch(toggleSidebar());
    }
  };

  const renderNavGroup = (items, groupTitle) => (
    <Box sx={{ mb: 2 }}>
      {groupTitle && (
        <Typography
          variant="caption"
          sx={{
            px: 3,
            py: 1,
            display: 'block',
            color: '#94A3B8',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.7rem',
          }}
        >
          {groupTitle}
        </Typography>
      )}
      <List disablePadding sx={{ px: 1.5 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path, item.title)}
                sx={{
                  borderRadius: '10px',
                  py: 1.25,
                  px: 2,
                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  '&:hover': {
                    backgroundColor: isActive ? '#1D4ED8' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#0F172A',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#FFFFFF' : '#64748B',
                  }}
                >
                  <Icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={sidebarOpen}
      onClose={isMobile ? () => dispatch(toggleSidebar()) : undefined}
      ModalProps={isMobile ? { keepMounted: true } : undefined}
      sx={{
        width: sidebarOpen && !isMobile ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
        },
      }}
    >
      {/* Official InterSkill Solutions Logo & Brand Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2.25,
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          alt="InterSkill Solutions Logo"
          sx={{
            height: 42,
            width: 'auto',
            objectFit: 'contain',
          }}
        />
        <Box>
          <Typography variant="h4" fontWeight={700} color="#0F172A" sx={{ lineHeight: 1.1, fontSize: '0.95rem' }}>
            InterSkill Solutions
          </Typography>
          <Typography variant="caption" color="#64748B" sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
            Employee Portal
          </Typography>
        </Box>
      </Box>

      {/* Sidebar Navigation */}
      <Box sx={{ py: 2, overflowY: 'auto', flexGrow: 1 }}>
        {renderNavGroup(employeeMenuItems, 'Employee Modules')}

        {isManager && (
          <>
            <Divider sx={{ my: 1.5, mx: 2 }} />
            {renderNavGroup(managerMenuItems, 'Manager Workspace')}
          </>
        )}

        {isAdmin && (
          <>
            <Divider sx={{ my: 1.5, mx: 2 }} />
            {renderNavGroup(adminMenuItems, 'Admin Workspace')}
          </>
        )}

        <Divider sx={{ my: 1.5, mx: 2 }} />
        <List disablePadding sx={{ px: 1.5 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/logout', 'Logout')}
              sx={{
                borderRadius: '10px',
                py: 1.25,
                px: 2,
                color: '#EF4444',
                '&:hover': { backgroundColor: '#FEF2F2' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: '#EF4444' }}>
                <LogOut size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
