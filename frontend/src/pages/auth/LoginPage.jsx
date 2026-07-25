import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Link as MuiLink,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Briefcase, Eye, EyeOff, Lock, Mail, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from '../../components/common/Button';
import { motion } from 'framer-motion';
import axiosInstance from '../../services/axiosInstance';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [progress, setProgress] = useState(0);
  const [healthStatus, setHealthStatus] = useState('checking'); // 'checking' | 'waking' | 'active'
  const [statusMessage, setStatusMessage] = useState('Welcome to InterSkill Solutions...');

  const statusPhrases = [
    'Welcome to InterSkill Solutions...',
    'Checking internet connection...',
    'Render free tier server is waking up. Please hold on...',
    'Initializing database handshake...',
    'Waking up cloud services (takes up to 50 seconds)...',
    'Almost ready, setting up portal configurations...',
    'Connecting securely to employee directory...',
  ];

  useEffect(() => {
    let phraseIndex = 0;
    const phraseInterval = setInterval(() => {
      if (healthStatus !== 'active') {
        phraseIndex = (phraseIndex + 1) % statusPhrases.length;
        setStatusMessage(statusPhrases[phraseIndex]);
      }
    }, 6000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (healthStatus === 'active') return 100;
        if (prev >= 95) return 95; // Hold at 95% until active
        return prev + 2.5; // Increments to 95% over ~38 seconds
      });
    }, 1000);

    const checkServerHealth = async () => {
      try {
        const response = await axiosInstance.get('/health');
        if (response.status === 'success' || response.timestamp) {
          setHealthStatus('active');
          setProgress(100);
          setStatusMessage('Server Active & Connected!');
          clearInterval(phraseInterval);
          clearInterval(progressInterval);
        }
      } catch (err) {
        setHealthStatus('waking');
      }
    };

    // Initial check
    checkServerHealth();

    // Check health every 4 seconds
    const healthInterval = setInterval(() => {
      if (healthStatus !== 'active') {
        checkServerHealth();
      } else {
        clearInterval(healthInterval);
      }
    }, 4000);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(progressInterval);
      clearInterval(healthInterval);
    };
  }, [healthStatus]);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    clearError();
    await login(data);
  };


  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        <Card
          sx={{
            borderRadius: '16px',
            boxShadow: '0px 8px 32px rgba(15, 23, 42, 0.06)',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            p: { xs: 2, sm: 3 },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Official InterSkill Solutions Logo Header */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="InterSkill Solutions Logo"
                sx={{
                  height: 68,
                  width: 'auto',
                  objectFit: 'contain',
                  mb: 1.5,
                  filter: 'drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.08))',
                }}
              />
              <Typography variant="h2" color="#0F172A" fontWeight={700} textAlign="center">
                InterSkill Solutions
              </Typography>
              <Typography variant="body2" color="#64748B" textAlign="center" sx={{ mt: 0.5, fontWeight: 500 }}>
                Employee Portal Login
              </Typography>
            </Box>

            {/* Error Notification Alert */}
            {error && (
              <Alert severity="error" onClose={clearError} sx={{ mb: 3, borderRadius: '10px' }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Email Field */}
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email address is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Please enter a valid email address',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Corporate Email"
                      variant="outlined"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail size={20} color="#64748B" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  )}
                />

                {/* Password Field */}
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={20} color="#64748B" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  )}
                />

                {/* Remember Me & Forgot Password Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={<Typography variant="body2" color="#0F172A">Remember me</Typography>}
                  />
                  <MuiLink
                    component={Link}
                    to="/forgot-password"
                    variant="body2"
                    color="primary"
                    sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Forgot Password?
                  </MuiLink>
                </Box>

                {/* Submit Button */}
                <CustomButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoading}
                  sx={{ py: 1.4, fontSize: '0.9375rem', mt: 1 }}
                >
                  {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
                </CustomButton>

                {/* Demo Credentials Box */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: '10px',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Typography variant="caption" color="#475569" fontWeight={600} display="block" gutterBottom>
                    Demo Test Credentials (Pre-seeded):
                  </Typography>
                  <Typography variant="caption" color="#64748B" display="block">
                    • Employee: <strong>alex.morgan@interskill.com</strong> / <strong>Password@123</strong>
                  </Typography>
                  <Typography variant="caption" color="#64748B" display="block">
                    • Manager: <strong>sarah.jenkins@interskill.com</strong> / <strong>Password@123</strong>
                  </Typography>
                  <Typography variant="caption" color="#64748B" display="block">
                    • Admin: <strong>admin@interskill.com</strong> / <strong>Password@123</strong>
                  </Typography>
                </Box>

                {/* Server Status Checker Widget */}
                <Box
                  sx={{
                    mt: 1.5,
                    p: 2,
                    borderRadius: '10px',
                    backgroundColor: healthStatus === 'active' ? '#ECFDF5' : '#FFFBEB',
                    border: healthStatus === 'active' ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {healthStatus === 'active' ? (
                        <CheckCircle2 size={16} color="#059669" />
                      ) : (
                        <Wifi size={16} color="#D97706" style={{ animation: 'pulse 1.5s infinite' }} />
                      )}
                      <Typography variant="caption" fontWeight={700} color={healthStatus === 'active' ? '#065F46' : '#92400E'}>
                        {statusMessage}
                      </Typography>
                    </Box>
                    <Typography variant="caption" fontWeight={800} color={healthStatus === 'active' ? '#065F46' : '#92400E'}>
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    color={healthStatus === 'active' ? 'success' : 'warning'}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: healthStatus === 'active' ? '#D1FAE5' : '#FEF3C7',
                    }}
                  />
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default LoginPage;
