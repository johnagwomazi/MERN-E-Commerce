import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const DEFAULT_ACCESS_EXPIRES_IN = '15m';
const DEFAULT_REFRESH_EXPIRES_IN = '7d';

const requireSecret = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

export const createAccessToken = (user) => {
  const secret = requireSecret('JWT_SECRET');
  const expiresIn = process.env.JWT_EXPIRES_IN || DEFAULT_ACCESS_EXPIRES_IN;

  return jwt.sign(
    {
      id: String(user._id),
      role: user.role,
      rv: user.refreshTokenVersion || 0
    },
    secret,
    { expiresIn }
  );
};

export const createRefreshToken = (user, rememberMe = false) => {
  const secret = requireSecret('REFRESH_TOKEN_SECRET');
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || DEFAULT_REFRESH_EXPIRES_IN;

  return jwt.sign(
    {
      id: String(user._id),
      rv: user.refreshTokenVersion || 0,
      rm: rememberMe
    },
    secret,
    { expiresIn }
  );
};

const durationMatch = /^(\d+)([smhd])$/i;

export const durationToMs = (value, fallback = DEFAULT_REFRESH_EXPIRES_IN) => {
  const input = String(value || fallback).trim();
  const match = durationMatch.exec(input);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
    default:
      return amount * 24 * 60 * 60 * 1000;
  }
};

export const authCookieOptions = (rememberMe = false) => {
  const secure = String(process.env.NODE_ENV).toLowerCase() === 'production';
  const options = {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/'
  };

  if (rememberMe) {
    options.maxAge = durationToMs(process.env.REFRESH_TOKEN_EXPIRES_IN, DEFAULT_REFRESH_EXPIRES_IN);
  }

  return options;
};
