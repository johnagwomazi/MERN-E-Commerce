import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';

const AdminOrders = () => {
  const loadAdminOrders = useAppStore((state) => state.loadAdminOrders);
  const markOrderDelivered = useAppStore((state) => state.markOrderDelivered);
  const adminOrders = useAppStore((state) => state.adminOrders);
  const adminLoading = useAppStore((state) => state.adminLoading);
  const error = useAppStore((state) => state.error);
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    loadAdminOrders();
  }, [loadAdminOrders]);

  const { pendingOrders, deliveredOrders } = useMemo(
    () => ({
      pendingOrders: adminOrders?.pendingOrders || [],
      deliveredOrders: adminOrders?.deliveredOrders || []
    }),
    [adminOrders]
  );

  const visibleOrders = tab === 'delivered' ? deliveredOrders : pendingOrders;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#7a5af8_0%,#b46ff7_52%,#ff7aa8_100%)] p-8 text-white shadow-[0_24px_80px_rgba(109,77,242,0.25)]">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Admin Orders</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Pending and delivered orders.</h1>
        <p className="mt-4 max-w-2xl text-white/80">Track paid orders, move completed orders to delivered, and keep the workflow organized.</p>
        <div className="mt-6">
          <Link
            to="/admin"
            className="inline-flex rounded-full bg-white px-5 py-3 font-semibold text-[#6d4df2]"
          >
            Add New Product
          </Link>
        </div>
      </div>

      <div className="mt-6 flex gap-2 rounded-full bg-white p-2 shadow-[0_18px_60px_rgba(9,17,31,0.08)]">
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`rounded-full px-5 py-3 text-sm font-semibold ${tab === 'pending' ? 'bg-[#6d4df2] text-white' : 'text-ink/60'}`}
        >
          Pending / Paid Orders
        </button>
        <button
          type="button"
          onClick={() => setTab('delivered')}
          className={`rounded-full px-5 py-3 text-sm font-semibold ${tab === 'delivered' ? 'bg-[#6d4df2] text-white' : 'text-ink/60'}`}
        >
          Delivered Orders
        </button>
      </div>

      {error ? <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}

      <div className="mt-6 space-y-4">
        {adminLoading ? (
          <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 text-ink/60">Loading orders...</div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 text-ink/60">No orders found.</div>
        ) : (
          visibleOrders.map((order) => (
            <div key={order._id} className="rounded-[1.5rem] border border-white/70 bg-white p-6 shadow-[0_18px_60px_rgba(9,17,31,0.08)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Customer</p>
                  <h3 className="text-xl font-bold text-ink">{order.userId?.name || 'Unknown customer'}</h3>
                  <p className="text-sm text-ink/60">{order.userId?.email}</p>
                  <p className="text-sm text-ink/60">Checkout name: {order.customerName}</p>
                  <p className="text-sm text-ink/60">Phone: {order.customerPhone}</p>
                  <p className="text-sm text-ink/60">City: {order.customerCity}</p>
                  <p className="text-sm text-ink/60">Address: {order.customerAddress}</p>
                  <p className="text-sm text-ink/60">Order date: {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-2 text-sm text-ink/70">
                  <p className="font-semibold text-ink">Items ordered</p>
                  {order.items.map((item) => (
                    <div key={item.productId?._id} className="flex items-center gap-4 rounded-2xl bg-paper p-3">
                      <img
                        src={item.productId?.image}
                        alt={item.productId?.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-ink">{item.productId?.name}</p>
                        <p className="text-xs text-ink/50">Qty {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-ink">
                        {formatCurrency((item.priceAtPurchase || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-ink/10 pt-3 font-bold text-ink">
                    Total: {formatCurrency(order.totalAmount)}
                  </div>
                </div>
                {tab === 'pending' ? (
                  <button
                    type="button"
                    onClick={() => markOrderDelivered(order._id)}
                    className="rounded-full bg-[#6d4df2] px-5 py-3 font-semibold text-white"
                  >
                    Done
                  </button>
                ) : (
                  <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                    Delivered
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
