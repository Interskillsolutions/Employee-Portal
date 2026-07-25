import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Edit3, CheckCircle2 } from 'lucide-react';
import CustomButton from '../common/Button';
import { motion } from 'framer-motion';

const KpiCard = ({
  title,
  icon: Icon,
  value = 0,
  target = 0,
  weeklyValue = 0,
  weeklyTarget = 0,
  color = '#2563EB',
  metricKey,
  onUpdateMetric,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const completed = Number(value) || 0;
  const targetVal = Number(target) || 0;
  const remaining = Math.max(targetVal - completed, 0);
  const percentage = targetVal > 0 ? Math.round((completed / targetVal) * 100) : 0;

  const weeklyCompleted = Number(weeklyValue) || completed;
  const weeklyTargetVal = Number(weeklyTarget) || (targetVal > 0 ? targetVal * 5 : 150);
  const weeklyPercentage = weeklyTargetVal > 0 ? Math.round((weeklyCompleted / weeklyTargetVal) * 100) : 0;

  const handleSaveProgress = () => {
    if (onUpdateMetric && metricKey) {
      onUpdateMetric(metricKey, Math.max(0, parseInt(inputValue) || 0));
    }
    setOpenDialog(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <CardContent sx={{ p: 2.5, pb: 2, flexGrow: 1 }}>
            {/* Header Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="#64748B" fontWeight={600}>
                {title}
              </Typography>

              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  backgroundColor: `${color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: color,
                }}
              >
                {Icon && <Icon size={18} />}
              </Box>
            </Box>

            {/* Metric Details Grid */}
            <Grid container spacing={1} sx={{ mb: 2, p: 1.25, backgroundColor: '#F8FAFC', borderRadius: '10px' }}>
              <Grid item xs={4}>
                <Typography variant="caption" color="#64748B" display="block">
                  Target
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#0F172A">
                  {targetVal}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="#64748B" display="block">
                  Done
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#10B981">
                  {completed}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="#64748B" display="block">
                  Rem.
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#EF4444">
                  {remaining}
                </Typography>
              </Grid>
            </Grid>

            {/* 1. Today's Progress Bar */}
            <Box sx={{ width: '100%', mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" color="#64748B" fontWeight={600}>
                  Today's Progress ({completed}/{targetVal})
                </Typography>
                <Typography variant="caption" color={color} fontWeight={700}>
                  {percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#F1F5F9',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: color,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            {/* 2. Weekly Progress Bar */}
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" color="#8B5CF6" fontWeight={600}>
                  Weekly Progress ({weeklyCompleted}/{weeklyTargetVal})
                </Typography>
                <Typography variant="caption" color="#8B5CF6" fontWeight={700}>
                  {weeklyPercentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(weeklyPercentage, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#F1F5F9',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#8B5CF6',
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </CardContent>

          {/* Prominent Update Status Button */}
          {onUpdateMetric && metricKey && (
            <Box sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
              <CustomButton
                variant="outlined"
                color="primary"
                size="small"
                fullWidth
                onClick={() => {
                  setInputValue(completed);
                  setOpenDialog(true);
                }}
                startIcon={<Edit3 size={14} />}
                sx={{ fontSize: '0.78rem', py: 0.6, borderRadius: '8px' }}
              >
                Update Status
              </CustomButton>
            </Box>
          )}
        </Card>
      </motion.div>

      {/* Update Status Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Update {title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748B" sx={{ mb: 2 }}>
            Enter your updated actual completed count for today (Target: {targetVal}):
          </Typography>
          <TextField
            type="number"
            label="Actual Completed"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            fullWidth
            autoFocus
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton variant="outlined" color="inherit" onClick={() => setOpenDialog(false)}>
            Cancel
          </CustomButton>
          <CustomButton variant="contained" color="primary" onClick={handleSaveProgress} startIcon={<CheckCircle2 size={16} />}>
            Save Status
          </CustomButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KpiCard;
