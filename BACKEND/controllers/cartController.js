import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorMiddleware.js';

const findProductByAnyId = async (productId) => {
  const mongooseProduct = await Product.findById(productId);
  if (mongooseProduct) {
    return mongooseProduct;
  }

  return Product.collection.findOne({ _id: productId });
};

const toProductSnapshot = (product) => {
  if (!product) {
    return null;
  }

  const plainProduct = typeof product.toObject === 'function' ? product.toObject() : product;

  return {
    _id: plainProduct._id,
    name: plainProduct.name,
    description: plainProduct.description,
    price: plainProduct.price,
    image: plainProduct.image,
    category: plainProduct.category,
    inventoryCount: plainProduct.inventoryCount
  };
};

const enrichCart = async (cart) => {
  if (!cart) {
    return { items: [] };
  }

  const plainCart = typeof cart.toObject === 'function' ? cart.toObject() : cart;
  const items = await Promise.all(
    (plainCart.items || []).map(async (item) => {
      const rawProductId = item.productId?._id || item.productId;
      const product = await findProductByAnyId(rawProductId);
      const productSnapshot = toProductSnapshot(product) || item.productSnapshot || null;

      return {
        ...item,
        productId: product || item.productId,
        productSnapshot,
        quantity: item.quantity
      };
    })
  );

  return {
    ...plainCart,
    items
  };
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    const enrichedCart = await enrichCart(cart || { userId: req.user._id, items: [] });

    res.json({
      success: true,
      cart: enrichedCart
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

    const productKey = String(productId);
    const itemIndex = cart.items.findIndex((item) => String(item.productId) === productKey);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].productSnapshot = toProductSnapshot(product);
    } else {
      cart.items.push({
        productId,
        quantity,
        productSnapshot: toProductSnapshot(product)
      });
    }

    await cart.save();
    const populatedCart = await enrichCart(await Cart.findById(cart._id));

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

    const item = cart.items.find((entry) => String(entry.productId) === String(productId));
    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await enrichCart(await Cart.findById(cart._id));

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

    cart.items = cart.items.filter((item) => String(item.productId) !== String(productId));
    await cart.save();

    const populatedCart = await enrichCart(await Cart.findById(cart._id));

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
