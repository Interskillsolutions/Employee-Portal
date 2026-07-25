import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ClipboardList, Plus, AlertCircle, Check, X, UserCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActionPlan } from '../../hooks/useActionPlan';
import { useDispatch } from 'react-redux';
import { respondToTask } from '../../store/slices/actionPlanSlice';
import CustomButton from '../common/Button';
import EmptyState from '../common/EmptyState';
import { motion } from 'framer-motion';

const ActionPlanWidget = ({ readOnly = false, plan = null }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { todayPlan: hookPlan, fetchTodayPlan, updateStatus } = useActionPlan();

  // Rejection dialog modal state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!readOnly && !plan) {
      fetchTodayPlan();
    }
  }, [readOnly, plan]);

  const todayPlan = plan || hookPlan;
  const tasks = todayPlan?.tasks || [];
  const hasPlan = tasks.length > 0;

  const handleAcceptTask = (taskId) => {
    dispatch(respondToTask({ taskId, action: 'accept' }));
  };

  const handleOpenRejectDialog = (taskId) => {
    setSelectedTaskId(taskId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleSubmitRejection = () => {
    if (selectedTaskId) {
      dispatch(
        respondToTask({
          taskId: selectedTaskId,
          action: 'reject',
          rejectionReason: rejectionReason || 'Schedule conflict for today',
        })
      );
    }
    setRejectDialogOpen(false);
  };

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
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card
          sx={{
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    backgroundColor: '#2563EB15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                  }}
                >
                  <ClipboardList size={22} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={600} color="#0F172A">
                    Today's Action Plan Tasks
                  </Typography>
                  <Typography variant="caption" color="#64748B">
                    Daily Task Commitments ({todayPlan?.completedTasks || 0} of {todayPlan?.totalTasks || 0} Completed)
                  </Typography>
                </Box>
              </Box>

              {!readOnly && (
                <CustomButton
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => navigate('/daily-planner')}
                  startIcon={<Plus size={16} />}
                >
                  Modify / Add Tasks
                </CustomButton>
              )}
            </Box>

            {/* Tasks Rendering List */}
            {!hasPlan ? (
              <EmptyState
                title="No Action Plan Created"
                description={
                  readOnly
                    ? 'This employee has not submitted their morning action plan tasks for today yet.'
                    : "You haven't submitted your morning action plan for today yet. Create your plan to start tracking daily priorities."
                }
                actionLabel={readOnly ? null : 'Create Action Plan'}
                onAction={readOnly ? null : () => navigate('/daily-planner')}
                icon={AlertCircle}
              />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {tasks.map((task) => {
                  const taskId = task._id || task.id;
                  const isManagerAssigned = !!task.assignedBy;
                  const isPendingApproval = task.approvalStatus === 'PendingApproval';
                  const isRejected = task.approvalStatus === 'Rejected';
                  const isCompleted = task.status === 'Completed';

                  return (
                    <Box
                      key={taskId}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: isRejected ? '#FEF2F2' : isCompleted ? '#F8FAFC' : '#FFFFFF',
                        border: isRejected ? '1.5px solid #FCA5A5' : isPendingApproval ? '1.5px dashed #2563EB' : '1px solid #E2E8F0',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                        {/* Checkbox & Task Title */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
                          {!isRejected && !isPendingApproval && (
                            <Checkbox
                              checked={isCompleted}
                              onChange={() => !readOnly && updateStatus(taskId, isCompleted ? 'Pending' : 'Completed')}
                              color="primary"
                              disabled={readOnly}
                            />
                          )}

                          <Box>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              color={isRejected ? '#991B1B' : isCompleted ? '#94A3B8' : '#0F172A'}
                              sx={{ textDecoration: isCompleted || isRejected ? 'line-through' : 'none' }}
                            >
                              {task.title}
                            </Typography>

                            {task.description && (
                              <Typography variant="caption" color={isRejected ? '#B91C1C' : '#64748B'} display="block">
                                {task.description}
                              </Typography>
                            )}

                            {/* Manager Assigned Tag */}
                            {isManagerAssigned && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                                <Chip
                                  label={`Assigned by ${task.assignedBy}`}
                                  size="small"
                                  sx={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: 600, fontSize: '0.72rem', height: 22 }}
                                />
                              </Box>
                            )}

                            {/* Rejection Reason Display */}
                            {isRejected && (
                              <Typography variant="caption" color="#B91C1C" fontWeight={600} display="block" sx={{ mt: 0.5 }}>
                                Rejected Reason: "{task.rejectionReason || 'Schedule conflict'}"
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Right Section: Pending Approval Accept/Reject Buttons OR Badges */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isPendingApproval ? (
                            readOnly ? (
                              <Chip label="Awaiting Employee Approval" color="warning" size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CustomButton
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  onClick={() => handleAcceptTask(taskId)}
                                  startIcon={<Check size={14} />}
                                  sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
                                >
                                  Accept Task
                                </CustomButton>

                                <CustomButton
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleOpenRejectDialog(taskId)}
                                  startIcon={<X size={14} />}
                                  sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
                                >
                                  Reject
                                </CustomButton>
                              </Box>
                            )
                          ) : isRejected ? (
                            <Chip label="Task Rejected" color="error" size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                          ) : (
                            <>
                              <Chip
                                label={task.category}
                                size="small"
                                sx={{ backgroundColor: '#F1F5F9', color: '#0F172A', fontWeight: 600, fontSize: '0.75rem' }}
                              />
                              <Chip
                                label={task.priority}
                                color={getPriorityColor(task.priority)}
                                size="small"
                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                              />
                            </>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Reject Task Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle size={20} />
          Reject Manager Assigned Task
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748B" sx={{ mb: 2 }}>
            Please state your reason for rejecting this manager-assigned task (e.g. Schedule capacity full, Priority conflict):
          </Typography>
          <TextField
            label="Reason for Rejection *"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            fullWidth
            multiline
            rows={2}
            autoFocus
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton variant="outlined" color="inherit" onClick={() => setRejectDialogOpen(false)}>
            Cancel
          </CustomButton>
          <CustomButton variant="contained" color="error" onClick={handleSubmitRejection} startIcon={<X size={16} />}>
            Submit Rejection
          </CustomButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActionPlanWidget;
