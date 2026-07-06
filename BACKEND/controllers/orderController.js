import Cart from '../models/Cart.js';
import PendingOrder from '../models/PendingOrder.js';
import DeliveredOrder from '../models/DeliveredOrder.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { verifyPaystackTransaction } from '../config/paystack.js';

const calculateDiscount = (subtotal, coupon) => {
  if (!coupon) {
    return 0;
  }

  if (coupon.discountType === 'percentage') {
    return Math.round((subtotal * coupon.discountValue) / 100);
  }

  return Math.min(coupon.discountValue, subtotal);
};

const findProductByAnyId = async (productId) => {
  const mongooseProduct = await Product.findById(productId);
  if (mongooseProduct) {
    return mongooseProduct;
  }

  return Product.collection.findOne({ _id: productId });
};

const updateProductInventoryByAnyId = async (productId, quantity, delta) => {
  const update = { $inc: { inventoryCount: delta * quantity } };

  const mongooseQuery = delta < 0
    ? { _id: productId, inventoryCount: { $gte: quantity } }
    : { _id: productId };

  const mongooseResult = await Product.findOneAndUpdate(mongooseQuery, update, { new: true });
  if (mongooseResult) {
    return mongooseResult;
  }

  const rawQuery = delta < 0
    ? { _id: productId, inventoryCount: { $gte: quantity } }
    : { _id: productId };

  const { value } = await Product.collection.findOneAndUpdate(rawQuery, update, {
    returnDocument: 'after'
  });

  return value || null;
};

const buildOrderItems = async (cartItems) => {
  const items = [];

  for (const entry of cartItems) {
    const productId = entry.productId?._id || entry.productId;
    const product = await findProductByAnyId(productId);

    if (!product) {
      throw new AppError('A product in your cart no longer exists', 400);
    }

    if (product.inventoryCount < entry.quantity) {
      throw new AppError(`Not enough stock for ${product.name}`, 400);
    }

    items.push({
      productId: productId,
      quantity: entry.quantity,
      priceAtPurchase: product.price
    });
  }

  return items;
};

const getCartForUser = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate('items.productId');

  if (!cart || cart.items.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  return cart;
};

const reserveInventory = async (items) => {
  for (const item of items) {
    const updatedProduct = await updateProductInventoryByAnyId(item.productId, item.quantity, -1);

    if (!updatedProduct) {
      throw new AppError('One or more items in your cart just sold out. Please modify your cart.', 400);
    }
  }
};

const releaseInventory = async (items) => {
  for (const item of items) {
    await updateProductInventoryByAnyId(item.productId, item.quantity, 1);
  }
};

export const initializeOrder = async (req, res, next) => {
  try {
    const {
      paymentReference,
      deliveryAddress,
      couponCode,
      customerName,
      customerEmail,
      customerPhone,
      customerCity,
      customerAddress
    } = req.body;

    // Enforce guard checking that backend secret environment keys have mounted properly
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new AppError('Server misconfiguration: PAYSTACK_SECRET_KEY environmental property is missing.', 500);
    }

    if (!paymentReference) {
      throw new AppError('paymentReference is required', 400);
    }

    if (!deliveryAddress) {
      throw new AppError('Delivery address is required', 400);
    }

    if (!customerName || !customerEmail || !customerPhone || !customerCity || !customerAddress) {
      throw new AppError('Customer details are required', 400);
    }

    const existingOrder = await PendingOrder.findOne({ paymentReference, userId: req.user._id });
    if (existingOrder) {
      return res.json({
        success: true,
        order: existingOrder,
        amountInKobo: Math.round(existingOrder.totalAmount * 100)
      });
    }

    const cart = await getCartForUser(req.user._id);
    const items = await buildOrderItems(cart.items);
    const subtotal = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);

    let coupon = null;
    let discount = 0;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: String(couponCode).toUpperCase(),
        isActive: true
      });

      if (!coupon) {
        throw new AppError('Coupon code is invalid', 400);
      }

      if (coupon.expiryDate.getTime() <= new Date().getTime()) {
        throw new AppError('Coupon has expired', 400);
      }

      if (subtotal < coupon.minOrderValue) {
        throw new AppError(`Minimum order value is NGN ${coupon.minOrderValue}`, 400);
      }

      discount = calculateDiscount(subtotal, coupon);
    }

    const totalAmount = Math.max(subtotal - discount, 0);

    await reserveInventory(items);

    const order = await PendingOrder.create({
      userId: req.user._id,
      items,
      totalAmount,
      couponApplied: coupon ? coupon._id : null,
      paymentReference,
      paymentStatus: 'pending',
      paid: false,
      delivered: false,
      customerName,
      customerEmail,
      customerPhone,
      customerCity,
      customerAddress,
      deliveryAddress
    });

    res.status(201).json({
      success: true,
      order,
      subtotal,
      discount,
      totalAmount,
      amountInKobo: Math.round(totalAmount * 100)
    });
  } catch (error) {
    next(error);
  }
};

