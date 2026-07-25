import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Divider,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Target,
  BarChart3,
  History,
  Calendar,
  X,
  Sliders,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTeamOverview } from '../../store/slices/managerSlice';
import { publishAnnouncement } from '../../store/slices/announcementSlice';
import PageHeader from '../../components/common/PageHeader';
import CustomButton from '../../components/common/Button';
import CreateAnnouncementModal from '../../components/announcements/CreateAnnouncementModal';

const ManagerTeamPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { team, isLoading, error } = useSelector((state) => state.manager);

  const [openAnnounceModal, setOpenAnnounceModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  useEffect(() => {
    dispatch(getTeamOverview());
  }, [dispatch]);

  const handlePublishAnnouncement = async (payload) => {
    await dispatch(publishAnnouncement(payload));
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const todayShortDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (isLoading && (!team || team.length === 0)) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="Team Directory" subtitle="Monitor Employee Daily Action Plans, Attendance & Time Logs" />
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Skeleton variant="rectangular" height={260} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Clean Header using PageHeader Action prop to prevent UI overlapping */}
      <PageHeader
        title="Manager Control Center & Team Directory"
        subtitle="Monitor Employee Daily Action Plans, Attendance & Shift Logs"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Live Today Date Badge */}
            <Chip
              icon={<Calendar size={16} color="#2563EB" />}
              label={`Today: ${todayFormatted}`}
              variant="outlined"
              color="primary"
              sx={{
                fontWeight: 800,
                fontSize: '0.82rem',
                py: 2,
                px: 1,
                borderRadius: '14px',
                backgroundColor: '#EFF6FF',
                borderColor: '#BFDBFE',
              }}
            />

            <CustomButton
              variant="contained"
              color="secondary"
              onClick={() => setOpenAnnounceModal(true)}
              startIcon={<Megaphone size={18} />}
              sx={{
                py: 1.2,
                px: 2.5,
                borderRadius: '14px',
                fontSize: '0.9rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                boxShadow: '0 6px 18px rgba(37, 99, 235, 0.25)',
              }}
            >
              + Make Announcement
            </CustomButton>
          </Box>
        }
      />

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Team Cards Grid */}
      <Grid container spacing={3}>
        {(team || []).map((emp) => {
          const hasPlan = !!(emp.todayPlan && emp.todayPlan.tasks && emp.todayPlan.tasks.length > 0);
          const taskCount = emp.todayPlan?.tasks?.length || 0;
          const completedTasks = emp.todayPlan?.completedTasks || 0;
          const attendance = emp.attendance;
          const isCheckIn = !!attendance?.clockInTime;
          const isCheckOut = !!attendance?.clockOutTime;

          let statusLabel = 'Not Clocked In';
          let statusColor = 'error';
          if (isCheckIn) {
            if (isCheckOut) {
              statusLabel = 'Clocked Out';
              statusColor = 'default';
            } else {
              statusLabel = 'Active / Working';
              statusColor = 'success';
            }
          }

          return (
            <Grid item xs={12} sm={6} md={4} key={emp.id}>
              <Card
                sx={{
                  borderRadius: '20px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0px 12px 36px rgba(37, 99, 235, 0.15)',
                    borderColor: '#2563EB',
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => setSelectedEmp(emp)}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Employee Avatar & Date Tag Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, minWidth: 0 }}>
                      <Avatar
                        src={emp.avatarUrl}
                        alt={emp.name}
                        sx={{
                          width: 50,
                          height: 50,
                          backgroundColor: '#2563EB',
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          border: '3px solid #EFF6FF',
                          flexShrink: 0,
                        }}
                      >
                        {emp.name?.charAt(0)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h4" fontWeight={800} color="#0F172A" noWrap sx={{ fontSize: '1.05rem' }}>
                          {emp.name}
                        </Typography>
                        <Typography variant="caption" color="#64748B" display="block" noWrap>
                          {emp.designation || 'Senior Team Member'}
                        </Typography>
                        <Typography variant="caption" color="#94A3B8" display="block" noWrap>
                          {emp.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={todayShortDate}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        flexShrink: 0,
                      }}
                    />
                  </Box>

                  {/* 1. Daily Action Plan Status Badge */}
                  <Box sx={{ mb: 2 }}>
                    {hasPlan ? (
                      <Chip
                        icon={<CheckCircle2 size={16} />}
                        label={`Daily Plan Submitted (${completedTasks}/${taskCount} Tasks)`}
                        color="success"
                        variant="filled"
                        sx={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          px: 1,
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          backgroundColor: '#ECFDF5',
                          color: '#047857',
                          border: '1px solid #A7F3D0',
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<AlertCircle size={16} />}
                        label="Daily Plan NOT Submitted Yet"
                        color="error"
                        variant="filled"
                        sx={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          px: 1,
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          backgroundColor: '#FEF2F2',
                          color: '#B91C1C',
                          border: '1px solid #FCA5A5',
                        }}
                      />
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* 2. Shift Attendance Time Log Section */}
                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: '14px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Clock size={16} color="#2563EB" />
                        <Typography variant="caption" fontWeight={800} color="#0F172A">
                          Shift Attendance Log
                        </Typography>
                      </Box>
                      <Chip
                        label={statusLabel}
                        size="small"
                        color={statusColor}
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 800 }}
                      />
                    </Box>

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#64748B" display="block">
                          Clock-In Time
                        </Typography>
                        <Typography variant="body2" fontWeight={800} color="#0F172A">
                          {attendance?.clockInTime || '—'}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption" color="#64748B" display="block">
                          Clock-Out Time
                        </Typography>
                        <Typography variant="body2" fontWeight={800} color="#0F172A">
                          {attendance?.clockOutTime || (isCheckIn ? 'Active Shift' : '—')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Clean Action Button */}
                  <CustomButton
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="small"
                    endIcon={<ArrowRight size={16} />}
                    sx={{ borderRadius: '12px', py: 1, fontSize: '0.85rem', fontWeight: 800 }}
                  >
                    Manage Employee
                  </CustomButton>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* DASHBOARD SELECTION MODAL UPON CLICKING EMPLOYEE CARD */}
      {selectedEmp && (
        <Dialog
          open={Boolean(selectedEmp)}
          onClose={() => setSelectedEmp(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              p: 1,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.25)',
            },
          }}
        >
          <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              <Avatar sx={{ bgcolor: '#2563EB', width: 44, height: 44, fontWeight: 800, flexShrink: 0 }}>
                {selectedEmp.name?.charAt(0)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h4" fontWeight={800} color="#0F172A" noWrap sx={{ fontSize: '1.1rem' }}>
                  {selectedEmp.name}
                </Typography>
                <Typography variant="caption" color="#64748B" noWrap display="block">
                  {selectedEmp.designation || 'Staff'} • {todayShortDate}
                </Typography>
              </Box>
            </Box>

            <IconButton size="small" onClick={() => setSelectedEmp(null)} sx={{ flexShrink: 0 }}>
              <X size={20} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} color="#475569" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
              Select Dashboard View
            </Typography>

            {/* CHOICE 1: TODAY'S TARGET */}
            <Card
              onClick={() => {
                const empId = selectedEmp.id;
                setSelectedEmp(null);
                navigate(`/manager/employee/${empId}?tab=today`);
              }}
              sx={{
                p: 2.25,
                borderRadius: '16px',
                border: '2px solid #2563EB40',
                backgroundColor: '#EFF6FF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#2563EB',
                  backgroundColor: '#DBEAFE',
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  <Target size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} color="#1E40AF">
                    Today's Target
                  </Typography>
                  <Typography variant="caption" color="#3B82F6" display="block" sx={{ mt: 0.25, lineHeight: 1.3 }}>
                    View active daily action plan, calls/messages targets & tasks.
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* CHOICE 2: WEEKLY TARGET */}
            <Card
              onClick={() => {
                const empId = selectedEmp.id;
                setSelectedEmp(null);
                navigate(`/manager/employee/${empId}?tab=weekly`);
              }}
              sx={{
                p: 2.25,
                borderRadius: '16px',
                border: '2px solid #10B98140',
                backgroundColor: '#ECFDF5',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#10B981',
                  backgroundColor: '#D1FAE5',
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  <BarChart3 size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} color="#065F46">
                    Weekly Target
                  </Typography>
                  <Typography variant="caption" color="#047857" display="block" sx={{ mt: 0.25, lineHeight: 1.3 }}>
                    View current week's targets, weekly progress bar & goal achievements.
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* CHOICE 3: ACTION PLAN HISTORY */}
            <Card
              onClick={() => {
                const empId = selectedEmp.id;
                setSelectedEmp(null);
                navigate(`/manager/employee/${empId}?tab=history`);
              }}
              sx={{
                p: 2.25,
                borderRadius: '16px',
                border: '2px solid #8B5CF640',
                backgroundColor: '#F5F3FF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#8B5CF6',
                  backgroundColor: '#EDE9FE',
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  <History size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} color="#5B21B6">
                    Action Plan History
                  </Typography>
                  <Typography variant="caption" color="#7C3AED" display="block" sx={{ mt: 0.25, lineHeight: 1.3 }}>
                    Browse history logs of past daily plans, date logs & archived targets.
                  </Typography>
                </Box>
              </Box>
            </Card>
          </DialogContent>
        </Dialog>
      )}

      {/* Manager Create Announcement Modal */}
      <CreateAnnouncementModal
        open={openAnnounceModal}
        onClose={() => setOpenAnnounceModal(false)}
        onPublish={handlePublishAnnouncement}
      />
    </Box>
  );
};

export default ManagerTeamPage;
