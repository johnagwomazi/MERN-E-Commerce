import { AppError } from '../middleware/errorMiddleware.js';

const emailPattern = /^\S+@\S+\.\S+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const createValidator = (check) => (req, res, next) => {
  try {
    check(req);
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(error.message || 'Invalid request payload', 400));
  }
};

export const validateRegister = createValidator((req) => {
  const name = normalizeString(req.body?.name);
  const email = normalizeString(req.body?.email).toLowerCase();
  const password = normalizeString(req.body?.password);
  const confirmPassword = normalizeString(req.body?.confirmPassword);
  const termsAccepted = req.body?.termsAccepted;

  if (!name) {
    throw new AppError('Name is required', 400);
  }

  if (!emailPattern.test(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  if (!passwordPattern.test(password)) {
    throw new AppError(
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      400
    );
  }

  if (confirmPassword && password !== confirmPassword) {
    throw new AppError('Passwords do not match', 400);
  }

  if (termsAccepted !== true && termsAccepted !== 'true') {
    throw new AppError('You must accept the terms and privacy policy to continue', 400);
  }

  req.body.name = name;
  req.body.email = email;
  req.body.password = password;
});

export const validateLogin = createValidator((req) => {
  const email = normalizeString(req.body?.email).toLowerCase();
  const password = normalizeString(req.body?.password);

  if (!emailPattern.test(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  if (!password) {
    throw new AppError('Password is required', 400);
  }

  req.body.email = email;
  req.body.password = password;
});

export const validateForgotPassword = createValidator((req) => {
  const email = normalizeString(req.body?.email).toLowerCase();

  if (!emailPattern.test(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  req.body.email = email;
});

export const validateResetPassword = createValidator((req) => {
  const password = normalizeString(req.body?.password);
  const confirmPassword = normalizeString(req.body?.confirmPassword);

  if (!passwordPattern.test(password)) {
    throw new AppError(
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      400
    );
  }

  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match', 400);
  }

  req.body.password = password;
});

export const validateEmailOnly = createValidator((req) => {
  const email = normalizeString(req.body?.email).toLowerCase();

  if (!emailPattern.test(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  req.body.email = email;
});

