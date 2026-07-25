import express from 'express';
import { getEmployeeDashboardSummary } from '../controllers/dashboardController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/employee/summary', verifyToken, getEmployeeDashboardSummary);

export default router;
