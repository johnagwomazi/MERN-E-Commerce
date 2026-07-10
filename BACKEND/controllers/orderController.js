import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import PendingOrder from '../models/PendingOrder.js';
import DeliveredOrder from '../models/DeliveredOrder.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { initializePaystackTransaction, verifyPaystackTransaction } from '../config/paystack.js';

const calculateDiscount = (subtotal, coupon) => {
  if (!coupon) {
    return 0;
  }

  if (coupon.discountType === 'percentage') {
    return Math.round((subtotal * coupon.discountValue) / 100);
  }

  return Math.min(coupon.discountValue, subtotal);
};

const toFiniteNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (value == null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveInventorySource = (product) => {
  const candidates = [
    { field: 'inventoryCount', value: toFiniteNumber(product?.inventoryCount) },
    { field: 'countInStock', value: toFiniteNumber(product?.countInStock) },
    { field: 'stock', value: toFiniteNumber(product?.stock) }
  ].filter((candidate) => candidate.value !== null);

  if (candidates.length === 0) {
    return { field: 'inventoryCount', value: 0 };
  }

  const preferredPositive = candidates.find((candidate) => candidate.field === 'inventoryCount' && candidate.value > 0)
    || candidates.find((candidate) => candidate.field === 'countInStock' && candidate.value > 0)
    || candidates.find((candidate) => candidate.field === 'stock' && candidate.value > 0);

  if (preferredPositive) {
    return preferredPositive;
  }

  return candidates[0];
};

const findProductByAnyId = async (productId) => {
  const mongooseProduct = await Product.findById(productId);
  if (mongooseProduct) {
    return mongooseProduct;
  }

  return Product.collection.findOne({ _id: productId });
};

const buildProductIdCandidates = (value) => {
  const candidates = [];
  const addCandidate = (candidate) => {
    if (candidate == null) {
      return;
    }

    const key = typeof candidate === 'string' ? `string:${candidate}` : candidate?.toString?.() || JSON.stringify(candidate);

    if (!candidates.some((entry) => entry.key === key)) {
      candidates.push({ key, value: candidate });
    }
  };

  addCandidate(value);
  addCandidate(String(value));

  if (typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)) {
    addCandidate(new mongoose.Types.ObjectId(value));
  }

  if (value?.toString && mongoose.Types.ObjectId.isValid(value.toString())) {
    addCandidate(new mongoose.Types.ObjectId(value.toString()));
  }

  return candidates;
};

const getCartItemProductId = (item) => item?.productId?._id || item?.productId || item?.productSnapshot?._id || item?.productSnapshot?.id || null;

const getInventoryField = (product) => {
  return resolveInventorySource(product).field;
};

const getInventoryValue = (product) => {
  return resolveInventorySource(product).value;
};

const updateProductInventoryByAnyId = async (
  productId,
  quantity,
  delta,
  productHint = null
) => {
  const product =
    productHint || (await findProductByAnyId(productId));

  if (!product) {
    console.error("Product not found:", productId);
    return null;
  }

  const inventoryField = getInventoryField(product);
  const currentInventory = getInventoryValue(product);

  if (delta < 0 && currentInventory < quantity) {
    console.warn('[orders] Inventory check failed before update', {
      productId: String(product._id),
      inventoryField,
      currentInventory,
      requestedQuantity: quantity
    });
    return null;
  }

  const update = {
    $inc: {
      [inventoryField]: delta * quantity
    }
  };

  const idCandidates = buildProductIdCandidates(product?._id || productId);
  let updatedProduct = null;

  for (const candidate of idCandidates) {
    updatedProduct = await Product.findOneAndUpdate(
      { _id: candidate.value },
      update,
      {
        new: true
      }
    );

    if (updatedProduct) {
      break;
    }

    const rawResult = await Product.collection.findOneAndUpdate(
      { _id: candidate.value },
      update,
      {
        returnDocument: 'after'
      }
    );

    if (rawResult?.value) {
      updatedProduct = rawResult.value;
      break;
    }
  }

  console.log("Inventory update result:", {
    productId: product._id,
    inventoryField,
    quantity,
    delta,
    success: !!updatedProduct
  });

  return updatedProduct;
};

