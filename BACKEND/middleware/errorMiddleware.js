export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const notFound = (req, res, next) => {
  next(new AppError('The requested resource could not be found.', 404));
};

const getPublicErrorMessage = (err) => {
  const message = String(err?.message || '').toLowerCase();

  if (err?.name === 'CastError') {
    return 'The requested item could not be found.';
  }

  if (err?.name === 'ValidationError') {
    return 'Please check your input and try again.';
  }

  if (err?.code === 11000) {
    return 'An item with these details already exists.';
  }

  if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError' || /jwt|token/i.test(message)) {
    return 'Your session has expired. Please sign in again.';
  }

  if (message.includes('verify your email')) {
    return 'Please verify your email address before signing in.';
  }

  if (message.includes('invalid credentials') || message.includes('incorrect password')) {
    return 'The email or password you entered is incorrect.';
  }

  if (message.includes('forbidden')) {
    return "You don't have permission to perform this action.";
  }

  if (message.includes('product not found')) {
    return 'The requested product could not be found.';
  }

  if (message.includes('not found')) {
    return 'The requested resource could not be found.';
  }

  if (message.includes('paystack') && message.includes('failed')) {
    return "We couldn't verify your payment. If you were charged, please contact support.";
  }

  if (message.includes('ecconnrefused') || message.includes('econnrefused') || message.includes('enotfound') || message.includes('getaddrinfo') || message.includes('mongonetworkerror')) {
    return 'Unable to connect to our services. Please try again later.';
  }

  if (err?.statusCode === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (err?.statusCode === 403) {
    return "You don't have permission to perform this action.";
  }

  if (err?.statusCode === 404) {
    return 'The requested resource could not be found.';
  }

  if (err?.statusCode >= 500) {
    return 'Something went wrong on our end. Please try again in a few moments.';
  }

  return 'Something went wrong. Please try again.';
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : err.statusCode || 500;
  let message = getPublicErrorMessage(err);
  let code = err.code || 'SERVER_ERROR';

  console.error('[api-error]', {
    statusCode,
    name: err?.name,
    code: err?.code,
    message: err?.message,
    stack: err?.stack
  });

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'The requested item could not be found.';
    code = 'INVALID_ID';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Please check your input and try again.';
    code = 'VALIDATION_ERROR';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'An item with these details already exists.';
    code = 'DUPLICATE_KEY';
  }

  const payload = {
    success: false,
    message,
    code
  };

  res.status(statusCode).json(payload);
};
