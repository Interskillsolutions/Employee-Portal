import express from 'express';
import {
  getTeamOverview,
  getEmployeeDetail,
  assignTaskToEmployee,
  createAnnouncement,
  listAnnouncements,
  getAllStaff,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/managerController.js';

const router = express.Router();

// All routes are protected by verifyToken middleware applied globally in server.js
router.get('/team', getTeamOverview);
router.get('/employee/:id', getEmployeeDetail);
router.post('/employee/:id/assign', assignTaskToEmployee);
router.post('/announcement', createAnnouncement);
router.get('/announcements', listAnnouncements);

// Staff / Employee Management Routes for Admin
router.get('/staff', getAllStaff);
router.post('/staff', createEmployee);
router.put('/staff/:id', updateEmployee);
router.delete('/staff/:id', deleteEmployee);

export default router;
