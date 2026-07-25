import React, { useState } from 'react';
import {
  Box,
  Fab,
  Card,
  CardContent,
  Typography,
  Badge,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Avatar,
} from '@mui/material';
import { MessageSquare, X, Megaphone, Bell, Calendar, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const generalAnnouncements = [
  {
    id: 'g1',
    title: 'General Meeting at 5:00 PM Today',
    content: 'All team members please join the department sync meeting on Teams at 05:00 PM.',
    date: 'Today, 05:00 PM',
    tag: 'General',
    author: 'Manager Sarah',
  },
  {
    id: 'g2',
    title: 'Q3 Goal Evaluation Kickoff',
    content: 'Please ensure all weekly target scorecards are updated before EOD tomorrow.',
    date: 'July 24, 2026',
    tag: 'Broadcast',
    author: 'Admin Team',
  },
];

const personalNotifications = [
  {
    id: 'p1',
    title: 'Reminder: End of Day Report Pending',
    content: 'Alex: Please submit your End of Day Report before shift completion today at 6:00 PM.',
    date: '10 mins ago',
    tag: 'Personal',
    author: 'Manager Sarah',
    priority: 'High',
  },
  {
    id: 'p2',
    title: 'Weekly Target Goal Updated',
    content: 'Your manager updated your weekly Calls Target to 50 calls for this week.',
    date: '2 hours ago',
    tag: 'System',
    author: 'System',
    priority: 'Medium',
  },
];

const FloatingChatNotification = () => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const unreadCount = generalAnnouncements.length + personalNotifications.length;

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={() => setOpen(!open)}
        sx={{
          width: 56,
          height: 56,
          boxShadow: '0px 8px 24px rgba(37, 99, 235, 0.35)',
          backgroundColor: '#2563EB',
          '&:hover': { backgroundColor: '#1D4ED8' },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <MessageSquare size={24} color="#FFFFFF" />
        </Badge>
      </Fab>

      {/* Floating Compact Popup Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              sx={{
                position: 'absolute',
                bottom: 72,
                right: 0,
                width: { xs: 320, sm: 360 },
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.16)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Bell size={18} color="#60A5FA" />
                  <Typography variant="body1" fontWeight={600} color="#FFFFFF">
                    Announcements & Alerts
                  </Typography>
                </Box>

                <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#94A3B8' }}>
                  <X size={18} />
                </IconButton>
              </Box>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#F8FAFC' }}>
                <Tabs
                  value={tabValue}
                  onChange={(e, val) => setTabValue(val)}
                  variant="fullWidth"
                  sx={{ minHeight: 42, '& .MuiTab-root': { py: 1, fontSize: '0.8rem', fontWeight: 600 } }}
                >
                  <Tab label={`General (${generalAnnouncements.length})`} />
                  <Tab label={`Personal (${personalNotifications.length})`} />
                </Tabs>
              </Box>

              {/* Popup Content List */}
              <CardContent sx={{ p: 2, maxHeight: 320, overflowY: 'auto' }}>
                {tabValue === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {generalAnnouncements.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          p: 1.5,
                          borderRadius: '10px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={700} color="#0F172A">
                            {item.title}
                          </Typography>
                          <Chip label={item.tag} color="primary" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                        </Box>
                        <Typography variant="caption" color="#64748B" sx={{ display: 'block', mb: 1 }}>
                          {item.content}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="#94A3B8" sx={{ fontSize: '0.7rem' }}>
                            By {item.author}
                          </Typography>
                          <Typography variant="caption" color="#94A3B8" sx={{ fontSize: '0.7rem' }}>
                            {item.date}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {tabValue === 1 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {personalNotifications.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          p: 1.5,
                          borderRadius: '10px',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FCA5A5',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={700} color="#991B1B">
                            {item.title}
                          </Typography>
                          <Chip label={item.priority} color="error" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                        </Box>
                        <Typography variant="caption" color="#7F1D1D" sx={{ display: 'block', mb: 1 }}>
                          {item.content}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="#B91C1C" sx={{ fontSize: '0.7rem' }}>
                            From {item.author}
                          </Typography>
                          <Typography variant="caption" color="#B91C1C" sx={{ fontSize: '0.7rem' }}>
                            {item.date}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default FloatingChatNotification;
