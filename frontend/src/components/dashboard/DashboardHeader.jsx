import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Bell,
  LogOut,
  Clock,
  Calendar,
  Rocket,
  PlusCircle,
  Target,
  FileText,
  BarChart2,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../common/Button';

const DashboardHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [currentTime, setCurrentTime] = useState(dayjs().format('hh:mm:ss A'));
  const currentDate = dayjs().format('dddd, DD MMMM YYYY');

  // Shortcuts menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const openShortcuts = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    handleCloseMenu();
    navigate(path);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('hh:mm:ss A'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        mb: 4,
        p: { xs: 2.5, sm: 3 },
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Greeting & Name */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={user?.avatarUrl}
          sx={{
            width: 54,
            height: 54,
            backgroundColor: '#2563EB',
            fontSize: '1.25rem',
            fontWeight: 700,
            boxShadow: '0px 4px 14px rgba(37, 99, 235, 0.25)',
          }}
        >
          {user?.firstName ? user.firstName.charAt(0) : 'E'}
        </Avatar>
        <Box>
          <Typography variant="body2" color="#64748B" fontWeight={500}>
            {getGreeting()}, 👋
          </Typography>
          <Typography variant="h1" color="#0F172A" fontWeight={700} sx={{ fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
            {user ? `${user.firstName} ${user.lastName}` : 'Alex Morgan'}
          </Typography>
        </Box>
      </Box>

      {/* Live Date, Time, Quick Shortcuts Menu & Actions */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          width: { xs: '100%', md: 'auto' },
          justifyContent: { xs: 'space-between', md: 'flex-end' },
          flexWrap: 'wrap',
        }}
      >
        {/* Quick Shortcuts Hover/Click Menu Button */}
        <Box
          onMouseEnter={handleOpenMenu}
          onClick={handleOpenMenu}
          sx={{ display: 'inline-block' }}
        >
          <CustomButton
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<Rocket size={18} />}
            sx={{
              borderRadius: '12px',
              py: 0.9,
              px: 2,
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: '#EFF6FF',
              borderColor: '#BFDBFE',
              '&:hover': {
                backgroundColor: '#DBEAFE',
              },
            }}
          >
            Quick Shortcuts
          </CustomButton>
        </Box>

        {/* Hover Menu Popup */}
        <Menu
          anchorEl={anchorEl}
          open={openShortcuts}
          onClose={handleCloseMenu}
          MenuListProps={{
            onMouseLeave: handleCloseMenu,
            sx: { py: 1 },
          }}
          PaperProps={{
            sx: {
              borderRadius: '14px',
              mt: 1,
              minWidth: 230,
              boxShadow: '0px 10px 30px rgba(15, 23, 42, 0.12)',
              border: '1px solid #E2E8F0',
            },
          }}
        >
          <MenuItem onClick={() => handleNavigate('/daily-planner')} sx={{ py: 1.2, px: 2 }}>
            <ListItemIcon sx={{ color: '#2563EB', minWidth: 34 }}>
              <PlusCircle size={18} />
            </ListItemIcon>
            <ListItemText primary="Create Action Plan" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
          </MenuItem>

          <MenuItem onClick={() => handleNavigate('/weekly-target')} sx={{ py: 1.2, px: 2 }}>
            <ListItemIcon sx={{ color: '#8B5CF6', minWidth: 34 }}>
              <Target size={18} />
            </ListItemIcon>
            <ListItemText primary="Open Weekly Target" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
          </MenuItem>

          <MenuItem onClick={() => handleNavigate('/reports')} sx={{ py: 1.2, px: 2 }}>
            <ListItemIcon sx={{ color: '#10B981', minWidth: 34 }}>
              <FileText size={18} />
            </ListItemIcon>
            <ListItemText primary="Submit EOD Report" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
          </MenuItem>

          <MenuItem onClick={() => handleNavigate('/reports')} sx={{ py: 1.2, px: 2 }}>
            <ListItemIcon sx={{ color: '#06B6D4', minWidth: 34 }}>
              <BarChart2 size={18} />
            </ListItemIcon>
            <ListItemText primary="View Performance Reports" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
          </MenuItem>
        </Menu>

        {/* Live Clock Badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
          }}
        >
          <Clock size={18} color="#2563EB" />
          <Typography variant="body2" fontWeight={700} color="#0F172A" sx={{ fontFamily: 'monospace' }}>
            {currentTime}
          </Typography>
        </Box>

        {/* Date Display */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
          }}
        >
          <Calendar size={18} color="#64748B" />
          <Typography variant="body2" fontWeight={500} color="#64748B">
            {currentDate}
          </Typography>
        </Box>

        {/* Notifications & Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton sx={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B' }}>
              <Badge badgeContent={3} color="primary">
                <Bell size={20} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout Session">
            <IconButton onClick={handleLogout} sx={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#EF4444' }}>
              <LogOut size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
