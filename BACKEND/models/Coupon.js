import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type is required']
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value must be zero or greater']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order value must be zero or greater']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    }
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);

