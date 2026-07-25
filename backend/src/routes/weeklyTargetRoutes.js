import express from 'express';
import {
  getCurrentWeeklyTarget,
  createWeeklyTarget,
  updateWeeklyTarget,
  getWeeklyTargetHistory,
} from '../controllers/weeklyTargetController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createWeeklyTarget);
router.get('/current', getCurrentWeeklyTarget);
router.put('/:id', updateWeeklyTarget);
router.get('/history', getWeeklyTargetHistory);

export default router;
