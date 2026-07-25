import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Checkbox,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Plus,
  Trash2,
  Save,
  Edit3,
  Phone,
  MessageSquare,
  UserCheck,
  Layers,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useActionPlan } from '../../hooks/useActionPlan';
import PageHeader from '../../components/common/PageHeader';
import CustomCard from '../../components/common/Card';
import CustomButton from '../../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  'Calls',
  'Messages',
  'Emails',
  'Follow Up',
  'Meeting',
  'Visit',
  'Admission',
  'Documentation',
  'CRM Update',
  'Other',
];

const PRIORITIES = ['High', 'Medium', 'Low'];

const createEmptyTaskRow = (order = 0) => ({
  title: '',
  description: '',
  category: 'Calls',
  priority: 'Medium',
  displayOrder: order,
});

const DailyPlannerPage = () => {
  const { todayPlan, isLoading, error, fetchTodayPlan, savePlan, updateStatus, deleteTask } = useActionPlan();

  const [isEditing, setIsEditing] = useState(false);
  const [dailyCallsTarget, setDailyCallsTarget] = useState(30);
  const [dailyWhatsappTarget, setDailyWhatsappTarget] = useState(50);
  const [dailyExpectedAdmissions, setDailyExpectedAdmissions] = useState(2);
  const [dailyExpectedEnquiryPipeline, setDailyExpectedEnquiryPipeline] = useState(10);

  const [draftTasks, setDraftTasks] = useState([createEmptyTaskRow(0)]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchTodayPlan();
  }, []);

  const tasks = todayPlan?.tasks || [];
  const hasSavedPlan = tasks.length > 0;

  useEffect(() => {
    if (todayPlan) {
      setDailyCallsTarget(todayPlan.dailyCallsTarget ?? 30);
      setDailyWhatsappTarget(todayPlan.dailyWhatsappTarget ?? 50);
      setDailyExpectedAdmissions(todayPlan.dailyExpectedAdmissions ?? 2);
      setDailyExpectedEnquiryPipeline(todayPlan.dailyExpectedEnquiryPipeline ?? 10);

      if (hasSavedPlan && !isEditing) {
        setDraftTasks(
          tasks.map((t, idx) => ({
            title: t.title,
            description: t.description || '',
            category: t.category || 'Calls',
            priority: t.priority || 'Medium',
            status: t.status || 'Pending',
            assignedBy: t.assignedBy || '',
            displayOrder: idx,
          }))
        );
      }
    }
  }, [todayPlan, hasSavedPlan, tasks, isEditing]);

  const handleAddRow = () => {
    setDraftTasks((prev) => [...prev, createEmptyTaskRow(prev.length)]);
  };

  const handleRemoveRow = (index) => {
    if (draftTasks.length === 1) {
      setValidationError('Your action plan must contain at least one task.');
      return;
    }
    setValidationError('');
    setDraftTasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleTaskChange = (index, field, value) => {
    setValidationError('');
    setDraftTasks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSavePlan = async () => {
    const invalidIndex = draftTasks.findIndex((t) => !t.title || !t.title.trim());
    if (invalidIndex !== -1) {
      setValidationError(`Task #${invalidIndex + 1} requires a Task Name.`);
      return;
    }

    setValidationError('');
    try {
      await savePlan({
        dailyCallsTarget,
        dailyWhatsappTarget,
        dailyExpectedAdmissions,
        dailyExpectedEnquiryPipeline,
        tasks: draftTasks,
      });
      setIsEditing(false);
      fetchTodayPlan();
    } catch (err) {
      setValidationError(err.message || 'Failed to save Daily Action Plan');
    }
  };

  const handleStartEdit = () => {
    if (tasks.length > 0) {
      setDraftTasks(
        tasks.map((t, idx) => ({
          title: t.title,
          description: t.description || '',
          category: t.category || 'Calls',
          priority: t.priority || 'Medium',
          status: t.status || 'Pending',
          assignedBy: t.assignedBy || '',
          displayOrder: idx,
        }))
      );
    }
    setIsEditing(true);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Daily Action Plan"
        subtitle="Set today's numerical targets and plan daily work commitments"
        action={
          hasSavedPlan && !isEditing ? (
            <CustomButton
              variant="outlined"
              color="primary"
              onClick={handleStartEdit}
              startIcon={<Edit3 size={18} />}
            >
              Modify / Add Tasks
            </CustomButton>
          ) : null
        }
      />

      {(validationError || error) && (
        <Alert severity="error" onClose={() => setValidationError('')} sx={{ mb: 3, borderRadius: '10px' }}>
          {validationError || error}
        </Alert>
      )}

      {/* TOP 4 NUMERICAL TARGET COMMITMENT CARDS */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 2.5, backgroundColor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: '10px', backgroundColor: '#2563EB15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                <Phone size={20} />
              </Box>
              <Typography variant="body1" fontWeight={600} color="#0F172A">
                Today's Calls Target
              </Typography>
            </Box>
            {!hasSavedPlan || isEditing ? (
              <TextField
                type="number"
                value={dailyCallsTarget}
                onChange={(e) => setDailyCallsTarget(Math.max(0, parseInt(e.target.value) || 0))}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontWeight: 700 } }}
              />
            ) : (
              <Typography variant="h1" fontWeight={700} color="#2563EB" sx={{ mt: 1 }}>
                {dailyCallsTarget} <Typography component="span" variant="body2" color="#64748B">calls</Typography>
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 2.5, backgroundColor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: '10px', backgroundColor: '#10B98115', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                <MessageSquare size={20} />
              </Box>
              <Typography variant="body1" fontWeight={600} color="#0F172A">
                WhatsApp Target
              </Typography>
            </Box>
            {!hasSavedPlan || isEditing ? (
              <TextField
                type="number"
                value={dailyWhatsappTarget}
                onChange={(e) => setDailyWhatsappTarget(Math.max(0, parseInt(e.target.value) || 0))}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontWeight: 700 } }}
              />
            ) : (
              <Typography variant="h1" fontWeight={700} color="#10B981" sx={{ mt: 1 }}>
                {dailyWhatsappTarget} <Typography component="span" variant="body2" color="#64748B">messages</Typography>
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 2.5, backgroundColor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: '10px', backgroundColor: '#8B5CF615', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                <UserCheck size={20} />
              </Box>
              <Typography variant="body1" fontWeight={600} color="#0F172A">
                Expected Admissions
              </Typography>
            </Box>
            {!hasSavedPlan || isEditing ? (
              <TextField
                type="number"
                value={dailyExpectedAdmissions}
                onChange={(e) => setDailyExpectedAdmissions(Math.max(0, parseInt(e.target.value) || 0))}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontWeight: 700 } }}
              />
            ) : (
              <Typography variant="h1" fontWeight={700} color="#8B5CF6" sx={{ mt: 1 }}>
                {dailyExpectedAdmissions} <Typography component="span" variant="body2" color="#64748B">admissions</Typography>
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 2.5, backgroundColor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: '10px', backgroundColor: '#F59E0B15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                <Layers size={20} />
              </Box>
              <Typography variant="body1" fontWeight={600} color="#0F172A">
                Enquiry Pipeline
              </Typography>
            </Box>
            {!hasSavedPlan || isEditing ? (
              <TextField
                type="number"
                value={dailyExpectedEnquiryPipeline}
                onChange={(e) => setDailyExpectedEnquiryPipeline(Math.max(0, parseInt(e.target.value) || 0))}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontWeight: 700 } }}
              />
            ) : (
              <Typography variant="h1" fontWeight={700} color="#F59E0B" sx={{ mt: 1 }}>
                {dailyExpectedEnquiryPipeline} <Typography component="span" variant="body2" color="#64748B">pipeline</Typography>
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Progress & Summary Banner */}
      {hasSavedPlan && !isEditing && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <CustomCard hoverable={false} sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={600} color="#0F172A">
                  Task Completion Rate
                </Typography>
                <Chip label={dayjs().format('MMM DD, YYYY')} size="small" sx={{ backgroundColor: '#F8FAFC', fontWeight: 600 }} />
              </Box>

              <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                  <Typography variant="h1" fontWeight={700} color="#2563EB">
                    {completionPercentage}%
                  </Typography>
                  <Typography variant="body2" color="#64748B" fontWeight={500}>
                    {completedTasks} of {totalTasks} tasks finished
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#2563EB',
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>
            </CustomCard>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', p: 2.5 }}>
                  <Typography variant="caption" color="#64748B" fontWeight={600}>Total Tasks</Typography>
                  <Typography variant="h1" fontWeight={700} color="#0F172A" sx={{ mt: 0.5 }}>{totalTasks}</Typography>
                </Card>
              </Grid>

              <Grid item xs={4}>
                <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', p: 2.5, backgroundColor: '#F0FDF4' }}>
                  <Typography variant="caption" color="#166534" fontWeight={600}>Completed</Typography>
                  <Typography variant="h1" fontWeight={700} color="#15803D" sx={{ mt: 0.5 }}>{completedTasks}</Typography>
                </Card>
              </Grid>

              <Grid item xs={4}>
                <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', p: 2.5, backgroundColor: '#FFFBEB' }}>
                  <Typography variant="caption" color="#92400E" fontWeight={600}>Pending</Typography>
                  <Typography variant="h1" fontWeight={700} color="#B45309" sx={{ mt: 0.5 }}>{pendingTasks}</Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* SECTION A: INLINE DYNAMIC TASK BUILDER */}
      {(!hasSavedPlan || isEditing) && (
        <CustomCard title="Daily Task Commitments" subtitle="Add your planned tasks for the day below" hoverable={false}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
            <AnimatePresence>
              {draftTasks.map((task, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                  <Box sx={{ p: 2.5, borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={0.5}>
                        <Typography variant="body2" fontWeight={700} color="#94A3B8">#{index + 1}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={4.5}>
                        <TextField
                          placeholder="Task Name *"
                          value={task.title}
                          onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                          fullWidth
                          size="small"
                          required
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#FFFFFF' } }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <TextField
                          placeholder="Description (optional)"
                          value={task.description}
                          onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                          fullWidth
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#FFFFFF' } }}
                        />
                      </Grid>

                      <Grid item xs={6} sm={2}>
                        <TextField
                          select
                          label="Category"
                          value={task.category}
                          onChange={(e) => handleTaskChange(index, 'category', e.target.value)}
                          fullWidth
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#FFFFFF' } }}
                        >
                          {CATEGORIES.map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={5} sm={1.5}>
                        <TextField
                          select
                          label="Priority"
                          value={task.priority}
                          onChange={(e) => handleTaskChange(index, 'priority', e.target.value)}
                          fullWidth
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#FFFFFF' } }}
                        >
                          {PRIORITIES.map((pri) => (
                            <MenuItem key={pri} value={pri}>{pri}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={1} sm={0.5} sx={{ textAlign: 'right' }}>
                        <IconButton size="small" onClick={() => handleRemoveRow(index)} sx={{ color: '#EF4444' }}>
                          <Trash2 size={18} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <CustomButton variant="outlined" color="primary" onClick={handleAddRow} startIcon={<Plus size={18} />}>
              Add Another Task
            </CustomButton>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {isEditing && (
                <CustomButton variant="outlined" color="inherit" onClick={() => setIsEditing(false)}>
                  Cancel
                </CustomButton>
              )}
              <CustomButton variant="contained" color="primary" onClick={handleSavePlan} disabled={isLoading} startIcon={<Save size={18} />}>
                {isLoading ? 'Saving Plan...' : 'Save Daily Action Plan'}
              </CustomButton>
            </Box>
          </Box>
        </CustomCard>
      )}

      {/* SECTION B: SAVED INTERACTIVE CHECKLIST VIEW */}
      {hasSavedPlan && !isEditing && (
        <CustomCard title="Today's Saved Action Plan" subtitle="Check off completed tasks as you work through your day" hoverable={false}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tasks.map((task) => (
              <Box
                key={task._id || task.id}
                onClick={() => updateStatus(task._id || task.id, task.status === 'Completed' ? 'Pending' : 'Completed')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2.25,
                  borderRadius: '12px',
                  backgroundColor: task.status === 'Completed' ? '#F8FAFC' : '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.04)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Checkbox
                    checked={task.status === 'Completed'}
                    onChange={() => updateStatus(task._id || task.id, task.status === 'Completed' ? 'Pending' : 'Completed')}
                    color="primary"
                  />
                  <Box>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color={task.status === 'Completed' ? '#94A3B8' : '#0F172A'}
                      sx={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}
                    >
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography variant="body2" color="#64748B" sx={{ fontSize: '0.8125rem', mt: 0.25 }}>
                        {task.description}
                      </Typography>
                    )}
                    {task.assignedBy && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                        <Chip
                          label={`Assigned by ${task.assignedBy}`}
                          size="small"
                          sx={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: 600, fontSize: '0.72rem', height: 22 }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label={task.category} size="small" sx={{ backgroundColor: '#F1F5F9', color: '#0F172A', fontWeight: 600, fontSize: '0.75rem' }} />
                  <Chip label={task.priority} color={getPriorityColor(task.priority)} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task._id || task.id);
                    }}
                    sx={{ color: '#EF4444' }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </CustomCard>
      )}
    </Box>
  );
};

export default DailyPlannerPage;
