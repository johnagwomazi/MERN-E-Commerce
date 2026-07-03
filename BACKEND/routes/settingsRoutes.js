import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/rolesMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();
router.get('/', protect, requireAdmin, getSettings);
router.patch('/', protect, requireAdmin, updateSettings);
export default router;
