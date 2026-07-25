import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Tabs, Tab } from '@mui/material';
import { Megaphone, Calendar, Bell, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AnnouncementWidget = () => {
  const [tabValue, setTabValue] = useState(0);

  const generalAnnouncements = [
    {
      id: 'g1',
      title: 'General Team Sync Meeting at 5:00 PM',
      content: 'All department team members please join the sprint sync meeting on Microsoft Teams at 05:00 PM.',
      date: 'Today, 05:00 PM',
      tag: 'General',
      author: 'Manager Sarah',
    },
    {
      id: 'g2',
      title: 'Q3 Productivity Townhall',
      content: 'All team members are invited to join the Q3 performance townhall tomorrow at 3:00 PM.',
      date: 'July 24, 2026',
      tag: 'Broadcast',
      author: 'Admin Team',
    },
  ];

  const personalNotifications = [
    {
      id: 'p1',
      title: 'Submit End of Day Report Reminder',
      content: 'Alex: Please submit your End of Day Report before shift completion today at 06:00 PM.',
      date: '10 mins ago',
      tag: 'Personal',
      author: 'Manager Sarah',
      priority: 'High',
    },
    {
      id: 'p2',
      title: 'Weekly Target Milestone Reached',
      content: 'Great job! You completed 80% of your Weekly Target scorecard.',
      date: 'Yesterday, 04:30 PM',
      tag: 'System',
      author: 'System',
      priority: 'Medium',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card
        sx={{
          borderRadius: '16px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  backgroundColor: '#F59E0B15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F59E0B',
                }}
              >
                <Megaphone size={22} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={600} color="#0F172A">
                  Announcements & Notices
                </Typography>
                <Typography variant="caption" color="#64748B">
                  General Broadcasts & Direct Alerts
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Sub-tabs for General vs Personal */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(e, val) => setTabValue(val)}
              variant="fullWidth"
              sx={{ minHeight: 38, '& .MuiTab-root': { py: 0.75, fontSize: '0.8rem', fontWeight: 600 } }}
            >
              <Tab label={`General (${generalAnnouncements.length})`} />
              <Tab label={`Personal (${personalNotifications.length})`} />
            </Tabs>
          </Box>

          {/* General Announcements Tab */}
          {tabValue === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              {generalAnnouncements.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={700} color="#0F172A">
                      {item.title}
                    </Typography>
                    <Chip label={item.tag} color="primary" size="small" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                  </Box>
                  <Typography variant="body2" color="#64748B" sx={{ mb: 1.25, fontSize: '0.8125rem' }}>
                    {item.content}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="#94A3B8" sx={{ fontWeight: 500 }}>
                      By {item.author}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Calendar size={13} color="#94A3B8" />
                      <Typography variant="caption" color="#94A3B8">
                        {item.date}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Personal Notifications Tab */}
          {tabValue === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              {personalNotifications.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={700} color="#991B1B">
                      {item.title}
                    </Typography>
                    <Chip label={item.priority} color="error" size="small" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                  </Box>
                  <Typography variant="body2" color="#7F1D1D" sx={{ mb: 1.25, fontSize: '0.8125rem' }}>
                    {item.content}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="#B91C1C" sx={{ fontWeight: 600 }}>
                      From {item.author}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Clock size={13} color="#B91C1C" />
                      <Typography variant="caption" color="#B91C1C">
                        {item.date}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnnouncementWidget;
