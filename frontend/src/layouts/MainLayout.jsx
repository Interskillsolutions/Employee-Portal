import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = ({ children }) => {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container Shell */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin 0.2s ease',
        }}
      >
        <Navbar />

        {/* Page Content Shell with Framer Motion Page Transition */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;
