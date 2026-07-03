import api from '@/utils/axiosInstance';

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (token, payload) => api.post(`/auth/reset-password/${token}`, payload),
  sendVerification: (payload) => api.post('/auth/send-verification', payload),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`)
};

