import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Skeleton,
  Alert,
  Snackbar,
  InputAdornment,
  Paper,
  Divider,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Search,
  Users,
  ShieldCheck,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Building2,
  BadgeCheck,
  Plus,
  X,
  Headphones,
  PhoneCall,
  Megaphone,
  MapPin,
  Navigation,
  Globe,
  Wifi,
  Target,
  XCircle,
} from 'lucide-react';
import { getAllStaff, createEmployee, updateEmployee, deleteEmployee } from '../../store/slices/managerSlice';
import { getAllSupportTicketsApi, updateSupportTicketStatusApi } from '../../services/api/supportApi';
import { publishAnnouncement } from '../../store/slices/announcementSlice';
import { getAllBranchesApi, createBranchApi, toggleBranchStatusApi, deleteBranchApi } from '../../services/api/attendanceApi';
import CreateAnnouncementModal from '../../components/announcements/CreateAnnouncementModal';
import PageHeader from '../../components/common/PageHeader';
import CustomButton from '../../components/common/Button';

const DEFAULT_BRANCHES = [
  'Main Campus / Head Office',
  'North Branch',
  'South Branch',
  'East Branch',
  'West Branch',
  'Remote / Virtual',
];

const DEFAULT_DESIGNATIONS = [
  'Senior Frontend Developer',
  'Admissions & Telecaller Executive',
  'QA Lead & Software Engineer',
  'UI/UX Product Designer',
  'Engineering Manager',
  'Operations Executive',
  'Branch Head',
];

const AdminStaffManagementPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { staffList, isLoading, isSubmitting, error } = useSelector((state) => state.manager);

  // Dynamic Custom Branches & Designations (Persisted in localStorage)
  const [branchesList, setBranchesList] = useState(() => {
    try {
      const saved = localStorage.getItem('interskill_branches');
      return saved ? JSON.parse(saved) : DEFAULT_BRANCHES;
    } catch (e) {
      return DEFAULT_BRANCHES;
    }
  });

  const [designationsList, setDesignationsList] = useState(() => {
    try {
      const saved = localStorage.getItem('interskill_designations');
      return saved ? JSON.parse(saved) : DEFAULT_DESIGNATIONS;
    } catch (e) {
      return DEFAULT_DESIGNATIONS;
    }
  });

  // New Branch & Designation Inline Add States
  const [showAddBranchInput, setShowAddBranchInput] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  const [showAddDesignationInput, setShowAddDesignationInput] = useState(false);
  const [newDesignationName, setNewDesignationName] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal States
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);

  // Form Fields
  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Main Campus / Head Office'); // Branch
  const [designation, setDesignation] = useState('Senior Frontend Developer');
  const [role, setRole] = useState('Employee');
  const [status, setStatus] = useState('Active');

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empToDelete, setEmpToDelete] = useState(null);

  // Support Tickets Queue State
  const [supportTickets, setSupportTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Announcement Modal State
  const [openAnnounceModal, setOpenAnnounceModal] = useState(false);

  // Notification Snackbar State
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // ── Branch Management State ────────────────────────────────────────────────
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [openBranchModal, setOpenBranchModal] = useState(false);
  const [branchSubmitting, setBranchSubmitting] = useState(false);
  const [branchForm, setBranchForm] = useState({ branchName: '', branchCode: '', address: '', latitude: '', longitude: '', allowedRadius: '100' });
  const [branchFormErrors, setBranchFormErrors] = useState({});
  const [branchDeleteDialog, setBranchDeleteDialog] = useState({ open: false, branch: null });
  const [branchDeleting, setBranchDeleting] = useState(false);

  const handlePublishAnnouncement = async (payload) => {
    await dispatch(publishAnnouncement(payload));
  };

  const loadBranches = async () => {
    setLoadingBranches(true);
    try {
      const data = await getAllBranchesApi();
      setBranches(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Failed to load branches:', e.message);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    dispatch(getAllStaff());
    loadSupportTickets();
    loadBranches();
  }, [dispatch]);

  const loadSupportTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await getAllSupportTicketsApi();
      const list = res.tickets || res.data?.tickets || [];
      setSupportTickets(list);
    } catch (e) {
      console.warn('Failed to load support tickets:', e.message);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleUpdateTicketStatus = async (id, newStatus) => {
    try {
      await updateSupportTicketStatusApi(id, newStatus);
      setSupportTickets((prev) =>
        prev.map((t) => ((t._id || t.id) === id ? { ...t, status: newStatus } : t))
      );
      setSnackbarMsg(`Ticket status updated to "${newStatus}"!`);
    } catch (e) {
      alert('Failed to update ticket status');
    }
  };

  // Save custom branches & designations to localStorage
  const saveBranches = (newList) => {
    setBranchesList(newList);
    localStorage.setItem('interskill_branches', JSON.stringify(newList));
  };

  const saveDesignations = (newList) => {
    setDesignationsList(newList);
    localStorage.setItem('interskill_designations', JSON.stringify(newList));
  };

  // Add custom branch handler
  const handleAddNewBranch = () => {
    const trimmed = newBranchName.trim();
    if (!trimmed) return;
    if (!branchesList.includes(trimmed)) {
      const updated = [...branchesList, trimmed];
      saveBranches(updated);
      setDepartment(trimmed);
      setSnackbarMsg(`New branch "${trimmed}" added and selected!`);
    } else {
      setDepartment(trimmed);
    }
    setNewBranchName('');
    setShowAddBranchInput(false);
  };

  // Delete custom branch handler
  const handleDeleteBranch = (branchToDelete, e) => {
    e.stopPropagation();
    const updated = branchesList.filter((b) => b !== branchToDelete);
    saveBranches(updated);
    if (department === branchToDelete) {
      setDepartment(updated[0] || '');
    }
  };

  // Add custom designation handler
  const handleAddNewDesignation = () => {
    const trimmed = newDesignationName.trim();
    if (!trimmed) return;
    if (!designationsList.includes(trimmed)) {
      const updated = [...designationsList, trimmed];
      saveDesignations(updated);
      setDesignation(trimmed);
      setSnackbarMsg(`New designation "${trimmed}" added and selected!`);
    } else {
      setDesignation(trimmed);
    }
    setNewDesignationName('');
    setShowAddDesignationInput(false);
  };

  // Delete custom designation handler
  const handleDeleteDesignation = (desigToDelete, e) => {
    e.stopPropagation();
    const updated = designationsList.filter((d) => d !== desigToDelete);
    saveDesignations(updated);
    if (designation === desigToDelete) {
      setDesignation(updated[0] || '');
    }
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedEmpId(null);
    setEmployeeId(`IS-EMP-${Math.floor(100 + Math.random() * 900)}`);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('Password@123');
    setDepartment(branchesList[0] || 'Main Campus / Head Office');
    setDesignation(designationsList[0] || 'Senior Frontend Developer');
    setRole('Employee');
    setStatus('Active');
    setShowAddBranchInput(false);
    setShowAddDesignationInput(false);
    setOpenModal(true);
  };

  const handleOpenEditModal = (emp) => {
    setIsEditMode(true);
    setSelectedEmpId(emp._id || emp.id);
    setEmployeeId(emp.employeeId || '');
    setFirstName(emp.firstName || emp.name?.split(' ')[0] || '');
    setLastName(emp.lastName || emp.name?.split(' ')[1] || '');
    setEmail(emp.email || '');
    setPassword('');

    const empBranch = emp.department || branchesList[0] || 'Main Campus / Head Office';
    if (!branchesList.includes(empBranch)) {
      saveBranches([...branchesList, empBranch]);
    }
    setDepartment(empBranch);

    const empDesig = emp.designation || designationsList[0] || 'Team Member';
    if (!designationsList.includes(empDesig)) {
      saveDesignations([...designationsList, empDesig]);
    }
    setDesignation(empDesig);

    setRole(emp.role || 'Employee');
    setStatus(emp.status || 'Active');
    setShowAddBranchInput(false);
    setShowAddDesignationInput(false);
    setOpenModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    const payload = {
      employeeId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      department: department.trim(), // Branch
      designation: designation.trim(), // Customized Designation
      role,
      status,
    };

    if (isEditMode && selectedEmpId) {
      const res = await dispatch(updateEmployee({ id: selectedEmpId, empData: payload }));
      if (!res.error) {
        setSnackbarMsg('Employee account updated successfully!');
        setOpenModal(false);
        dispatch(getAllStaff());
      }
    } else {
      const res = await dispatch(createEmployee(payload));
      if (!res.error) {
        setSnackbarMsg('New employee added successfully!');
        setOpenModal(false);
        dispatch(getAllStaff());
      }
    }
  };

  const handleOpenDeleteDialog = (emp) => {
    setEmpToDelete(emp);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (empToDelete) {
      const targetId = empToDelete._id || empToDelete.id;
      const res = await dispatch(deleteEmployee(targetId));
      if (!res.error) {
        setSnackbarMsg('Employee deleted successfully.');
        dispatch(getAllStaff());
      }
    }
    setDeleteDialogOpen(false);
    setEmpToDelete(null);
  };

  // ── Branch Handlers ──────────────────────────────────────────────────────────
  const validateBranchForm = () => {
    const errors = {};
    if (!branchForm.branchName.trim()) errors.branchName = 'Branch name is required';
    if (!branchForm.latitude || isNaN(Number(branchForm.latitude))) errors.latitude = 'Valid latitude required (e.g. 19.1972)';
    if (!branchForm.longitude || isNaN(Number(branchForm.longitude))) errors.longitude = 'Valid longitude required (e.g. 72.9722)';
    const r = Number(branchForm.allowedRadius);
    if (isNaN(r) || r < 10 || r > 1000) errors.allowedRadius = 'Radius must be 10–100m';
    setBranchFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateBranch = async () => {
    if (!validateBranchForm()) return;
    setBranchSubmitting(true);
    try {
      const created = await createBranchApi({
        branchName: branchForm.branchName.trim(),
        branchCode: branchForm.branchCode.trim() || undefined,
        address: branchForm.address.trim(),
        latitude: Number(branchForm.latitude),
        longitude: Number(branchForm.longitude),
        allowedRadius: Number(branchForm.allowedRadius || 100),
      });
      setBranches((prev) => [...prev, created]);
      setOpenBranchModal(false);
      setBranchForm({ branchName: '', branchCode: '', address: '', latitude: '', longitude: '', allowedRadius: '100' });
      setBranchFormErrors({});
      setSnackbarMsg(`✅ Branch “${created.branchName}” added! Employees can now clock in from this location.`);
    } catch (err) {
      setSnackbarMsg(err?.response?.data?.message || 'Failed to create branch.');
    } finally {
      setBranchSubmitting(false);
    }
  };

  const handleToggleBranchStatus = async (branch) => {
    const newStatus = !branch.isActive;
    setBranches((prev) => prev.map((b) => (b._id === branch._id ? { ...b, isActive: newStatus } : b)));
    try {
      await toggleBranchStatusApi(branch._id, newStatus);
      setSnackbarMsg(newStatus ? `✅ "${branch.branchName}" is now Active.` : `⏸ "${branch.branchName}" has been Deactivated.`);
    } catch {
      setBranches((prev) => prev.map((b) => (b._id === branch._id ? { ...b, isActive: !newStatus } : b)));
      setSnackbarMsg('Failed to update branch status.');
    }
  };

  const handleDeleteBranchConfirm = async () => {
    const branch = branchDeleteDialog.branch;
    if (!branch) return;
    setBranchDeleting(true);
    try {
      await deleteBranchApi(branch._id);
      setBranches((prev) => prev.filter((b) => b._id !== branch._id));
      setBranchDeleteDialog({ open: false, branch: null });
      setSnackbarMsg(`🗑️ Branch "${branch.branchName}" deleted permanently.`);
    } catch {
      setSnackbarMsg('Failed to delete branch.');
    } finally {
      setBranchDeleting(false);
    }
  };

  // Filtered staff list

  const filteredStaff = (staffList || []).filter((emp) => {
    const fullName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalCount = staffList?.length || 0;
  const employeeCount = staffList?.filter((s) => s.role === 'Employee').length || 0;
  const managerCount = staffList?.filter((s) => s.role === 'Manager').length || 0;
  const adminCount = staffList?.filter((s) => s.role === 'Admin').length || 0;

  if (isLoading && (!staffList || staffList.length === 0)) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '16px', mb: 3 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '16px' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header & Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <PageHeader title="Staff & Employee Management" subtitle="Create, Edit, Delete and Manage Staff Accounts, Branches & Customized Roles" />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <CustomButton
            variant="contained"
            color="secondary"
            onClick={() => setOpenAnnounceModal(true)}
            startIcon={<Megaphone size={18} />}
            sx={{
              py: 1.25,
              px: 3,
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            }}
          >
            + Make Announcement
          </CustomButton>

          <CustomButton
            variant="outlined"
            onClick={() => navigate('/admin/branches')}
            startIcon={<MapPin size={18} />}
            sx={{
              py: 1.25,
              px: 3,
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontWeight: 700,
              borderColor: '#10b981',
              color: '#10b981',
              '&:hover': { borderColor: '#059669', background: 'rgba(16,185,129,0.08)', color: '#059669' },
            }}
          >
            Manage Branches
          </CustomButton>

          <CustomButton
            variant="contained"
            color="primary"
            onClick={handleOpenAddModal}
            startIcon={<UserPlus size={18} />}
            sx={{ py: 1.25, px: 3, borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600 }}
          >
            + Add New Employee
          </CustomButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* KPI Overview Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', p: 2.5, border: '1px solid #E2E8F0', boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#2563EB15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                <Users size={22} />
              </Box>
              <Box>
                <Typography variant="caption" color="#64748B" fontWeight={600}>
                  Total Staff
                </Typography>
                <Typography variant="h3" fontWeight={700} color="#0F172A">
                  {totalCount}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', p: 2.5, border: '1px solid #E2E8F0', boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#10B98115', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                <Briefcase size={22} />
              </Box>
              <Box>
                <Typography variant="caption" color="#64748B" fontWeight={600}>
                  Employees
                </Typography>
                <Typography variant="h3" fontWeight={700} color="#0F172A">
                  {employeeCount}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', p: 2.5, border: '1px solid #E2E8F0', boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#8B5CF615', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                <ShieldCheck size={22} />
              </Box>
              <Box>
                <Typography variant="caption" color="#64748B" fontWeight={600}>
                  Managers
                </Typography>
                <Typography variant="h3" fontWeight={700} color="#0F172A">
                  {managerCount}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', p: 2.5, border: '1px solid #E2E8F0', boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#F59E0B15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                <ShieldCheck size={22} />
              </Box>
              <Box>
                <Typography variant="caption" color="#64748B" fontWeight={600}>
                  Administrators
                </Typography>
                <Typography variant="h3" fontWeight={700} color="#0F172A">
                  {adminCount}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filter & Search Bar */}
      <Card sx={{ p: 2.5, mb: 3, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              placeholder="Search by name, email, employee ID, branch, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#64748B" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Role Filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            >
              <MenuItem value="All">All Roles</MenuItem>
              <MenuItem value="Employee">Employees Only</MenuItem>
              <MenuItem value="Manager">Managers Only</MenuItem>
              <MenuItem value="Admin">Admins Only</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Staff Data Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Staff Member</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Employee ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Branch & Designation</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="#64748B">No staff members found matching criteria.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((emp) => {
                const empId = emp._id || emp.id;
                const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`;

                return (
                  <TableRow key={empId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={emp.profileImage} alt={name} sx={{ backgroundColor: '#2563EB', fontWeight: 700 }}>
                          {name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={700} color="#0F172A">
                            {name}
                          </Typography>
                          <Typography variant="caption" color="#64748B">
                            {emp.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="#2563EB">
                        {emp.employeeId || 'IS-EMP-101'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#0F172A">
                        {emp.designation || 'Staff Member'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                        <Building2 size={13} color="#64748B" />
                        <Typography variant="caption" color="#64748B">
                          {emp.department || 'Main Branch'}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={emp.role || 'Employee'}
                        size="small"
                        color={emp.role === 'Admin' ? 'warning' : emp.role === 'Manager' ? 'secondary' : 'primary'}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={emp.status || 'Active'}
                        size="small"
                        color={emp.status === 'Active' ? 'success' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/manager/employee/${empId}`)}
                          title="View Live Employee Dashboard"
                        >
                          <Eye size={18} />
                        </IconButton>

                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleOpenEditModal(emp)}
                          title="Edit Employee Details"
                        >
                          <Edit size={18} />
                        </IconButton>

                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleOpenDeleteDialog(emp)}
                          title="Delete Employee Account"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Admin Support Tickets & Help Line Control Queue */}
      <Card
        sx={{
          mt: 4,
          p: 3,
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0px 10px 30px rgba(15, 23, 42, 0.06)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <Headphones size={26} />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A">
                Site Support Queue & Help Desk
              </Typography>
              <Typography variant="body2" color="#64748B">
                Employee support queries & direct helpline inquiries (Help Hotline: <strong>8799903365</strong>)
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={<PhoneCall size={16} color="#10B981" />}
            label="Support Hotline: 8799903365"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 800, fontSize: '0.88rem', py: 2, px: 1, borderRadius: '12px' }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {supportTickets.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '16px' }}>
            <CheckCircle2 size={36} color="#10B981" />
            <Typography variant="subtitle1" fontWeight={700} color="#0F172A" sx={{ mt: 1 }}>
              Support Queue Clear
            </Typography>
            <Typography variant="body2" color="#64748B">
              No pending support tickets from employees.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {supportTickets.map((ticket) => {
              const ticketId = ticket._id || ticket.id;
              return (
                <Grid item xs={12} md={6} key={ticketId}>
                  <Card
                    sx={{
                      p: 2.5,
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: ticket.status === 'Open' ? '#FFFBEB' : '#F8FAFC',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                        {ticket.subject}
                      </Typography>
                      <Chip
                        label={ticket.priority || 'Normal'}
                        size="small"
                        color={ticket.priority === 'Urgent' ? 'error' : ticket.priority === 'High' ? 'warning' : 'default'}
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Box>

                    <Typography variant="body2" color="#475569" sx={{ mb: 2, lineHeight: 1.5 }}>
                      {ticket.message}
                    </Typography>

                    <Divider sx={{ mb: 1.5 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" fontWeight={700} color="#0F172A" display="block">
                          From: {ticket.senderName} ({ticket.senderEmail})
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          Help Phone: {ticket.supportPhone || '8799903365'}
                        </Typography>
                      </Box>

                      <TextField
                        select
                        size="small"
                        value={ticket.status || 'Open'}
                        onChange={(e) => handleUpdateTicketStatus(ticketId, e.target.value)}
                        sx={{
                          minWidth: 130,
                          '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 },
                        }}
                      >
                        <MenuItem value="Open">Open</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Resolved">Resolved</MenuItem>
                      </TextField>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* COMPANY BRANCHES — Geo-Fenced Attendance Locations                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Card
        sx={{
          mt: 4,
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0px 10px 30px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Section Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            borderBottom: '1px solid #F1F5F9',
            background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              }}
            >
              <MapPin size={24} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                🏢 Company Branches
              </Typography>
              <Typography variant="caption" color="#64748B">
                Registered geo-fenced locations — employees can only clock in from these branches
              </Typography>
            </Box>
          </Box>

          <CustomButton
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => {
              setBranchForm({ branchName: '', branchCode: '', address: '', latitude: '', longitude: '', allowedRadius: '100' });
              setBranchFormErrors({});
              setOpenBranchModal(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #34D399, #10B981)' },
            }}
          >
            Add New Branch
          </CustomButton>
        </Box>

        {/* Stats Row */}
        <Box sx={{ display: 'flex', gap: 2, px: 3, py: 2, borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Branches', value: branches.length, color: '#6366F1', bg: '#EEF2FF' },
            { label: 'Active', value: branches.filter((b) => b.isActive).length, color: '#10B981', bg: '#F0FDF4' },
            { label: 'Inactive', value: branches.filter((b) => !b.isActive).length, color: '#F59E0B', bg: '#FFFBEB' },
          ].map((s) => (
            <Box key={s.label} sx={{ background: s.bg, borderRadius: '10px', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: s.color, fontWeight: 800, fontSize: '1.2rem' }}>{loadingBranches ? '—' : s.value}</Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>{s.label}</Typography>
            </Box>
          ))}
          <Box sx={{ ml: 'auto', background: '#EFF6FF', borderRadius: '10px', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Wifi size={14} style={{ color: '#3B82F6' }} />
            <Typography sx={{ color: '#3B82F6', fontSize: '0.8rem', fontWeight: 600 }}>Clock-in radius per branch (configurable)</Typography>
          </Box>
        </Box>

        {/* Branches Table */}
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                {['Branch Name', 'Code', 'Address', 'Latitude', 'Longitude', 'Radius', 'Status', 'Toggle'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingBranches
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <TableCell key={j}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : branches.map((branch) => (
                    <TableRow key={branch._id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ background: '#EEF2FF', borderRadius: '8px', p: 0.7, color: '#6366F1' }}>
                            <Building2 size={15} />
                          </Box>
                          <Typography fontWeight={700} color="#0F172A" fontSize="0.9rem">{branch.branchName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={branch.branchCode || '—'} size="small" sx={{ background: '#EEF2FF', color: '#6366F1', fontWeight: 700, fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell sx={{ color: '#64748B', fontSize: '0.82rem', maxWidth: 200 }}>
                        {branch.address || '—'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Navigation size={12} style={{ color: '#10B981' }} />
                          <Typography sx={{ fontFamily: 'monospace', color: '#10B981', fontSize: '0.82rem', fontWeight: 700 }}>
                            {branch.latitude?.toFixed(4) ?? '—'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Globe size={12} style={{ color: '#3B82F6' }} />
                          <Typography sx={{ fontFamily: 'monospace', color: '#3B82F6', fontSize: '0.82rem', fontWeight: 700 }}>
                            {branch.longitude?.toFixed(4) ?? '—'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Wifi size={11} />}
                          label={`${branch.allowedRadius ?? 100}m`}
                          size="small"
                          sx={{ background: '#FFFBEB', color: '#F59E0B', fontWeight: 700, '& .MuiChip-icon': { color: '#F59E0B' } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={branch.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            background: branch.isActive ? '#F0FDF4' : '#FEF2F2',
                            color: branch.isActive ? '#10B981' : '#EF4444',
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={branch.isActive ? 'Deactivate branch' : 'Activate branch'}>
                          <Switch
                            checked={Boolean(branch.isActive)}
                            onChange={() => handleToggleBranchStatus(branch)}
                            size="small"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10B981' },
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Delete this branch permanently">
                          <IconButton
                            size="small"
                            onClick={() => setBranchDeleteDialog({ open: true, branch })}
                            sx={{ color: '#EF4444', background: '#FEF2F2', borderRadius: '8px', '&:hover': { background: '#FEE2E2' } }}
                          >
                            <Trash2 size={15} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              {!loadingBranches && branches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <MapPin size={40} style={{ color: '#CBD5E1', marginBottom: 8 }} />
                    <Typography color="#94A3B8" fontWeight={600}>No branches registered yet.</Typography>
                    <Typography color="#CBD5E1" fontSize="0.82rem">Click "Add New Branch" to register your first location.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ── Add Branch Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={openBranchModal}
        onClose={() => { setOpenBranchModal(false); setBranchFormErrors({}); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ background: '#F0FDF4', borderRadius: '10px', p: 0.8, color: '#10B981' }}>
            <Building2 size={20} />
          </Box>
          Add New Company Branch
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="#64748B" sx={{ mb: 2 }}>
            Branches added here will be <strong>immediately available</strong> for all employees as a valid clock-in location.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Branch Name *"
                fullWidth
                value={branchForm.branchName}
                onChange={(e) => { setBranchForm((p) => ({ ...p, branchName: e.target.value })); setBranchFormErrors((p) => ({ ...p, branchName: undefined })); }}
                error={!!branchFormErrors.branchName}
                helperText={branchFormErrors.branchName || 'e.g. Thane Main Campus, Andheri East Office'}
                InputProps={{ startAdornment: <InputAdornment position="start"><Building2 size={16} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Branch Code (Optional)"
                fullWidth
                value={branchForm.branchCode}
                onChange={(e) => setBranchForm((p) => ({ ...p, branchCode: e.target.value }))}
                placeholder="e.g. IS-THN-01"
                helperText="Auto-generated if left empty"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Allowed Radius (meters) *"
                fullWidth
                type="number"
                value={branchForm.allowedRadius}
                onChange={(e) => { setBranchForm((p) => ({ ...p, allowedRadius: e.target.value })); setBranchFormErrors((p) => ({ ...p, allowedRadius: undefined })); }}
                error={!!branchFormErrors.allowedRadius}
                helperText={branchFormErrors.allowedRadius || 'Employees must be within this distance. Default: 100m'}
                inputProps={{ min: 10, max: 1000 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Wifi size={16} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Full Address"
                fullWidth
                value={branchForm.address}
                onChange={(e) => setBranchForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="e.g. Gladiola Tower, Near Station, Thane West, Maharashtra"
                helperText="Full street address for reference"
                InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={16} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: '10px', fontSize: '0.82rem' }}>
                <strong>How to get GPS coordinates:</strong> Open Google Maps → Right-click on the branch location → Click the coordinates shown at the top. Copy Latitude first, then Longitude.
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Latitude *"
                fullWidth
                type="number"
                value={branchForm.latitude}
                onChange={(e) => { setBranchForm((p) => ({ ...p, latitude: e.target.value })); setBranchFormErrors((p) => ({ ...p, latitude: undefined })); }}
                error={!!branchFormErrors.latitude}
                helperText={branchFormErrors.latitude || 'e.g. 19.1972 (North = positive)'}
                placeholder="19.1972"
                inputProps={{ step: 'any' }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Navigation size={16} style={{ color: '#10B981' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Longitude *"
                fullWidth
                type="number"
                value={branchForm.longitude}
                onChange={(e) => { setBranchForm((p) => ({ ...p, longitude: e.target.value })); setBranchFormErrors((p) => ({ ...p, longitude: undefined })); }}
                error={!!branchFormErrors.longitude}
                helperText={branchFormErrors.longitude || 'e.g. 72.9722 (East = positive)'}
                placeholder="72.9722"
                inputProps={{ step: 'any' }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Globe size={16} style={{ color: '#3B82F6' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
          <CustomButton
            variant="outlined"
            onClick={() => { setOpenBranchModal(false); setBranchFormErrors({}); }}
            sx={{ borderRadius: '10px', px: 3 }}
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            onClick={handleCreateBranch}
            disabled={branchSubmitting}
            startIcon={<Plus size={16} />}
            sx={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '10px', px: 3, fontWeight: 700, '&:hover': { background: 'linear-gradient(135deg, #34D399, #10B981)' } }}
          >
            {branchSubmitting ? 'Adding Branch…' : 'Add Branch'}
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* ── Delete Branch Confirm Dialog ───────────────────────────────────────── */}
      <Dialog
        open={branchDeleteDialog.open}
        onClose={() => setBranchDeleteDialog({ open: false, branch: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '18px', border: '1px solid #FCA5A5', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, color: '#0F172A' }}>
          <Box sx={{ background: '#FEF2F2', borderRadius: '10px', p: 0.8, color: '#EF4444' }}>
            <AlertTriangle size={20} />
          </Box>
          Delete Branch?
        </DialogTitle>
        <DialogContent>
          <Typography color="#64748B" sx={{ mb: 1 }}>
            You are about to permanently delete:
          </Typography>
          <Typography fontWeight={700} fontSize="1rem" color="#0F172A" sx={{ mb: 1.5 }}>
            🏢 {branchDeleteDialog.branch?.branchName}
          </Typography>
          <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '0.82rem' }}>
            <strong>This action cannot be undone.</strong> Employees will no longer be able to clock in from this location.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
          <CustomButton
            variant="outlined"
            onClick={() => setBranchDeleteDialog({ open: false, branch: null })}
            sx={{ borderRadius: '10px', px: 3 }}
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            color="error"
            onClick={handleDeleteBranchConfirm}
            disabled={branchDeleting}
            startIcon={<Trash2 size={16} />}
            sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
          >
            {branchDeleting ? 'Deleting…' : 'Yes, Delete'}
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Add / Edit Employee Dialog Modal */}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '18px', p: 1 } }}>
        <form onSubmit={handleSubmitForm}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {isEditMode ? 'Edit Employee Account' : 'Add New Staff / Employee'}
          </DialogTitle>

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Employee ID *"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Role *"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name *"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Email Address *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              {!isEditMode && (
                <Grid item xs={12}>
                  <TextField
                    label="Default Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    helperText="Default password set to Password@123"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              )}

              {/* 1. Fully Customizable Branch / Location Field */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>
                    Branch / Location *
                  </Typography>
                  <CustomButton
                    variant="text"
                    color="primary"
                    size="small"
                    onClick={() => setShowAddBranchInput(!showAddBranchInput)}
                    startIcon={<Plus size={14} />}
                    sx={{ p: 0, fontSize: '0.75rem', minWidth: 'auto', textTransform: 'none' }}
                  >
                    + Customize / Add New Branch
                  </CustomButton>
                </Box>

                {/* Inline Add New Custom Branch Form */}
                {showAddBranchInput && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5, p: 1.5, backgroundColor: '#EFF6FF', borderRadius: '12px', border: '1px border-dashed #2563EB' }}>
                    <TextField
                      size="small"
                      placeholder="Enter new custom branch name..."
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      fullWidth
                      autoFocus
                      sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF', borderRadius: '8px' } }}
                    />
                    <CustomButton variant="contained" color="primary" size="small" onClick={handleAddNewBranch} sx={{ whiteSpace: 'nowrap' }}>
                      Add Branch
                    </CustomButton>
                  </Box>
                )}

                <TextField
                  select
                  label="Select Branch *"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Building2 size={18} color="#64748B" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, mb: 1 }}
                >
                  {branchesList.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Branch Chip Selector & Custom Management */}
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.5 }}>
                  {branchesList.map((b) => (
                    <Chip
                      key={b}
                      label={b}
                      size="small"
                      onClick={() => setDepartment(b)}
                      onDelete={(e) => handleDeleteBranch(b, e)}
                      deleteIcon={<X size={12} />}
                      variant={department === b ? 'filled' : 'outlined'}
                      color={department === b ? 'primary' : 'default'}
                      sx={{ fontSize: '0.72rem', cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Grid>

              {/* 2. Fully Customizable Designation Field */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>
                    Designation (Job Title) *
                  </Typography>
                  <CustomButton
                    variant="text"
                    color="primary"
                    size="small"
                    onClick={() => setShowAddDesignationInput(!showAddDesignationInput)}
                    startIcon={<Plus size={14} />}
                    sx={{ p: 0, fontSize: '0.75rem', minWidth: 'auto', textTransform: 'none' }}
                  >
                    + Customize / Add New Designation
                  </CustomButton>
                </Box>

                {/* Inline Add New Custom Designation Form */}
                {showAddDesignationInput && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5, p: 1.5, backgroundColor: '#EFF6FF', borderRadius: '12px', border: '1px border-dashed #2563EB' }}>
                    <TextField
                      size="small"
                      placeholder="Enter new custom designation title..."
                      value={newDesignationName}
                      onChange={(e) => setNewDesignationName(e.target.value)}
                      fullWidth
                      autoFocus
                      sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF', borderRadius: '8px' } }}
                    />
                    <CustomButton variant="contained" color="primary" size="small" onClick={handleAddNewDesignation} sx={{ whiteSpace: 'nowrap' }}>
                      Add Designation
                    </CustomButton>
                  </Box>
                )}

                <TextField
                  select
                  label="Select Designation *"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeCheck size={18} color="#64748B" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, mb: 1 }}
                >
                  {designationsList.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Designation Chip Selector & Custom Management */}
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.5 }}>
                  {designationsList.map((d) => (
                    <Chip
                      key={d}
                      label={d}
                      size="small"
                      onClick={() => setDesignation(d)}
                      onDelete={(e) => handleDeleteDesignation(d, e)}
                      deleteIcon={<X size={12} />}
                      variant={designation === d ? 'filled' : 'outlined'}
                      color={designation === d ? 'primary' : 'default'}
                      sx={{ fontSize: '0.72rem', cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  label="Account Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <CustomButton variant="outlined" color="inherit" onClick={() => setOpenModal(false)}>
              Cancel
            </CustomButton>
            <CustomButton type="submit" variant="contained" color="primary" loading={isSubmitting} startIcon={<CheckCircle2 size={18} />}>
              {isEditMode ? 'Save Changes' : 'Create Employee'}
            </CustomButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle size={22} />
          Delete Employee Account
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748B">
            Are you sure you want to delete staff account for <strong>{empToDelete?.name || empToDelete?.firstName}</strong> ({empToDelete?.email})? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton variant="outlined" color="inherit" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </CustomButton>
          <CustomButton variant="contained" color="error" onClick={handleConfirmDelete} startIcon={<Trash2 size={16} />}>
            Delete Staff
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Success Notification Snackbar */}
      <Snackbar open={!!snackbarMsg} autoHideDuration={4000} onClose={() => setSnackbarMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" onClose={() => setSnackbarMsg('')} sx={{ borderRadius: '12px' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
      {/* Create Announcement Modal for Admin */}
      <CreateAnnouncementModal
        open={openAnnounceModal}
        onClose={() => setOpenAnnounceModal(false)}
        onPublish={handlePublishAnnouncement}
      />
    </Box>
  );
};

export default AdminStaffManagementPage;
