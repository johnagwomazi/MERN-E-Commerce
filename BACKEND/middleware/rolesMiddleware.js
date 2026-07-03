import { AppError } from './errorMiddleware.js';

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Permission denied', 403));
  }

  next();
};

export const requireAdmin = requireRole('admin');
export const requireManagerOrAdmin = requireRole('manager', 'admin');
export const requireCustomer = requireRole('customer');
