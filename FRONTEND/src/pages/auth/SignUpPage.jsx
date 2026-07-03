import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import PasswordInput from '@/components/auth/PasswordInput';
import AuthButton from '@/components/auth/AuthButton';
import { useToast } from '@/components/ToastProvider';
import { usePasswordStrength } from '@/hooks/usePasswordStrength';
import { useAppStore } from '@/context/useAppStore';

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const SignUpPage = () => {
  const navigate = useNavigate();
  const { success } = useToast();
  const register = useAppStore((state) => state.register);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const authNotice = useAppStore((state) => state.authNotice);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const strength = usePasswordStrength(form.password);

  const fieldErrors = useMemo(() => {
    const issues = {};

    if (form.confirmPassword && form.password !== form.confirmPassword) {
      issues.confirmPassword = 'Passwords do not match';
    }

    if (form.password && !passwordRule.test(form.password)) {
      issues.password = 'Use 8+ chars with upper, lower, number, and symbol';
    }

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      issues.email = 'Enter a valid email address';
    }

    return issues;
  }, [form.confirmPassword, form.email, form.password]);

  const submit = async (event) => {
    event.preventDefault();
    const data = await register(form);
    success(data.message || 'Account created. Check your inbox to verify your email.');
    navigate('/verify-email/pending', { replace: true, state: { email: form.email } });
  };

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Build your account in under a minute"
      description="The signup flow is designed for modern SaaS and e-commerce users with strong password rules, verification, and helpful real-time guidance."
      sideTitle="Verification first"
      sideCopy="Every new account is verified before sign-in. That keeps fraud down, improves deliverability, and makes your customer experience more trustworthy."
    >
      <AuthCard>
        <form onSubmit={submit} className="space-y-5" aria-label="Sign up form">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-ink/45">New account</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Sign up</h2>
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
            label="Full name"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Your name"
            required
          />

          <AuthInput
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            required
            error={fieldErrors.email}
          />

          <PasswordInput
            label="Password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Create a strong password"
            required
            hint="Use 8+ characters with uppercase, lowercase, number, and symbol."
            error={fieldErrors.password}
          />

          <div className="rounded-2xl border border-ink/10 bg-paper/70 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">Password strength</span>
              <span className="font-semibold text-[#6d4df2]">{strength.label}</span>
            </div>
            <div className="h-2 rounded-full bg-ink/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#111827] via-[#6d4df2] to-[#ff7aa8] transition-all"
                style={{ width: `${Math.max(strength.score * 100, 8)}%` }}
              />
            </div>
            <div className="mt-3 grid gap-2 text-xs text-ink/65 sm:grid-cols-2">
              {strength.checklist.map((item) => (
                <div key={item.label} className={`rounded-xl px-3 py-2 ${item.satisfied ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-ink/50'}`}>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <PasswordInput
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            placeholder="Re-enter your password"
            required
            error={fieldErrors.confirmPassword}
          />

          <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-paper/70 p-4 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(event) => setForm((current) => ({ ...current, termsAccepted: event.target.checked }))}
              className="mt-1 h-4 w-4 rounded border-ink/20 text-[#6d4df2] focus:ring-[#6d4df2]"
              required
            />
            <span>
              I agree to the{' '}
              <a href="#" className="font-semibold text-[#6d4df2] hover:underline">
                Terms and Conditions
              </a>{' '}
              and acknowledge the{' '}
              <a href="#" className="font-semibold text-[#6d4df2] hover:underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>

          <AuthButton loading={loading} type="submit" disabled={!form.termsAccepted || !!fieldErrors.email || !!fieldErrors.password || !!fieldErrors.confirmPassword}>
            Create account
          </AuthButton>

          <p className="text-center text-sm text-ink/60">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#6d4df2] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default SignUpPage;

