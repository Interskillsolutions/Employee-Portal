import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Activity, CheckCircle, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const ActivityTimelineWidget = ({ activities = [] }) => {
  const defaultActivities = [
    { id: '1', title: 'Completed Enquiry Follow-up Task', time: '10 mins ago', category: 'Task' },
    { id: '2', title: 'Clocked In for Morning Shift (09:15 AM)', time: '2 hours ago', category: 'Attendance' },
    { id: '3', title: 'Achieved 80% Weekly Target Milestone', time: 'Yesterday', category: 'Milestone' },
  ];

  const list = activities.length > 0 ? activities : defaultActivities;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                backgroundColor: '#06B6D415',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06B6D4',
              }}
            >
              <Activity size={22} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={600} color="#0F172A">
                Recent Activity Log
              </Typography>
              <Typography variant="caption" color="#64748B">
                Timeline of System Events
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {list.map((item, idx) => (
              <Box key={item.id || idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <CheckCircle size={16} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="#0F172A">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="#64748B">
                    {item.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivityTimelineWidget;
