import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Dashboard from '@/pages/Dashboard';
import OrderSuccess from '@/pages/OrderSuccess';
import AuthPage from '@/pages/AuthPage';
import AdminDashboard from '@/pages/AdminDashboard';
import Analytics from '@/pages/Analytics';
import AdminOrders from '@/pages/AdminOrders';
import People from '@/pages/People';
import PendingUploads from '@/pages/PendingUploads';

const App = () => {
  const bootstrapAuth = useAppStore((state) => state.bootstrapAuth);
  const loadProducts = useAppStore((state) => state.loadProducts);
  const token = useAppStore((state) => state.token);
  const loadCart = useAppStore((state) => state.loadCart);
  const user = useAppStore((state) => state.user);
  const loadAdminOrders = useAppStore((state) => state.loadAdminOrders);

  useEffect(() => {
    bootstrapAuth();
    loadProducts();
  }, [bootstrapAuth, loadProducts]);

  useEffect(() => {
    if (token || localStorage.getItem('auth-token')) {
      loadCart();
    }
  }, [token, loadCart]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminOrders();
    }
  }, [user, loadAdminOrders]);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-paper text-ink">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['manager', 'admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute roles={['manager', 'admin']}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute roles={['manager', 'admin']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/people"
              element={
                <ProtectedRoute roles={['admin']}>
                  <People />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pending-uploads"
              element={
                <ProtectedRoute roles={['admin']}>
                  <PendingUploads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-success"
              element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
