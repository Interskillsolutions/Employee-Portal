import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Fab,
  Popover,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Megaphone,
  Clock,
  CheckCircle2,
  Bell,
  MessageSquare,
  Sparkles,
  UserCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import CustomButton from '../common/Button';
import {
  fetchAnnouncements,
  acknowledgeAnnouncement,
  snoozeAnnouncement,
} from '../../store/slices/announcementSlice';

const EmployeeAnnouncementBanner = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { announcements } = useSelector((state) => state.announcements);

  const [animatingId, setAnimatingId] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const currentEmpId = String(user?._id || user?.id || 'demo_employee_id');

  // Filter announcements for this employee
  const relevantAnnouncements = announcements.filter((a) => {
    if (!a) return false;
    if (a.type === 'General') return true;
    if (a.targetEmployeeIds && a.targetEmployeeIds.includes(currentEmpId)) return true;
    return false;
  });

  // Find top unacknowledged & unsnoozed announcement to show in Glass Overlay Banner
  const activeOverlayItem = relevantAnnouncements.find((a) => {
    const isAcked = a.acknowledgedBy && a.acknowledgedBy.includes(currentEmpId);
    const isSnoozed = a.snoozedBy && a.snoozedBy.includes(currentEmpId);
    return !isAcked && !isSnoozed;
  });

  const handleAcknowledge = async (id) => {
    setAnimatingId(id);
    setTimeout(async () => {
      await dispatch(acknowledgeAnnouncement(id));
      setAnimatingId(null);
    }, 450);
  };

  const handleSnooze = async (id) => {
    setAnimatingId(id);
    setTimeout(async () => {
      await dispatch(snoozeAnnouncement(id));
      setAnimatingId(null);
    }, 450);
  };

  const handleOpenPopover = (e) => {
    setPopoverAnchor(e.currentTarget);
  };

  const handleClosePopover = () => {
    setPopoverAnchor(null);
  };

  const isPopoverOpen = Boolean(popoverAnchor);

  return (
    <>
      {/* 1. GLASSMORPHISM OVERLAY BANNER FOR ACTIVE ANNOUNCEMENT */}
      {activeOverlayItem && (
        <Card
          key={activeOverlayItem._id || activeOverlayItem.id}
          sx={{
            mb: 3,
            p: 3,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(241, 245, 249, 0.92) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: activeOverlayItem.priority === 'Urgent'
              ? '2px solid rgba(239, 68, 68, 0.6)'
              : activeOverlayItem.priority === 'High'
              ? '2px solid rgba(245, 158, 11, 0.6)'
              : '2px solid rgba(37, 99, 235, 0.4)',
            boxShadow: activeOverlayItem.priority === 'Urgent'
              ? '0px 16px 40px rgba(239, 68, 68, 0.18)'
              : '0px 16px 40px rgba(37, 99, 235, 0.15)',
            transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.45s ease',
            transform: animatingId === (activeOverlayItem._id || activeOverlayItem.id)
              ? 'translate(300px, 400px) scale(0.1)'
              : 'translate(0, 0) scale(1)',
            opacity: animatingId === (activeOverlayItem._id || activeOverlayItem.id) ? 0 : 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Gradient Blur background accent */}
          <Box
            sx={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: activeOverlayItem.priority === 'Urgent'
                ? 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(255,255,255,0) 70%)'
                : 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none',
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1, minWidth: 280 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  background: activeOverlayItem.priority === 'Urgent'
                    ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                    : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
                  flexShrink: 0,
                }}
              >
                <Megaphone size={26} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                  <Typography variant="h3" fontWeight={800} color="#0F172A">
                    {activeOverlayItem.title}
                  </Typography>

                  <Chip
                    label={activeOverlayItem.type === 'Personal' ? 'Personal Message' : 'General Announcement'}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      backgroundColor: activeOverlayItem.type === 'Personal' ? '#8B5CF620' : '#2563EB20',
                      color: activeOverlayItem.type === 'Personal' ? '#6D28D9' : '#1D4ED8',
                      border: `1px solid ${activeOverlayItem.type === 'Personal' ? '#8B5CF6' : '#2563EB'}`,
                    }}
                  />

                  <Chip
                    label={`Priority: ${activeOverlayItem.priority}`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      backgroundColor: activeOverlayItem.priority === 'Urgent' ? '#EF444420' : '#F59E0B20',
                      color: activeOverlayItem.priority === 'Urgent' ? '#DC2626' : '#B45309',
                    }}
                  />
                </Box>

                <Typography variant="body1" color="#334155" sx={{ mt: 0.5, lineHeight: 1.6, fontWeight: 500 }}>
                  {activeOverlayItem.message}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                    <Sparkles size={14} color="#8B5CF6" />
                    <Typography variant="caption" fontWeight={700} color="#475569">
                      From: {activeOverlayItem.senderName} ({activeOverlayItem.senderRole || 'Manager'})
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: 'center' }}>
              <CustomButton
                variant="outlined"
                color="neutral"
                size="medium"
                onClick={() => handleSnooze(activeOverlayItem._id || activeOverlayItem.id)}
                startIcon={<Clock size={16} />}
                sx={{ borderRadius: '12px', fontWeight: 700 }}
              >
                Remind Me Later
              </CustomButton>

              <CustomButton
                variant="contained"
                color="primary"
                size="medium"
                onClick={() => handleAcknowledge(activeOverlayItem._id || activeOverlayItem.id)}
                startIcon={<CheckCircle2 size={18} />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 800,
                  px: 2.5,
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                }}
              >
                Acknowledge
              </CustomButton>
            </Box>
          </Box>
        </Card>
      )}

      {/* 2. FLOATING BOTTOM-RIGHT CHAT & ANNOUNCEMENT ICON */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1200,
        }}
      >
        <Badge
          badgeContent={relevantAnnouncements.length}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#8B5CF6',
              fontWeight: 800,
              fontSize: '0.75rem',
            },
          }}
        >
          <Fab
            onClick={handleOpenPopover}
            sx={{
              width: 58,
              height: 58,
              background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
              '&:hover': {
                transform: 'scale(1.05)',
                background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <MessageSquare size={26} />
          </Fab>
        </Badge>

        {/* Announcements History Popover / Drawer */}
        <Popover
          open={isPopoverOpen}
          anchorEl={popoverAnchor}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              width: 360,
              maxHeight: 480,
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.22)',
              border: '1px solid #E2E8F0',
              p: 0,
            },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', color: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Megaphone size={20} color="#8B5CF6" />
              <Typography variant="subtitle1" fontWeight={800}>
                Team Announcements
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleClosePopover} sx={{ color: '#94A3B8' }}>
              <X size={18} />
            </IconButton>
          </Box>

          <Divider />

          <List sx={{ p: 0, overflowY: 'auto', maxHeight: 400 }}>
            {relevantAnnouncements.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Bell size={32} color="#94A3B8" />
                <Typography variant="body2" color="#64748B" sx={{ mt: 1 }}>
                  No announcements published yet.
                </Typography>
              </Box>
            ) : (
              relevantAnnouncements.map((item) => {
                const itemId = item._id || item.id;
                const isAck = item.acknowledgedBy && item.acknowledgedBy.includes(currentEmpId);
                return (
                  <React.Fragment key={itemId}>
                    <ListItem
                      sx={{
                        p: 2,
                        backgroundColor: isAck ? '#FFFFFF' : '#2563EB08',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                          {item.title}
                        </Typography>
                        {isAck ? (
                          <Chip label="Read" size="small" color="success" sx={{ fontSize: '0.65rem', height: 20 }} />
                        ) : (
                          <Chip label="New" size="small" color="primary" sx={{ fontSize: '0.65rem', height: 20 }} />
                        )}
                      </Box>

                      <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.5 }}>
                        {item.message}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mt: 1 }}>
                        <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                          By {item.senderName} • {item.type}
                        </Typography>
                        {!isAck && (
                          <CustomButton
                            variant="text"
                            size="small"
                            onClick={() => handleAcknowledge(itemId)}
                            sx={{ fontSize: '0.75rem', p: 0, minWidth: 'auto', fontWeight: 700 }}
                          >
                            Mark Read
                          </CustomButton>
                        )}
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })
            )}
          </List>
        </Popover>
      </Box>
    </>
  );
};

export default EmployeeAnnouncementBanner;
