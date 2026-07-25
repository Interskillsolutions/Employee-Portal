import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { motion } from 'framer-motion';

const CustomButton = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
  sx = {},
  ...props
}) => {
  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      style={{ display: fullWidth ? 'block' : 'inline-block' }}
    >
      <MuiButton
        variant={variant}
        color={color}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        startIcon={startIcon}
        endIcon={endIcon}
        onClick={onClick}
        type={type}
        sx={{
          borderRadius: '12px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: variant === 'contained' ? '0px 4px 14px rgba(37, 99, 235, 0.2)' : 'none',
          px: 2.5,
          py: 1,
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiButton>
    </motion.div>
  );
};

export default CustomButton;
