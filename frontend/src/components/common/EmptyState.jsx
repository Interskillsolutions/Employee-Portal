import React from 'react';
import { Box, Typography } from '@mui/material';
import { FolderOpen } from 'lucide-react';
import CustomButton from './Button';

const EmptyState = ({
  title = 'No Records Found',
  description = 'There are currently no items to display in this view.',
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px border-dashed #CBD5E1',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748B',
          mb: 2,
        }}
      >
        <Icon size={32} />
      </Box>
      <Typography variant="h3" fontWeight={600} color="#0F172A" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="#64748B" sx={{ maxWidth: 400, mb: actionLabel ? 3 : 0 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <CustomButton variant="contained" color="primary" onClick={onAction}>
          {actionLabel}
        </CustomButton>
      )}
    </Box>
  );
};

export default EmptyState;
