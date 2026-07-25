import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
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
  LinearProgress,
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
import PageHeader from '../../components/common/PageHeader';
import CustomButton from '../../components/common/Button';
import { clockOutThunk, fetchActiveBranches, fetchTodayAttendance } from '../../store/slices/attendanceSlice';
import { getTodayPlan } from '../../store/slices/actionPlanSlice';
import { getCurrentTarget } from '../../store/slices/weeklyTargetSlice';

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

const ReportsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { todayRecord, isClockedIn, activeBranches, isClockingOut, error: attError } = useSelector((state) => state.attendance);
  const { todayPlan } = useSelector((state) => state.actionPlan);
  const { currentTarget } = useSelector((state) => state.weeklyTarget);

  const [tasksDoneSummary, setTasksDoneSummary] = useState('');
  const [tomorrowTasks, setTomorrowTasks] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Metrics States (Done Values)
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

  // Fetch initial records
  useEffect(() => {
    dispatch(fetchTodayAttendance());
    dispatch(getTodayPlan());
    dispatch(getCurrentTarget());
    dispatch(fetchActiveBranches());
  }, [dispatch]);

  // Prefill metrics state when todayPlan loads
  useEffect(() => {
    if (todayPlan) {
      setCallsCompleted(todayPlan.dailyCallsCompleted ?? 0);
      setWhatsappCompleted(todayPlan.dailyWhatsappCompleted ?? 0);
      setAdmissionsCompleted(todayPlan.dailyAdmissionsCompleted ?? 0);
      setPipelineCompleted(todayPlan.dailyEnquiryPipelineCompleted ?? 0);
    }
  }, [todayPlan]);

  // Request actual browser GPS coordinates
  useEffect(() => {
    if (todayRecord?.clockOutTime) return; // Skip if already clocked out

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
  }, [todayRecord]);

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

  const handleClockOutSubmit = async (e) => {
    e.preventDefault();

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
      setSuccessMsg('EOD Report successfully submitted and clocked out!');
      dispatch(fetchTodayAttendance());
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  const todayTasks = todayPlan?.tasks || [];

  // Helper variables for targets
  const planCallsTarget = todayPlan?.dailyCallsTarget ?? 30;
  const planWhatsappTarget = todayPlan?.dailyWhatsappTarget ?? 50;
  const planAdmissionsTarget = todayPlan?.dailyExpectedAdmissions ?? 2;
  const planPipelineTarget = todayPlan?.dailyExpectedEnquiryPipeline ?? 10;

  const weeklyCallsTarget = currentTarget?.callsTarget ?? 150;
  const weeklyCallsCompleted = (currentTarget?.callsCompleted ?? 0) - (todayPlan?.dailyCallsCompleted ?? 0) + Number(callsCompleted);

  const weeklyWhatsappTarget = currentTarget?.messagesTarget ?? 250;
  const weeklyWhatsappCompleted = (currentTarget?.messagesCompleted ?? 0) - (todayPlan?.dailyWhatsappCompleted ?? 0) + Number(whatsappCompleted);

  const weeklyAdmissionsTarget = currentTarget?.admissionsTarget ?? 10;
  const weeklyAdmissionsCompleted = (currentTarget?.admissionsCompleted ?? 0) - (todayPlan?.dailyAdmissionsCompleted ?? 0) + Number(admissionsCompleted);

  const weeklyPipelineTarget = currentTarget?.enquiriesTarget ?? 50;
  const weeklyPipelineCompleted = (currentTarget?.enquiriesCompleted ?? 0) - (todayPlan?.dailyEnquiryPipelineCompleted ?? 0) + Number(pipelineCompleted);

  // ──────── Helper function to render a premium KPI Card like the image ────────
  const renderKpiCard = (title, icon, color, target, done, setDone, weeklyTarget, weeklyDone) => {
    const IconComp = icon;
    const remaining = Math.max(0, target - done);
    const todayPercent = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
    const weeklyPercent = weeklyTarget > 0 ? Math.min(100, Math.round((weeklyDone / weeklyTarget) * 100)) : 0;

    return (
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          backgroundColor: '#FFFFFF',
          overflow: 'visible',
          height: '100%',
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          {/* Header Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} color="#475569" sx={{ fontSize: '0.85rem' }}>
              {title}
            </Typography>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
              }}
            >
              <IconComp size={16} />
            </Box>
          </Box>

          {/* Target, Done, Rem Stats Row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr 1fr',
              gap: 1,
              p: 1.5,
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              mb: 2.5,
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="caption" color="#64748B" display="block">Target</Typography>
              <Typography variant="body1" fontWeight={800} color="#0F172A">
                {target}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="#10B981" display="block" sx={{ fontWeight: 700 }}>Done</Typography>
              <TextField
                type="number"
                size="small"
                value={done}
                onChange={(e) => setDone(Math.max(0, Number(e.target.value)))}
                inputProps={{ min: 0, style: { padding: '4px 6px', fontWeight: 800, fontSize: '0.88rem', color: '#047857' } }}
                sx={{
                  width: '90%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #10B98130',
                    '&.Mui-focused fieldset': { borderColor: '#10B981' },
                  },
                }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="#EF4444" display="block" sx={{ fontWeight: 700 }}>Rem.</Typography>
              <Typography variant="body1" fontWeight={800} color="#B91C1C">
                {remaining}
              </Typography>
            </Box>
          </Box>

          {/* Today's Progress Bar */}
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" fontWeight={700} color="#64748B">
                Today's Progress ({done}/{target})
              </Typography>
              <Typography variant="caption" fontWeight={800} color={done >= target ? '#10B981' : '#64748B'}>
                {todayPercent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={todayPercent}
              sx={{
                height: 6,
                borderRadius: '3px',
                backgroundColor: '#E2E8F0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: done >= target ? '#10B981' : '#2563EB',
                  borderRadius: '3px',
                },
              }}
            />
          </Box>

          {/* Weekly Progress Bar */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" fontWeight={700} color="#64748B">
                Weekly Progress ({weeklyDone}/{weeklyTarget})
              </Typography>
              <Typography variant="caption" fontWeight={800} color="#8B5CF6">
                {weeklyPercent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={weeklyPercent}
              sx={{
                height: 6,
                borderRadius: '3px',
                backgroundColor: '#E2E8F0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#8B5CF6',
                  borderRadius: '3px',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  // ──────── Render View if Already Clocked Out ────────
  if (todayRecord?.clockOutTime) {
    return (
      <Box sx={{ pb: 4 }}>
        <PageHeader title="End of Day Report" subtitle="Your EOD performance submission has been registered" />

        <Card sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)', backgroundColor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ background: '#ECFDF5', borderRadius: '12px', p: 1, color: '#10B981' }}>
              <CheckCircle size={28} />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ fontSize: '1.25rem' }}>
                Shift Completed & Clocked Out
              </Typography>
              <Typography variant="body2" color="#64748B">
                Log Times: In Time: {todayRecord.clockInTime} | Out Time: {todayRecord.clockOutTime}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            {/* Left Column - Report details */}
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                    📋 Tasks Completed Summary:
                  </Typography>
                  <Typography variant="body2" color="#334155" sx={{ whiteSpace: 'pre-line', p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 600 }}>
                    {todayRecord.tasksCompletedSummary || 'No summary submitted.'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                    ☀️ Tomorrow's Plan / Focus Tasks:
                  </Typography>
                  <Typography variant="body2" color="#334155" sx={{ whiteSpace: 'pre-line', p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 600 }}>
                    {todayRecord.tomorrowTasks || 'No tomorrow tasks drafted.'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                    💬 Remarks:
                  </Typography>
                  <Typography variant="body2" color="#334155" sx={{ whiteSpace: 'pre-line', p: 2, borderRadius: '12px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', fontWeight: 600 }}>
                    {todayRecord.remarks || 'No remarks added.'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right Column - Final KPI Stats */}
            <Grid item xs={12} md={5}>
              <Card variant="outlined" sx={{ p: 3, borderRadius: '18px', backgroundColor: '#F8FAFC' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
                  📊 Finalized Metrics completed today:
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Calls', icon: Phone, color: '#2563EB', value: todayPlan?.dailyCallsCompleted ?? 0, target: todayPlan?.dailyCallsTarget ?? 30 },
                    { label: 'WhatsApp', icon: MessageSquare, color: '#10B981', value: todayPlan?.dailyWhatsappCompleted ?? 0, target: todayPlan?.dailyWhatsappTarget ?? 50 },
                    { label: 'Admissions', icon: UserCheck, color: '#8B5CF6', value: todayPlan?.dailyAdmissionsCompleted ?? 0, target: todayPlan?.dailyExpectedAdmissions ?? 2 },
                    { label: 'Pipeline Leads', icon: Layers, color: '#F59E0B', value: todayPlan?.dailyEnquiryPipelineCompleted ?? 0, target: todayPlan?.dailyExpectedEnquiryPipeline ?? 10 },
                  ].map((m, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: '12px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
                        <m.icon size={16} color={m.color} style={{ margin: '0 auto 4px' }} />
                        <Typography variant="h4" fontWeight={800} color="#0F172A">{m.value} / {m.target}</Typography>
                        <Typography variant="caption" fontWeight={700} color="#64748B">{m.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </Card>
      </Box>
    );
  }

  // ──────── Render View if Not Clocked In ────────
  if (!isClockedIn) {
    return (
      <Box sx={{ pb: 4 }}>
        <PageHeader title="End of Day Report" subtitle="Submit your EOD Performance Report & Clock Out" />
        <Card sx={{ p: 4, borderRadius: '24px', textAlign: 'center', border: '1px dashed #EF4444', backgroundColor: '#FEF2F2' }}>
          <AlertTriangle size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h3" fontWeight={800} color="#991B1B" sx={{ mb: 1, fontSize: '1.25rem' }}>
            Clock In Required
          </Typography>
          <Typography variant="body1" color="#B91C1C" sx={{ mb: 3 }}>
            You have not clocked in today yet. Please go to the Dashboard to check in before filing your EOD Report.
          </Typography>
          <CustomButton variant="contained" color="error" onClick={() => navigate('/dashboard')} sx={{ borderRadius: '10px' }}>
            Go to Dashboard
          </CustomButton>
        </Card>
      </Box>
    );
  }

  const hasPlan = !!todayPlan && (!!todayPlan._id || !!todayPlan.id || (todayPlan.tasks && todayPlan.tasks.length > 0));

  // ──────── Render View if Daily Plan not set ────────
  if (!hasPlan) {
    return (
      <Box sx={{ pb: 4 }}>
        <PageHeader title="End of Day Report" subtitle="Submit your EOD Performance Report & Clock Out" />
        <Card sx={{ p: 4, borderRadius: '24px', textAlign: 'center', border: '1px dashed #F59E0B', backgroundColor: '#FFFBEB' }}>
          <AlertTriangle size={48} color="#D97706" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h3" fontWeight={800} color="#92400E" sx={{ mb: 1, fontSize: '1.25rem' }}>
            Daily Action Plan Required
          </Typography>
          <Typography variant="body1" color="#B45309" sx={{ mb: 3 }}>
            You have clocked in, but you have not created today's Daily Action Plan yet. Please set your daily plan targets first to access the End of Day Report.
          </Typography>
          <CustomButton variant="contained" color="warning" onClick={() => navigate('/dashboard')} sx={{ borderRadius: '10px' }}>
            Go to Dashboard & Create Plan
          </CustomButton>
        </Card>
      </Box>
    );
  }

  // ──────── Standard Report Submission Screen ────────
  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader title="End of Day Report" subtitle="Provide EOD Summary & Submit to Clock Out" />

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', fontWeight: 700 }}>
          {successMsg}
        </Alert>
      )}

      {/* 4 Premium KPI target cards side by side like the user's uploaded dashboard image */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          {renderKpiCard('Daily Calls Target', Phone, '#2563EB', planCallsTarget, callsCompleted, setCallsCompleted, weeklyCallsTarget, weeklyCallsCompleted)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderKpiCard('WhatsApp Messages', MessageSquare, '#10B981', planWhatsappTarget, whatsappCompleted, setWhatsappCompleted, weeklyWhatsappTarget, weeklyWhatsappCompleted)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderKpiCard('Expected Admissions', UserCheck, '#8B5CF6', planAdmissionsTarget, admissionsCompleted, setAdmissionsCompleted, weeklyAdmissionsTarget, weeklyAdmissionsCompleted)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderKpiCard('Enquiry Pipeline', Layers, '#F59E0B', planPipelineTarget, pipelineCompleted, setPipelineCompleted, weeklyPipelineTarget, weeklyPipelineCompleted)}
        </Grid>
      </Grid>

      <form onSubmit={handleClockOutSubmit}>
        <Grid container spacing={3}>
          {/* Left Panel: EOD summary text fields */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: 3, borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)', display: 'flex', flexDirection: 'column', gap: 3, backgroundColor: '#FFFFFF' }}>
              <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ fontSize: '1.15rem' }}>
                📝 Write EOD Report Summaries
              </Typography>

              <TextField
                label="Summary of Tasks Completed Today *"
                multiline
                rows={4}
                fullWidth
                required
                variant="outlined"
                placeholder="Summarize what you achieved today, phone calls closed, admissions processed..."
                value={tasksDoneSummary}
                onChange={(e) => setTasksDoneSummary(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
              />

              <TextField
                label="Tomorrow's Action Plan / Focus Tasks (Optional)"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                placeholder="List tasks you plan to execute tomorrow..."
                value={tomorrowTasks}
                onChange={(e) => setTomorrowTasks(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
              />

              <TextField
                label="Additional Remarks / Comments (Optional)"
                multiline
                rows={2}
                fullWidth
                variant="outlined"
                placeholder="Any other comments or feedback you'd like to share..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
              />
            </Card>
          </Grid>

          {/* Right Panel: GPS Validation & Action Plan progress */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* GPS Geofence Verification Status Card */}
              <Card sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
                  📍 Geofence Clock-Out Check
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    backgroundColor: verification.isWithinRadius ? '#ECFDF5' : '#FEF2F2',
                    border: `2px solid ${verification.isWithinRadius ? '#10B981' : '#EF4444'}`,
                    transition: 'all 0.3s ease',
                    mb: 2,
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
                          ? `✔ Within ${verification.nearestBranch?.branchName || 'Radius'} (${verification.distanceMeters}m)`
                          : '❌ Outside Branch Premises'}
                      </Typography>
                    </Box>
                  </Box>

                  {gpsLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                      <CircularProgress size={12} color="inherit" />
                      <Typography variant="caption" fontWeight={700} color="#475569">
                        Locating satellite...
                      </Typography>
                    </Box>
                  )}

                  {!verification.isWithinRadius && !gpsLoading && (
                    <Typography variant="caption" color="#B91C1C" display="block" sx={{ mt: 1, fontWeight: 700 }}>
                      Please visit any company branch to mark attendance.
                    </Typography>
                  )}
                </Box>
              </Card>

              {/* Today's Tasks Checked from Action Plan */}
              {todayTasks.length > 0 && (
                <Card sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>
                    📋 Today's Action Plan Tasks:
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
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: t.status === 'Completed' ? '#0F172A' : '#64748B',
                          }}
                        />
                        <Chip
                          label={t.status}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            backgroundColor: t.status === 'Completed' ? '#ECFDF5' : '#F1F5F9',
                            color: t.status === 'Completed' ? '#10B981' : '#64748B',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              )}

              {/* Submit / Clock Out Button */}
              {formError && (
                <Alert severity="error" sx={{ borderRadius: '12px', fontWeight: 700 }}>
                  {formError}
                </Alert>
              )}

              {attError && (
                <Alert severity="error" sx={{ borderRadius: '12px', fontWeight: 700 }}>
                  {attError}
                </Alert>
              )}

              <CustomButton
                type="submit"
                variant="contained"
                color="error"
                fullWidth
                size="large"
                loading={isClockingOut}
                disabled={!verification.isWithinRadius || gpsLoading || !tasksDoneSummary.trim()}
                startIcon={<Navigation size={18} />}
                sx={{
                  py: 1.6,
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  background: verification.isWithinRadius && tasksDoneSummary.trim()
                    ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                    : '#CBD5E1',
                  boxShadow: verification.isWithinRadius && tasksDoneSummary.trim() ? '0 6px 20px rgba(239, 68, 68, 0.3)' : 'none',
                }}
              >
                Submit EOD Report & Clock Out
              </CustomButton>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ReportsPage;
