import axios from 'axios';

const TECHNICAL_PATTERNS = [
  /AxiosError/i,
  /Network Error/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /ENOTFOUND/i,
  /getaddrinfo/i,
  /MongoNetworkError/i,
  /MongoServerError/i,
  /CastError/i,
  /ValidationError/i,
  /JsonWebTokenError/i,
  /TokenExpiredError/i,
  /jwt malformed/i,
  /Internal Server Error/i,
  /Request failed with status code/i
];

const cleanMessage = (value) => String(value || '').trim();

const matchesTechnicalPattern = (message) =>
  TECHNICAL_PATTERNS.some((pattern) => pattern.test(message));

const getRequestPath = (error) => String(error?.config?.url || '').toLowerCase();

const isAuthLoginRequest = (error) => getRequestPath(error).includes('/auth/login');

const isAuthRegisterRequest = (error) => getRequestPath(error).includes('/auth/register');

const isAuthRefreshRequest = (error) => getRequestPath(error).includes('/auth/refresh-token');

const isAuthProtectedRequest = (error) =>
  getRequestPath(error).includes('/auth/me') ||
  getRequestPath(error).includes('/cart') ||
  getRequestPath(error).includes('/orders') ||
  getRequestPath(error).includes('/users') ||
  getRequestPath(error).includes('/settings') ||
  getRequestPath(error).includes('/analytics') ||
  getRequestPath(error).includes('/products');

export const getFriendlyErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const response = error?.response;
  const status = response?.status;
  const backendMessage = cleanMessage(response?.data?.message || error?.message);
  const backendCode = cleanMessage(response?.data?.code || error?.code).toUpperCase();

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'You appear to be offline. Please check your internet connection.';
  }

  if (error?.name === 'CanceledError') {
    return 'The request was canceled. Please try again.';
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || /timeout/i.test(backendMessage)) {
      return 'The request timed out. Please try again.';
    }

    if (!response) {
      return 'Unable to connect to our servers. Please check your internet connection and try again.';
    }
  }

  if (isAuthLoginRequest(error) && status === 401) {
    return 'The email or password you entered is incorrect.';
  }

  if (isAuthRegisterRequest(error) && status === 400 && /already exists|duplicate/i.test(backendMessage)) {
    return 'An account with this email already exists.';
  }

  if (isAuthRefreshRequest(error) && status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (backendCode === 'AUTH_INVALID_CREDENTIALS') {
    return 'The email or password you entered is incorrect.';
  }

  if (/verify your email/i.test(backendMessage) || /email verification/i.test(backendMessage)) {
    return 'Please verify your email address before signing in.';
  }

  if (/session/i.test(backendMessage) && /expired|invalid/i.test(backendMessage)) {
    return 'Your session has expired. Please sign in again.';
  }

  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (status === 403) {
    return "You don't have permission to perform this action.";
  }

  if (status === 404) {
    if (/product/i.test(getRequestPath(error)) || /product/i.test(backendMessage)) {
      return 'The requested product could not be found.';
    }

    return 'The requested item could not be found.';
  }

  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (status === 500 || matchesTechnicalPattern(backendMessage)) {
    return 'Something went wrong on our end. Please try again in a few moments.';
  }

  if (backendMessage && !matchesTechnicalPattern(backendMessage)) {
    return backendMessage;
  }

  if (isAuthProtectedRequest(error) && matchesTechnicalPattern(backendMessage)) {
    return 'Something went wrong. Please try again.';
  }

  return fallback;
};

export const normalizeClientError = (error, fallback) => {
  const message = getFriendlyErrorMessage(error, fallback);
  const normalized = new Error(message);
  normalized.name = 'AppFriendlyError';
  normalized.status = error?.response?.status || error?.status;
  normalized.code = error?.response?.data?.code || error?.code || 'CLIENT_ERROR';
  normalized.isFriendly = true;
  normalized.originalError = error;
  normalized.isAxiosError = axios.isAxiosError(error);
  return normalized;
};

