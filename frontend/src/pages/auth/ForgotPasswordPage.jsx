import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Alert, InputAdornment, Link as MuiLink } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Briefcase, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from '../../components/common/Button';
import { motion } from 'framer-motion';

const ForgotPasswordPage = () => {
  const { forgotPassword, isLoading, error, successMessage, clearError } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    clearError();
    const result = await forgotPassword(data);
    if (result) {
      setSubmitted(true);
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
                Reset Password
              </Typography>
              <Typography variant="body2" color="#64748B" align="center" sx={{ mt: 0.5 }}>
                Enter your registered corporate email address to receive password reset instructions.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" onClose={clearError} sx={{ mb: 3, borderRadius: '10px' }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
                {successMessage}
              </Alert>
            )}

            {!submitted ? (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: 'Email address is required',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Please enter a valid email' },
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

                  <CustomButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isLoading}
                    sx={{ py: 1.4, fontSize: '0.9375rem' }}
                  >
                    {isLoading ? 'Sending Instructions...' : 'Send Reset Link'}
                  </CustomButton>
                </Box>
              </form>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" color="#0F172A" fontWeight={500} gutterBottom>
                  Password reset link has been dispatched to your email.
                </Typography>
              </Box>
            )}

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

export default ForgotPasswordPage;