const syncCartItems = async (cart) => {
  const cartItems = cart?.items || [];
  console.log('Incoming cart:', cartItems);

  const validItems = [];
  const orphanedItems = [];
  const outOfStockItems = [];

  for (const item of cartItems) {
    const productId = getCartItemProductId(item);
    console.log('Checking product:', productId);
    console.log('Cart item:', item);
    console.log('Requested quantity:', item?.quantity);

    if (!productId) {
      orphanedItems.push({ item, reason: 'missing_product_id' });
      console.log('Found product:', null);
      continue;
    }

    const product = await findProductByAnyId(productId);
    console.log('Found product:', product);
    console.log('Stock field value:', product?.stock);
    console.log('Quantity field value:', product?.quantity);
    console.log('Inventory field value:', product?.inventory);
    console.log('countInStock field value:', product?.countInStock);

    if (!product) {
      orphanedItems.push({ item, productId, reason: 'missing_database_record' });
      continue;
    }

    const availableInventory = getInventoryValue(product);

    if (availableInventory < item.quantity) {
      console.warn('[orders] Item out of stock', {
        productId: String(productId),
        productName: product?.name,
        requestedQuantity: item.quantity,
        availableInventory
      });

      outOfStockItems.push({
        item,
        productId,
        productName: product?.name,
        requestedQuantity: item.quantity,
        availableInventory
      });
      continue;
    }

    validItems.push({
      productId,
      quantity: item.quantity,
      priceAtPurchase: product.price,
      inventoryField: getInventoryField(product)
    });
  }

  return { validItems, orphanedItems, outOfStockItems };
};

const getCartForUser = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate('items.productId');

  if (!cart || cart.items.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  return cart;
};

const reserveInventory = async (items) => {
  const reservedItems = [];

  try {
    for (const item of items) {
      const updatedProduct = await updateProductInventoryByAnyId(
        item.productId,
        item.quantity,
        -1
      );

      console.log("Inventory reservation result:", updatedProduct);

      if (!updatedProduct) {
        throw new AppError(
          "One or more items in your cart just sold out. Please modify your cart.",
          400
        );
      }

      reservedItems.push(item);
    }

    return true;
  } catch (error) {
    // rollback any successful reservations
    for (const item of reservedItems) {
      try {
        await updateProductInventoryByAnyId(
          item.productId,
          item.quantity,
          1
        );
      } catch (rollbackError) {
        console.error("Inventory rollback failed", rollbackError);
      }
    }

    throw error;
  }
};

const releaseInventory = async (items) => {
  for (const item of items) {
    await updateProductInventoryByAnyId(item.productId, item.quantity, 1);
  }
};

