export const CardSkeleton = () => (
  <div className="animate-pulse rounded-[1.75rem] border border-white/70 bg-white p-4 shadow-[0_16px_50px_rgba(9,17,31,0.06)]">
    <div className="h-44 rounded-2xl bg-slate-200" />
    <div className="mt-4 h-4 w-2/3 rounded-full bg-slate-200" />
    <div className="mt-3 h-3 w-full rounded-full bg-slate-200" />
    <div className="mt-2 h-3 w-5/6 rounded-full bg-slate-200" />
    <div className="mt-5 flex items-center justify-between">
      <div className="h-6 w-20 rounded-full bg-slate-200" />
      <div className="h-10 w-28 rounded-full bg-slate-200" />
    </div>
  </div>
);

export const PageSkeleton = ({ rows = 4 }) => (
  <div className="grid gap-4">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="animate-pulse rounded-[1.5rem] border border-white/70 bg-white p-4">
        <div className="h-5 w-1/3 rounded-full bg-slate-200" />
        <div className="mt-3 h-4 w-3/4 rounded-full bg-slate-200" />
      </div>
    ))}
  </div>
);
