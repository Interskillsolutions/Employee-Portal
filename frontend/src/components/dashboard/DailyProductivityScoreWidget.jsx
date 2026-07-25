import React from 'react';
import { Card, CardContent, Typography, Box, Chip, CircularProgress } from '@mui/material';
import { Award, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const DailyProductivityScoreWidget = ({ actionPlan, weeklyTarget }) => {
  const actionPlanCompletion = actionPlan?.completionPercentage || (actionPlan?.tasks?.length > 0 ? Math.round((actionPlan.tasks.filter(t => t.status === 'Completed').length / actionPlan.tasks.length) * 100) : 0);
  const weeklyAchievement = weeklyTarget?.overallProgress || 79;
  const kpiCompletion = actionPlan?.completedTasks ? Math.min(actionPlan.completedTasks * 20, 100) : 75;
  const reportSubmission = 0; // Pending until EOD report module

  // Calculated Score Formula
  const score = Math.round(
    actionPlanCompletion * 0.4 +
    weeklyAchievement * 0.3 +
    kpiCompletion * 0.2 +
    reportSubmission * 0.1
  );

  const getPerformanceLabel = (s) => {
    if (s >= 85) return { label: 'Excellent', color: 'success' };
    if (s >= 70) return { label: 'Good', color: 'primary' };
    if (s >= 50) return { label: 'Average', color: 'warning' };
    return { label: 'Needs Improvement', color: 'error' };
  };

  const perf = getPerformanceLabel(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
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
                  backgroundColor: '#10B98115',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                }}
              >
                <Zap size={22} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={600} color="#0F172A">
                  Daily Productivity Score
                </Typography>
                <Typography variant="caption" color="#64748B">
                  Weighted Efficiency Index
                </Typography>
              </Box>
            </Box>

            <Chip label={perf.label} color={perf.color} size="small" sx={{ fontWeight: 700, px: 1 }} />
          </Box>

          {/* Circular Score Gauge Container */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={120}
                thickness={6}
                sx={{ color: '#F1F5F9' }}
              />
              <CircularProgress
                variant="determinate"
                value={Math.min(score, 100)}
                size={120}
                thickness={6}
                sx={{ color: '#10B981', position: 'absolute', left: 0 }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h1" fontWeight={700} color="#0F172A">
                  {score}
                </Typography>
                <Typography variant="caption" color="#64748B" fontWeight={600}>
                  SCORE
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Weighted Breakdown Table */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3, pt: 2, borderTop: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="#64748B">Action Plan (40%)</Typography>
              <Typography variant="caption" fontWeight={700} color="#0F172A">{actionPlanCompletion}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="#64748B">Weekly Target (30%)</Typography>
              <Typography variant="caption" fontWeight={700} color="#0F172A">{weeklyAchievement}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="#64748B">KPI Completion (20%)</Typography>
              <Typography variant="caption" fontWeight={700} color="#0F172A">{kpiCompletion}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="#64748B">EOD Report (10%)</Typography>
              <Typography variant="caption" fontWeight={700} color="#94A3B8">Pending</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyProductivityScoreWidget;
