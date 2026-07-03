import { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const clearCart = useAppStore((state) => state.clearCart);

  useEffect(() => {
    const finishOrder = async () => {
      await clearCart();
      const timer = setTimeout(() => navigate('/'), 1500);
      return () => clearTimeout(timer);
    };

    finishOrder();
  }, [clearCart, navigate]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full rounded-[2rem] border border-white/70 bg-white p-10 shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Payment confirmed</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink">Your order is complete.</h1>
        <p className="mt-4 text-lg leading-8 text-ink/70">The backend verified your Paystack transaction and the cart has been cleared safely.</p>
        <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-green-700">
          Payment successful, thank you for your order
        </p>
        {reference ? <p className="mt-6 rounded-2xl bg-paper px-4 py-3 text-ink">Reference: <span className="font-semibold">{reference}</span></p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-[#6d4df2] px-6 py-3 font-semibold text-white">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
