import { ShieldCheck, Sparkles } from 'lucide-react';

const AuthLayout = ({ eyebrow, title, description, children, sideTitle, sideCopy }) => {
  return (
    <div className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(109,77,242,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,122,168,0.18),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center justify-center">
        <section className="w-full max-w-[560px]">{children}</section>
      </div>
    </div>
  );
};

export default AuthLayout;
