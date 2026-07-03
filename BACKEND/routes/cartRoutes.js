import express from 'express';
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.delete('/clear', clearCart);

export default router;

