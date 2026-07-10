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
  const [expandedOrderId, setExpandedOrderId] = useState('');

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

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setExpandedOrderId('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="sticky top-3 z-20 -mx-4 px-4 py-2 sm:static sm:mx-0 sm:px-0 sm:py-0">
        <div className="grid grid-cols-2 rounded-2xl bg-white p-1.5 shadow-[0_18px_60px_rgba(9,17,31,0.08)] sm:flex sm:gap-2 sm:rounded-full sm:p-2">
          <button
            type="button"
            onClick={() => handleTabChange('pending')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors sm:rounded-full sm:px-5 ${
              tab === 'pending' ? 'bg-[#6d4df2] text-white' : 'text-ink/60'
            }`}
          >
            Pending / Paid Orders
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('delivered')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors sm:rounded-full sm:px-5 ${
              tab === 'delivered' ? 'bg-[#6d4df2] text-white' : 'text-ink/60'
            }`}
          >
            Delivered Orders
          </button>
        </div>
      </div>

      {error ? <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}

      <div className="mt-6 space-y-4 sm:mt-6">
        {adminLoading ? (
          <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 text-ink/60">Loading orders...</div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 text-ink/60">No orders found.</div>
        ) : (
          <>
            <div className="space-y-3 sm:hidden">
              {visibleOrders.map((order) => {
                const isExpanded = expandedOrderId === order._id;

                return (
                  <div key={order._id} className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white shadow-[0_18px_60px_rgba(9,17,31,0.08)]">
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId((current) => (current === order._id ? '' : order._id))}
                      className="flex w-full flex-col gap-2 px-4 py-4 text-left"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <p className="text-[11px] uppercase tracking-[0.3em] text-ink/45">Customer</p>
                          <h3 className="truncate text-base font-black text-ink">
                            {order.userId?.name || 'Unknown customer'}
                          </h3>
                          <p className="truncate text-sm text-ink/60">{order.userId?.email}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${tab === 'delivered' || order.delivered ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {tab === 'delivered' || order.delivered ? 'Delivered' : 'Pending'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-ink/70">
                        <div className="rounded-2xl bg-paper px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.25em] text-ink/40">Total</p>
                          <p className="mt-1 text-lg font-black text-ink">{formatCurrency(order.totalAmount)}</p>
                        </div>
                        <div className="rounded-2xl bg-paper px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.25em] text-ink/40">Items</p>
                          <p className="mt-1 text-lg font-black text-ink">{order.items.length}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-1 text-sm text-ink/60">
                        <p className="truncate">Email: {order.userId?.email}</p>
                        <p className="truncate">City: {order.customerCity || 'N/A'}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6d4df2]">
                          {isExpanded ? 'Hide details' : 'View details'}
                        </span>
                        <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/70">
                          {isExpanded ? '-' : '+'}
                        </span>
                      </div>
                    </button>

                    {isExpanded ? (
                      <div className="border-t border-slate-100 px-4 py-4">
                        <div className="space-y-3 text-sm text-ink/70">
                          <div className="rounded-2xl bg-paper px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-ink/40">Checkout name</p>
                            <p className="mt-1 font-medium text-ink">{order.customerName || 'N/A'}</p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-paper px-4 py-3">
                              <p className="text-[11px] uppercase tracking-[0.25em] text-ink/40">Phone</p>
                              <p className="mt-1 font-medium text-ink">{order.customerPhone || 'N/A'}</p>
                            </div>
                            <div className="rounded-2xl bg-paper px-4 py-3">
                              <p className="text-[11px] uppercase tracking-[0.25em] text-ink/40">Order date</p>
                              <p className="mt-1 font-medium text-ink">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="rounded-2xl bg-paper px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-ink/40">Full address</p>
                            <p className="mt-1 leading-relaxed text-ink">{order.customerAddress || 'N/A'}</p>
                          </div>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink/40">Product list</p>
                            <div className="mt-3 space-y-3">
                              {order.items.map((item) => (
                                <div key={item.productId?._id || item._id || `${order._id}-${item.quantity}`} className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-3 sm:flex-row sm:items-center">
                                  <img
                                    src={item.productId?.image}
                                    alt={item.productId?.name}
                                    className="h-24 w-full rounded-xl object-cover sm:h-14 sm:w-14"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-ink">{item.productId?.name}</p>
                                    <p className="text-xs text-ink/50">Qty {item.quantity}</p>
                                  </div>
                                  <span className="text-sm font-semibold text-ink">
                                    {formatCurrency((item.priceAtPurchase || 0) * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                            <p className="text-sm font-semibold text-ink">Total amount</p>
                            <p className="text-lg font-black text-ink">{formatCurrency(order.totalAmount)}</p>
                          </div>

                          {tab === 'pending' ? (
                            <button
                              type="button"
                              onClick={() => markOrderDelivered(order._id)}
                              className="mt-2 w-full rounded-full bg-[#6d4df2] px-5 py-3 font-semibold text-white"
                            >
                              Mark Delivered
                            </button>
                          ) : (
                            <span className="mt-2 flex w-full items-center justify-center rounded-full bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                              Delivered
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="hidden space-y-4 sm:block">
              {visibleOrders.map((order) => (
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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
