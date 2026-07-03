import express from 'express';
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
  validateCoupon
} from '../controllers/couponController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/', protect, authorizeRoles('admin'), getCoupons);
router.post('/', protect, authorizeRoles('admin'), createCoupon);
router.put('/:id', protect, authorizeRoles('admin'), updateCoupon);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCoupon);

export default router;

