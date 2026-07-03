import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from './errorMiddleware.js';

const parseCookies = (cookieHeader = '') =>
  cookieHeader.split(';').reduce((acc, pair) => {
    const [rawKey, ...rawValue] = pair.trim().split('=');
    if (!rawKey) {
      return acc;
    }
    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join('=') || '');
    return acc;
  }, {});

export const protect = async (req, res, next) => {
  try {
    req.cookies = req.cookies || parseCookies(req.headers.cookie || '');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('Not authorized, token missing', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('Not authorized, user not found', 401));
    }

    if (!user.emailVerified) {
      return next(new AppError('Please verify your email before continuing', 403));
    }

    req.user = user;
    req.authToken = token;
    next();
  } catch (error) {
    next(new AppError('Not authorized, token invalid', 401));
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403));
    }

    next();
  };
};
