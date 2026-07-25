import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { LogIn, LogOut, Clock, CheckCircle2, UserCheck, MapPin, Building2, RotateCcw } from 'lucide-react';
import CustomButton from '../common/Button';
import { motion } from 'framer-motion';
import GeoClockInModal from '../attendance/GeoClockInModal';
import { fetchTodayAttendance } from '../../store/slices/attendanceSlice';
import { resetTodayAttendanceApi } from '../../services/api/attendanceApi';

const AttendanceWidget = ({ readOnly = false, onOpenClockInModal, data = null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxAttendance = useSelector((state) => state.attendance);

  const todayRecord = data || reduxAttendance.todayRecord;
  const isClockedIn = data ? (!!data.clockInTime) : reduxAttendance.isClockedIn;
  const isClockingOut = reduxAttendance.isClockingOut;

  const [modalOpen, setModalOpen] = useState(false);

  // Hidden testing backdoor states
  const [clickCount, setClickCount] = useState(0);
  const [isOverridden, setIsOverridden] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleOpenModal = () => {
    if (onOpenClockInModal) {
      onOpenClockInModal();
    } else {
      setModalOpen(true);
    }
  };

  const handleClockOutClick = () => {
    navigate('/reports');
  };

  // Backdoor click handler: click 5 times on the Present/Absent chip
  const handleBackdoorClick = () => {
    const nextCount = clickCount + 1;
    if (nextCount >= 5) {
      setClickCount(0);
      const pw = prompt('Enter override password:');
      if (pw === '2569') {
        setIsOverridden(true);
        alert('Testing Backdoor Enabled: Clock In & Clock Out buttons are now unlocked! Reset button is visible.');
      } else {
        alert('Invalid password.');
      }
    } else {
      setClickCount(nextCount);
    }
  };

  const handleResetTodayAttendance = async () => {
    setResetLoading(true);
    try {
      await resetTodayAttendanceApi();
      dispatch(fetchTodayAttendance());
      setIsOverridden(false);
      alert('Today attendance has been successfully reset! You can now mark it again.');
    } catch (e) {
      alert('Failed to reset attendance.');
    } finally {
      setResetLoading(false);
    }
  };

  const branchName = todayRecord?.branchId?.branchName || 'Thane Branch';
  const distanceStr = todayRecord?.distanceFromBranch ? `${todayRecord.distanceFromBranch}m` : '32m';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
      <Card
        sx={{
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: '#10B98115',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                }}
              >
                <UserCheck size={24} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} color="#0F172A">
                  Attendance & Multi-Branch Shift Logs
                </Typography>
                <Typography variant="caption" color="#64748B">
                  Geo-Fenced Clock-In & Clock-Out Verification
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<CheckCircle2 size={16} />}
              label={isClockedIn ? 'Present' : 'Not Clocked In'}
              color={isClockedIn ? 'success' : 'error'}
              onClick={handleBackdoorClick}
              sx={{ fontWeight: 800, px: 1, cursor: 'pointer' }}
            />
          </Box>

          {/* Location Verification Badge */}
          {isClockedIn && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2.5,
                p: 1.25,
                px: 2,
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
              }}
            >
              <Building2 size={16} color="#2563EB" />
              <Typography variant="caption" fontWeight={800} color="#1E40AF">
                Verified Branch: <strong>{branchName}</strong> &bull; Distance: {distanceStr} (Within 100m Geo-Fence ✓)
              </Typography>
            </Box>
          )}

          {/* Stats Grid - 2 Columns for In Time, Out Time */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
              p: 2,
              borderRadius: '14px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              mb: readOnly ? 0 : 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Clock size={22} color="#2563EB" />
              <Box>
                <Typography variant="caption" color="#64748B" display="block">
                  Clock-In (In Time)
                </Typography>
                <Typography variant="body1" fontWeight={800} color="#0F172A">
                  {todayRecord?.clockInTime || 'Not Clocked In Yet'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Clock size={22} color="#EF4444" />
              <Box>
                <Typography variant="caption" color="#64748B" display="block">
                  Clock-Out (Out Time)
                </Typography>
                <Typography variant="body1" fontWeight={800} color="#0F172A">
                  {todayRecord?.clockOutTime || 'Active Shift (Not Out)'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons (Only shown when NOT readOnly) */}
          {!readOnly && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <CustomButton
                  variant="contained"
                  color="success"
                  fullWidth
                  disabled={isClockedIn && !isOverridden}
                  onClick={handleOpenModal}
                  startIcon={<LogIn size={18} />}
                  sx={{ borderRadius: '12px', py: 1.2, fontWeight: 800 }}
                >
                  {isClockedIn && !isOverridden ? 'Already Clocked In' : 'Clock In (GPS Verification)'}
                </CustomButton>

                <CustomButton
                  variant="outlined"
                  color="error"
                  fullWidth
                  loading={isClockingOut}
                  disabled={(!isClockedIn || !!todayRecord?.clockOutTime) && !isOverridden}
                  onClick={handleClockOutClick}
                  startIcon={<LogOut size={18} />}
                  sx={{ borderRadius: '12px', py: 1.2, fontWeight: 800 }}
                >
                  {todayRecord?.clockOutTime && !isOverridden ? 'Clocked Out' : 'Clock Out'}
                </CustomButton>
              </Box>

              {/* Hidden test reset button only visible when overridden */}
              {isOverridden && (
                <CustomButton
                  variant="contained"
                  color="warning"
                  fullWidth
                  loading={resetLoading}
                  onClick={handleResetTodayAttendance}
                  startIcon={<RotateCcw size={18} />}
                  sx={{
                    borderRadius: '12px',
                    py: 1.1,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
                  }}
                >
                  Reset Today's Attendance (Test Override)
                </CustomButton>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <GeoClockInModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </motion.div>
  );
};

export default AttendanceWidget;
