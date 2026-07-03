import { create } from 'zustand';
import api from '@/utils/axiosInstance';
import { authService } from '@/services/authService';
import { clearStoredAuthToken, getStoredAuthToken, getStoredRememberMe, getStoredRefreshToken, setStoredAuthToken } from '@/utils/authStorage';
import { getFriendlyErrorMessage } from '@/utils/errorHandler';

const getErrorMessage = (error) => getFriendlyErrorMessage(error);

const initialToken = getStoredAuthToken();
const initialRememberMe = getStoredRememberMe();

const syncSessionUser = (set, data, rememberMe = initialRememberMe) => {
  if (data?.accessToken) {
    setStoredAuthToken(data.accessToken, rememberMe, data.refreshToken || getStoredRefreshToken());
  }

  if (typeof window !== 'undefined' && data?.accessToken) {
    window.dispatchEvent(
      new CustomEvent('auth:token-refreshed', {
        detail: { token: data.accessToken, rememberMe, refreshToken: data.refreshToken || getStoredRefreshToken() }
      })
    );
  }

  set({
    token: data?.accessToken || '',
    user: data?.user || null
  });
};

export const useAppStore = create((set, get) => ({
  token: initialToken,
  user: null,
  products: [],
  product: null,
  cart: { items: [] },
  orders: [],
  coupon: null,
  adminProducts: [],
  pendingProducts: [],
  users: [],
  settings: null,
  adminOrders: { pendingOrders: [], deliveredOrders: [] },
  analytics: null,
  analyticsLoading: false,
  loading: false,
  productLoading: false,
  productError: '',
  bootstrapping: false,
  cartLoadingProductId: '',
  checkoutLoading: false,
  adminLoading: false,
  error: '',
  authNotice: '',

  setError: (error) => set({ error }),
  clearError: () => set({ error: '' }),

  setAuth: (token, user, rememberMe = initialRememberMe, refreshToken = '') => {
    if (token) {
      setStoredAuthToken(token, rememberMe, refreshToken);
    } else {
      clearStoredAuthToken();
    }

    set({ token, user });
  },

  bootstrapAuth: async () => {
    set({ bootstrapping: true });

    try {
      const { data } = await api.get('/auth/me');
      set({
        token: getStoredAuthToken(),
        user: data.user,
        bootstrapping: false,
        authNotice: ''
      });
      await get().loadCart();
      await get().loadOrders();
      if (data.user?.role === 'admin') {
        await get().loadAdminOrders();
      }
    } catch (error) {
      clearStoredAuthToken();
      set({
        token: '',
        user: null,
        bootstrapping: false,
        authNotice: '',
        cart: { items: [] },
        orders: [],
        adminOrders: { pendingOrders: [], deliveredOrders: [] }
      });
    }
  },

  register: async (payload) => {
    try {
      set({ loading: true, error: '' });
      const { data } = await authService.register(payload);
      set({
        loading: false,
        authNotice: data.message || 'Account created. Please verify your email.'
      });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message, authNotice: '' });
      throw error;
    }
  },

  login: async (payload) => {
    try {
      set({ loading: true, error: '' });
      const { data } = await authService.login(payload);
      get().setAuth(data.accessToken, data.user, payload.rememberMe, data.refreshToken);
      await get().loadCart();
      await get().loadOrders();
      if (data.user?.role === 'admin') {
        await get().loadAdminOrders();
      }
      set({ loading: false, authNotice: data.message || '' });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message, authNotice: '' });
      throw error;
    }
  },

  sendVerificationEmail: async (payload) => {
    try {
      set({ loading: true, error: '' });
      const { data } = await authService.sendVerification(payload);
      set({ loading: false, authNotice: data.message || 'Verification email sent' });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message, authNotice: '' });
      throw error;
    }
  },

  verifyEmail: async (token) => {
    try {
      set({ loading: true, error: '' });
      const { data } = await authService.verifyEmail(token);
      set({ loading: false, authNotice: data.message || 'Email verified' });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message, authNotice: '' });
      throw error;
    }
  },

  forgotPassword: async (payload) => {
    try {
      set({ loading: true, error: '' });
      const { data } = await authService.forgotPassword(payload);
      set({ loading: false, authNotice: data.message || 'Reset email sent' });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message, authNotice: '' });
      throw error;
    }
  },

  resetPassword: async (token, payload) => {
    try {
      set({ loading: true, error: '' });
      const { data } = await authService.resetPassword(token, payload);
      set({ loading: false, authNotice: data.message || 'Password updated' });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message, authNotice: '' });
      throw error;
    }
  },

  logout: async () => {
    void authService.logout().catch(() => {});
    clearStoredAuthToken();
    set({
      token: '',
      user: null,
      cart: { items: [] },
      orders: [],
      adminOrders: { pendingOrders: [], deliveredOrders: [] },
      coupon: null,
      error: '',
      authNotice: ''
    });
  },

  loadProducts: async () => {
    try {
      set({ loading: true, error: '' });
      const { data } = await api.get('/products');
      set({ products: data.products || [], loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },

  loadProduct: async (id) => {
    try {
      set({ productLoading: true, productError: '', error: '' });
      const { data } = await api.get(`/products/${id}`);
      set({
        product: data.product,
        productLoading: false,
        productError: ''
      });
      return data.product;
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        product: null,
        productLoading: false,
        productError: message,
        error: message
      });
      throw error;
    }
  },

  loadCart: async () => {
    try {
      if (!get().token && !getStoredAuthToken()) {
        return;
      }

      const { data } = await api.get('/cart');
      set({ cart: data.cart || { items: [] } });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      set({ cartLoadingProductId: productId, error: '' });
      const { data } = await api.post('/cart/add', { productId, quantity });
      set({ cart: data.cart || { items: [] }, cartLoadingProductId: '' });
      return data;
    } catch (error) {
      set({ cartLoadingProductId: '', error: getErrorMessage(error) });
      throw error;
    }
  },

  updateCartItem: async (productId, quantity) => {
    try {
      const { data } = await api.patch(`/cart/items/${productId}`, { quantity });
      set({ cart: data.cart || { items: [] } });
      return data;
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  removeCartItem: async (productId) => {
    try {
      const { data } = await api.delete(`/cart/items/${productId}`);
      set({ cart: data.cart || { items: [] } });
      return data;
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear');
      set({ cart: { items: [] } });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  validateCoupon: async (code, subtotal) => {
    try {
      const { data } = await api.post('/coupons/validate', { code, subtotal });
      const coupon = {
        code: String(code).toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue
      };
      set({ coupon, error: '' });
      return data;
    } catch (error) {
      set({ coupon: null, error: getErrorMessage(error) });
      throw error;
    }
  },

  clearCoupon: () => set({ coupon: null }),

  loadAdminProducts: async () => {
    try {
      set({ adminLoading: true, error: '' });
      const { data } = await api.get('/products');
      set({ adminProducts: data.products || [], adminLoading: false });
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
    }
  },
  loadPendingProducts: async () => {
    try {
      set({ adminLoading: true, error: '' });
      const { data } = await api.get('/products/pending');
      set({ pendingProducts: data.products || [], adminLoading: false });
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
    }
  },

  createProduct: async (payload) => {
    try {
      set({ adminLoading: true, error: '' });
      const { data } = await api.post('/products', payload);
      set((state) => ({ adminProducts: [data.product, ...state.adminProducts], adminLoading: false }));
      return data.product;
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  updateProduct: async (id, payload) => {
    try {
      set({ adminLoading: true, error: '' });
      const { data } = await api.put(`/products/${id}`, payload);
      set((state) => ({
        adminProducts: state.adminProducts.map((product) =>
          product._id === id ? data.product : product
        ),
        adminLoading: false
      }));
      return data.product;
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ adminLoading: true, error: '' });
      await api.delete(`/products/${id}`);
      set((state) => ({
        adminProducts: state.adminProducts.filter((product) => product._id !== id),
        adminLoading: false
      }));
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  loadUsers: async (params = {}) => {
    try {
      set({ adminLoading: true, error: '' });
      const { data } = await api.get('/users', { params });
      set({ users: data.users || [], adminLoading: false });
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
    }
  },
  changeUserRole: async (id, role) => {
    try {
      set({ adminLoading: true, error: '' });
      const { data } = await api.patch(`/users/${id}/role`, { role });
      set((state) => ({ users: state.users.map((user) => (user._id === id ? { ...user, ...data.user } : user)), adminLoading: false }));
      return data.user;
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  deleteUser: async (id) => {
    try {
      set({ adminLoading: true, error: '' });
      await api.delete(`/users/${id}`);
      set((state) => ({ users: state.users.filter((user) => user._id !== id), adminLoading: false }));
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  loadSettings: async () => {
    try {
      const { data } = await api.get('/settings');
      set({ settings: data.settings });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },
  loadAnalytics: async (range = 'weekly') => {
    try {
      set({ analyticsLoading: true, error: '' });
      const { data } = await api.get('/analytics', { params: { range } });
      set({ analytics: data, analyticsLoading: false });
      return data;
    } catch (error) {
      set({ analyticsLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  updateSettings: async (payload) => {
    try {
      set({ adminLoading: true, error: '' });
      const { data } = await api.patch('/settings', payload);
      set({ settings: data.settings, adminLoading: false });
      return data.settings;
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  approveProduct: async (id) => {
    try {
      set({ adminLoading: true, error: '' });
      const { data } = await api.patch(`/products/${id}/approve`);
      set((state) => ({
        pendingProducts: state.pendingProducts.filter((product) => product._id !== id),
        adminProducts: [data.product, ...state.adminProducts],
        adminLoading: false
      }));
      return data.product;
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  rejectProduct: async (id) => {
    try {
      set({ adminLoading: true, error: '' });
      const { data } = await api.patch(`/products/${id}/reject`);
      set((state) => ({
        pendingProducts: state.pendingProducts.filter((product) => product._id !== id),
        adminProducts: state.adminProducts.map((product) => (product._id === id ? data.product : product)),
        adminLoading: false
      }));
      return data.product;
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  toggleFeaturedProduct: async (product) => {
    return get().updateProduct(product._id, { ...product, featured: !product.featured });
  },

  loadAdminOrders: async () => {
    try {
      set({ adminLoading: true, error: '' });
      const [pendingRes, deliveredRes] = await Promise.all([
        api.get('/orders/admin/pending'),
        api.get('/orders/admin/delivered')
      ]);
      set({
        adminOrders: {
          pendingOrders: pendingRes.data.pendingOrders || [],
          deliveredOrders: deliveredRes.data.deliveredOrders || []
        },
        adminLoading: false
      });
      return {
        pendingOrders: pendingRes.data.pendingOrders || [],
        deliveredOrders: deliveredRes.data.deliveredOrders || []
      };
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  markOrderDelivered: async (id) => {
    try {
      set({ adminLoading: true, error: '' });
      const { data } = await api.patch(`/orders/admin/${id}/deliver`);
      set((state) => ({
        adminOrders: {
          pendingOrders: (state.adminOrders.pendingOrders || []).filter((order) => order._id !== id),
          deliveredOrders: [data.order, ...(state.adminOrders.deliveredOrders || [])]
        },
        adminLoading: false
      }));
      return data.order;
    } catch (error) {
      set({ adminLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  initializeOrder: async (payload) => {
    try {
      set({ checkoutLoading: true, error: '' });
      const { data } = await api.post('/orders/initialize', payload);
      set({ checkoutLoading: false });
      return data;
    } catch (error) {
      set({ checkoutLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  verifyOrder: async (reference) => {
    try {
      set({ checkoutLoading: true, error: '' });
      const { data } = await api.get(`/orders/verify/${reference}`);
      await get().clearCart();
      set({ cart: { items: [] } });
      await get().loadOrders();
      set({ checkoutLoading: false });
      return data;
    } catch (error) {
      set({ checkoutLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  loadOrders: async () => {
    try {
      if (!get().token && !getStoredAuthToken()) {
        return;
      }

      const { data } = await api.get('/orders/mine');
      set({ orders: data.orders || [] });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  }
}));

if (typeof window !== 'undefined') {
  window.addEventListener('auth:token-refreshed', (event) => {
    const token = event?.detail?.token || '';
    const rememberMe = Boolean(event?.detail?.rememberMe);
    useAppStore.setState((state) => ({
      ...state,
      token: token || state.token
    }));

    if (token) {
      setStoredAuthToken(token, rememberMe, event?.detail?.refreshToken || getStoredRefreshToken());
    }
  });
}
