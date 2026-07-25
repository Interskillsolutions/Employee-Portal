import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Alert, InputAdornment, IconButton, Link as MuiLink } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Briefcase, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from '../../components/common/Button';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const { resetPassword, isLoading, error, successMessage, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    clearError();
    const result = await resetPassword({ token, password: data.password });
    if (result) {
      setTimeout(() => navigate('/login'), 2000);
    }
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  backgroundColor: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  mb: 2,
                  boxShadow: '0px 4px 14px rgba(37, 99, 235, 0.3)',
                }}
              >
                <Briefcase size={28} />
              </Box>
              <Typography variant="h2" fontWeight={700} color="#0F172A" align="center">
                Set New Password
              </Typography>
              <Typography variant="body2" color="#64748B" align="center" sx={{ mt: 0.5 }}>
                Please create a secure password for your InterSkill Portal account.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" onClose={clearError} sx={{ mb: 3, borderRadius: '10px' }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
                {successMessage} Redirecting to login...
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="New Password"
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

                <CustomButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoading}
                  sx={{ py: 1.4, fontSize: '0.9375rem' }}
                >
                  {isLoading ? 'Updating Password...' : 'Reset Password'}
                </CustomButton>
              </Box>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <MuiLink
                component={Link}
                to="/login"
                variant="body2"
                color="primary"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                <ArrowLeft size={16} /> Back to Sign In
              </MuiLink>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ResetPasswordPage;