export const initializeOrder = async (req, res, next) => {
  try {
    console.log('Request body:', req.body);
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

    const validationResult = {
      hasPaymentReference: Boolean(paymentReference),
      hasDeliveryAddress: Boolean(deliveryAddress),
      hasCustomerName: Boolean(customerName),
      hasCustomerEmail: Boolean(customerEmail),
      hasCustomerPhone: Boolean(customerPhone),
      hasCustomerCity: Boolean(customerCity),
      hasCustomerAddress: Boolean(customerAddress)
    };

    console.log('Validation result:', validationResult);

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
      const frontendCallbackUrl = process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL.replace(/\/+$/, '')}/order-success?reference=${encodeURIComponent(paymentReference)}`
        : undefined;
      const existingPaystackResponse = await initializePaystackTransaction({
        email: customerEmail,
        amount: Math.round(existingOrder.totalAmount * 100),
        reference: paymentReference,
        callback_url: frontendCallbackUrl,
        metadata: {
          orderId: String(existingOrder._id),
          customerName,
          customerPhone,
          customerCity,
          customerAddress
        }
      });

      const existingAuthorizationUrl = existingPaystackResponse?.data?.authorization_url;
      const existingAccessCode = existingPaystackResponse?.data?.access_code;

      console.log('Paystack response:', existingPaystackResponse);

      if (!existingAuthorizationUrl || !existingAccessCode) {
        throw new AppError('Unable to initialize payment with Paystack', 502);
      }

      return res.json({
        success: true,
        order: existingOrder,
        amountInKobo: Math.round(existingOrder.totalAmount * 100),
        paymentReference,
        authorizationUrl: existingAuthorizationUrl,
        accessCode: existingAccessCode,
        callbackUrl: frontendCallbackUrl,
        cartWarning: null
      });
    }

    const cart = await getCartForUser(req.user._id);
    const { validItems, orphanedItems, outOfStockItems } = await syncCartItems(cart);

    if (orphanedItems.length > 0 || outOfStockItems.length > 0) {
      console.warn('[orders] Orphaned cart items removed before checkout', {
        userId: String(req.user._id),
        orphanedItems: orphanedItems.map((entry) => ({
          productId: getCartItemProductId(entry.item),
          quantity: entry.item?.quantity,
          reason: entry.reason
        })),
        outOfStockItems: outOfStockItems.map((entry) => ({
          productId: entry.productId,
          productName: entry.productName,
          requestedQuantity: entry.requestedQuantity,
          availableInventory: entry.availableInventory
        }))
      });

      cart.items = cart.items.filter((item) => {
        const productId = getCartItemProductId(item);
        return validItems.some((validItem) => String(validItem.productId) === String(productId));
      });

      await cart.save();
    }

    if (!validItems.length) {
      throw new AppError('One or more products in your cart were removed and no valid items remain', 400);
    }

    const items = validItems;
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

    let inventoryReservationWarning = null;

    try {
      await reserveInventory(items);
    } catch (reservationError) {
      inventoryReservationWarning =
        'We could not confirm stock reservation right now, but your payment can still proceed.';

      console.warn('[orders] Inventory reservation failed, continuing checkout', {
        paymentReference,
        userId: String(req.user._id),
        message: reservationError?.message
      });
    }

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

    console.info('[orders] Pending order created', {
      orderId: String(order._id),
      userId: String(req.user._id),
      paymentReference,
      amountInKobo: Math.round(totalAmount * 100)
    });

    const frontendCallbackUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL.replace(/\/+$/, '')}/order-success?reference=${encodeURIComponent(paymentReference)}`
      : undefined;

    const paystackResponse = await initializePaystackTransaction({
      email: customerEmail,
      amount: Math.round(totalAmount * 100),
      reference: paymentReference,
      callback_url: frontendCallbackUrl,
      metadata: {
        orderId: String(order._id),
        customerName,
        customerPhone,
        customerCity,
        customerAddress
      }
    });

    console.log('Paystack response:', paystackResponse);

    const authorizationUrl = paystackResponse?.data?.authorization_url;
    const accessCode = paystackResponse?.data?.access_code;
    const transactionReference = paystackResponse?.data?.reference || paymentReference;

    if (!authorizationUrl || !accessCode) {
      await releaseInventory(items);
      await PendingOrder.findByIdAndDelete(order._id);
      throw new AppError('Unable to initialize payment with Paystack', 502);
    }

    console.info('[orders] Paystack payment initialized', {
      orderId: String(order._id),
      paymentReference: transactionReference,
      authorizationUrl
    });

    res.status(201).json({
      success: true,
      order,
      subtotal,
      discount,
      totalAmount,
      amountInKobo: Math.round(totalAmount * 100),
      paymentReference: transactionReference,
      authorizationUrl,
      accessCode,
      callbackUrl: frontendCallbackUrl,
      cartWarning: inventoryReservationWarning
        || ((orphanedItems.length > 0 || outOfStockItems.length > 0)
        ? 'Some unavailable products were removed from your cart. The remaining items are ready for checkout.'
        : null)
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
      console.warn('[orders] Payment verification failed', {
        orderId: String(order._id),
        paymentReference: reference,
        paystackStatus: paystackResult?.status,
        transactionStatus: transaction?.status
      });
      throw new AppError('Payment verification failed', 400);
    }

    if (Math.round(Number(transaction.amount || 0)) !== Math.round(order.totalAmount * 100)) {
      order.paymentStatus = 'failed';
      await order.save();
      await releaseInventory(order.items);
      console.warn('[orders] Payment amount mismatch', {
        orderId: String(order._id),
        paymentReference: reference,
        expected: Math.round(order.totalAmount * 100),
        received: Number(transaction.amount || 0)
      });
      throw new AppError('Payment amount mismatch', 400);
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
