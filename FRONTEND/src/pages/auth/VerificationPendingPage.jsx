import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { useAppStore } from '@/context/useAppStore';

const VerificationPendingPage = () => {
  const location = useLocation();
  const sendVerificationEmail = useAppStore((state) => state.sendVerificationEmail);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const authNotice = useAppStore((state) => state.authNotice);
  const [email, setEmail] = useState(location.state?.email || '');

  const submit = async (event) => {
    event.preventDefault();
    await sendVerificationEmail({ email });
  };

  return (
    <AuthLayout
      eyebrow="Pending verification"
      title="Check your inbox"
      description="Your account was created, but you need to verify your email before signing in. We can resend the link if needed."
      sideTitle="No dead ends"
      sideCopy="The pending page makes verification recoverable, so expired links and missed emails don’t trap new users."
    >
      <AuthCard>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-ink/45">Next step</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Verify your email</h2>
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
            Resend verification email
          </AuthButton>

          <p className="text-center text-sm text-ink/60">
            Already verified?{' '}
            <Link to="/login" className="font-semibold text-[#6d4df2] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default VerificationPendingPage;

