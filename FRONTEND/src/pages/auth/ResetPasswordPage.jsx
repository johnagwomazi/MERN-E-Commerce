import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import PasswordInput from '@/components/auth/PasswordInput';
import AuthButton from '@/components/auth/AuthButton';
import { useToast } from '@/components/ToastProvider';
import { useAppStore } from '@/context/useAppStore';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();
  const resetPassword = useAppStore((state) => state.resetPassword);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const authNotice = useAppStore((state) => state.authNotice);
  const [form, setForm] = useState({ password: '', confirmPassword: '' });

  const submit = async (event) => {
    event.preventDefault();
    const data = await resetPassword(token, form);
    success(data.message || 'Password reset.');
    navigate('/login', { replace: true });
  };

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Choose a new password"
      description="Finish recovery by setting a strong new password. Once updated, any old session tokens are invalidated automatically."
      sideTitle="Security update"
      sideCopy="Password resets rotate session state, so compromised tokens won’t remain valid after the change."
    >
      <AuthCard>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-ink/45">New credentials</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Reset password</h2>
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

          <PasswordInput
            label="New password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Create a new password"
            required
          />

          <PasswordInput
            label="Confirm new password"
            name="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            placeholder="Confirm your new password"
            required
          />

          <AuthButton loading={loading} type="submit">
            Update password
          </AuthButton>

          <p className="text-center text-sm text-ink/60">
            Remembered it?{' '}
            <Link to="/login" className="font-semibold text-[#6d4df2] hover:underline">
              Return to sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default ResetPasswordPage;

