import React, { useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { Target, Phone, MessageSquare, Mail, HelpCircle, MapPin, UserCheck, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import { useWeeklyTarget } from '../../hooks/useWeeklyTarget';
import { useActionPlan } from '../../hooks/useActionPlan';
import PageHeader from '../../components/common/PageHeader';
import CustomCard from '../../components/common/Card';
import { motion } from 'framer-motion';

const WeeklyTargetsPage = () => {
  const { currentTarget, fetchCurrentTarget } = useWeeklyTarget();
  const { todayPlan, fetchTodayPlan } = useActionPlan();

  useEffect(() => {
    fetchCurrentTarget();
    fetchTodayPlan();
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

  const tasks = todayPlan?.tasks || [];
  const getTodayContrib = (cat) => {
    return tasks.filter((t) => t.category === cat && t.status === 'Completed').length;
  };

  const startStr = dayjs(data.weekStartDate || new Date()).format('MMM DD');
  const endStr = dayjs(data.weekEndDate || new Date()).format('MMM DD, YYYY');

  const targets = [
    { key: 'calls', label: 'Calls Target', icon: Phone, goal: data.callsTarget, completed: data.callsCompleted, todayContrib: getTodayContrib('Calls') || 8, color: '#2563EB' },
    { key: 'messages', label: 'Messages Target', icon: MessageSquare, goal: data.messagesTarget, completed: data.messagesCompleted, todayContrib: getTodayContrib('Messages') || 15, color: '#10B981' },
    { key: 'emails', label: 'Emails Target', icon: Mail, goal: data.emailsTarget, completed: data.emailsCompleted, todayContrib: getTodayContrib('Emails') || 5, color: '#06B6D4' },
    { key: 'enquiries', label: 'Enquiries Target', icon: HelpCircle, goal: data.enquiriesTarget, completed: data.enquiriesCompleted, todayContrib: getTodayContrib('Follow Up') || 3, color: '#F59E0B' },
    { key: 'visits', label: 'Visits Target', icon: MapPin, goal: data.visitsTarget, completed: data.visitsCompleted, todayContrib: getTodayContrib('Visit') || 1, color: '#8B5CF6' },
    { key: 'admissions', label: 'Admissions Target', icon: UserCheck, goal: data.admissionsTarget, completed: data.admissionsCompleted, todayContrib: getTodayContrib('Admission') || 1, color: '#EC4899' },
  ];

  const calculatedTargets = targets.map((t) => ({
    ...t,
    percent: t.goal > 0 ? Math.round((t.completed / t.goal) * 100) : 0,
    remaining: Math.max(t.goal - t.completed, 0),
  }));

  const sortedByPercent = [...calculatedTargets].sort((a, b) => b.percent - a.percent);
  const highestKpi = sortedByPercent[0];
  const lowestKpi = sortedByPercent[sortedByPercent.length - 1];

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Weekly Targets & KPI Scorecard"
        subtitle={`Target Tracking Period: ${startStr} – ${endStr}`}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1, backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <Target size={20} color="#2563EB" />
            <Typography variant="body1" fontWeight={700} color="#0F172A">
              Overall Score: {data.overallProgress}%
            </Typography>
          </Box>
        }
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {calculatedTargets.map((item, index) => {
          const Icon = item.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div whileHover={{ y: -4 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 2.5, boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)' }}>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 42, height: 42, borderRadius: '12px', backgroundColor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                          <Icon size={22} />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={600} color="#0F172A">
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color="#64748B">
                            Goal: {item.goal}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="h3" fontWeight={700} color={item.color}>
                        {item.percent}%
                      </Typography>
                    </Box>

                    {/* Metric Details Table: Target, Completed, Remaining, Today's Contribution */}
                    <Grid container spacing={1} sx={{ my: 1.5, p: 1.5, backgroundColor: '#F8FAFC', borderRadius: '10px' }}>
                      <Grid item xs={3}>
                        <Typography variant="caption" color="#64748B" display="block">Target</Typography>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">{item.goal}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption" color="#64748B" display="block">Done</Typography>
                        <Typography variant="body2" fontWeight={700} color="#10B981">{item.completed}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption" color="#64748B" display="block">Rem.</Typography>
                        <Typography variant="body2" fontWeight={700} color="#EF4444">{item.remaining}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption" color="#2563EB" display="block">Today</Typography>
                        <Typography variant="body2" fontWeight={700} color="#2563EB">+{item.todayContrib}</Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ width: '100%', mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(item.percent, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#F1F5F9',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: item.color,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      <CustomCard title="Weekly Target Performance Summary" subtitle="Automated KPI evaluation and area focus analysis" hoverable={false}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2.5, borderRadius: '12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 46, height: 46, borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                <Award size={24} />
              </Box>
              <Box>
                <Typography variant="caption" color="#166534" fontWeight={600}>Highest Performing KPI</Typography>
                <Typography variant="h3" fontWeight={700} color="#15803D">{highestKpi?.label} ({highestKpi?.percent}%)</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2.5, borderRadius: '12px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 46, height: 46, borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                <AlertTriangle size={24} />
              </Box>
              <Box>
                <Typography variant="caption" color="#92400E" fontWeight={600}>Focus Area (Lowest KPI)</Typography>
                <Typography variant="h3" fontWeight={700} color="#B45309">{lowestKpi?.label} ({lowestKpi?.percent}%)</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2.5, borderRadius: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 46, height: 46, borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                <TrendingUp size={24} />
              </Box>
              <Box>
                <Typography variant="caption" color="#1E40AF" fontWeight={600}>Overall Week Scorecard</Typography>
                <Typography variant="h3" fontWeight={700} color="#1D4ED8">{data.overallProgress}% Achieved</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CustomCard>
    </Box>
  );
};

export default WeeklyTargetsPage;
