import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  Alert,
  TextField,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from '@mui/material';
import {
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Navigation,
  CheckCircle,
  Phone,
  MessageSquare,
  UserCheck,
  Layers,
} from 'lucide-react';
import CustomButton from '../common/Button';
import { clockOutThunk, fetchActiveBranches } from '../../store/slices/attendanceSlice';

// Haversine Distance Formula in Frontend
const calculateHaversineMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const EodReportModal = ({ open, onClose, onClockOutSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeBranches, isClockingOut, error: attError } = useSelector((state) => state.attendance);
  const { todayPlan } = useSelector((state) => state.actionPlan);

  const [tasksDoneSummary, setTasksDoneSummary] = useState('');
  const [tomorrowTasks, setTomorrowTasks] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState('');

  // Metrics States
  const [callsCompleted, setCallsCompleted] = useState(0);
  const [whatsappCompleted, setWhatsappCompleted] = useState(0);
  const [admissionsCompleted, setAdmissionsCompleted] = useState(0);
  const [pipelineCompleted, setPipelineCompleted] = useState(0);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [userCoords, setUserCoords] = useState(null);

  // Verification results state
  const [verification, setVerification] = useState({
    isWithinRadius: false,
    nearestBranch: null,
    distanceMeters: null,
  });

  const empName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName}` : 'Employee');
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Prefill metrics state when todayPlan loads
  useEffect(() => {
    if (todayPlan) {
      setCallsCompleted(todayPlan.dailyCallsCompleted ?? 0);
      setWhatsappCompleted(todayPlan.dailyWhatsappCompleted ?? 0);
      setAdmissionsCompleted(todayPlan.dailyAdmissionsCompleted ?? 0);
      setPipelineCompleted(todayPlan.dailyEnquiryPipelineCompleted ?? 0);
    }
  }, [todayPlan]);

  // Fetch active company branches on open
  useEffect(() => {
    if (open) {
      dispatch(fetchActiveBranches());
    }
  }, [open, dispatch]);

  // Request actual browser GPS coordinates
  useEffect(() => {
    if (!open) return;

    if (navigator.geolocation) {
      setGpsLoading(true);
      setGpsError('');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setGpsLoading(false);
        },
        (err) => {
          setGpsLoading(false);
          setGpsError(
            'GPS Permission Denied / Position Unavailable. Please enable browser location to submit report and clock out.'
          );
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsError('Browser Geolocation is not supported on this device.');
    }
  }, [open]);

  // Verify coordinates against ALL active company branches using Haversine
  useEffect(() => {
    if (!userCoords || !activeBranches || activeBranches.length === 0) {
      setVerification({ isWithinRadius: false, nearestBranch: null, distanceMeters: null });
      return;
    }

    let minDistance = Infinity;
    let closest = null;
    let insideAny = false;

    activeBranches.forEach((b) => {
      const dist = calculateHaversineMeters(
        userCoords.latitude,
        userCoords.longitude,
        b.latitude,
        b.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        closest = b;
      }
      if (dist <= (b.allowedRadius || 100)) {
        insideAny = true;
      }
    });

    setVerification({
      isWithinRadius: insideAny,
      nearestBranch: closest,
      distanceMeters: minDistance,
    });
  }, [userCoords, activeBranches]);

  const handleClockOutSubmit = async () => {
    if (!userCoords || !verification.isWithinRadius) {
      setFormError('You must be within 100m of a registered branch to clock out.');
      return;
    }

    if (!tasksDoneSummary.trim()) {
      setFormError('Please enter a summary of today\'s completed tasks.');
      return;
    }

    setFormError('');

    const payload = {
      latitude: userCoords.latitude,
      longitude: userCoords.longitude,
      tasksCompletedSummary: tasksDoneSummary.trim(),
      tomorrowTasks: tomorrowTasks.trim(),
      remarks: remarks.trim(),
      dailyCallsCompleted: Number(callsCompleted),
      dailyWhatsappCompleted: Number(whatsappCompleted),
      dailyAdmissionsCompleted: Number(admissionsCompleted),
      dailyEnquiryPipelineCompleted: Number(pipelineCompleted),
    };

    const res = await dispatch(clockOutThunk(payload));
    if (!res.error) {
      if (onClockOutSuccess) onClockOutSuccess();
      if (onClose) onClose();
    }
  };

  const todayTasks = todayPlan?.tasks || [];

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 1,
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0',
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle sx={{ p: 2.5, pb: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Chip
            icon={<FileText size={16} color="#2563EB" />}
            label="End of Day EOD Performance Report"
            sx={{
              fontWeight: 800,
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              borderColor: '#BFDBFE',
              py: 1.5,
              fontSize: '0.78rem',
            }}
          />
        </Box>

        <Typography variant="h3" fontWeight={800} color="#0F172A" align="center" sx={{ fontSize: '1.35rem' }}>
          End of Day Report & Clock Out
        </Typography>
        <Typography variant="body2" color="#64748B" align="center" sx={{ mt: 0.5 }}>
          Hello {empName}, please review today's task execution and summarize your achievements to clock out.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Date & Branch Details */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderRadius: '16px',
            backgroundColor: '#F1F5F9',
            border: '1px solid #E2E8F0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={18} color="#2563EB" />
            <Typography variant="body2" fontWeight={700} color="#334155">
              {todayFormatted}
            </Typography>
          </Box>
          {verification.nearestBranch && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Building2 size={18} color="#10B981" />
              <Typography variant="body2" fontWeight={700} color="#334155">
                {verification.nearestBranch.branchName}
              </Typography>
            </Box>
          )}
        </Box>

        {/* 4 KPI METRIC INPUTS - Let employee adjust actual work completed */}
        <Box sx={{ p: 2, borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
          <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>
            📊 Finalize Today's Completed Target Metrics:
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Calls Completed', icon: Phone, color: '#2563EB', value: callsCompleted, setter: setCallsCompleted, target: todayPlan?.dailyCallsTarget ?? 0 },
              { label: 'WhatsApp Sent', icon: MessageSquare, color: '#10B981', value: whatsappCompleted, setter: setWhatsappCompleted, target: todayPlan?.dailyWhatsappTarget ?? 0 },
              { label: 'Admissions Processed', icon: UserCheck, color: '#8B5CF6', value: admissionsCompleted, setter: setAdmissionsCompleted, target: todayPlan?.dailyExpectedAdmissions ?? 0 },
              { label: 'Pipeline Leads Added', icon: Layers, color: '#F59E0B', value: pipelineCompleted, setter: setPipelineCompleted, target: todayPlan?.dailyExpectedEnquiryPipeline ?? 0 },
            ].map((m, idx) => (
              <Grid item xs={6} key={idx}>
                <Box sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <m.icon size={16} color={m.color} />
                    <Typography variant="caption" fontWeight={700} color="#475569">{m.label} (Target: {m.target})</Typography>
                  </Box>
                  <TextField
                    type="number"
                    size="small"
                    value={m.value}
                    onChange={(e) => m.setter(Math.max(0, Number(e.target.value)))}
                    inputProps={{ min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800 } }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Today's Tasks Checked from Action Plan */}
        {todayTasks.length > 0 && (
          <Box sx={{ p: 2, borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
              📋 Today's Action Plan Progress:
            </Typography>
            <List dense disablePadding>
              {todayTasks.map((t, idx) => (
                <ListItem key={idx} disableGutters sx={{ py: 0.4 }}>
                  <ListItemIcon sx={{ minWidth: 26 }}>
                    <CheckCircle
                      size={15}
                      color={t.status === 'Completed' ? '#10B981' : '#94A3B8'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={t.title}
                    primaryTypographyProps={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: t.status === 'Completed' ? '#0F172A' : '#64748B',
                    }}
                  />
                  <Chip
                    label={t.status}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      backgroundColor: t.status === 'Completed' ? '#ECFDF5' : '#F1F5F9',
                      color: t.status === 'Completed' ? '#10B981' : '#64748B',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* EOD Summary Inputs */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Summary of Tasks Completed Today *"
            multiline
            rows={3}
            fullWidth
            required
            variant="outlined"
            placeholder="Summarize what you achieved today, phone calls closed, admissions processed..."
            value={tasksDoneSummary}
            onChange={(e) => setTasksDoneSummary(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          <TextField
            label="Tomorrow's Action Plan / Tasks (Optional)"
            multiline
            rows={2}
            fullWidth
            variant="outlined"
            placeholder="List tasks you plan to execute tomorrow..."
            value={tomorrowTasks}
            onChange={(e) => setTomorrowTasks(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          <TextField
            label="Additional Comments / Remarks (Optional)"
            fullWidth
            variant="outlined"
            placeholder="Any comments, feedback or support needed..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </Box>

        {/* GPS Verification Status Banner */}
        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            backgroundColor: verification.isWithinRadius ? '#ECFDF5' : '#FEF2F2',
            border: `2px solid ${verification.isWithinRadius ? '#10B981' : '#EF4444'}`,
            transition: 'all 0.3s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {verification.isWithinRadius ? (
              <CheckCircle2 size={22} color="#10B981" />
            ) : (
              <AlertTriangle size={22} color="#EF4444" />
            )}
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={800}
                color={verification.isWithinRadius ? '#065F46' : '#991B1B'}
              >
                {verification.isWithinRadius
                  ? `✔ Within ${verification.nearestBranch?.branchName || 'Branch Radius'} (${verification.distanceMeters}m)`
                  : '❌ Outside Company Premises'}
              </Typography>
            </Box>
          </Box>

          {!verification.isWithinRadius && !gpsLoading && (
            <Typography variant="caption" color="#B91C1C" display="block" sx={{ mt: 1, fontWeight: 700 }}>
              You are out of range. Go to the branch premises to submit report and clock out.
            </Typography>
          )}

          {gpsLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <CircularProgress size={12} color="inherit" />
              <Typography variant="caption" fontWeight={700} color="#475569">
                Verifying location...
              </Typography>
            </Box>
          )}

          {gpsError && (
            <Typography variant="caption" color="#B91C1C" display="block" sx={{ mt: 1, fontWeight: 700 }}>
              {gpsError}
            </Typography>
          )}
        </Box>

        {(formError || attError) && (
          <Alert severity="error" sx={{ borderRadius: '12px', fontWeight: 700 }}>
            {formError || attError}
          </Alert>
        )}

        {/* Action Button */}
        <CustomButton
          variant="contained"
          color="error"
          fullWidth
          size="large"
          loading={isClockingOut}
          disabled={!verification.isWithinRadius || gpsLoading || !tasksDoneSummary.trim()}
          onClick={handleClockOutSubmit}
          startIcon={<Navigation size={18} />}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 800,
            background: verification.isWithinRadius && tasksDoneSummary.trim()
              ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
              : '#CBD5E1',
            boxShadow: verification.isWithinRadius && tasksDoneSummary.trim() ? '0 6px 20px rgba(239, 68, 68, 0.3)' : 'none',
          }}
        >
          {verification.isWithinRadius ? 'Submit EOD Report & Clock Out' : 'Clock Out Disabled (Out of Range)'}
        </CustomButton>
      </DialogContent>
    </Dialog>
  );
};

export default EodReportModal;
