import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Alert,
  Card,
  Typography,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import {
  Phone,
  MessageSquare,
  UserCheck,
  Layers,
  PlusCircle,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Sparkles,
  Calendar,
  Target,
  ShieldAlert,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary } from '../../store/slices/dashboardSlice';
import { getTodayPlan, saveBulkPlan, updateMetricProgress } from '../../store/slices/actionPlanSlice';
import { getCurrentTarget, updateTargetProgress } from '../../store/slices/weeklyTargetSlice';
import { fetchTodayAttendance } from '../../store/slices/attendanceSlice';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import FloatingTeamSupportWidget from '../../components/chat/FloatingTeamSupportWidget';
import KpiCard from '../../components/dashboard/KpiCard';
import DailyProductivityScoreWidget from '../../components/dashboard/DailyProductivityScoreWidget';
import AttendanceWidget from '../../components/dashboard/AttendanceWidget';
import ActionPlanWidget from '../../components/dashboard/ActionPlanWidget';
import WeeklyTargetWidget from '../../components/dashboard/WeeklyTargetWidget';
import ActivityTimelineWidget from '../../components/dashboard/ActivityTimelineWidget';
import AnnouncementWidget from '../../components/dashboard/AnnouncementWidget';
import FloatingChatNotification from '../../components/dashboard/FloatingChatNotification';
import CustomButton from '../../components/common/Button';
import GeoClockInModal from '../../components/attendance/GeoClockInModal';

const CATEGORIES = ['Calls', 'Messages', 'Emails', 'Follow Up', 'Meeting', 'Visit', 'Admission', 'CRM Update', 'Other'];
const PRIORITIES = ['High', 'Medium', 'Low'];

const PRESET_WEEKLY_GOALS = [
  'Close 5 high-value corporate admissions',
  'Achieve 85% lead follow-up response rate',
  'Complete weekly CRM data audit & update',
  'Conduct 10 campus tours / product demos',
];

const EmployeeDashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { summary, isLoading, error } = useSelector((state) => state.dashboard);
  const { todayPlan, isLoading: planLoading, isFetched: planFetched } = useSelector((state) => state.actionPlan);
  const { currentTarget } = useSelector((state) => state.weeklyTarget);
  const { isClockedIn, todayRecord, isLoading: attLoading } = useSelector((state) => state.attendance);
  const { user: authUser } = useSelector((state) => state.auth);

  // Admins are exempt from the attendance requirement
  const isAdminRole = authUser?.role === 'Admin';

  // Geo-Fenced Clock-In Modal State
  const [openClockInModal, setOpenClockInModal] = useState(false);

  // 1. Daily Action Plan Modal State
  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

  // Daily Form Fields
  const [callsTarget, setCallsTarget] = useState(30);
  const [whatsappTarget, setWhatsappTarget] = useState(50);
  const [admissionsTarget, setAdmissionsTarget] = useState(2);
  const [pipelineTarget, setPipelineTarget] = useState(10);

  const [draftTasks, setDraftTasks] = useState([
    { title: 'Morning follow-up calls with high-priority leads', category: 'Calls', priority: 'High' },
    { title: 'Send course details & fee structure via WhatsApp', category: 'Messages', priority: 'Medium' },
    { title: 'Update CRM lead statuses & daily notes', category: 'CRM Update', priority: 'Low' },
  ]);

  // 2. Weekly Goal Setting Modal State (Monday Notification)
  const [openWeeklyModal, setOpenWeeklyModal] = useState(false);
  const [isSubmittingWeekly, setIsSubmittingWeekly] = useState(false);

  // Weekly Form Fields
  const [weeklyCalls, setWeeklyCalls] = useState(150);
  const [weeklyMessages, setWeeklyMessages] = useState(250);
  const [weeklyAdmissions, setWeeklyAdmissions] = useState(10);
  const [weeklyEnquiries, setWeeklyEnquiries] = useState(50);
  const [weeklyGoalsList, setWeeklyGoalsList] = useState([
    'Close 5 high-value corporate admissions',
    'Achieve 85% lead follow-up response rate',
  ]);

  useEffect(() => {
    dispatch(getDashboardSummary());
    dispatch(getTodayPlan());
    dispatch(getCurrentTarget());
    dispatch(fetchTodayAttendance());
  }, [dispatch]);

  const tasks = todayPlan?.tasks || [];
  const hasPlan = !!todayPlan && (!!todayPlan._id || !!todayPlan.id || tasks.length > 0);
  const isMonday = new Date().getDay() === 1; // 1 = Monday
  const hasWeeklySubmitted = currentTarget?.isSubmitted ?? false;

  // Rule: Automatically open Clock-In Modal if attendance is NOT marked today
  // Admin role is exempt — no attendance requirement for admins
  useEffect(() => {
    if (isClockedIn) {
      setOpenClockInModal(false);
    } else if (!isAdminRole && !attLoading) {
      setOpenClockInModal(true);
    }
  }, [isAdminRole, attLoading, isClockedIn]);

  // Auto-open Daily Plan modal on fresh day ONLY after clocked in AND no plan exists
  useEffect(() => {
    if (isClockedIn && planFetched && !planLoading && !hasPlan && todayPlan === null) {
      setOpenPlanModal(true);
    }
  }, [isClockedIn, hasPlan, planLoading, planFetched, todayPlan]);

  // Auto-fill weekly targets when currentTarget loads
  useEffect(() => {
    if (currentTarget) {
      setWeeklyCalls(currentTarget.callsTarget ?? 150);
      setWeeklyMessages(currentTarget.messagesTarget ?? 250);
      setWeeklyAdmissions(currentTarget.admissionsTarget ?? 10);
      setWeeklyEnquiries(currentTarget.enquiriesTarget ?? 50);
      if (currentTarget.weeklyGoals && currentTarget.weeklyGoals.length > 0) {
        setWeeklyGoalsList(currentTarget.weeklyGoals);
      }
    }
  }, [currentTarget]);

  // Daily Target Metrics
  const callsTargetVal = todayPlan?.dailyCallsTarget ?? 30;
  const callsCompleted = todayPlan?.dailyCallsCompleted ?? 0;

  const whatsappTargetVal = todayPlan?.dailyWhatsappTarget ?? 50;
  const whatsappCompleted = todayPlan?.dailyWhatsappCompleted ?? 0;

  const admissionsTargetVal = todayPlan?.dailyExpectedAdmissions ?? 2;
  const admissionsCompleted = todayPlan?.dailyAdmissionsCompleted ?? 0;

  const pipelineTargetVal = todayPlan?.dailyExpectedEnquiryPipeline ?? 10;
  const pipelineCompleted = todayPlan?.dailyEnquiryPipelineCompleted ?? 0;

  // Increment Handlers
  const handleIncrementCalls = () => {
    if (!isAdminRole && !isClockedIn) return;
    dispatch(updateMetricProgress({ metric: 'calls', value: callsCompleted + 1 }));
  };

  const handleIncrementWhatsapp = () => {
    if (!isAdminRole && !isClockedIn) return;
    dispatch(updateMetricProgress({ metric: 'whatsapp', value: whatsappCompleted + 1 }));
  };

  const handleIncrementAdmissions = () => {
    if (!isAdminRole && !isClockedIn) return;
    dispatch(updateMetricProgress({ metric: 'admissions', value: admissionsCompleted + 1 }));
  };

  const handleIncrementPipeline = () => {
    if (!isAdminRole && !isClockedIn) return;
    dispatch(updateMetricProgress({ metric: 'pipeline', value: pipelineCompleted + 1 }));
  };

  // Draft Task Management
  const handleAddTaskRow = () => {
    setDraftTasks((prev) => [...prev, { title: '', category: 'Calls', priority: 'Medium' }]);
  };

  const handleRemoveTaskRow = (index) => {
    setDraftTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index, field, value) => {
    setDraftTasks((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleUpdateMetric = (metricKey, value) => {
    dispatch(updateMetricProgress({ metricKey, value }));
  };

  // Submit Daily Action Plan
  const handleSubmitDailyPlan = async (e) => {
    e.preventDefault();
    if (!isAdminRole && !isClockedIn) return;

    const validTasks = draftTasks.filter((t) => t.title.trim() !== '');

    const payload = {
      dailyCallsTarget: Number(callsTarget),
      dailyWhatsappTarget: Number(whatsappTarget),
      dailyExpectedAdmissions: Number(admissionsTarget),
      dailyExpectedEnquiryPipeline: Number(pipelineTarget),
      tasks: validTasks,
    };

    setIsSubmittingPlan(true);
    const res = await dispatch(saveBulkPlan(payload));
    setIsSubmittingPlan(false);

    if (!res.error) {
      setOpenPlanModal(false);
      dispatch(getTodayPlan());
    }
  };

  // Submit Weekly Goals
  const handleSubmitWeeklyTarget = async (e) => {
    e.preventDefault();
    if (!isClockedIn) return;

    const payload = {
      callsTarget: Number(weeklyCalls),
      messagesTarget: Number(weeklyMessages),
      admissionsTarget: Number(weeklyAdmissions),
      enquiriesTarget: Number(weeklyEnquiries),
      weeklyGoals: weeklyGoalsList.filter((g) => g.trim() !== ''),
      isSubmitted: true,
    };

    setIsSubmittingWeekly(true);
    const res = await dispatch(updateTargetProgress(payload));
    setIsSubmittingWeekly(false);

    if (!res.error) {
      setOpenWeeklyModal(false);
      dispatch(getCurrentTarget());
    }
  };

  if (isLoading && !summary) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '16px', mb: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((n) => (
            <Grid item xs={12} sm={6} md={3} key={n}>
              <Skeleton variant="rectangular" height={130} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4, position: 'relative' }}>
      {/* Top Header Banner */}
      <DashboardHeader
        onOpenDailyPlanner={() => {
          if (!isAdminRole && !isClockedIn) {
            setOpenClockInModal(true);
            return;
          }
          setOpenPlanModal(true);
        }}
      />

      {/* ATTENDANCE LOCKED DASHBOARD BANNER IF NOT CLOCKED IN — hidden for Admin */}
      {!isAdminRole && !isClockedIn && (
        <Card
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)',
            border: '2px solid #FCA5A5',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.15)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '16px',
                  backgroundColor: '#B91C1C15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#B91C1C',
                }}
              >
                <Lock size={28} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight={800} color="#991B1B" sx={{ fontSize: '1.25rem' }}>
                  Please mark today's attendance to continue.
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#B91C1C">
                  Mark today's attendance to unlock today's work, Daily Action Plan, and Weekly Target submissions.
                </Typography>
              </Box>
            </Box>

            <CustomButton
              variant="contained"
              color="error"
              onClick={() => setOpenClockInModal(true)}
              startIcon={<Lock size={18} />}
              sx={{
                py: 1.3,
                px: 3,
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
              }}
            >
              Clock In & Unlock Workstation
            </CustomButton>
          </Box>
        </Card>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* MONDAY WEEKLY TARGET SETTING REMINDER BANNER */}
      {isMonday && !hasWeeklySubmitted && isClockedIn && (
        <Alert
          severity="info"
          icon={<Target size={22} />}
          action={
            <CustomButton
              size="small"
              variant="contained"
              color="primary"
              onClick={() => setOpenWeeklyModal(true)}
              sx={{ borderRadius: '8px', fontWeight: 800 }}
            >
              Set Weekly Target Now
            </CustomButton>
          }
          sx={{ mb: 3, borderRadius: '16px', fontWeight: 700, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
        >
          📅 <strong>Happy Monday!</strong> Please define your target metrics & key goal focus for this week.
        </Alert>
      )}

      {/* DAILY PLAN LOCKED DASHBOARD BANNER IF NOT SET — hidden for Admin */}
      {!isAdminRole && isClockedIn && !hasPlan && !planLoading && (
        <Card
          sx={{
            p: 4,
            mb: 3,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FFFDF5 100%)',
            border: '2px dashed #F59E0B',
            boxShadow: '0 8px 30px rgba(245, 158, 11, 0.12)',
            textAlign: 'center',
            py: 6,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <AlertCircle size={32} />
          </Box>
          <Typography variant="h3" fontWeight={800} color="#92400E" sx={{ fontSize: '1.4rem', mb: 1 }}>
            Set Today's Daily Action Plan Required
          </Typography>
          <Typography variant="body1" fontWeight={700} color="#B45309" sx={{ maxWidth: 500, mx: 'auto', mb: 3.5 }}>
            To unlock your dashboard metrics, task tracking, and weekly goals, you must first define today's target numbers and focus tasks.
          </Typography>

          <CustomButton
            variant="contained"
            color="warning"
            onClick={() => setOpenPlanModal(true)}
            startIcon={<PlusCircle size={18} />}
            sx={{
              py: 1.4,
              px: 4,
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.92rem',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
            }}
          >
            Create Today's Action Plan
          </CustomButton>
        </Card>
      )}

      {/* DASHBOARD CONTENT CONTAINER — BLURRED & LOCKED IF NOT CLOCKED IN, HIDDEN IF NO PLAN */}
      <Box
        sx={{
          display: !isAdminRole && isClockedIn && !hasPlan ? 'none' : 'block',
          filter: !isAdminRole && !isClockedIn ? 'blur(6px)' : 'none',
          pointerEvents: !isAdminRole && !isClockedIn ? 'none' : 'auto',
          opacity: !isAdminRole && !isClockedIn ? 0.65 : 1,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Row 1: KPI Cards Grid */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Daily Calls Target"
              icon={Phone}
              value={callsCompleted}
              target={callsTargetVal}
              color="#2563EB"
              metricKey="dailyCallsCompleted"
              onUpdateMetric={handleUpdateMetric}
              weeklyValue={currentTarget?.callsCompleted ?? 0}
              weeklyTarget={currentTarget?.callsTarget ?? 150}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="WhatsApp Messages"
              icon={MessageSquare}
              value={whatsappCompleted}
              target={whatsappTargetVal}
              color="#10B981"
              metricKey="dailyWhatsappCompleted"
              onUpdateMetric={handleUpdateMetric}
              weeklyValue={currentTarget?.messagesCompleted ?? 0}
              weeklyTarget={currentTarget?.messagesTarget ?? 250}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Expected Admissions"
              icon={UserCheck}
              value={admissionsCompleted}
              target={admissionsTargetVal}
              color="#8B5CF6"
              metricKey="dailyAdmissionsCompleted"
              onUpdateMetric={handleUpdateMetric}
              weeklyValue={currentTarget?.admissionsCompleted ?? 0}
              weeklyTarget={currentTarget?.admissionsTarget ?? 10}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Enquiry Pipeline"
              icon={Layers}
              value={pipelineCompleted}
              target={pipelineTargetVal}
              color="#F59E0B"
              metricKey="dailyEnquiryPipelineCompleted"
              onUpdateMetric={handleUpdateMetric}
              weeklyValue={currentTarget?.enquiriesCompleted ?? 0}
              weeklyTarget={currentTarget?.enquiriesTarget ?? 50}
            />
          </Grid>
        </Grid>

        {/* Row 2: Main 2-Column Section */}
        <Grid container spacing={3}>
          {/* Left Column: Action Plan & Attendance */}
          <Grid item xs={12} lg={7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ActionPlanWidget onOpenPlanner={() => setOpenPlanModal(true)} />
              <AttendanceWidget onOpenClockInModal={() => setOpenClockInModal(true)} />
              <ActivityTimelineWidget />
            </Box>
          </Grid>

          {/* Right Column: Weekly Target & Productivity Score & Announcements */}
          <Grid item xs={12} lg={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <WeeklyTargetWidget onOpenWeeklyModal={() => setOpenWeeklyModal(true)} />
              <DailyProductivityScoreWidget />
              <AnnouncementWidget />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Floating Support & Chat Widgets */}
      <FloatingTeamSupportWidget />
      <FloatingChatNotification />

      {/* GEO-FENCED CLOCK IN MODAL */}
      <GeoClockInModal
        open={openClockInModal}
        onClose={() => setOpenClockInModal(false)}
        onClockInSuccess={() => {
          dispatch(fetchTodayAttendance());
          dispatch(getTodayPlan());
        }}
      />

      {/* 1. CREATE / EDIT DAILY ACTION PLAN MODAL */}
      <Dialog
        open={openPlanModal}
        onClose={() => setOpenPlanModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <form onSubmit={handleSubmitDailyPlan}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A' }}>
            ☀️ Create Your Daily Action Plan & Targets
          </DialogTitle>

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Alert severity="info" icon={<Sparkles size={20} />} sx={{ borderRadius: '14px', fontWeight: 700 }}>
              Set your target metrics and add morning priorities for today.
            </Alert>

            {/* Target Commitment Numbers Grid */}
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              1. Target Commitments for Today
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Calls Target"
                  type="number"
                  value={callsTarget}
                  onChange={(e) => setCallsTarget(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  label="WhatsApp Target"
                  type="number"
                  value={whatsappTarget}
                  onChange={(e) => setWhatsappTarget(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  label="Expected Admissions"
                  type="number"
                  value={admissionsTarget}
                  onChange={(e) => setAdmissionsTarget(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  label="Enquiry Pipeline"
                  type="number"
                  value={pipelineTarget}
                  onChange={(e) => setPipelineTarget(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
              </Grid>
            </Grid>

            {/* Task Item List */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                2. Today's Priority Action Tasks ({draftTasks.length})
              </Typography>

              <CustomButton variant="outlined" size="small" onClick={handleAddTaskRow} startIcon={<Plus size={16} />}>
                Add Task
              </CustomButton>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {draftTasks.map((t, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: '#F8FAFC' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      placeholder="e.g. Conduct follow-up call with prospective admission leads"
                      value={t.title}
                      onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                      fullWidth
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#FFFFFF' } }}
                    />
                    <IconButton color="error" onClick={() => handleRemoveTaskRow(idx)} disabled={draftTasks.length === 1}>
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        select
                        size="small"
                        label="Category"
                        value={t.category}
                        onChange={(e) => handleTaskChange(idx, 'category', e.target.value)}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#FFFFFF' } }}
                      >
                        {CATEGORIES.map((c) => (
                          <MenuItem key={c} value={c}>
                            {c}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        select
                        size="small"
                        label="Priority"
                        value={t.priority}
                        onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#FFFFFF' } }}
                      >
                        {PRIORITIES.map((p) => (
                          <MenuItem key={p} value={p}>
                            {p} Priority
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <CustomButton variant="outlined" color="inherit" onClick={() => setOpenPlanModal(false)}>
              Cancel
            </CustomButton>
            <CustomButton type="submit" variant="contained" color="primary" loading={isSubmittingPlan} startIcon={<CheckCircle2 size={18} />}>
              Save & Start Today's Plan
            </CustomButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* 2. WEEKLY GOAL SETTING MODAL */}
      <Dialog
        open={openWeeklyModal}
        onClose={() => setOpenWeeklyModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <form onSubmit={handleSubmitWeeklyTarget}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A' }}>
            🎯 Set Weekly Targets & Main Accomplishment Goals
          </DialogTitle>

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Alert severity="info" icon={<Target size={20} />} sx={{ borderRadius: '14px', fontWeight: 700 }}>
              Define target commitments for the entire week to align with team KPIs.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Weekly Calls Target"
                  type="number"
                  value={weeklyCalls}
                  onChange={(e) => setWeeklyCalls(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  label="Weekly Messages"
                  type="number"
                  value={weeklyMessages}
                  onChange={(e) => setWeeklyMessages(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  label="Weekly Admissions"
                  type="number"
                  value={weeklyAdmissions}
                  onChange={(e) => setWeeklyAdmissions(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  label="Weekly Enquiries"
                  type="number"
                  value={weeklyEnquiries}
                  onChange={(e) => setWeeklyEnquiries(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <CustomButton variant="outlined" color="inherit" onClick={() => setOpenWeeklyModal(false)}>
              Cancel
            </CustomButton>
            <CustomButton type="submit" variant="contained" color="primary" loading={isSubmittingWeekly} startIcon={<CheckCircle2 size={18} />}>
              Save Weekly Targets
            </CustomButton>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboardPage;
