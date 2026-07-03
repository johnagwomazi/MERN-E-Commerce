const SectionTitle = ({ eyebrow, title, action }) => (
  <div className="mb-5 flex items-end justify-between gap-4">
    <div>
      <p className="text-xs uppercase tracking-[0.35em] text-ink/45">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">{title}</h2>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export default SectionTitle;
