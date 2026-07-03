import axios from 'axios';
import { apiBaseUrl } from './env';
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  getStoredRefreshToken,
  getStoredRememberMe,
  setStoredAuthToken
} from './authStorage';
import { normalizeClientError } from './errorHandler';

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

let refreshPromise = null;

const dispatchTokenUpdate = (token, rememberMe, refreshToken = '') => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('auth:token-refreshed', {
      detail: { token, rememberMe, refreshToken }
    })
  );
};

const applyToken = (token, rememberMe = getStoredRememberMe(), refreshToken = '') => {
  setStoredAuthToken(token, rememberMe, refreshToken);
  dispatchTokenUpdate(token, rememberMe, refreshToken);
};

api.interceptors.request.use((config) => {
  const token = getStoredAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const requestUrl = String(originalRequest?.url || '');
    const isAuthRoute = requestUrl.includes('/auth/login')
      || requestUrl.includes('/auth/register')
      || requestUrl.includes('/auth/forgot-password')
      || requestUrl.includes('/auth/reset-password')
      || requestUrl.includes('/auth/send-verification')
      || requestUrl.includes('/auth/verify-email')
      || requestUrl.includes('/auth/refresh-token');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const rememberMe = getStoredRememberMe();
        const refreshToken = getStoredRefreshToken();
        refreshPromise =
          refreshPromise ||
          refreshClient.post('/auth/refresh-token', refreshToken ? { refreshToken } : {}).then(({ data }) => {
            if (data?.accessToken) {
              applyToken(data.accessToken, rememberMe, data.refreshToken || refreshToken);
            }
            return data;
          });

        const refreshData = await refreshPromise;
        refreshPromise = null;

        if (refreshData?.accessToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshData.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        refreshPromise = null;
        clearStoredAuthToken();
        return Promise.reject(normalizeClientError(refreshError, 'Your session has expired. Please sign in again.'));
      }
    }

    if (status === 401) {
      clearStoredAuthToken();
    }

    return Promise.reject(normalizeClientError(error));
  }
);

export { applyToken };
export default api;
