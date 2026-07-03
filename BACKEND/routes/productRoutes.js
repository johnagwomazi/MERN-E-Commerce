import express from 'express';
import {
  approveProduct,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getPendingProducts,
  rejectProduct,
  updateProduct
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin, requireManagerOrAdmin } from '../middleware/rolesMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/pending', protect, requireAdmin, getPendingProducts);
router.get('/:id', getProductById);
router.post('/', protect, requireManagerOrAdmin, createProduct);
router.put('/:id', protect, requireManagerOrAdmin, updateProduct);
router.patch('/:id/approve', protect, requireAdmin, approveProduct);
router.patch('/:id/reject', protect, requireAdmin, rejectProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

export default router;
