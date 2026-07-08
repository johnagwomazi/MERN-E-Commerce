import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { calculateCartSummary, resolveCartItemProduct } from '@/utils/cartSummary';
import { getStoredAuthToken } from '@/utils/authStorage';
import { useToast } from '@/components/ToastProvider';

const Checkout = () => {
  const cart = useAppStore((state) => state.cart);
  const user = useAppStore((state) => state.user);
  const token = useAppStore((state) => state.token);
  const loadCart = useAppStore((state) => state.loadCart);
  const initializeOrder = useAppStore((state) => state.initializeOrder);
  const checkoutLoading = useAppStore((state) => state.checkoutLoading);
  const cartLoading = useAppStore((state) => state.cartLoading);
  const [hydratingCart, setHydratingCart] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', address: '', city: '', phone: '' });
  const { error: showError, toast } = useToast();

  useEffect(() => {
    let isActive = true;

    const refreshCart = async () => {
      if (!token && !getStoredAuthToken()) {
        return;
      }

      setHydratingCart(true);
      try {
        await loadCart();
      } finally {
        if (isActive) {
          setHydratingCart(false);
        }
      }
    };

    refreshCart().catch(() => {
      if (isActive) {
        setHydratingCart(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [loadCart, token]);

  const cartSummary = useMemo(() => calculateCartSummary(cart?.items || []), [cart]);
  const { items, subtotal, shippingFee, total } = cartSummary;
  const isLoadingCart = hydratingCart || cartLoading;
  const emptyCart = !isLoadingCart && !items.length;

  const submit = async (event) => {
    event.preventDefault();
    setCheckoutError('');

    if (isLoadingCart || !items.length) {
      const message = isLoadingCart
        ? 'Your cart is still loading. Please wait a moment.'
        : 'Your cart is empty. Add items before checkout.';
      setCheckoutError(message);
      showError(message);
      return;
    }

    if (!form.name || !form.email || !form.address || !form.city || !form.phone) {
      const message = 'Please complete all checkout fields.';
      setCheckoutError(message);
      showError(message);
      return;
    }

    try {
      const payload = {
        paymentReference: `PSP_TXN_${Date.now()}`,
        deliveryAddress: `${form.address}, ${form.city}. ${form.phone}`,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        customerCity: form.city,
        customerAddress: form.address
      };

      console.log('Payment payload:', payload);

      const { authorizationUrl, authorization_url, cartWarning } = await initializeOrder(payload);

      const redirectUrl = authorizationUrl || authorization_url;

      if (!redirectUrl) {
        throw new Error('Payment was initialized, but Paystack did not return a checkout URL.');
      }

      if (cartWarning) {
        toast(cartWarning, 'info');
      }

      toast('Redirecting you to Paystack to complete payment.', 'info');
      window.location.assign(redirectUrl);
      return;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'We could not start the payment process. Please try again.';
      setCheckoutError(message);
      showError(message);
      console.error('[checkout] payment initialization failed:', error);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={submit} className="space-y-4 rounded-[1.5rem] border border-white/70 bg-white p-6">
        <h1 className="text-3xl font-black">Checkout</h1>
        <input required className="w-full rounded-2xl border p-4" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required className="w-full rounded-2xl border p-4" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required className="w-full rounded-2xl border p-4" placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input required className="w-full rounded-2xl border p-4" placeholder="City / State" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input required className="w-full rounded-2xl border p-4" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {checkoutError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {checkoutError}
          </div>
        ) : null}
        <button disabled={checkoutLoading || isLoadingCart || !items.length} className="rounded-full bg-[#6d4df2] px-5 py-4 font-semibold text-white">
          {checkoutLoading ? 'Processing...' : isLoadingCart ? 'Loading cart...' : 'Pay Now'}
        </button>
      </form>
      <aside className="rounded-[1.5rem] border border-white/70 bg-white p-6">
        <h2 className="text-xl font-bold">Order summary</h2>
        {isLoadingCart ? (
          <div className="mt-4 rounded-2xl bg-paper px-4 py-3 text-sm text-ink/60">
            Loading your cart...
          </div>
        ) : emptyCart ? (
          <div className="mt-4 space-y-3">
            <p className="rounded-2xl bg-paper px-4 py-3 text-sm text-ink/60">
              Your cart is empty. Add products before checkout.
            </p>
            <Link to="/cart" className="inline-flex rounded-full bg-[#6d4df2] px-5 py-3 font-semibold text-white">
              Return to cart
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              {items.map((item) => {
                const product = item.product || resolveCartItemProduct(item);
                const key = product?._id || item.productId?._id || item.productId || item.productSnapshot?._id;

                return (
                  <div key={key} className="flex justify-between gap-4 text-sm">
                    <span className="min-w-0 flex-1 truncate">
                      {product?.name || 'Product'} x {item.quantity}
                    </span>
                    <span>{formatCurrency((Number(product?.price) || 0) * Number(item.quantity || 0))}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee > 0 ? formatCurrency(shippingFee) : 'Free'}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default Checkout;
