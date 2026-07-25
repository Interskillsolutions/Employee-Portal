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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Briefcase, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from '../../components/common/Button';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
              </Box>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default LoginPage;
