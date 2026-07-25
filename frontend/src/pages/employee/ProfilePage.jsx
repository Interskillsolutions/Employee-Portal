import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  Alert,
  Tabs,
  Tab,
  Divider,
  Chip,
} from '@mui/material';
import { User, Lock, Mail, Phone, Building, Briefcase, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, changePassword, clearAuthError, clearSuccessMessage } from '../../store/slices/authSlice';
import PageHeader from '../../components/common/PageHeader';
import CustomCard from '../../components/common/Card';
import CustomButton from '../../components/common/Button';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error, successMessage } = useSelector((state) => state.auth);

  const [tabIndex, setTabIndex] = useState(0);

  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '+1 (555) 234-5678');
    }
  }, [user]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(clearSuccessMessage());
    dispatch(updateUserProfile({ firstName, lastName, phone }));
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    dispatch(clearAuthError());
    dispatch(clearSuccessMessage());

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    dispatch(changePassword({ currentPassword, newPassword }));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Employee Profile"
        subtitle="Manage your personal credentials, contact info, and account security"
      />

      {/* Success / Error Notifications */}
      {successMessage && (
        <Alert severity="success" onClose={() => dispatch(clearSuccessMessage())} sx={{ mb: 3, borderRadius: '12px' }}>
          {successMessage}
        </Alert>
      )}

      {(error || passwordError) && (
        <Alert severity="error" onClose={() => { dispatch(clearAuthError()); setPasswordError(''); }} sx={{ mb: 3, borderRadius: '12px' }}>
          {passwordError || error}
        </Alert>
      )}

      {/* Top Banner Profile Summary Card */}
      <Card
        sx={{
          mb: 4,
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
          p: { xs: 2.5, sm: 3 },
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar
            src={user?.avatarUrl}
            sx={{
              width: 80,
              height: 80,
              backgroundColor: '#2563EB',
              fontSize: '2rem',
              fontWeight: 700,
              boxShadow: '0px 6px 20px rgba(37, 99, 235, 0.25)',
            }}
          >
            {user?.firstName ? user.firstName.charAt(0) : 'E'}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h2" fontWeight={700} color="#0F172A">
                {user ? `${user.firstName} ${user.lastName}` : 'Alex Morgan'}
              </Typography>
              <Chip
                label={user?.role || 'Employee'}
                color="primary"
                size="small"
                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
              />
            </Box>

            <Typography variant="body2" color="#64748B" sx={{ fontWeight: 500 }}>
              {user?.designation || 'Senior Frontend Developer'} • {user?.department || 'Software Engineering'}
            </Typography>

            <Typography variant="caption" color="#94A3B8" sx={{ mt: 0.5, display: 'block' }}>
              Employee ID: <strong style={{ color: '#0F172A' }}>{user?.employeeId || 'IS-EMP-101'}</strong>
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Main Tabs Layout */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 1 }}>
            <Tabs
              orientation="vertical"
              value={tabIndex}
              onChange={(e, val) => setTabIndex(val)}
              sx={{
                '& .MuiTab-root': {
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  py: 1.5,
                  px: 2,
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  gap: 1.5,
                  minHeight: 48,
                  mb: 0.5,
                },
              }}
            >
              <Tab icon={<User size={18} />} iconPosition="start" label="Personal Info" />
              <Tab icon={<Lock size={18} />} iconPosition="start" label="Security & Password" />
            </Tabs>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          {tabIndex === 0 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <CustomCard title="Personal Information" subtitle="Update your contact details and name" hoverable={false}>
                <form onSubmit={handleUpdateProfile}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ mb: 0.75 }}>
                        First Name *
                      </Typography>
                      <TextField
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fullWidth
                        size="small"
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ mb: 0.75 }}>
                        Last Name *
                      </Typography>
                      <TextField
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        fullWidth
                        size="small"
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ mb: 0.75 }}>
                        Email Address (Read-only)
                      </Typography>
                      <TextField
                        value={user?.email || 'alex.morgan@interskill.com'}
                        disabled
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#F8FAFC' } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ mb: 0.75 }}>
                        Phone Number
                      </Typography>
                      <TextField
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ mb: 0.75 }}>
                        Department (Assigned)
                      </Typography>
                      <TextField
                        value={user?.department || 'Software Engineering'}
                        disabled
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#F8FAFC' } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ mb: 0.75 }}>
                        Designation / Post
                      </Typography>
                      <TextField
                        value={user?.designation || 'Senior Frontend Developer'}
                        disabled
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#F8FAFC' } }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <CustomButton
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isLoading}
                      startIcon={<Save size={18} />}
                      sx={{ py: 1.2, px: 3.5, fontSize: '0.9rem' }}
                    >
                      {isLoading ? 'Saving Changes...' : 'Save Profile Changes'}
                    </CustomButton>
                  </Box>
                </form>
              </CustomCard>
            </motion.div>
          )}

          {tabIndex === 1 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <CustomCard title="Account Security & Password" subtitle="Update your account login password" hoverable={false}>
                <form onSubmit={handleChangePassword}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ mb: 0.75 }}>
                        Current Password *
                      </Typography>
                      <TextField
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        fullWidth
                        size="small"
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ mb: 0.75 }}>
                        New Password *
                      </Typography>
                      <TextField
                        type="password"
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                        size="small"
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ mb: 0.75 }}>
                        Confirm New Password *
                      </Typography>
                      <TextField
                        type="password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        size="small"
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <CustomButton
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isLoading}
                      startIcon={<ShieldCheck size={18} />}
                      sx={{ py: 1.2, px: 3.5, fontSize: '0.9rem' }}
                    >
                      {isLoading ? 'Updating Password...' : 'Update Password'}
                    </CustomButton>
                  </Box>
                </form>
              </CustomCard>
            </motion.div>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
