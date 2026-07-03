import { useEffect, useState } from 'react';
import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const token = useAppStore((state) => state.token);
  const login = useAppStore((state) => state.login);
  const register = useAppStore((state) => state.register);
  const loadOrders = useAppStore((state) => state.loadOrders);
  const orders = useAppStore((state) => state.orders);
  const error = useAppStore((state) => state.error);
  const loading = useAppStore((state) => state.loading);
  const [mode, setMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (token) loadOrders();
  }, [token, loadOrders]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === 'register') {
      await register(authForm);
      navigate('/dashboard');
      return;
    }
    await login({ email: authForm.email, password: authForm.password });
    navigate('/dashboard');
  };

 if (!user) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl place-items-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_24px_80px_rgba(9,17,31,0.08)]"
      >
        <h1 className="text-3xl font-black">
          {mode === 'register' ? 'Create your account' : 'Welcome back'}
        </h1>

        {error ? (
          <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : null}

        {mode === 'register' ? (
          <input
            className="mt-6 w-full rounded-2xl border p-4"
            placeholder="Full name"
            value={authForm.name}
            onChange={(e) =>
              setAuthForm({ ...authForm, name: e.target.value })
            }
          />
        ) : null}

        <input
          className="mt-4 w-full rounded-2xl border p-4"
          type="email"
          placeholder="Email"
          value={authForm.email}
          onChange={(e) =>
            setAuthForm({ ...authForm, email: e.target.value })
          }
        />

        <input
          className="mt-4 w-full rounded-2xl border p-4"
          type="password"
          placeholder="Password"
          value={authForm.password}
          onChange={(e) =>
            setAuthForm({ ...authForm, password: e.target.value })
          }
        />

        <button
          disabled={loading}
          className="mt-6 w-full rounded-full bg-[#6d4df2] px-5 py-4 font-semibold text-white"
        >
          {loading
            ? 'Please wait...'
            : mode === 'register'
            ? 'Sign up'
            : 'Login'}
        </button>
      </form>
    </div>
  );
}

  const totalSpend = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#7a5af8_0%,#b46ff7_52%,#ff7aa8_100%)] p-8 text-white shadow-[0_24px_80px_rgba(109,77,242,0.25)]">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Dashboard</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Welcome back, {user.name}.</h1>
        <p className="mt-4 max-w-2xl leading-8 text-white/80">Role: {user.role}. Your cart, payment verification, and order history are connected to the backend in real time.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">Orders</p>
            <p className="mt-2 text-3xl font-bold">{orders.length}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">Total spend</p>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(totalSpend)}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">Email</p>
            <p className="mt-2 text-lg font-semibold">{user.email}</p>
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Order history</p>
            <h2 className="text-2xl font-black text-ink">Recent purchases</h2>
          </div>
          <button type="button" onClick={loadOrders} className="rounded-full bg-[#6d4df2] px-4 py-2 text-sm font-semibold text-white">Refresh</button>
        </div>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="rounded-2xl bg-paper px-4 py-3 text-ink/60">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="rounded-3xl border border-ink/10 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-ink">Ref: {order.paymentReference}</p>
                    <p className="text-sm text-ink/60">{order.deliveryAddress}</p>
                    <p className="text-sm text-ink/60">
                      Status: {order.delivered ? 'Delivered' : order.paid ? 'Paid' : order.paymentStatus}
                    </p>
                  </div>
                  <div className="text-sm text-ink/60">
                    <p>Total: {formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 rounded-2xl bg-paper p-4">
                  {order.items.map((item) => (
                    <div key={item.productId?._id} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-ink/70">
                        {item.productId?.name} x {item.quantity}
                      </span>
                      <span className="font-medium text-ink">
                        {formatCurrency((item.priceAtPurchase || item.productId?.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/cart" className="rounded-full bg-paper px-5 py-3 font-semibold text-ink">Go to cart</Link>
          {user.role === 'admin' || user.role === 'manager' ? (
            <Link to="/admin" className="rounded-full bg-[#6d4df2] px-5 py-3 font-semibold text-white">
              Admin dashboard
            </Link>
          ) : null}
          {user.role === 'admin' ? (
            <Link to="/admin/orders" className="rounded-full bg-[#6d4df2] px-5 py-3 font-semibold text-white">
              Orders
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
