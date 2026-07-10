import { useEffect, useMemo } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle2, ChevronDown, Clock, Clock3, DollarSign, Package, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';


const getOrderStatus = (order) => {
  if (order?.delivered) {
    return {
      label: 'Delivered',
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      dot: 'bg-emerald-500'
    };
  }

  return {
    label: 'Pending',
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-amber-500'
  };
};

const StatusBadge = ({ order }) => {
  const status = getOrderStatus(order);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
      {status.label}
    </span>
  );
};

const OrderSection = ({ title, icon: Icon, description, orders, expandedOrderId, onToggleOrder, resolveProduct }) => {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
      <div className="border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#6d4df2]/10 text-[#6d4df2]">
              <Icon size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-slate-900">No orders here yet</p>
            <p className="mt-1 text-sm text-slate-500">This section will update automatically as your order status changes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order._id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white transition-shadow hover:shadow-md">
                <button
                  type="button"
                  onClick={() => onToggleOrder(order._id)}
                  className="flex w-full flex-col gap-4 border-b border-slate-100 bg-slate-50/50 px-4 py-4 text-left transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  aria-expanded={expandedOrderId === order._id}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-bold text-slate-800">
                        Ref: {order.paymentReference || String(order._id || '').slice(-8)}
                      </p>
                      <StatusBadge order={order} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {order.deliveryAddress}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                        Total
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                      <ChevronDown size={18} className={`transition-transform duration-200 ${expandedOrderId === order._id ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </button>

                {expandedOrderId === order._id ? (
                  <div className="divide-y divide-slate-50 px-4 py-2 sm:px-5">
                    {order.items.map((item) => {
                      const product = resolveProduct(item);
                      const productKey = product?._id || item.productId?._id || item.productSnapshot?._id || `${order._id}-${item.quantity}`;

                      return (
                        <div key={productKey} className="flex items-center justify-between gap-4 py-3 text-sm">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 font-bold text-xs text-slate-600">
                              {item.quantity}x
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-800">
                                {product?.name || 'Product'}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {product?.category || 'Item from your order'}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 font-semibold text-slate-900">
                            {formatCurrency((item.priceAtPurchase || product?.price || 0) * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const Dashboard = () => {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const products = useAppStore((state) => state.products);
  const loadOrders = useAppStore((state) => state.loadOrders);
  const orders = useAppStore((state) => state.orders);
  const loading = useAppStore((state) => state.loading);
  const [expandedOrderId, setExpandedOrderId] = useState('');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders]);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const productsById = useMemo(() => {
    return (products || []).reduce((acc, product) => {
      if (product?._id) {
        acc[String(product._id)] = product;
      }
      return acc;
    }, {});
  }, [products]);

  const resolveProduct = (item) => {
    const productId = item?.productId?._id || item?.productId || item?.productSnapshot?._id || item?.productSnapshot?.id;
    const catalogProduct = productId ? productsById[String(productId)] : null;

    return catalogProduct || item?.productId || item?.productSnapshot || null;
  };

  const { pendingOrders, deliveredOrders, totalSpend } = useMemo(() => {
    const pending = orders.filter((order) => !order.delivered);
    const delivered = orders.filter((order) => Boolean(order.delivered));

    return {
      pendingOrders: pending,
      deliveredOrders: delivered,
      totalSpend: orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
    };
  }, [orders]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
     
<div className="relative overflow-hidden rounded-3xl bg-[#6d4df2] px-6 py-8 text-white shadow-[0_32px_96px_rgba(109,77,242,0.35)] sm:p-10 border border-white/15">
  {/* Modern High-End Ambient Mesh Background Effects */}
  <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-white/20 blur-[80px] pointer-events-none" />
  <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-white/10 blur-[100px] pointer-events-none" />
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_45%)] pointer-events-none" />

  <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
    
    {/* Left Column: Heading & Context */}
    <div className="lg:col-span-5 space-y-4">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
        <Package size={13} className="text-white/90" />
        Customer Workspace
      </span>
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Welcome back, <span className="text-white">{user.name}</span>
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
          Track your recent purchases, monitor pending items, and audit your verified digital billing history in real time.
        </p>
      </div>
    </div>

    {/* Right Column: High-Density Bento Grid Metrics */}
    <div className="lg:col-span-7 grid gap-4 grid-cols-2 sm:gap-5">
      
      {/* Total Orders Metric Card */}
      <div className="group relative rounded-2xl border border-white/20 bg-white/10 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/15">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">Total Orders</p>
          <div className="rounded-lg bg-white/10 p-1.5 text-white/90 transition-transform group-hover:scale-110">
            <Package size={16} />
          </div>
        </div>
        <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">{orders.length}</p>
      </div>

      {/* Pending Metric Card */}
      <div className="group relative rounded-2xl border border-white/20 bg-white/10 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/15">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">Pending</p>
          <div className="rounded-lg bg-white/10 p-1.5 text-white/90 transition-transform group-hover:scale-110">
            <Clock size={16} />
          </div>
        </div>
        <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">{pendingOrders.length}</p>
      </div>

      {/* Delivered Metric Card */}
      <div className="group relative rounded-2xl border border-white/20 bg-white/10 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/15">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">Delivered</p>
          <div className="rounded-lg bg-white/10 p-1.5 text-white/90 transition-transform group-hover:scale-110">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">{deliveredOrders.length}</p>
      </div>

      {/* Total Spend Metric Card (Spans full width on narrow screens to protect large currency texts) */}
      <div className="group relative col-span-2 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/15 sm:col-span-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">Total Spend</p>
          <div className="rounded-lg bg-white/10 p-1.5 text-white/90 transition-transform group-hover:scale-110">
            <DollarSign size={16} />
          </div>
        </div>
        <p className="mt-4 truncate text-2xl font-extrabold tracking-tight text-white lg:text-3xl" title={formatCurrency(totalSpend)}>
          {formatCurrency(totalSpend)}
        </p>
      </div>

    </div>
  </div>
</div>


      <section className="rounded-[2rem] border border-white/70 bg-white shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Order history</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Your recent purchases</h2>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6d4df2] px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#5b3ee0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <OrderSection
            title="Pending Orders"
            icon={Clock3}
            description="Orders that are not yet delivered."
            orders={pendingOrders}
            expandedOrderId={expandedOrderId}
            onToggleOrder={(orderId) => setExpandedOrderId((current) => (current === orderId ? '' : orderId))}
            resolveProduct={resolveProduct}
          />

          <OrderSection
            title="Delivered Orders"
            icon={CheckCircle2}
            description="Orders that have already been completed."
            orders={deliveredOrders}
            expandedOrderId={expandedOrderId}
            onToggleOrder={(orderId) => setExpandedOrderId((current) => (current === orderId ? '' : orderId))}
            resolveProduct={resolveProduct}
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
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
    </div>
  );
};

export default Dashboard;
