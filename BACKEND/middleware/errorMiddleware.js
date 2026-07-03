export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const notFound = (req, res, next) => {
  next(new AppError(`Not found - ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'SERVER_ERROR';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier format';
    code = 'INVALID_ID';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
    code = 'VALIDATION_ERROR';
  }

  if (err.code === 11000) {
    statusCode = 400;
    const duplicateField = Object.keys(err.keyValue || {})[0];
    message = duplicateField
      ? `${duplicateField} already exists`
      : 'Duplicate value detected';
    code = 'DUPLICATE_KEY';
  }

  const payload = {
    success: false,
    message,
    code
  };

  if (process.env.NODE_ENV !== 'production' && !err.isOperational) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
