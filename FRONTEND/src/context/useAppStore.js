import { create } from 'zustand';
import api from '@/utils/axiosInstance';

const getErrorMessage = (error) => {
  return error?.response?.data?.message || error.message || 'Something went wrong';
};

export const useAppStore = create((set, get) => ({
  token: localStorage.getItem('auth-token') || '',
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
  bootstrapping: false,
  cartLoadingProductId: '',
  checkoutLoading: false,
  adminLoading: false,
  error: '',

  setError: (error) => set({ error }),
  clearError: () => set({ error: '' }),

  setAuth: (token, user) => {
    if (token) {
      localStorage.setItem('auth-token', token);
    } else {
      localStorage.removeItem('auth-token');
    }

    set({ token, user });
  },

  bootstrapAuth: async () => {
    const token = localStorage.getItem('auth-token');

    if (!token) {
      return;
    }

    set({ bootstrapping: true });

    try {
      const { data } = await api.get('/auth/me');
      set({
        token,
        user: data.user,
        bootstrapping: false
      });
      await get().loadCart();
      await get().loadOrders();
      if (data.user?.role === 'admin') {
        await get().loadAdminOrders();
      }
    } catch (error) {
      localStorage.removeItem('auth-token');
      set({
        token: '',
        user: null,
        bootstrapping: false,
        cart: { items: [] },
        orders: [],
        adminOrders: { pendingOrders: [], deliveredOrders: [] }
      });
    }
  },

  register: async (payload) => {
    try {
      set({ loading: true, error: '' });
      const { data } = await api.post('/auth/register', payload);
      get().setAuth(data.token, data.user);
      await get().loadCart();
      await get().loadOrders();
      if (data.user?.role === 'admin') {
        await get().loadAdminOrders();
      }
      set({ loading: false });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message });
      throw error;
    }
  },

  login: async (payload) => {
    try {
      set({ loading: true, error: '' });
      const { data } = await api.post('/auth/login', payload);
      get().setAuth(data.token, data.user);
      await get().loadCart();
      await get().loadOrders();
      if (data.user?.role === 'admin') {
        await get().loadAdminOrders();
      }
      set({ loading: false });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth-token');
    set({
      token: '',
      user: null,
      cart: { items: [] },
      orders: [],
      adminOrders: { pendingOrders: [], deliveredOrders: [] },
      coupon: null,
      error: ''
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
      set({ loading: true, error: '' });
      const { data } = await api.get(`/products/${id}`);
      set({ product: data.product, loading: false });
      return data.product;
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  loadCart: async () => {
    try {
      if (!get().token && !localStorage.getItem('auth-token')) {
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
      if (!get().token && !localStorage.getItem('auth-token')) {
        return;
      }

      const { data } = await api.get('/orders/mine');
      set({ orders: data.orders || [] });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  }
}));
