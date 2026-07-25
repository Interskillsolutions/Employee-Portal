import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box } from '@mui/material';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomModal = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
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
          {title}
        </Typography>
        {onClose && (
          <IconButton onClick={onClose} size="small" sx={{ color: '#64748B' }}>
            <X size={20} />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: '#E2E8F0', py: 3 }}>
        {children}
      </DialogContent>
      {actions && <DialogActions sx={{ p: 2 }}>{actions}</DialogActions>}
    </Dialog>
  );
};

export default CustomModal;
