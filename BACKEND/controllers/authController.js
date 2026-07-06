import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { AppError } from '../middleware/errorMiddleware.js';
import {
  authCookieOptions,
  createAccessToken,
  createRefreshToken,
  generateToken,
  hashToken,
} from '../utils/authTokens.js';
import { emailService } from '../services/emailService.js';

const authFields = 'name email role emailVerified createdAt updatedAt';
const isEmailVerificationRequired = () =>
  String(process.env.REQUIRE_EMAIL_VERIFICATION).toLowerCase() === 'true';

const toUserPayload = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const ensureCartForUser = async (userId) => {
  await Cart.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [] } },
    { upsert: true, new: true }
  );
};

const setRefreshCookie = (res, refreshToken, rememberMe) => {
  if (String(process.env.AUTH_USE_COOKIES).toLowerCase() !== 'true') {
    return;
  }

  const baseOptions = authCookieOptions(rememberMe);
  res.cookie('refreshToken', refreshToken, baseOptions);
};

const clearAuthCookie = (res) => {
  if (String(process.env.AUTH_USE_COOKIES).toLowerCase() !== 'true') {
    return;
  }

  res.clearCookie('refreshToken', { path: '/' });
};

const issueAuthPayload = (res, user, rememberMe = false) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user, rememberMe);
  setRefreshCookie(res, refreshToken, rememberMe);

  return {
    accessToken,
    refreshToken,
    user: toUserPayload(user)
  };
};

const setVerificationToken = async (user) => {
  const token = generateToken(24);
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await user.save({ validateBeforeSave: false });
  return token;
};

const setPasswordResetToken = async (user) => {
  const token = generateToken(24);
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await user.save({ validateBeforeSave: false });
  return token;
};

const enforceRequiredSecret = (name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
};

const maybeSendVerificationEmail = async (user, token) => {
  await emailService.sendVerificationEmail({ user, token });
};

const maybeSendPasswordResetEmail = async (user, token) => {
  await emailService.sendPasswordResetEmail({ user, token });
};

const maybeSendWelcomeEmail = async (user) => {
  await emailService.sendWelcomeEmail({ user });
};

export const register = async (req, res, next) => {
  try {
    enforceRequiredSecret('JWT_SECRET');
    enforceRequiredSecret('REFRESH_TOKEN_SECRET');

    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError('An account already exists with this email', 400);
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'customer',
      emailVerified: false
    });

    await ensureCartForUser(user._id);
    const verificationToken = await setVerificationToken(user);
    await maybeSendVerificationEmail(user, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email before signing in.',
      verificationRequired: isEmailVerificationRequired(),
      user: toUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    enforceRequiredSecret('JWT_SECRET');
    enforceRequiredSecret('REFRESH_TOKEN_SECRET');

    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    if (isEmailVerificationRequired() && !user.emailVerified) {
      const token = await setVerificationToken(user);
      await maybeSendVerificationEmail(user, token);
      throw new AppError('Please verify your email before signing in', 403);
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const payload = issueAuthPayload(res, user, rememberMe === true || rememberMe === 'true');

    res.json({
      success: true,
      message: 'Signed in successfully',
      verificationRequired: isEmailVerificationRequired() && !user.emailVerified,
      ...payload
    });
  } catch (error) {
    if (error.statusCode === 403) {
      return next(new AppError(error.message, 403));
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { refreshTokenVersion: 1 } });
    }

    clearAuthCookie(res);

    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    enforceRequiredSecret('JWT_SECRET');
    enforceRequiredSecret('REFRESH_TOKEN_SECRET');

    const tokenFromBody = req.body?.refreshToken;
    const tokenFromHeader = req.headers['x-refresh-token'];
    const tokenFromCookie = req.cookies?.refreshToken;
    const refreshTokenValue = tokenFromBody || tokenFromHeader || tokenFromCookie;

    if (!refreshTokenValue) {
      throw new AppError('Refresh token missing', 401);
    }

    const { default: jwt } = await import('jsonwebtoken');
    const decoded = jwt.verify(refreshTokenValue, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('Refresh token invalid', 401);
    }

    if ((user.refreshTokenVersion || 0) !== (decoded.rv || 0)) {
      throw new AppError('Refresh token expired', 401);
    }

    if (isEmailVerificationRequired() && !user.emailVerified) {
      throw new AppError('Please verify your email before signing in', 403);
    }

    const payload = issueAuthPayload(res, user, Boolean(decoded.rm));

    res.json({
      success: true,
      message: 'Session restored',
      ...payload
    });
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Unable to refresh session', 401));
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(authFields);

    res.json({
      success: true,
      user: toUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

export const sendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      res.status(200).json({
        success: true,
        message: 'If an account exists, a verification email will be sent'
      });
      return;
    }

    if (user.emailVerified) {
      res.json({
        success: true,
        message: 'Email is already verified'
      });
      return;
    }

    const token = await setVerificationToken(user);
    await maybeSendVerificationEmail(user, token);

    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token;
    if (!token) {
      throw new AppError('Verification token is required', 400);
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      throw new AppError('Verification link is invalid or has expired', 400);
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = '';
    user.emailVerificationExpiresAt = null;
    await user.save({ validateBeforeSave: false });
    await ensureCartForUser(user._id);
    await maybeSendWelcomeEmail(user);

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: toUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      res.json({
        success: true,
        message: 'If an account exists, a reset link will be sent'
      });
      return;
    }

    const token = await setPasswordResetToken(user);
    await maybeSendPasswordResetEmail(user, token);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token;
    const { password } = req.body;

    if (!token) {
      throw new AppError('Reset token is required', 400);
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      throw new AppError('Reset link is invalid or has expired', 400);
    }

    user.password = password;
    user.passwordResetTokenHash = '';
    user.passwordResetExpiresAt = null;
    user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
