import { ShieldCheck, Sparkles } from 'lucide-react';

const AuthLayout = ({ eyebrow, title, description, children, sideTitle, sideCopy }) => {
  return (
    <div className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(109,77,242,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,122,168,0.18),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
      <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.09)] backdrop-blur-xl sm:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#6d4df2]/10 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-ink/50">
              <Sparkles size={12} />
              {eyebrow}
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-ink sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-ink/65 sm:text-lg">{description}</p>
            <div className="mt-8 rounded-[1.75rem] border border-ink/10 bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#6d4df2] p-6 text-white shadow-[0_24px_70px_rgba(17,24,39,0.18)]">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white/10 p-3">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
                    {sideTitle}
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-white/80">{sideCopy}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section>{children}</section>
      </div>
    </div>
  );
};

export default AuthLayout;

