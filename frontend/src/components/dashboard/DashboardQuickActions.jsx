import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { PlusCircle, Target, FileText, BarChart2, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../common/Button';
import { motion } from 'framer-motion';

const DashboardQuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Create Today's Action Plan",
      icon: PlusCircle,
      path: '/daily-planner',
      color: 'primary',
      variant: 'contained',
    },
    {
      label: 'Open Weekly Target',
      icon: Target,
      path: '/weekly-target',
      color: 'secondary',
      variant: 'outlined',
    },
    {
      label: 'Submit End Of Day Report',
      icon: FileText,
      path: '/reports',
      color: 'success',
      variant: 'outlined',
    },
    {
      label: 'View Performance Reports',
      icon: BarChart2,
      path: '/reports',
      color: 'info',
      variant: 'outlined',
    },
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
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
              <Rocket size={22} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={600} color="#0F172A">
                Quick Shortcuts & Operations
              </Typography>
              <Typography variant="caption" color="#64748B">
                Fast-track daily workflows
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {actions.map((act, index) => {
              const Icon = act.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <CustomButton
                    variant={act.variant}
                    color={act.color}
                    fullWidth
                    onClick={() => navigate(act.path)}
                    startIcon={<Icon size={18} />}
                    sx={{ py: 1.25, justifyContent: 'flex-start', px: 2 }}
                  >
                    {act.label}
                  </CustomButton>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardQuickActions;
