import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import axios from 'axios';
import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';

const Checkout = () => {
  const navigate = useNavigate();
  const cart = useAppStore((state) => state.cart);
  const user = useAppStore((state) => state.user);
  const initializeOrder = useAppStore((state) => state.initializeOrder);
  const verifyOrder = useAppStore((state) => state.verifyOrder);
  const clearCoupon = useAppStore((state) => state.clearCoupon);
  const checkoutLoading = useAppStore((state) => state.checkoutLoading);
  const items = cart?.items || [];
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', address: '', city: '', phone: '' });

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0), [items]);
  const reference = `PSP_TXN_${Date.now()}`;
  const amount = Math.round(subtotal * 100);
  const paystack = usePaystackPayment({ reference, email: user?.email || '', amount, publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '' });

  const submit = async (event) => {
    event.preventDefault();
    await initializeOrder({
      paymentReference: reference,
      deliveryAddress: `${form.address}, ${form.city}. ${form.phone}`,
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      customerCity: form.city,
      customerAddress: form.address
    });
    paystack({
      onSuccess: async () => {
        await verifyOrder(reference);
        clearCoupon();
        await useAppStore.getState().clearCart();
        navigate('/order-success?reference=' + reference);
      },
      onClose: async () => {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
        await axios.post(`${baseURL}/orders/cancel/${reference}`, {}, { withCredentials: true });
      }
    });
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
        <button disabled={checkoutLoading || !items.length} className="rounded-full bg-[#6d4df2] px-5 py-4 font-semibold text-white">{checkoutLoading ? 'Processing...' : 'Pay Now'}</button>
      </form>
      <aside className="rounded-[1.5rem] border border-white/70 bg-white p-6">
        <h2 className="text-xl font-bold">Order summary</h2>
        <div className="mt-4 space-y-3">
          {items.map((item) => <div key={item.productId?._id} className="flex justify-between text-sm"><span>{item.productId?.name} x {item.quantity}</span><span>{formatCurrency((item.productId?.price || 0) * item.quantity)}</span></div>)}
        </div>
        <div className="mt-4 border-t pt-4 font-bold flex justify-between"><span>Total</span><span>{formatCurrency(subtotal)}</span></div>
      </aside>
    </div>
  );
};

export default Checkout;
