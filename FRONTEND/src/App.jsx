import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';
import { getStoredAuthToken } from '@/utils/authStorage';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ToastProvider } from '@/components/ToastProvider';
import Home from '@/pages/Home';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Dashboard from '@/pages/Dashboard';
import OrderSuccess from '@/pages/OrderSuccess';
import AuthPage from '@/pages/AuthPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import VerificationPendingPage from '@/pages/auth/VerificationPendingPage';
import VerificationSuccessPage from '@/pages/auth/VerificationSuccessPage';
import VerificationFailedPage from '@/pages/auth/VerificationFailedPage';
import AdminDashboard from '@/pages/AdminDashboard';
import Analytics from '@/pages/Analytics';
import AdminOrders from '@/pages/AdminOrders';
import People from '@/pages/People';
import PendingUploads from '@/pages/PendingUploads';
import AdminLayout from '@/components/admin/AdminLayout';

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
    if (token || getStoredAuthToken()) {
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
      <ToastProvider>
        <div className="flex min-h-screen flex-col bg-paper text-ink">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
              <Route path="/verify-email/pending" element={<VerificationPendingPage />} />
              <Route path="/verify-email/success" element={<VerificationSuccessPage />} />
              <Route path="/verify-email/failed" element={<VerificationFailedPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
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
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute roles={['manager', 'admin']}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <ProtectedRoute roles={['manager', 'admin']}>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="people"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <People />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="pending-uploads"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <PendingUploads />
                    </ProtectedRoute>
                  }
                />
              </Route>
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
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
