import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';

const Dashboard = () => {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const loadOrders = useAppStore((state) => state.loadOrders);
  const orders = useAppStore((state) => state.orders);
  const loading = useAppStore((state) => state.loading);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders]);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const totalSpend = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#111827_0%,#6d4df2_52%,#ff7aa8_100%)] p-8 text-white shadow-[0_24px_80px_rgba(109,77,242,0.25)]">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Dashboard</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Welcome back, {user.name}.</h1>
        <p className="mt-4 max-w-2xl leading-8 text-white/80">
          Your cart, payment verification, and order history are connected to the backend in real time.
        </p>
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
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="rounded-full bg-[#6d4df2] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Refresh
          </button>
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
          <Link to="/cart" className="rounded-full bg-paper px-5 py-3 font-semibold text-ink">
            Go to cart
          </Link>
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

