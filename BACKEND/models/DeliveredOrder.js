import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: [0, 'Price at purchase must be zero or greater']
    }
  },
  { _id: false }
);

const deliveredOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount must be zero or greater']
    },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerCity: { type: String, required: true, trim: true },
    customerAddress: { type: String, required: true, trim: true },
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'success'
    },
    paid: {
      type: Boolean,
      default: true
    },
    delivered: {
      type: Boolean,
      default: true
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true, collection: 'delivered_orders' }
);

export default mongoose.model('DeliveredOrder', deliveredOrderSchema);
