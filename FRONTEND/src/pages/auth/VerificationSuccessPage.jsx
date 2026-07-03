import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';

const VerificationSuccessPage = () => {
  return (
    <AuthLayout
      eyebrow="Verification complete"
      title="Your account is active"
      description="Everything is ready. You can now sign in and continue shopping or managing the store."
      sideTitle="Ready to go"
      sideCopy="The account is verified and ready for secure sign-in."
    >
      <AuthCard>
        <div className="space-y-6 text-center">
          <CheckCircle2 className="mx-auto text-emerald-600" size={44} />
          <div>
            <h2 className="text-2xl font-black text-ink">Email verified successfully</h2>
            <p className="mt-2 text-sm text-ink/60">You can sign in with your new account now.</p>
          </div>
          <Link to="/login" className="block rounded-full bg-[#111827] px-5 py-3.5 text-sm font-semibold text-white">
            Continue to sign in
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default VerificationSuccessPage;
