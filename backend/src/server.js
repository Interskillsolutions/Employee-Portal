import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import actionPlanRoutes from './routes/actionPlanRoutes.js';
import weeklyTargetRoutes from './routes/weeklyTargetRoutes.js';
import AuthService from './services/authService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB().then(() => {
  AuthService.seedDefaultData();
});

// Middleware Stack
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Base Root Greeting Route
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 4rem 2rem;">
      <h1 style="color: #2563EB;">InterSkill Solutions Employee Portal API is live!</h1>
      <p style="color: #475569; font-size: 1.1rem;">The backend service is up and running successfully.</p>
      <a href="/api/v1/health" style="display: inline-block; background: #2563EB; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 1rem;">Check Health Status</a>
    </div>
  `);
});

// Base Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'InterSkill Solutions Employee Portal API is operational',
    timestamp: new Date().toISOString(),
  });
});

// Mount Domain Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/action-plan', actionPlanRoutes);
app.use('/api/v1/weekly-target', weeklyTargetRoutes);
import managerRoutes from './routes/managerRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import branchRoutes from './routes/branchRoutes.js';

app.use('/api/v1/manager', managerRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/branches', branchRoutes);

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || null;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
  });
});

app.listen(PORT, () => {
  console.log(`[Server]: InterSkill Backend listening on port ${PORT}`);
});
