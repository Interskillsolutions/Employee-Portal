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
  Avatar,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Navigation,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import CustomButton from '../common/Button';
import { clockInThunk, fetchActiveBranches } from '../../store/slices/attendanceSlice';

// Haversine Distance Formula in Frontend JS
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

const GeoClockInModal = ({ open, onClose, onClockInSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeBranches, isClockingIn, error } = useSelector((state) => state.attendance);

  const [currentTimeStr, setCurrentTimeStr] = useState('');
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

  // Ticking Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    }, 1000);
    setCurrentTimeStr(
      new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    );
    return () => clearInterval(timer);
  }, []);

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
            'GPS Permission Denied / Position Unavailable. Please enable browser location to mark attendance.'
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

  const handleClockInSubmit = async () => {
    if (!userCoords || !verification.isWithinRadius) return;

    const payload = {
      latitude: userCoords.latitude,
      longitude: userCoords.longitude,
      device: navigator.platform || 'Desktop/Mobile Device',
      browser: navigator.userAgent.includes('Chrome') ? 'Google Chrome' : 'Web Browser',
    };

    const res = await dispatch(clockInThunk(payload));
    if (!res.error) {
      if (onClockInSuccess) onClockInSuccess();
      if (onClose) onClose();
    }
  };

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
      <DialogTitle sx={{ p: 2.5, pb: 1, textCenter: 'center' }}>
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Chip
            icon={<ShieldCheck size={16} color="#2563EB" />}
            label="Corporate Geo-Fenced Attendance System"
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

        <Typography variant="h3" fontWeight={800} color="#0F172A" align="center" sx={{ fontSize: '1.4rem' }}>
          Welcome, {empName}
        </Typography>
        <Typography variant="body2" color="#64748B" align="center" sx={{ mt: 0.5 }}>
          Please mark today's attendance to unlock your daily workstation dashboard.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Date & Live Ticking Clock Banner */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            p: 2,
            borderRadius: '16px',
            backgroundColor: '#F1F5F9',
            border: '1px solid #E2E8F0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Calendar size={22} color="#2563EB" />
            <Box>
              <Typography variant="caption" color="#64748B" display="block">
                Today's Date
              </Typography>
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                {todayFormatted}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Clock size={22} color="#10B981" />
            <Box>
              <Typography variant="caption" color="#64748B" display="block">
                Current Time
              </Typography>
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                {currentTimeStr || '09:00:00 AM'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* GPS Verification Status Card */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: '18px',
            backgroundColor: verification.isWithinRadius ? '#ECFDF5' : '#FEF2F2',
            border: `2px solid ${verification.isWithinRadius ? '#10B981' : '#EF4444'}`,
            transition: 'all 0.3s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {verification.isWithinRadius ? (
                <CheckCircle2 size={28} color="#10B981" />
              ) : (
                <AlertTriangle size={28} color="#EF4444" />
              )}
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  color={verification.isWithinRadius ? '#065F46' : '#991B1B'}
                  sx={{ fontSize: '1.05rem' }}
                >
                  {verification.isWithinRadius
                    ? `✔ Inside ${verification.nearestBranch?.branchName || 'Company Premises'}`
                    : '❌ Outside Company Premises'}
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={verification.isWithinRadius ? '#047857' : '#B91C1C'}
                >
                  {verification.distanceMeters !== null
                    ? `Distance: ${verification.distanceMeters} meters to nearest branch`
                    : 'Fetching GPS coordinates...'}
                </Typography>
              </Box>
            </Box>

            <Chip
              label={verification.isWithinRadius ? 'Verified' : 'Blocked'}
              color={verification.isWithinRadius ? 'success' : 'error'}
              sx={{ fontWeight: 800, px: 1 }}
            />
          </Box>

          <Divider sx={{ my: 1.5, opacity: 0.6 }} />

          {/* Branch Details */}
          {verification.nearestBranch && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#334155' }}>
              <Building2 size={16} color="#475569" />
              <Typography variant="caption" fontWeight={700}>
                Registered Office: <strong>{verification.nearestBranch.branchName}</strong> ({verification.nearestBranch.branchCode}) &bull; Allowed Radius: {verification.nearestBranch.allowedRadius || 100}m
              </Typography>
            </Box>
          )}

          {/* Out of Range Alert Message */}
          {!verification.isWithinRadius && !gpsLoading && (
            <Alert severity="error" sx={{ mt: 1.5, borderRadius: '12px', fontWeight: 700 }}>
              You are currently outside all registered InterSkill Solutions branches. Please visit any company branch to mark attendance.
            </Alert>
          )}

          {gpsLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
              <CircularProgress size={18} color="inherit" />
              <Typography variant="caption" fontWeight={700} color="#475569">
                Detecting GPS coordinates via satellite...
              </Typography>
            </Box>
          )}

          {gpsError && (
            <Typography variant="caption" color="#B91C1C" display="block" sx={{ mt: 1, fontWeight: 700 }}>
              {gpsError}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: '12px', fontWeight: 700 }}>
            {error}
          </Alert>
        )}

        {/* CLOCK IN ACTION BUTTON (STAYS DISABLED UNTIL VERIFICATION SUCCEEDS) */}
        <CustomButton
          variant="contained"
          color="success"
          fullWidth
          size="large"
          loading={isClockingIn}
          disabled={!verification.isWithinRadius || gpsLoading}
          onClick={handleClockInSubmit}
          startIcon={<Navigation size={20} />}
          sx={{
            py: 1.6,
            borderRadius: '14px',
            fontSize: '1.05rem',
            fontWeight: 800,
            background: verification.isWithinRadius
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              : '#CBD5E1',
            boxShadow: verification.isWithinRadius ? '0 6px 20px rgba(16, 185, 129, 0.3)' : 'none',
          }}
        >
          {verification.isWithinRadius ? 'Clock In & Unlock Dashboard' : 'Clock In Disabled (Out of Range)'}
        </CustomButton>
      </DialogContent>
    </Dialog>
  );
};

export default GeoClockInModal;
