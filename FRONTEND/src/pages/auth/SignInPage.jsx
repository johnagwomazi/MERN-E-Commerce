import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import PasswordInput from '@/components/auth/PasswordInput';
import AuthButton from '@/components/auth/AuthButton';
import { useToast } from '@/components/ToastProvider';
import { useAppStore } from '@/context/useAppStore';

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: showError } = useToast();
  const login = useAppStore((state) => state.login);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const authNotice = useAppStore((state) => state.authNotice);
  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: true
  });

  const redirectTo = location.state?.from?.pathname || '/';

  const submit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      success('Welcome back. You are signed in.');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to sign in right now.';
      showError(message);

      if (/verify your email/i.test(message)) {
        navigate('/verify-email/pending', {
          replace: true,
          state: { email: form.email }
        });
      }
    }
  };

  return (
    <AuthLayout
      eyebrow="Sign in"
      title="Welcome back to your account"
      description="Access your orders, cart, and admin tools with a secure sign-in experience that feels polished on every device."
      sideTitle="Secure access"
      sideCopy="We keep sessions tidy with refresh tokens, remember-me storage, and verification-aware sign-in so your account stays safer without adding friction."
    >
      <AuthCard>
        <form onSubmit={submit} className="space-y-5" aria-label="Sign in form">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-ink/45">Account access</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Sign in</h2>
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
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            required
          />

          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Enter your password"
            required
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-3 text-sm font-medium text-ink/75">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(event) => setForm((current) => ({ ...current, rememberMe: event.target.checked }))}
                className="h-4 w-4 rounded border-ink/20 text-[#6d4df2] focus:ring-[#6d4df2]"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm font-semibold text-[#6d4df2] hover:underline">
              Forgot password?
            </Link>
          </div>

          <AuthButton loading={loading} type="submit">
            Sign in
          </AuthButton>

          <p className="text-center text-sm text-ink/60">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-[#6d4df2] hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default SignInPage;
