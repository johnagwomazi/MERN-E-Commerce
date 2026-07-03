import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/rolesMiddleware.js';
import { changeUserRole, deleteUser, getUsers } from '../controllers/userController.js';

const router = express.Router();
router.use(protect, requireAdmin);
router.get('/', getUsers);
router.patch('/:id/role', changeUserRole);
router.delete('/:id', deleteUser);
export default router;
