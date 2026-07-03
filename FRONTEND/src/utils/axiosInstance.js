import axios from 'axios';
import { apiBaseUrl } from './env';

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('auth-token');
    }

    return Promise.reject(error);
  }
);

export default api;

