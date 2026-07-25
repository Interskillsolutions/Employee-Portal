import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { Menu as MenuIcon, Bell, User, LogOut, Settings } from 'lucide-react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeRouteTitle = useSelector((state) => state.ui.activeRouteTitle);
  const user = useSelector((state) => state.auth.user);

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const currentDate = dayjs().format('dddd, DD MMMM YYYY');

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateProfile = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    // Phase 1 navigation baseline
    navigate('/logout');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        color: '#0F172A',
        px: { xs: 1, sm: 2 },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '70px !important' }}>
        {/* Left Section: Menu Toggle + Page Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => dispatch(toggleSidebar())}
            edge="start"
            sx={{ color: '#0F172A', borderRadius: '8px' }}
          >
            <MenuIcon size={22} />
          </IconButton>

          <Typography variant="h3" fontWeight={700} color="#0F172A">
            {activeRouteTitle}
          </Typography>
        </Box>

        {/* Right Section: Date + Notifications + Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 } }}>
          {/* Current Date Display */}
          <Typography
            variant="body2"
            sx={{
              display: { xs: 'none', md: 'block' },
              color: '#64748B',
              fontWeight: 500,
              backgroundColor: '#F8FAFC',
              px: 2,
              py: 0.75,
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
            }}
          >
            {currentDate}
          </Typography>

          {/* Notification Icon */}
          <IconButton sx={{ color: '#64748B', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Badge badgeContent={3} color="primary">
              <Bell size={20} />
            </Badge>
          </IconButton>

          {/* Profile Menu Trigger */}
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: '24px',
              '&:hover': { backgroundColor: '#F8FAFC' },
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                backgroundColor: '#2563EB',
                fontSize: '0.9375rem',
                fontWeight: 600,
              }}
            >
              {user?.name ? user.name.charAt(0) : 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body1" fontWeight={600} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                {user?.name || 'Employee User'}
              </Typography>
              <Typography variant="body2" color="#64748B" sx={{ fontSize: '0.75rem' }}>
                {user?.role || 'Employee'}
              </Typography>
            </Box>
          </Box>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                width: 200,
                borderRadius: '12px',
                mt: 1.5,
                boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.08)',
                border: '1px solid #E2E8F0',
              },
            }}
          >
            <MenuItem onClick={handleNavigateProfile} sx={{ py: 1.25, gap: 1.5 }}>
              <User size={18} color="#64748B" />
              <Typography variant="body2" fontWeight={500}>
                Profile
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }} sx={{ py: 1.25, gap: 1.5 }}>
              <Settings size={18} color="#64748B" />
              <Typography variant="body2" fontWeight={500}>
                Settings
              </Typography>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleLogout} sx={{ py: 1.25, gap: 1.5, color: '#EF4444' }}>
              <LogOut size={18} color="#EF4444" />
              <Typography variant="body2" fontWeight={600}>
                Logout
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
