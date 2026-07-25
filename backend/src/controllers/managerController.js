import ActionPlanService from '../services/actionPlanService.js';
import AuthService from '../services/authService.js';
import AttendanceService from '../services/attendanceService.js';
import * as AnnouncementService from '../services/announcementService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import mongoose from 'mongoose';

const MOCK_TEAM_MEMBERS = [
  {
    _id: '65b210f9a843e90011223341',
    employeeId: 'IS-EMP-101',
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@interskill.com',
    profileImage: '',
    department: 'Software Engineering',
    designation: 'Senior Frontend Developer',
    role: 'Employee',
    status: 'Active',
  },
  {
    _id: '65b210f9a843e90011223344',
    employeeId: 'IS-EMP-102',
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@interskill.com',
    profileImage: '',
    department: 'Quality Assurance',
    designation: 'QA Lead',
    role: 'Employee',
    status: 'Active',
  },
  {
    _id: '65b210f9a843e90011223345',
    employeeId: 'IS-EMP-103',
    firstName: 'Emily',
    lastName: 'Watson',
    email: 'emily.watson@interskill.com',
    profileImage: '',
    department: 'UI/UX Design',
    designation: 'Product Designer',
    role: 'Employee',
    status: 'Active',
  },
];

// GET /api/manager/team - list all employees with brief info and today plan summary
export const getTeamOverview = asyncHandler(async (req, res) => {
  let users = null;

  if (mongoose.connection.readyState === 1) {
    try {
      const User = (await import('../models/User.js')).default;
      users = await User.find({ role: { $ne: 'Admin' } }).select('firstName lastName email profileImage role department designation');
    } catch (err) {
      console.warn('[Manager Warning]: MongoDB query failed, using mock team fallback:', err.message);
    }
  }

  if (users === null) {
    users = MOCK_TEAM_MEMBERS.filter((u) => u.role !== 'Admin');
  }

  const team = await Promise.all(
    users.map(async (user) => {
      const uObj = user.toObject ? user.toObject() : user;
      const todayPlan = await ActionPlanService.getTodayPlan(uObj._id || uObj.id);
      const attendance = await AttendanceService.getTodayAttendance(uObj._id || uObj.id);
      return {
        id: uObj._id || uObj.id,
        name: uObj.name || `${uObj.firstName || ''} ${uObj.lastName || ''}`,
        email: uObj.email,
        avatarUrl: uObj.profileImage || '',
        role: uObj.role,
        department: uObj.department || 'Main Branch',
        designation: uObj.designation || 'Team Member',
        todayPlan: todayPlan || null,
        attendance: attendance || null,
      };
    })
  );

  res.status(200).json(new ApiResponse(200, team, 'Team overview fetched'));
});

// GET /api/manager/employee/:id - detailed view for a single employee
export const getEmployeeDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let user = null;

  if (mongoose.connection.readyState === 1) {
    try {
      const User = (await import('../models/User.js')).default;
      user = await User.findById(id).select('-password -refreshToken');
    } catch (err) {
      console.warn('[Manager Warning]: MongoDB query failed, using mock employee detail fallback:', err.message);
    }
  }

  if (!user) {
    user = MOCK_TEAM_MEMBERS.find((u) => u._id === id || u.employeeId === id) || MOCK_TEAM_MEMBERS[0];
  }

  const uObj = user.toObject ? user.toObject() : user;
  const todayPlan = await ActionPlanService.getTodayPlan(uObj._id || uObj.id);
  const history = await ActionPlanService.getEmployeeHistory(uObj._id || uObj.id);
  const attendance = await AttendanceService.getTodayAttendance(uObj._id || uObj.id);

  res.status(200).json(
    new ApiResponse(200, { user: uObj, todayPlan, attendance, history }, 'Employee detail fetched')
  );
});

// POST /api/manager/employee/:id/assign - assign a new task to employee
export const assignTaskToEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params; // employee id
  const { title, description, category, priority, managerName } = req.body;

  const payload = {
    title,
    description: description || '',
    category: category || 'Other',
    priority: priority || 'Medium',
    assignedBy: managerName || req.user?.firstName || 'Manager',
  };

  const updatedPlan = await ActionPlanService.assignManagerTask(id, payload, payload.assignedBy);
  res.status(200).json(new ApiResponse(200, updatedPlan, 'Task assigned successfully'));
});

// POST /api/manager/announcement - create a general announcement
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, tag } = req.body;
  const announcement = await AnnouncementService.create({ title, content, tag, createdBy: req.user?.firstName || 'Manager' });
  res.status(201).json(new ApiResponse(201, announcement, 'Announcement created'));
});

