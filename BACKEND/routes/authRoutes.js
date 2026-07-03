import express from 'express';
import {
  forgotPassword,
  getMe,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  sendVerification,
  verifyEmail
} from '../controllers/authController.js';
import { authLimiter, strictLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateEmailOnly,
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh-token', strictLimiter, refreshToken);
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', authLimiter, validateResetPassword, resetPassword);
router.post('/send-verification', authLimiter, validateEmailOnly, sendVerification);
router.get('/verify-email/:token', strictLimiter, verifyEmail);

export default router;
