import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  InputAdornment,
  Tooltip,
  Switch,
  FormControlLabel,
  Skeleton,
  Paper,
} from '@mui/material';
import {
  MapPin,
  Plus,
  Building2,
  Navigation,
  CheckCircle2,
  XCircle,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Wifi,
  Info,
  ArrowLeft,
  Target,
  Globe,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllBranchesApi, createBranchApi, toggleBranchStatusApi, deleteBranchApi } from '../../services/api/attendanceApi';
import CustomButton from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';

// ─── Glassmorphism Styles ──────────────────────────────────────────────────────
const glassCard = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '18px',
};

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    color: '#e2e8f0',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
    '&:hover fieldset': { borderColor: 'rgba(99,179,237,0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#63b3ed' },
  },
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#63b3ed' },
  '& .MuiInputAdornment-root svg': { color: '#64748b' },
};

const EMPTY_FORM = {
  branchName: '',
  branchCode: '',
  address: '',
  latitude: '',
  longitude: '',
  allowedRadius: '100',
};

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminBranchManagementPage = () => {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Delete confirm dialog state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, branch: null });
  const [deleting, setDeleting] = useState(false);

  // ── Fetch All Branches ────────────────────────────────────────────────────
  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBranchesApi();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      showSnackbar('Failed to load branches. Check backend connection.', 'error');
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // ── Snackbar ──────────────────────────────────────────────────────────────
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ── Form Validation ───────────────────────────────────────────────────────
  const validateForm = () => {
    const errors = {};
    if (!form.branchName.trim()) errors.branchName = 'Branch name is required';
    if (!form.latitude || isNaN(Number(form.latitude))) errors.latitude = 'Valid latitude is required (e.g. 19.1972)';
    if (!form.longitude || isNaN(Number(form.longitude))) errors.longitude = 'Valid longitude is required (e.g. 72.9722)';
    const radius = Number(form.allowedRadius);
    if (isNaN(radius) || radius < 10 || radius > 1000)
      errors.allowedRadius = 'Allowed radius must be between 10m and 1000m';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Create Branch ─────────────────────────────────────────────────────────
  const handleCreateBranch = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const created = await createBranchApi({
        branchName: form.branchName.trim(),
        branchCode: form.branchCode.trim() || undefined,
        address: form.address.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        allowedRadius: Number(form.allowedRadius || 100),
      });
      setBranches((prev) => [...prev, created]);
      setOpenModal(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      showSnackbar(`✅ Branch "${created.branchName}" added successfully! Employees can now clock in from this location.`);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to create branch. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle Branch Status ──────────────────────────────────────────────────
  const handleToggleStatus = async (branch) => {
    const newStatus = !branch.isActive;
    // Optimistic update
    setBranches((prev) =>
      prev.map((b) => (b._id === branch._id ? { ...b, isActive: newStatus } : b))
    );
    try {
      await toggleBranchStatusApi(branch._id, newStatus);
      showSnackbar(
        newStatus
          ? `✅ "${branch.branchName}" is now Active — employees can clock in.`
          : `⏸ "${branch.branchName}" has been Deactivated.`,
        newStatus ? 'success' : 'warning'
      );
    } catch (err) {
      // Revert on failure
      setBranches((prev) =>
        prev.map((b) => (b._id === branch._id ? { ...b, isActive: !newStatus } : b))
      );
      showSnackbar('Failed to update branch status.', 'error');
    }
  };

  // ── Delete Branch ─────────────────────────────────────────────────────────
  const handleDeleteBranch = async () => {
    const branch = deleteDialog.branch;
    if (!branch) return;
    setDeleting(true);
    try {
      await deleteBranchApi(branch._id);
      setBranches((prev) => prev.filter((b) => b._id !== branch._id));
      setDeleteDialog({ open: false, branch: null });
      showSnackbar(`🗑️ Branch "${branch.branchName}" has been permanently deleted.`, 'success');
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to delete branch.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Form Field Change ─────────────────────────────────────────────────────
  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeBranches = branches.filter((b) => b.isActive).length;
  const inactiveBranches = branches.filter((b) => !b.isActive).length;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', p: { xs: 2, md: 3 } }}>
      {/* Back Button */}
      <Box sx={{ mb: 2 }}>
        <CustomButton
          variant="text"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/admin/staff')}
          sx={{ color: '#94a3b8', '&:hover': { color: '#e2e8f0' } }}
        >
          Back to Staff Management
        </CustomButton>
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', fontSize: { xs: '1.5rem', md: '2rem' } }}>
            🏢 Company Branch Management
          </Typography>
          <Typography sx={{ color: '#64748b', mt: 0.5 }}>
            Manage all registered InterSkill Solutions branches with geo-fence coordinates for attendance tracking
          </Typography>
        </Box>
        <CustomButton
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setOpenModal(true); }}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '12px',
            px: 3,
            py: 1.2,
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            '&:hover': { background: 'linear-gradient(135deg, #818cf8, #a78bfa)', transform: 'translateY(-1px)' },
          }}
        >
          Add New Branch
        </CustomButton>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Branches', value: loading ? '—' : branches.length, icon: <Building2 size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Active Branches', value: loading ? '—' : activeBranches, icon: <CheckCircle2 size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
          { label: 'Inactive Branches', value: loading ? '—' : inactiveBranches, icon: <XCircle size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
          { label: 'Attendance Geo-Radius', value: '100m', icon: <Target size={22} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
        ].map((stat, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Card sx={{ ...glassCard, p: 0 }}>
              <CardContent sx={{ p: '18px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ background: stat.bg, borderRadius: '10px', p: 1, color: stat.color }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography sx={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.2 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Info Alert */}
      <Alert
        severity="info"
        icon={<Info size={18} />}
        sx={{
          mb: 3,
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '12px',
          color: '#93c5fd',
          '& .MuiAlert-icon': { color: '#60a5fa' },
        }}
      >
        <strong>How Geo-Fenced Attendance Works:</strong> Employees can only Clock In / Clock Out when they are within the
        <strong> Allowed Radius</strong> of any active branch. The system uses real GPS satellite coordinates (Haversine formula)
        for precise 100m geo-fence verification.
      </Alert>

      {/* Branches Table */}
      <Card sx={{ ...glassCard, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>
            📍 Registered Company Branches
          </Typography>
        </Box>
        <TableContainer component={Paper} sx={{ background: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { color: '#94a3b8', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' } }}>
                <TableCell>Branch</TableCell>
                <TableCell>Branch Code</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>GPS Coordinates</TableCell>
                <TableCell>Allowed Radius</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Toggle</TableCell>
                <TableCell align="center">Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <TableCell key={j} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : branches.map((branch) => (
                    <TableRow
                      key={branch._id}
                      sx={{
                        '&:hover': { background: 'rgba(255,255,255,0.04)' },
                        '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0' },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ background: 'rgba(99,102,241,0.15)', borderRadius: '8px', p: 0.8, color: '#818cf8' }}>
                            <Building2 size={16} />
                          </Box>
                          <Typography sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                            {branch.branchName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={branch.branchCode || '—'}
                          size="small"
                          sx={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220, color: '#94a3b8 !important', fontSize: '0.82rem' }}>
                        {branch.address || '—'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Navigation size={12} style={{ color: '#10b981' }} />
                            <Typography sx={{ fontSize: '0.8rem', color: '#10b981', fontFamily: 'monospace' }}>
                              {branch.latitude?.toFixed(4) ?? '—'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Globe size={12} style={{ color: '#3b82f6' }} />
                            <Typography sx={{ fontSize: '0.8rem', color: '#3b82f6', fontFamily: 'monospace' }}>
                              {branch.longitude?.toFixed(4) ?? '—'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <Wifi size={14} style={{ color: '#f59e0b' }} />
                          <Typography sx={{ color: '#f59e0b', fontWeight: 700 }}>
                            {branch.allowedRadius ?? 100}m
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={branch.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          icon={branch.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          sx={{
                            background: branch.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
                            color: branch.isActive ? '#10b981' : '#ef4444',
                            fontWeight: 700,
                            '& .MuiChip-icon': { color: 'inherit' },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={branch.isActive ? 'Deactivate this branch' : 'Activate this branch'}>
                          <Switch
                            checked={Boolean(branch.isActive)}
                            onChange={() => handleToggleStatus(branch)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' },
                              '& .MuiSwitch-track': { backgroundColor: '#334155' },
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Delete this branch permanently">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteDialog({ open: true, branch })}
                            sx={{
                              color: '#ef4444',
                              background: 'rgba(239,68,68,0.1)',
                              borderRadius: '8px',
                              '&:hover': { background: 'rgba(239,68,68,0.2)' },
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

              {!loading && branches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                      <MapPin size={48} style={{ color: '#334155' }} />
                      <Typography sx={{ color: '#64748b', fontWeight: 600 }}>No branches registered yet</Typography>
                      <Typography sx={{ color: '#475569', fontSize: '0.85rem' }}>
                        Click "Add New Branch" to register your first company location.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ── Add Branch Modal ────────────────────────────────────────────────── */}
      <Dialog
        open={openModal}
        onClose={() => { setOpenModal(false); setFormErrors({}); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            overflow: 'hidden',
          },
        }}
      >
        {/* Dialog Header */}
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            px: 3,
            py: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ background: 'rgba(99,102,241,0.25)', borderRadius: '10px', p: 1, color: '#818cf8' }}>
              <Building2 size={20} />
            </Box>
            <Box>
              <Typography sx={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.15rem' }}>
                Add New Company Branch
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                Set the branch name, address, and GPS coordinates for geo-fenced attendance
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 0 }}>
            {/* Branch Name */}
            <Grid item xs={12}>
              <TextField
                label="Branch Name *"
                fullWidth
                value={form.branchName}
                onChange={handleFormChange('branchName')}
                error={!!formErrors.branchName}
                helperText={formErrors.branchName || 'e.g. Thane Main Campus, Andheri East Office'}
                InputProps={{ startAdornment: <InputAdornment position="start"><Building2 size={16} /></InputAdornment> }}
                sx={fieldStyle}
                FormHelperTextProps={{ sx: { color: formErrors.branchName ? '#ef4444' : '#64748b' } }}
              />
            </Grid>

            {/* Branch Code */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Branch Code (Optional)"
                fullWidth
                value={form.branchCode}
                onChange={handleFormChange('branchCode')}
                placeholder="e.g. IS-THN-01"
                helperText="Auto-generated if left empty"
                sx={fieldStyle}
                FormHelperTextProps={{ sx: { color: '#64748b' } }}
              />
            </Grid>

            {/* Allowed Radius */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Allowed Radius (meters) *"
                fullWidth
                type="number"
                value={form.allowedRadius}
                onChange={handleFormChange('allowedRadius')}
                error={!!formErrors.allowedRadius}
                helperText={formErrors.allowedRadius || 'Employees must be within this radius to clock in. Default: 100m'}
                InputProps={{ startAdornment: <InputAdornment position="start"><Wifi size={16} /></InputAdornment>, inputProps: { min: 10, max: 1000 } }}
                sx={fieldStyle}
                FormHelperTextProps={{ sx: { color: formErrors.allowedRadius ? '#ef4444' : '#64748b' } }}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                label="Full Address"
                fullWidth
                value={form.address}
                onChange={handleFormChange('address')}
                placeholder="e.g. Gladiola Tower, Near Station, Thane West, Maharashtra"
                helperText="Full street address for reference"
                InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={16} /></InputAdornment> }}
                sx={fieldStyle}
                FormHelperTextProps={{ sx: { color: '#64748b' } }}
              />
            </Grid>

            {/* GPS Coordinates */}
            <Grid item xs={12}>
              <Alert
                icon={<Navigation size={16} />}
                severity="info"
                sx={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  borderRadius: '10px',
                  color: '#93c5fd',
                  '& .MuiAlert-icon': { color: '#60a5fa' },
                  mb: 1,
                }}
              >
                <strong>How to get GPS coordinates:</strong> Open Google Maps → right-click on the branch location → click the coordinates shown at the top of the menu. Copy Latitude first, then Longitude.
              </Alert>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Latitude *"
                fullWidth
                type="number"
                value={form.latitude}
                onChange={handleFormChange('latitude')}
                error={!!formErrors.latitude}
                helperText={formErrors.latitude || 'e.g. 19.1972 (North = positive)'}
                placeholder="19.1972"
                InputProps={{ startAdornment: <InputAdornment position="start"><Navigation size={16} style={{ color: '#10b981' }} /></InputAdornment>, inputProps: { step: 'any' } }}
                sx={fieldStyle}
                FormHelperTextProps={{ sx: { color: formErrors.latitude ? '#ef4444' : '#64748b' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Longitude *"
                fullWidth
                type="number"
                value={form.longitude}
                onChange={handleFormChange('longitude')}
                error={!!formErrors.longitude}
                helperText={formErrors.longitude || 'e.g. 72.9722 (East = positive)'}
                placeholder="72.9722"
                InputProps={{ startAdornment: <InputAdornment position="start"><Globe size={16} style={{ color: '#3b82f6' }} /></InputAdornment>, inputProps: { step: 'any' } }}
                sx={fieldStyle}
                FormHelperTextProps={{ sx: { color: formErrors.longitude ? '#ef4444' : '#64748b' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)', gap: 1.5 }}>
          <CustomButton
            variant="outlined"
            onClick={() => { setOpenModal(false); setFormErrors({}); setForm(EMPTY_FORM); }}
            sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#94a3b8', borderRadius: '10px', px: 3 }}
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            onClick={handleCreateBranch}
            disabled={submitting}
            startIcon={<Plus size={16} />}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '10px',
              px: 3,
              fontWeight: 700,
              '&:hover': { background: 'linear-gradient(135deg, #818cf8, #a78bfa)' },
            }}
          >
            {submitting ? 'Adding Branch…' : 'Add Branch'}
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Delete Confirmation Dialog ───────────────────────────────────────── */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, branch: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '18px',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#f1f5f9', fontWeight: 800 }}>
          <Box sx={{ background: 'rgba(239,68,68,0.15)', borderRadius: '10px', p: 0.8, color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </Box>
          Delete Branch?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94a3b8', mb: 1 }}>
            You are about to permanently delete:
          </Typography>
          <Typography sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', mb: 1.5 }}>
            🏢 {deleteDialog.branch?.branchName}
          </Typography>
          <Alert
            severity="error"
            sx={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '10px',
              color: '#fca5a5',
              '& .MuiAlert-icon': { color: '#ef4444' },
              fontSize: '0.82rem',
            }}
          >
            <strong>This action cannot be undone.</strong> Employees will no longer be able to use this location for clock-in after deletion.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
          <CustomButton
            variant="outlined"
            onClick={() => setDeleteDialog({ open: false, branch: null })}
            sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#94a3b8', borderRadius: '10px', px: 3 }}
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            onClick={handleDeleteBranch}
            disabled={deleting}
            startIcon={<Trash2 size={16} />}
            sx={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              borderRadius: '10px',
              px: 3,
              fontWeight: 700,
              '&:hover': { background: 'linear-gradient(135deg, #ef4444, #dc2626)' },
            }}
          >
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Box>

  );
};

export default AdminBranchManagementPage;
