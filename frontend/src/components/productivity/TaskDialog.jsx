import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Typography,
  IconButton,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import CustomButton from '../common/Button';

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

const TaskDialog = ({ open, onClose, onSave, initialData }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'Calls',
      priority: 'Medium',
      estimatedMinutes: 30,
      actualMinutes: 0,
      dueTime: '05:00 PM',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'Calls',
        priority: initialData.priority || 'Medium',
        estimatedMinutes: initialData.estimatedMinutes || 30,
        actualMinutes: initialData.actualMinutes || 0,
        dueTime: initialData.dueTime || '05:00 PM',
      });
    } else {
      reset({
        title: '',
        description: '',
        category: 'Calls',
        priority: 'Medium',
        estimatedMinutes: 30,
        actualMinutes: 0,
        dueTime: '05:00 PM',
      });
    }
  }, [initialData, reset, open]);

  const onSubmit = (data) => {
    onSave(data);
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
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h3" fontWeight={600} color="#0F172A">
          {initialData ? 'Edit Planned Task' : 'Add New Daily Task'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748B' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers sx={{ borderColor: '#E2E8F0', py: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Task title is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Task Name *"
                    placeholder="e.g. Conduct 15 client enquiry follow-up calls"
                    variant="outlined"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    placeholder="Key task objectives or client context"
                    variant="outlined"
                    multiline
                    rows={2}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Category *"
                    fullWidth
                    error={!!errors.category}
                    helperText={errors.category?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="priority"
                control={control}
                rules={{ required: 'Priority is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Priority *"
                    fullWidth
                    error={!!errors.priority}
                    helperText={errors.priority?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  >
                    {PRIORITIES.map((pri) => (
                      <MenuItem key={pri} value={pri}>
                        {pri}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="estimatedMinutes"
                control={control}
                rules={{ required: 'Estimated time is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Est. Time (Mins) *"
                    fullWidth
                    error={!!errors.estimatedMinutes}
                    helperText={errors.estimatedMinutes?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="actualMinutes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Actual Time (Mins)"
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="dueTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Due Time"
                    placeholder="e.g. 05:00 PM"
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <CustomButton variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton type="submit" variant="contained" color="primary">
            {initialData ? 'Update Task' : 'Save Task'}
          </CustomButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskDialog;
