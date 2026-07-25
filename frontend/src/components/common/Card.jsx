import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, Box } from '@mui/material';
import { motion } from 'framer-motion';

const CustomCard = ({
  children,
  title,
  subtitle,
  action,
  hoverable = true,
  sx = {},
  contentSx = {},
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MuiCard
        sx={{
          borderRadius: '12px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
          ...sx,
        }}
        {...props}
      >
        {(title || subtitle || action) && (
          <CardHeader
            title={title}
            subheader={subtitle}
            action={action}
            titleTypographyProps={{ variant: 'h4', fontWeight: 600, color: '#0F172A' }}
            subheaderTypographyProps={{ variant: 'body2', color: '#64748B' }}
            sx={{ pb: 1, px: 3, pt: 3 }}
          />
        )}
        <CardContent sx={{ px: 3, pb: 3, '&:last-child': { pb: 3 }, ...contentSx }}>
          {children}
        </CardContent>
      </MuiCard>
    </motion.div>
  );
};

export default CustomCard;
