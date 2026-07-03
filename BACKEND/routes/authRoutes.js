import express from 'express';
import { getMe, login, register } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

export default router;

