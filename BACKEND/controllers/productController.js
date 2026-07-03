import Product from '../models/Product.js';
import Setting from '../models/Setting.js';
import AuditLog from '../models/AuditLog.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, q } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }

    filter.$or = [
      { approvalStatus: 'approved' },
      { approvalStatus: { $exists: false } },
      { approvalStatus: null }
    ];
    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      products
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };

    if (!req.user || req.user.role !== 'admin') {
      filter.$or = [
        { approvalStatus: 'approved' },
        { approvalStatus: { $exists: false } },
        { approvalStatus: null }
      ];
    }

    const product = await Product.findOne(filter);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const settings = await Setting.findOne() || await Setting.create({});
    const role = req.user?.role || 'customer';
    const requiresApproval = role === 'manager' && settings.requireManagerApproval;
    const payload = {
      ...req.body,
      createdBy: req.user?._id,
      approvalStatus: role === 'admin' ? 'approved' : requiresApproval ? 'pending' : 'approved',
      approvedBy: role === 'admin' ? req.user._id : undefined,
      approvedAt: role === 'admin' ? new Date() : undefined
    };
    const product = await Product.create(payload);

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      message: 'Product deleted'
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ approvalStatus: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) { next(error); }
};

export const approveProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    product.approvalStatus = 'approved';
    product.approvedBy = req.user._id;
    product.approvedAt = new Date();
    await product.save();
    await AuditLog.create({ action: 'product_approved', performedBy: req.user._id, targetId: product._id });
    res.json({ success: true, message: 'Product approved successfully', product });
  } catch (error) { next(error); }
};

export const rejectProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    product.approvalStatus = 'rejected';
    await product.save();
    await AuditLog.create({ action: 'product_rejected', performedBy: req.user._id, targetId: product._id });
    res.json({ success: true, message: 'Product rejected successfully', product });
  } catch (error) { next(error); }
};
