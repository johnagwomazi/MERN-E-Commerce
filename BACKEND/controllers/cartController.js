import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorMiddleware.js';

const getPopulatedCart = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  return cart || { userId, items: [] };
};

const findProductByAnyId = async (productId) => {
  const mongooseProduct = await Product.findById(productId);
  if (mongooseProduct) {
    return mongooseProduct;
  }

  return Product.collection.findOne({ _id: productId });
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      throw new AppError('productId is required', 400);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError('Quantity must be a whole number greater than zero', 400);
    }

    const product = await findProductByAnyId(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $setOnInsert: { userId: req.user._id, items: [] } },
      { upsert: true, new: true }
    );

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');

    res.json({
      success: true,
      message: 'Item added to cart',
      cart: populatedCart
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError('Quantity must be at least 1', 400);
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const item = cart.items.find((entry) => entry.productId.toString() === productId);
    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.productId');

    res.json({
      success: true,
      cart: populatedCart
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.productId');

    res.json({
      success: true,
      cart: populatedCart
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { items: [] } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
};
