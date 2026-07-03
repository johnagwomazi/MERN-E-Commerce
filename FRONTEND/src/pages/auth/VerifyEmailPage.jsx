import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, LoaderCircle, TriangleAlert } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import AuthButton from '@/components/auth/AuthButton';
import { useAppStore } from '@/context/useAppStore';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const verifyEmail = useAppStore((state) => state.verifyEmail);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const authNotice = useAppStore((state) => state.authNotice);
  const [state, setState] = useState('loading');

  useEffect(() => {
    const run = async () => {
      try {
        await verifyEmail(token);
        setState('success');
        navigate('/verify-email/success', { replace: true });
      } catch {
        setState('failed');
        navigate('/verify-email/failed', { replace: true });
      }
    };

    run();
  }, [navigate, token, verifyEmail]);

  return (
    <AuthLayout
      eyebrow="Email verification"
      title="Confirm your email address"
      description="We’re checking your verification link now. Once confirmed, your account will be unlocked for normal sign-in."
      sideTitle="Verification status"
      sideCopy="If the link has expired, you can request a new one from the pending verification page without starting over."
    >
      <AuthCard>
        <div className="space-y-6 text-center">
          {state === 'loading' ? (
            <>
              <LoaderCircle className="mx-auto animate-spin text-[#6d4df2]" size={40} />
              <div>
                <h2 className="text-2xl font-black text-ink">Checking link</h2>
                <p className="mt-2 text-sm text-ink/60">One moment while we validate your account.</p>
              </div>
            </>
          ) : null}

          {state === 'success' ? (
            <>
              <CheckCircle2 className="mx-auto text-emerald-600" size={44} />
              <div>
                <h2 className="text-2xl font-black text-ink">Email verified</h2>
                <p className="mt-2 text-sm text-ink/60">{authNotice || 'Your account is ready to use.'}</p>
              </div>
              <AuthButton type="button" onClick={() => navigate('/login')}>
                Continue to sign in
              </AuthButton>
            </>
          ) : null}

          {state === 'failed' ? (
            <>
              <TriangleAlert className="mx-auto text-rose-600" size={44} />
              <div>
                <h2 className="text-2xl font-black text-ink">Verification failed</h2>
                <p className="mt-2 text-sm text-ink/60">{error || 'This verification link is invalid or expired.'}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/verify-email/pending" className="flex-1 rounded-full bg-[#111827] px-5 py-3.5 text-center text-sm font-semibold text-white">
                  Resend verification
                </Link>
                <Link to="/login" className="flex-1 rounded-full border border-ink/10 px-5 py-3.5 text-center text-sm font-semibold text-ink">
                  Back to sign in
                </Link>
              </div>
            </>
          ) : null}

          {loading ? null : null}
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
