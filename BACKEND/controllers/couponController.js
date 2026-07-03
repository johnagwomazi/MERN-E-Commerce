import Coupon from '../models/Coupon.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code) {
      throw new AppError('Coupon code is required', 400);
    }

    const coupon = await Coupon.findOne({
      code: String(code).toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      throw new AppError('Coupon code is invalid', 400);
    }

    if (coupon.expiryDate.getTime() <= new Date().getTime()) {
      throw new AppError('Coupon has expired', 400);
    }

    if (Number(subtotal) < coupon.minOrderValue) {
      throw new AppError(`Minimum order value is NGN ${coupon.minOrderValue}`, 400);
    }

    res.json({
      success: true,
      valid: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      coupon: {
        id: coupon._id,
        code: coupon.code
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      success: true,
      coupon
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      coupons
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    res.json({
      success: true,
      coupon
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    res.json({
      success: true,
      message: 'Coupon deleted'
    });
  } catch (error) {
    next(error);
  }
};

