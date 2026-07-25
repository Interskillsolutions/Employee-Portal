import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const CustomLoader = ({ message = 'Loading...', fullPage = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullPage ? '70vh' : '200px',
        gap: 2,
        width: '100%',
      }}
    >
      <CircularProgress size={40} thickness={4} sx={{ color: '#2563EB' }} />
      {message && (
        <Typography variant="body2" color="#64748B" fontWeight={500}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default CustomLoader;
