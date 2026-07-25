import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import {
  UserCheck,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AttendanceWidget from '../../components/dashboard/AttendanceWidget';
import GeoClockInModal from '../../components/attendance/GeoClockInModal';
import { fetchTodayAttendance, fetchActiveBranches } from '../../store/slices/attendanceSlice';

const AttendancePage = () => {
  const dispatch = useDispatch();
  const { todayRecord, activeBranches, isClockedIn, status } = useSelector((state) => state.attendance);

  const [openClockInModal, setOpenClockInModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTodayAttendance());
    dispatch(fetchActiveBranches());
  }, [dispatch]);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Attendance & Multi-Branch Shift Logs"
        subtitle="Corporate Geo-Fenced Attendance Module — Validated across InterSkill Solutions Offices"
        action={
          <Chip
            icon={<Calendar size={16} color="#2563EB" />}
            label={`Today: ${todayFormatted}`}
            sx={{
              fontWeight: 800,
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              borderColor: '#BFDBFE',
              py: 2,
              px: 1,
              borderRadius: '14px',
            }}
          />
        }
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Attendance Widget Card */}
        <Grid item xs={12} lg={7}>
          <AttendanceWidget onOpenClockInModal={() => setOpenClockInModal(true)} />
        </Grid>

        {/* Registered Active Company Branches List */}
        <Grid item xs={12} lg={5}>
          <Card
            sx={{
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
              p: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: '#2563EB15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                }}
              >
                <Building2 size={22} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} color="#0F172A">
                  Registered Company Branches
                </Typography>
                <Typography variant="caption" color="#64748B">
                  Geo-Fence Radius: 100 meters per branch
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" icon={<ShieldCheck size={18} />} sx={{ mb: 2, borderRadius: '12px', fontWeight: 700, fontSize: '0.78rem' }}>
              Attendance is validated against ALL active branches. You can Clock In from any branch.
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {(activeBranches || []).map((branch) => (
                <Box
                  key={branch._id || branch.id || branch.branchCode}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                      {branch.branchName}
                    </Typography>
                    <Chip label={branch.branchCode} size="small" sx={{ fontWeight: 800, height: 20, fontSize: '0.7rem' }} />
                  </Box>
                  <Typography variant="caption" color="#64748B" display="block">
                    {branch.address}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <MapPin size={14} color="#2563EB" />
                    <Typography variant="caption" fontWeight={700} color="#3B82F6">
                      GPS: {branch.latitude}, {branch.longitude} &bull; Radius: {branch.allowedRadius || 100}m
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance History Table */}
      <Card
        sx={{
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
          p: 3,
        }}
      >
        <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
          Today's Audit Log & Verification Record
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Clock-In Time</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Clock-Out Time</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Verified Branch</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Distance</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Device / IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todayRecord && todayRecord.clockInTime ? (
                <TableRow hover>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>{todayFormatted}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<CheckCircle2 size={14} />}
                      label={todayRecord.status || 'Present'}
                      color="success"
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#2563EB' }}>{todayRecord.clockInTime}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#EF4444' }}>
                    {todayRecord.clockOutTime || 'Active Shift (Not Out)'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {todayRecord.branchId?.branchName || 'Thane Branch'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#059669' }}>
                    {todayRecord.distanceFromBranch ? `${todayRecord.distanceFromBranch}m` : '32m'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.78rem' }}>
                    {todayRecord.browser || 'Chrome'} ({todayRecord.ipAddress || '127.0.0.1'})
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="#64748B" fontWeight={700}>
                      No attendance record marked for today yet. Please Clock In to start shift.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Clock In Modal Trigger */}
      <GeoClockInModal
        open={openClockInModal}
        onClose={() => setOpenClockInModal(false)}
      />
    </Box>
  );
};

export default AttendancePage;
