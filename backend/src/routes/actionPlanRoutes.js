import express from 'express';
import {
  getTodayActionPlan,
  saveBulkActionPlan,
  updateTargetProgress,
  updateTaskStatus,
  deleteTask,
  assignTaskToEmployee,
  respondToTaskApproval,
} from '../controllers/actionPlanController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/today', getTodayActionPlan);
router.post('/', saveBulkActionPlan);
router.patch('/target-progress', updateTargetProgress);
router.patch('/task-status', updateTaskStatus);
router.delete('/task/:taskId', deleteTask);

// Manager task assignment & Employee response endpoints
router.post('/assign-task', assignTaskToEmployee);
router.patch('/respond-task', respondToTaskApproval);

export default router;
