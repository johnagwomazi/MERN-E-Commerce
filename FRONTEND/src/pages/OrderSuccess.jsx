import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const verifyOrder = useAppStore((state) => state.verifyOrder);
  const clearCoupon = useAppStore((state) => state.clearCoupon);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    let timer;
    let isMounted = true;

    const finishOrder = async () => {
      if (!reference) {
        setStatus('error');
        setMessage('Missing payment reference. Please contact support if you were charged.');
        return;
      }

      try {
        await verifyOrder(reference);
        clearCoupon();
        if (!isMounted) {
          return;
        }
        setStatus('success');
        setMessage('Payment successful. Your order has been verified.');
        timer = window.setTimeout(() => navigate('/'), 1800);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const fallbackMessage =
          error?.response?.data?.message ||
          error?.message ||
          "We couldn't verify this payment automatically.";
        setStatus('error');
        setMessage(fallbackMessage);
      }
    };

    finishOrder();

    return () => {
      isMounted = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [clearCoupon, navigate, reference, verifyOrder]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full rounded-[2rem] border border-white/70 bg-white p-10 shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-ink/45">
          {status === 'error' ? 'Verification needed' : status === 'success' ? 'Payment confirmed' : 'Checking payment'}
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink">
          {status === 'success' ? 'Your order is complete.' : status === 'error' ? 'We could not verify this order yet.' : 'Please wait while we verify your payment.'}
        </h1>
        <p className="mt-4 text-lg leading-8 text-ink/70">{message}</p>
        {status === 'success' ? (
          <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-green-700">
            Payment successful, thank you for your order
          </p>
        ) : status === 'error' ? (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-rose-700">
            If you were charged, please contact support with your transaction reference.
          </p>
        ) : (
          <p className="mt-4 rounded-2xl bg-paper px-4 py-3 text-ink/70">
            Finalizing your order securely...
          </p>
        )}
        {reference ? <p className="mt-6 rounded-2xl bg-paper px-4 py-3 text-ink">Reference: <span className="font-semibold">{reference}</span></p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-[#6d4df2] px-6 py-3 font-semibold text-white">Continue shopping</Link>
          {status === 'error' ? <Link to="/cart" className="rounded-full bg-paper px-6 py-3 font-semibold text-ink">Back to cart</Link> : null}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
