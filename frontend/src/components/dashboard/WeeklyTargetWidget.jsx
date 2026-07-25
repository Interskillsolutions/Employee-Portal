import React, { useEffect } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { Target, Phone, MessageSquare, Mail, HelpCircle, MapPin, UserCheck } from 'lucide-react';
import { useWeeklyTarget } from '../../hooks/useWeeklyTarget';
import { motion } from 'framer-motion';

const WeeklyTargetWidget = () => {
  const { currentTarget, fetchCurrentTarget } = useWeeklyTarget();

  useEffect(() => {
    fetchCurrentTarget();
  }, []);

  const data = currentTarget || {
    callsTarget: 150, callsCompleted: 0,
    messagesTarget: 250, messagesCompleted: 0,
    emailsTarget: 30, emailsCompleted: 0,
    enquiriesTarget: 50, enquiriesCompleted: 0,
    visitsTarget: 5, visitsCompleted: 0,
    admissionsTarget: 10, admissionsCompleted: 0,
    overallProgress: 0,
  };

  const metrics = [
    { label: 'Calls Target', icon: Phone, goal: data.callsTarget, achieved: data.callsCompleted, color: '#2563EB' },
    { label: 'Messages Target', icon: MessageSquare, goal: data.messagesTarget, achieved: data.messagesCompleted, color: '#10B981' },
    { label: 'Emails Target', icon: Mail, goal: data.emailsTarget, achieved: data.emailsCompleted, color: '#06B6D4' },
    { label: 'Enquiries Target', icon: HelpCircle, goal: data.enquiriesTarget, achieved: data.enquiriesCompleted, color: '#F59E0B' },
    { label: 'Visits Target', icon: MapPin, goal: data.visitsTarget, achieved: data.visitsCompleted, color: '#8B5CF6' },
    { label: 'Admissions Target', icon: UserCheck, goal: data.admissionsTarget, achieved: data.admissionsCompleted, color: '#EC4899' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  backgroundColor: '#8B5CF615',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8B5CF6',
                }}
              >
                <Target size={22} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={600} color="#0F172A">
                  Weekly Target Status
                </Typography>
                <Typography variant="caption" color="#64748B">
                  Cumulative KPI Scorecard
                </Typography>
              </Box>
            </Box>

            <Typography variant="h3" fontWeight={700} color="#8B5CF6">
              {data.overallProgress || 79}%
            </Typography>
          </Box>

          {/* Compact Progress Bars List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {metrics.map((m, index) => {
              const Icon = m.icon;
              const percent = m.goal > 0 ? Math.round((m.achieved / m.goal) * 100) : 0;

              return (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color={m.color} />
                      <Typography variant="body2" fontWeight={600} color="#0F172A">
                        {m.label}
                      </Typography>
                    </Box>
                    <Typography variant="caption" fontWeight={700} color="#64748B">
                      {m.achieved} / {m.goal} ({percent}%)
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(percent, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#F1F5F9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: m.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>

          {/* Strategic Weekly Goals Checklist */}
          {data?.weeklyGoals && data.weeklyGoals.length > 0 && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #F1F5F9' }}>
              <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
                Key Weekly Strategic Goals
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {data.weeklyGoals.map((goal, gIdx) => (
                  <Box key={gIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
                    <Typography variant="body2" fontWeight={600} color="#0F172A">
                      {goal}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeeklyTargetWidget;
