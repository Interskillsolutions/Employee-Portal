import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2.5,
        px: 3,
        mt: 'auto',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
      }}
    >
      <Typography variant="body2" color="#64748B">
        &copy; {new Date().getFullYear()} InterSkill Solutions. All rights reserved.
      </Typography>
      <Typography variant="caption" color="#94A3B8" fontWeight={500}>
        Employee Productivity & Performance Portal v1.0.0 (Phase 1 Foundation)
      </Typography>
    </Box>
  );
};

export default Footer;
