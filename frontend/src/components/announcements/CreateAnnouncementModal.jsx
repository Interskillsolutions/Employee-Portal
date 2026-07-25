import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  IconButton,
  FormGroup,
  Checkbox,
  Grid,
  Divider,
} from '@mui/material';
import { Megaphone, X, Users, User, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import CustomButton from '../common/Button';
import { fetchTeamMembersApi } from '../../services/api/managerApi';

const CreateAnnouncementModal = ({ open, onClose, onPublish }) => {
  const [type, setType] = useState('General'); // 'General' | 'Personal'
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('Normal'); // 'Normal' | 'High' | 'Urgent'
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadTeam();
    }
  }, [open]);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await fetchTeamMembersApi();
      const list = res.employees || res.data?.employees || res || [];
      if (Array.isArray(list)) {
        setTeamMembers(list);
      }
    } catch (e) {
      console.warn('Failed to load team list:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === teamMembers.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(teamMembers.map((m) => m._id || m.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (type === 'Personal' && selectedEmployees.length === 0) {
      alert('Please select at least one employee for a Personal announcement.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title,
      message,
      type,
      targetEmployeeIds: type === 'Personal' ? selectedEmployees : [],
      priority,
    };

    await onPublish(payload);
    setIsSubmitting(false);

    // Reset form
    setTitle('');
    setMessage('');
    setType('General');
    setSelectedEmployees([]);
    setPriority('Normal');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 1,
          boxShadow: '0px 24px 60px rgba(15, 23, 42, 0.2)',
          border: '1px solid #E2E8F0',
        },
      }}
    >
      <DialogTitle sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              backgroundColor: '#2563EB15',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Megaphone size={24} />
          </Box>
          <Box>
            <Typography variant="h3" fontWeight={800} color="#0F172A">
              Publish Team Announcement
            </Typography>
            <Typography variant="body2" color="#64748B">
              Broadcast announcements to all team members or specific individuals
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* 1. Announcement Audience Type */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="#334155" sx={{ mb: 1 }}>
            Announcement Scope *
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box
                onClick={() => setType('General')}
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  border: `2px solid ${type === 'General' ? '#2563EB' : '#E2E8F0'}`,
                  backgroundColor: type === 'General' ? '#2563EB08' : '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Users size={22} color={type === 'General' ? '#2563EB' : '#64748B'} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color={type === 'General' ? '#1E40AF' : '#0F172A'}>
                    General
                  </Typography>
                  <Typography variant="caption" color="#64748B">
                    Broadcast to entire team
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box
                onClick={() => setType('Personal')}
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  border: `2px solid ${type === 'Personal' ? '#8B5CF6' : '#E2E8F0'}`,
                  backgroundColor: type === 'Personal' ? '#8B5CF608' : '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <User size={22} color={type === 'Personal' ? '#8B5CF6' : '#64748B'} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color={type === 'Personal' ? '#6D28D9' : '#0F172A'}>
                    Personal
                  </Typography>
                  <Typography variant="caption" color="#64748B">
                    Select specific employees
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* 2. Employee Selection List (Shown when Personal is selected) */}
        {type === 'Personal' && (
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#334155">
                Select Target Employees ({selectedEmployees.length} Selected)
              </Typography>
              <Chip
                label={selectedEmployees.length === teamMembers.length ? 'Deselect All' : 'Select All'}
                size="small"
                onClick={handleSelectAll}
                sx={{ fontWeight: 700, cursor: 'pointer' }}
              />
            </Box>

            <Box sx={{ maxHeight: 180, overflowY: 'auto', pr: 1 }}>
              <FormGroup>
                {teamMembers.map((member) => {
                  const memberId = member._id || member.id;
                  const fullName = `${member.firstName || ''} ${member.lastName || member.name || ''}`.trim();
                  const isChecked = selectedEmployees.includes(memberId);
                  return (
                    <FormControlLabel
                      key={memberId}
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleToggleEmployee(memberId)}
                          size="small"
                          color="secondary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={600} color="#0F172A">
                            {fullName}
                          </Typography>
                          <Typography variant="caption" color="#64748B">
                            ({member.designation || member.role || 'Staff'})
                          </Typography>
                        </Box>
                      }
                    />
                  );
                })}
              </FormGroup>
            </Box>
          </Box>
        )}

        {/* 3. Title & Message */}
        <TextField
          label="Announcement Title *"
          placeholder="e.g., Immediate Team Huddle at 4 PM"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Announcement Message *"
          placeholder="Write complete instructions or announcement details here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={4}
          fullWidth
          required
        />

        {/* 4. Priority Chips */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="#334155" sx={{ mb: 1 }}>
            Priority Level
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { label: 'Normal', color: '#2563EB' },
              { label: 'High', color: '#F59E0B' },
              { label: 'Urgent', color: '#EF4444' },
            ].map((p) => (
              <Chip
                key={p.label}
                label={p.label}
                onClick={() => setPriority(p.label)}
                sx={{
                  fontWeight: 700,
                  px: 1,
                  backgroundColor: priority === p.label ? p.color : '#F1F5F9',
                  color: priority === p.label ? '#FFFFFF' : '#64748B',
                  border: `1.5px solid ${priority === p.label ? p.color : '#CBD5E1'}`,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: priority === p.label ? p.color : '#E2E8F0' },
                }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <CustomButton variant="outlined" color="neutral" onClick={onClose}>
          Cancel
        </CustomButton>

        <CustomButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          startIcon={<Send size={18} />}
          disabled={!title.trim() || !message.trim()}
          sx={{ px: 3, borderRadius: '12px' }}
        >
          Publish Announcement
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAnnouncementModal;
