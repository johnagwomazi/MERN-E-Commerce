import express from 'express';
import {
  getMyOrders, 
  initializeOrder, 
  verifyOrder, 
  cancelOrderAndReleaseStock,
  getAdminOrders,
  getPendingAdminOrders,
  getDeliveredAdminOrders,
  markOrderDelivered
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireManagerOrAdmin } from '../middleware/rolesMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/initialize', initializeOrder);
router.post('/cancel/:reference', cancelOrderAndReleaseStock); // Matches frontend fallback endpoint hook
router.get('/verify/:reference', verifyOrder);
router.get('/mine', getMyOrders);
router.get('/admin', requireManagerOrAdmin, getAdminOrders);
router.get('/admin/pending', requireManagerOrAdmin, getPendingAdminOrders);
router.get('/admin/delivered', requireManagerOrAdmin, getDeliveredAdminOrders);
router.patch('/admin/:id/deliver', requireManagerOrAdmin, markOrderDelivered);

export default router;
