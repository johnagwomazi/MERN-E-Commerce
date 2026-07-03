import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { useToast } from '@/components/ToastProvider';
import { useAppStore } from '@/context/useAppStore';

const ForgotPasswordPage = () => {
  const { success } = useToast();
  const forgotPassword = useAppStore((state) => state.forgotPassword);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const authNotice = useAppStore((state) => state.authNotice);
  const [email, setEmail] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const data = await forgotPassword({ email });
    success(data.message || 'Reset instructions sent.');
  };

  return (
    <AuthLayout
      eyebrow="Password reset"
      title="Reset your password safely"
      description="We’ll send a time-limited reset link to your inbox. The flow is quick, private, and designed to recover accounts without exposing sensitive details."
      sideTitle="Recovery flow"
      sideCopy="Users can request a reset email, choose a new password, and continue working without manual support or account confusion."
    >
      <AuthCard>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-ink/45">Account recovery</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Forgot password</h2>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
              {error}
            </div>
          ) : null}

          {authNotice ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status">
              {authNotice}
            </div>
          ) : null}

          <AuthInput
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <AuthButton loading={loading} type="submit">
            Send reset link
          </AuthButton>

          <p className="text-center text-sm text-ink/60">
            Back to{' '}
            <Link to="/login" className="font-semibold text-[#6d4df2] hover:underline">
              sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

