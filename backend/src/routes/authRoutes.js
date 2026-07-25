import express from 'express';
import {
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../validations/authValidation.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

// Protected Authentication Endpoints
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

export default router;
