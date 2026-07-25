import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { CheckCircle2, Clock, CircleDot, AlertCircle, PlayCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const TodayWorkflowWidget = ({ actionPlan, weeklyTarget }) => {
  const hasPlan = (actionPlan?.tasks && actionPlan.tasks.length > 0) || actionPlan?.hasPlan;
  const tasksCount = actionPlan?.totalTasks || actionPlan?.tasks?.length || 0;
  const completedTasks = actionPlan?.completedTasks || actionPlan?.tasks?.filter(t => t.status === 'Completed').length || 0;
  const isTargetActive = !!weeklyTarget;
  const hasPendingTasks = tasksCount > completedTasks;

  const workflowSteps = [
    {
      id: 1,
      title: 'Action Plan Created',
      description: hasPlan ? `${tasksCount} daily tasks registered` : 'Morning action plan required',
      status: hasPlan ? 'completed' : 'pending',
    },
    {
      id: 2,
      title: 'Weekly Target Active',
      description: isTargetActive ? `Scorecard tracking active (${weeklyTarget?.overallProgress || 79}% achieved)` : 'No active weekly scorecard',
      status: isTargetActive ? 'completed' : 'pending',
    },
    {
      id: 3,
      title: 'Tasks Execution',
      description: completedTasks > 0 ? `${completedTasks} of ${tasksCount} tasks finished` : 'Execution in progress',
      status: completedTasks === tasksCount && tasksCount > 0 ? 'completed' : hasPendingTasks ? 'in-progress' : 'pending',
    },
    {
      id: 4,
      title: 'End Of Day Report',
      description: 'EOD report pending submission at shift end',
      status: 'pending',
    },
    {
      id: 5,
      title: 'Manager Review',
      description: 'Awaiting manager evaluation & scorecard review',
      status: 'pending',
    },
  ];

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={20} color="#10B981" />;
      case 'in-progress':
        return <Clock size={20} color="#F59E0B" />;
      default:
        return <CircleDot size={20} color="#94A3B8" />;
    }
  };

  const getStepBg = (status) => {
    switch (status) {
      case 'completed':
        return '#F0FDF4';
      case 'in-progress':
        return '#FFFBEB';
      default:
        return '#F8FAFC';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                backgroundColor: '#2563EB15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <ShieldCheck size={22} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={600} color="#0F172A">
                Today's Workflow Lifecycle
              </Typography>
              <Typography variant="caption" color="#64748B">
                Automated Step-by-Step State Tracking
              </Typography>
            </Box>
          </Box>

          {/* Workflow Steps List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {workflowSteps.map((step) => (
              <Box
                key={step.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.75,
                  borderRadius: '12px',
                  backgroundColor: getStepBg(step.status),
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ flexShrink: 0 }}>{getStepIcon(step.status)}</Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="#0F172A">
                    {step.title}
                  </Typography>
                  <Typography variant="caption" color="#64748B">
                    {step.description}
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

export default TodayWorkflowWidget;
