import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  Avatar,
  Typography,
  Chip,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  UserCheck,
  Layers,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Target,
  BarChart3,
  History,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react';
import { getEmployeeDetail, assignTaskToEmployee } from '../../store/slices/managerSlice';
import KpiCard from '../../components/dashboard/KpiCard';
import ActionPlanWidget from '../../components/dashboard/ActionPlanWidget';
import AttendanceWidget from '../../components/dashboard/AttendanceWidget';
import DailyProductivityScoreWidget from '../../components/dashboard/DailyProductivityScoreWidget';
import WeeklyTargetWidget from '../../components/dashboard/WeeklyTargetWidget';
import CustomButton from '../../components/common/Button';

const ManagerEmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const initialView = tabParam === 'weekly' ? 1 : tabParam === 'history' ? 2 : 0;
  const [activeTab, setActiveTab] = useState(initialView);

  // History state: selected date for viewing a past day's dashboard
  const [selectedHistoryDate, setSelectedHistoryDate] = useState('');

  const { selectedEmployeeDetail, isLoading, isAssigning } = useSelector((state) => state.manager);

  // Assign task modal state
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('Call');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [successSnackbar, setSuccessSnackbar] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(getEmployeeDetail(id));
    }
  }, [dispatch, id]);

  const user = selectedEmployeeDetail?.user || {};
  const todayPlan = selectedEmployeeDetail?.todayPlan || null;
  const attendance = selectedEmployeeDetail?.attendance || null;
  const historyPlans = selectedEmployeeDetail?.history || [];

  const empName = user.name || (user.firstName ? `${user.firstName} ${user.lastName}` : 'Employee');
  const firstName = user.firstName || empName.split(' ')[0] || 'Employee';

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Dynamic Check: Has employee set today's plan?
  const hasSubmittedToday = !!(
    todayPlan &&
    ((todayPlan.tasks && todayPlan.tasks.length > 0) ||
      todayPlan.dailyCallsTarget > 0 ||
      todayPlan.dailyWhatsappTarget > 0)
  );

  // Today's Target Metrics
  const callsTarget = todayPlan?.dailyCallsTarget ?? 0;
  const callsCompleted = todayPlan?.dailyCallsCompleted ?? 0;

  const whatsappTarget = todayPlan?.dailyWhatsappTarget ?? 0;
  const whatsappCompleted = todayPlan?.dailyWhatsappCompleted ?? 0;

  const admissionsTarget = todayPlan?.dailyExpectedAdmissions ?? 0;
  const admissionsCompleted = todayPlan?.dailyAdmissionsCompleted ?? 0;

  const pipelineTarget = todayPlan?.dailyExpectedEnquiryPipeline ?? 0;
  const pipelineCompleted = todayPlan?.dailyEnquiryPipelineCompleted ?? 0;

  // Find historical plan for selected history date
  const matchedHistoryPlan = selectedHistoryDate
    ? historyPlans.find((p) => {
        const pDate = new Date(p.planDate || p.createdAt).toISOString().split('T')[0];
        return pDate === selectedHistoryDate;
      })
    : historyPlans[0] || null;

  const handleOpenAssignModal = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskCategory('Call');
    setTaskPriority('Medium');
    setOpenAssignModal(true);
  };

  const handleAssignTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const taskData = {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      category: taskCategory,
      priority: taskPriority,
    };

    const res = await dispatch(assignTaskToEmployee({ id, taskData }));
    if (!res.error) {
      setOpenAssignModal(false);
      setSuccessSnackbar(`Task successfully assigned to ${empName}!`);
      dispatch(getEmployeeDetail(id));
    }
  };

  if (isLoading && !selectedEmployeeDetail) {
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
    <Box sx={{ pb: 4 }}>
      {/* Back Button & Top Header Banner */}
      <Box sx={{ mb: 3 }}>
        <CustomButton
          variant="text"
          color="inherit"
          onClick={() => navigate('/manager/employees')}
          startIcon={<ArrowLeft size={18} />}
          sx={{ mb: 2, color: '#64748B' }}
        >
          Back to Team Directory
        </CustomButton>

        <Card
          sx={{
            p: 3,
            borderRadius: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.06)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            {/* Employee Profile Metadata */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar
                src={user.profileImage || ''}
                alt={empName}
                sx={{ width: 60, height: 60, border: '3px solid #2563EB15', backgroundColor: '#2563EB', fontSize: '1.4rem', fontWeight: 800, flexShrink: 0 }}
              >
                {empName.charAt(0)}
              </Avatar>

              <Box>
                <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ fontSize: '1.35rem', mb: 0.75 }}>
                  {empName}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={user.role || 'Employee'}
                    size="small"
                    sx={{ backgroundColor: '#2563EB15', color: '#2563EB', fontWeight: 800 }}
                  />
                  <Chip
                    label={user.status || 'Active'}
                    size="small"
                    color="success"
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    icon={<Calendar size={14} color="#2563EB" />}
                    label={`Today: ${todayFormatted}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 800, color: '#1E40AF', borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }}
                  />
                  {attendance?.clockOutTime && (
                    <Chip
                      icon={<CheckCircle2 size={14} color="#10B981" />}
                      label={`Clocked Out: ${attendance.clockOutTime}`}
                      size="small"
                      sx={{ fontWeight: 800, color: '#047857', backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', border: '1px solid' }}
                    />
                  )}
                </Box>

                <Typography variant="body2" color="#64748B" sx={{ mt: 0.75 }}>
                  {user.designation || 'Senior Team Member'} &bull; {user.department || 'Software Engineering'} &bull; {user.email}
                </Typography>
              </Box>
            </Box>

            {/* Actions Panel */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {attendance?.clockOutTime && (
                <CustomButton
                  variant="contained"
                  onClick={() => setOpenReportModal(true)}
                  startIcon={<FileText size={18} />}
                  sx={{
                    py: 1.2,
                    px: 2.5,
                    borderRadius: '14px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    backgroundColor: '#0284C7',
                    '&:hover': { backgroundColor: '#0369A1' },
                    boxShadow: '0 4px 12px rgba(2,132,199,0.2)',
                  }}
                >
                  View EOD Report
                </CustomButton>
              )}
              <CustomButton
                variant="contained"
                color="primary"
                onClick={handleOpenAssignModal}
                startIcon={<PlusCircle size={18} />}
                sx={{ py: 1.2, px: 2.5, borderRadius: '14px', fontSize: '0.9rem', fontWeight: 800, flexShrink: 0 }}
              >
                Assign Task to {firstName}
              </CustomButton>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Clean Tabs Selector without "Option N:" prefixes */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => {
          setActiveTab(val);
          const tabName = val === 1 ? 'weekly' : val === 2 ? 'history' : 'today';
          setSearchParams({ tab: tabName });
        }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          mb: 3,
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          p: 0.5,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
          border: '1px solid #E2E8F0',
          '& .MuiTab-root': {
            fontWeight: 800,
            fontSize: '0.9rem',
            textTransform: 'none',
            borderRadius: '12px',
            py: 1.5,
            minHeight: 48,
          },
        }}
      >
        <Tab icon={<Target size={18} />} iconPosition="start" label="Today's Target" />
        <Tab icon={<BarChart3 size={18} />} iconPosition="start" label="Weekly Target" />
        <Tab icon={<History size={18} />} iconPosition="start" label={`Action Plan History (${historyPlans.length})`} />
      </Tabs>

      {/* TAB 0: TODAY'S TARGET (DYNAMIC: SHOW ONLY IF SET BY EMPLOYEE) */}
      {activeTab === 0 && (
        <>
          {hasSubmittedToday ? (
            <>
              <Alert severity="success" icon={<CheckCircle2 size={20} />} sx={{ mb: 3, borderRadius: '12px', fontWeight: 700 }}>
                Today's Daily Target has been submitted by <strong>{empName}</strong> for {todayFormatted}.
              </Alert>

              {/* 4 Dynamic Target Commitment Cards */}
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <KpiCard title="Calls Target" icon={Phone} value={callsCompleted} target={callsTarget} color="#2563EB" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KpiCard title="WhatsApp Target" icon={MessageSquare} value={whatsappCompleted} target={whatsappTarget} color="#10B981" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KpiCard title="Expected Admissions" icon={UserCheck} value={admissionsCompleted} target={admissionsTarget} color="#8B5CF6" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KpiCard title="Enquiry Pipeline" icon={Layers} value={pipelineCompleted} target={pipelineTarget} color="#F59E0B" />
                </Grid>
              </Grid>

              {/* Main 2-Column Dashboard Content */}
              <Grid container spacing={3}>
                <Grid item xs={12} lg={7}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <ActionPlanWidget readOnly={true} plan={todayPlan} />
                    <AttendanceWidget data={attendance} readOnly={true} />
                  </Box>
                </Grid>
                <Grid item xs={12} lg={5}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <DailyProductivityScoreWidget actionPlan={todayPlan} />
                  </Box>
                </Grid>
              </Grid>
            </>
          ) : (
            /* DYNAMIC NOT-SET STATE */
            <Card
              sx={{
                p: 5,
                borderRadius: '24px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                border: '2px dashed #CBD5E1',
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '20px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  color: '#EF4444',
                }}
              >
                <AlertCircle size={32} />
              </Box>

              <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                Today's Target Not Set Yet
              </Typography>
              <Typography variant="body1" color="#64748B" sx={{ maxWidth: 480, mx: 'auto', mb: 3 }}>
                <strong>{empName}</strong> has not submitted an action plan or set targets for today ({todayFormatted}). Target numbers will appear dynamically once the employee submits their daily plan.
              </Typography>

              <CustomButton
                variant="contained"
                color="primary"
                onClick={handleOpenAssignModal}
                startIcon={<PlusCircle size={18} />}
                sx={{ borderRadius: '12px', py: 1.2, px: 3, fontWeight: 800 }}
              >
                Assign Task to {firstName} Now
              </CustomButton>
            </Card>
          )}
        </>
      )}

      {/* TAB 1: WEEKLY TARGET */}
      {activeTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Alert severity="info" icon={<BarChart3 size={20} />} sx={{ borderRadius: '12px', fontWeight: 700 }}>
            Viewing <strong>{empName}'s</strong> Current Weekly Target & Overall Week Accomplishments.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <WeeklyTargetWidget />
            </Grid>
            <Grid item xs={12} lg={4}>
              <DailyProductivityScoreWidget actionPlan={todayPlan} />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 2: ACTION PLAN HISTORY WITH DATE SELECTOR & DAY DASHBOARD */}
      {activeTab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Date Picker Header Bar */}
          <Card sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <History size={24} />
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800} color="#0F172A">
                    Action Plan History & Day Dashboard
                  </Typography>
                  <Typography variant="body2" color="#64748B">
                    Select any date to view {empName}'s full action plan dashboard for that day
                  </Typography>
                </Box>
              </Box>

              {/* Date Input Selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="body2" fontWeight={800} color="#334155">
                  Select Date:
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={selectedHistoryDate}
                  onChange={(e) => setSelectedHistoryDate(e.target.value)}
                  sx={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 },
                  }}
                />
              </Box>
            </Box>

            {/* Quick Recent Date Pills */}
            {historyPlans.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2.5, flexWrap: 'wrap' }}>
                <Typography variant="caption" fontWeight={800} color="#64748B">
                  Recent Logged Dates:
                </Typography>

                {historyPlans.slice(0, 5).map((hp) => {
                  const pDate = new Date(hp.planDate || hp.createdAt).toISOString().split('T')[0];
                  const displayDateStr = new Date(hp.planDate || hp.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const isSelected = selectedHistoryDate === pDate || (!selectedHistoryDate && matchedHistoryPlan === hp);

                  return (
                    <Chip
                      key={hp._id || hp.id}
                      icon={<Calendar size={13} />}
                      label={displayDateStr}
                      onClick={() => setSelectedHistoryDate(pDate)}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 800, cursor: 'pointer', borderRadius: '10px' }}
                    />
                  );
                })}
              </Box>
            )}
          </Card>

          {/* DISPLAY SELECTED DAY'S DASHBOARD */}
          {matchedHistoryPlan ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Day Dashboard Header Notice */}
              <Alert severity="info" icon={<Calendar size={20} />} sx={{ borderRadius: '14px', fontWeight: 700 }}>
                Showing Historical Dashboard for{' '}
                <strong>
                  {new Date(matchedHistoryPlan.planDate || matchedHistoryPlan.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </strong>
              </Alert>

              {/* 4 Historical Target Cards for Selected Date */}
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <KpiCard
                    title="Calls Logged"
                    icon={Phone}
                    value={matchedHistoryPlan.dailyCallsCompleted || 0}
                    target={matchedHistoryPlan.dailyCallsTarget || 30}
                    color="#2563EB"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <KpiCard
                    title="WhatsApp Messages"
                    icon={MessageSquare}
                    value={matchedHistoryPlan.dailyWhatsappCompleted || 0}
                    target={matchedHistoryPlan.dailyWhatsappTarget || 50}
                    color="#10B981"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <KpiCard
                    title="Admissions Done"
                    icon={UserCheck}
                    value={matchedHistoryPlan.dailyAdmissionsCompleted || 0}
                    target={matchedHistoryPlan.dailyExpectedAdmissions || 2}
                    color="#8B5CF6"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <KpiCard
                    title="Enquiry Pipeline"
                    icon={Layers}
                    value={matchedHistoryPlan.dailyEnquiryPipelineCompleted || 0}
                    target={matchedHistoryPlan.dailyExpectedEnquiryPipeline || 10}
                    color="#F59E0B"
                  />
                </Grid>
              </Grid>

              {/* Main 2-Column Historical Dashboard */}
              <Grid container spacing={3}>
                <Grid item xs={12} lg={7}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <ActionPlanWidget readOnly={true} plan={matchedHistoryPlan} />
                    <AttendanceWidget data={attendance} readOnly={true} />
                  </Box>
                </Grid>

                <Grid item xs={12} lg={5}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <DailyProductivityScoreWidget actionPlan={matchedHistoryPlan} />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Card sx={{ p: 5, textAlign: 'center', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                No Action Plan Submitted on Selected Date
              </Typography>
              <Typography variant="body2" color="#64748B">
                Please pick another date from the selector or click a recent date pill above.
              </Typography>
            </Card>
          )}

          {/* Full History Logs Summary Table */}
          <Card sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mt: 1 }}>
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
              All Submitted History Records ({historyPlans.length})
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Date Logged</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Calls</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>WhatsApp</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Admissions</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Tasks</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="#64748B" fontWeight={600}>
                          No historical action plans recorded yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    historyPlans.map((planItem) => {
                      const pDate = new Date(planItem.planDate || planItem.createdAt).toISOString().split('T')[0];
                      const dateStr = new Date(planItem.planDate || planItem.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      });
                      const tasksArr = planItem.tasks || [];
                      const doneTasks = tasksArr.filter((t) => t.status === 'Completed').length;

                      return (
                        <TableRow key={planItem._id || planItem.id} hover>
                          <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Calendar size={16} color="#2563EB" />
                              {dateStr}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {planItem.dailyCallsCompleted || 0} / {planItem.dailyCallsTarget || 30}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {planItem.dailyWhatsappCompleted || 0} / {planItem.dailyWhatsappTarget || 50}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {planItem.dailyAdmissionsCompleted || 0} / {planItem.dailyExpectedAdmissions || 2}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {doneTasks} / {tasksArr.length} Tasks
                          </TableCell>
                          <TableCell>
                            <CustomButton
                              variant="outlined"
                              size="small"
                              onClick={() => setSelectedHistoryDate(pDate)}
                              sx={{ borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}
                            >
                              View Day Dashboard
                            </CustomButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* Assign Task Modal */}
      <Dialog
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '18px', p: 1 } }}
      >
        <form onSubmit={handleAssignTaskSubmit}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
            Assign Task to {empName}
          </DialogTitle>

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Typography variant="body2" color="#64748B">
              This task will be dispatched to {empName}'s daily action plan.
            </Typography>

            <TextField
              label="Task Title *"
              placeholder="e.g. Conduct demo presentation with 5 prospective leads"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              fullWidth
              required
              autoFocus
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              label="Task Description"
              placeholder="Add optional guidelines or details for the employee..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Category"
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                  <MenuItem value="Call">Call</MenuItem>
                  <MenuItem value="Admission">Admission</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                  <MenuItem value="Meeting">Meeting</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Priority"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                  <MenuItem value="High">High Priority</MenuItem>
                  <MenuItem value="Medium">Medium Priority</MenuItem>
                  <MenuItem value="Low">Low Priority</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <CustomButton variant="outlined" color="inherit" onClick={() => setOpenAssignModal(false)}>
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isAssigning}
              startIcon={<CheckCircle2 size={18} />}
            >
              Assign Task
            </CustomButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* EOD REPORT DIALOG MODAL */}
      <Dialog
        open={openReportModal}
        onClose={() => setOpenReportModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ background: '#EFF6FF', borderRadius: '10px', p: 0.8, color: '#2563EB' }}>
            <FileText size={20} />
          </Box>
          EOD Performance Report Details
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <Box sx={{ p: 2, borderRadius: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="#64748B" display="block">Clock-In Time</Typography>
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                {attendance?.clockInTime || '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="#64748B" display="block">Clock-Out Time</Typography>
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                {attendance?.clockOutTime || '—'}
              </Typography>
            </Box>
          </Box>

          {/* Finalized Target Metrics Grid */}
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>
              📊 Finalized Target Metrics:
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Calls', icon: Phone, color: '#2563EB', value: callsCompleted, target: callsTarget },
                { label: 'WhatsApp', icon: MessageSquare, color: '#10B981', value: whatsappCompleted, target: whatsappTarget },
                { label: 'Admissions', icon: UserCheck, color: '#8B5CF6', value: admissionsCompleted, target: admissionsTarget },
                { label: 'Pipeline Leads', icon: Layers, color: '#F59E0B', value: pipelineCompleted, target: pipelineTarget },
              ].map((m, idx) => (
                <Grid item xs={6} sm={3} key={idx}>
                  <Box sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: '12px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
                    <m.icon size={16} color={m.color} style={{ margin: '0 auto 4px' }} />
                    <Typography variant="h4" fontWeight={800} color="#0F172A">{m.value} / {m.target}</Typography>
                    <Typography variant="caption" fontWeight={700} color="#64748B">{m.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider />

          {/* Tasks Completed Summary */}
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>
              📋 Today's Completed Tasks Summary:
            </Typography>
            <Typography variant="body2" color="#334155" sx={{ whiteSpace: 'pre-line', p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 600 }}>
              {attendance?.tasksCompletedSummary || 'No summary submitted.'}
            </Typography>
          </Box>

          {/* Tomorrow's Action Plan */}
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>
              ☀️ Tomorrow's Plan / Focus Tasks:
            </Typography>
            <Typography variant="body2" color="#334155" sx={{ whiteSpace: 'pre-line', p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 600 }}>
              {attendance?.tomorrowTasks || 'No tomorrow tasks drafted.'}
            </Typography>
          </Box>

          {/* Remarks */}
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>
              💬 Additional Comments / Remarks:
            </Typography>
            <Typography variant="body2" color="#334155" sx={{ whiteSpace: 'pre-line', p: 2, borderRadius: '12px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', fontWeight: 600 }}>
              {attendance?.remarks || 'No remarks added.'}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <CustomButton variant="outlined" color="inherit" onClick={() => setOpenReportModal(false)}>
            Close Report
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Bottom Left Success Notification Snackbar (Never Overlaps Floating Support Chat FAB) */}
      <Snackbar
        open={!!successSnackbar}
        autoHideDuration={4000}
        onClose={() => setSuccessSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccessSnackbar('')} sx={{ borderRadius: '12px' }}>
          {successSnackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManagerEmployeeDetailPage;
