import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';

const VerificationFailedPage = () => {
  return (
    <AuthLayout
      eyebrow="Verification failed"
      title="That link no longer works"
      description="Verification links can expire. Request a fresh one and we’ll get you back on track."
      sideTitle="Try again"
      sideCopy="Use the resend page to get a brand-new verification link."
    >
      <AuthCard>
        <div className="space-y-6 text-center">
          <TriangleAlert className="mx-auto text-rose-600" size={44} />
          <div>
            <h2 className="text-2xl font-black text-ink">Verification failed</h2>
            <p className="mt-2 text-sm text-ink/60">Your link may have expired or already been used.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/verify-email/pending" className="flex-1 rounded-full bg-[#111827] px-5 py-3.5 text-center text-sm font-semibold text-white">
              Resend verification
            </Link>
            <Link to="/login" className="flex-1 rounded-full border border-ink/10 px-5 py-3.5 text-center text-sm font-semibold text-ink">
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default VerificationFailedPage;