// GET /api/manager/announcements - list all announcements
export const listAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await AnnouncementService.list();
  res.status(200).json(new ApiResponse(200, announcements, 'Announcements fetched'));
});

// GET /api/manager/staff - list all staff details for management
export const getAllStaff = asyncHandler(async (req, res) => {
  let users = null;
  if (mongoose.connection.readyState === 1) {
    try {
      const User = (await import('../models/User.js')).default;
      users = await User.find({}).select('-password -refreshToken');
    } catch (err) {
      console.warn('[Staff Warning]: MongoDB query failed, using mock staff fallback:', err.message);
    }
  }

  if (users === null) {
    users = MOCK_TEAM_MEMBERS;
  }

  res.status(200).json(new ApiResponse(200, users, 'Staff list fetched successfully'));
});

// POST /api/manager/staff - create new employee
export const createEmployee = asyncHandler(async (req, res) => {
  const { employeeId, firstName, lastName, email, password, department, designation, role, status } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ success: false, message: 'First name, last name, and email are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password ? password.trim() : 'Password@123';

  const newEmp = {
    _id: `65b210f9a843e900${Date.now().toString().slice(-6)}`,
    employeeId: employeeId || `IS-EMP-${Math.floor(100 + Math.random() * 900)}`,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    name: `${firstName.trim()} ${lastName.trim()}`,
    email: cleanEmail,
    password: cleanPassword,
    department: department || 'Main Campus / Head Office',
    designation: designation || 'Team Member',
    role: role || 'Employee',
    status: status || 'Active',
    profileImage: '',
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const User = (await import('../models/User.js')).default;
      const created = await User.create({
        employeeId: newEmp.employeeId,
        firstName: newEmp.firstName,
        lastName: newEmp.lastName,
        email: cleanEmail,
        password: cleanPassword,
        department: newEmp.department,
        designation: newEmp.designation,
        role: newEmp.role,
        status: newEmp.status,
      });
      newEmp._id = created._id.toString();
    } catch (err) {
      console.warn('[Create Warning]: MongoDB create failed, registering in mock auth provider:', err.message);
    }
  }

  AuthService.registerMockUser(newEmp);
  MOCK_TEAM_MEMBERS.unshift(newEmp);

  res.status(201).json(new ApiResponse(201, newEmp, 'Employee created successfully'));
});

// PUT /api/manager/staff/:id - update existing employee
export const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, department, designation, role, status } = req.body;

  let updatedUser = null;
  if (mongoose.connection.readyState === 1) {
    try {
      const User = (await import('../models/User.js')).default;
      updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { firstName, lastName, email: email?.toLowerCase(), department, designation, role, status } },
        { new: true }
      );
    } catch (err) {
      console.warn('[Update Warning]: MongoDB update failed, updating mock staff array');
    }
  }

  const idx = MOCK_TEAM_MEMBERS.findIndex((u) => u._id === id || u.employeeId === id);
  if (idx !== -1) {
    if (firstName) MOCK_TEAM_MEMBERS[idx].firstName = firstName;
    if (lastName) MOCK_TEAM_MEMBERS[idx].lastName = lastName;
    if (email) MOCK_TEAM_MEMBERS[idx].email = email.toLowerCase();
    if (department) MOCK_TEAM_MEMBERS[idx].department = department;
    if (designation) MOCK_TEAM_MEMBERS[idx].designation = designation;
    if (role) MOCK_TEAM_MEMBERS[idx].role = role;
    if (status) MOCK_TEAM_MEMBERS[idx].status = status;
    updatedUser = MOCK_TEAM_MEMBERS[idx];
  }

  if (updatedUser) {
    AuthService.registerMockUser(updatedUser);
  }

  res.status(200).json(new ApiResponse(200, updatedUser || MOCK_TEAM_MEMBERS[0], 'Employee updated successfully'));
});

// DELETE /api/manager/staff/:id - delete employee
export const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState === 1) {
    try {
      const User = (await import('../models/User.js')).default;
      await User.findByIdAndDelete(id);
    } catch (err) {
      console.warn('[Delete Warning]: MongoDB delete failed');
    }
  }

  AuthService.removeMockUser(id);
  const idx = MOCK_TEAM_MEMBERS.findIndex((u) => u._id === id || u.employeeId === id);
  if (idx !== -1) {
    MOCK_TEAM_MEMBERS.splice(idx, 1);
  }

  res.status(200).json(new ApiResponse(200, null, 'Employee deleted successfully'));
});
