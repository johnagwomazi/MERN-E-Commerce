import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { AppError } from '../middleware/errorMiddleware.js';

const createToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('An account already exists with this email', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'customer'
    });

    await Cart.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { userId: user._id, items: [] } },
      { upsert: true, new: true }
    );

    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
