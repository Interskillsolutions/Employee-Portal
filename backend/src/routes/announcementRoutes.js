import express from 'express';
import {
  createAnnouncement,
  getEmployeeAnnouncements,
  acknowledgeAnnouncement,
  snoozeAnnouncement,
} from '../controllers/announcementController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createAnnouncement);
router.get('/', getEmployeeAnnouncements);
router.patch('/:id/acknowledge', acknowledgeAnnouncement);
router.patch('/:id/snooze', snoozeAnnouncement);

export default router;