const clearUserCart = async (userId) => {
  await Cart.findOneAndUpdate(
    { userId },
    { $set: { items: [] } },
    { new: true, upsert: true }
  );
};

export const verifyOrder = async (req, res, next) => {
  try {
    const { reference } = req.params;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new AppError('Server misconfiguration: PAYSTACK_SECRET_KEY environmental property is missing.', 500);
    }

    const order = await PendingOrder.findOne({ paymentReference: reference, userId: req.user._id });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus === 'success') {
      return res.json({
        success: true,
        message: 'Order already verified',
        order
      });
    }

    const paystackResult = await verifyPaystackTransaction(reference);
    const transaction = paystackResult?.data;

    if (!transaction || paystackResult.status !== true || transaction.status !== 'success') {
      order.paymentStatus = 'failed';
      await order.save();
      await releaseInventory(order.items);
      throw new AppError('Payment verification failed', 400);
    }

    await clearUserCart(req.user._id);

    order.paymentStatus = 'success';
    order.paid = true;
    await order.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: await PendingOrder.findById(order._id)
        .populate('userId', 'name email role')
        .populate('items.productId')
        .populate('couponApplied')
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const [pendingOrders, deliveredOrders] = await Promise.all([
      PendingOrder.find({ userId: req.user._id })
        .populate('items.productId')
        .populate('couponApplied')
        .sort({ createdAt: -1 }),
      DeliveredOrder.find({ userId: req.user._id })
        .populate('items.productId')
        .populate('couponApplied')
        .sort({ createdAt: -1 })
    ]);

    const orders = [...pendingOrders, ...deliveredOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// Add this directly into your /backend/controllers/orderController.js file:
export const cancelOrderAndReleaseStock = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const order = await PendingOrder.findOne({ paymentReference: reference, userId: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order reference registry entry not found' });
    }

    // Only return stock if the order hasn't already been processed or completed
    if (order.paymentStatus === 'pending') {
      order.paymentStatus = 'failed';
      await order.save();
      
      // Runs your existing helper utility method to add stock quantities back
      await releaseInventory(order.items);
      
      return res.json({ success: true, message: 'Stock reservation successfully rolled back.' });
    }

    res.json({ success: true, message: 'No adjustment required.' });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (req, res, next) => {
  try {
    const pendingOrders = await PendingOrder.find({})
      .populate('userId', 'name email role')
      .populate('items.productId')
      .populate('couponApplied')
      .sort({ createdAt: -1 });

    const deliveredOrders = await DeliveredOrder.find({})
      .populate('userId', 'name email role')
      .populate('items.productId')
      .populate('couponApplied')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      pendingOrders,
      deliveredOrders
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingAdminOrders = async (req, res, next) => {
  try {
    const pendingOrders = await PendingOrder.find({})
      .populate('userId', 'name email role')
      .populate('items.productId')
      .populate('couponApplied')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      pendingOrders
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveredAdminOrders = async (req, res, next) => {
  try {
    const deliveredOrders = await DeliveredOrder.find({})
      .populate('userId', 'name email role')
      .populate('items.productId')
      .populate('couponApplied')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      deliveredOrders
    });
  } catch (error) {
    next(error);
  }
};

export const markOrderDelivered = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await PendingOrder.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const orderData = order.toObject();
    delete orderData._id;
    delete orderData.createdAt;
    delete orderData.updatedAt;
    delete orderData.__v;

    const deliveredOrder = await DeliveredOrder.create({
      ...orderData,
      paymentStatus: 'success',
      paid: true,
      delivered: true
    });

    await PendingOrder.findByIdAndDelete(order._id);

    res.json({
      success: true,
      message: 'Order marked as delivered',
      order: deliveredOrder
    });
  } catch (error) {
    next(error);
  }
};
