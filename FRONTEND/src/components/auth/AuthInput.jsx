const AuthInput = ({ label, hint, error, className = '', ...props }) => {
  const inputId = props.id || props.name;

  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <input
        id={inputId}
        {...props}
        className="w-full rounded-2xl border border-ink/10 bg-paper/80 px-4 py-3 text-ink outline-none transition placeholder:text-ink/35 focus:border-[#6d4df2] focus:bg-white focus:ring-4 focus:ring-[#6d4df2]/10"
      />
      {hint ? <span className="mt-2 block text-xs text-ink/45">{hint}</span> : null}
      {error ? <span className="mt-2 block text-sm font-medium text-rose-600">{error}</span> : null}
    </label>
  );
};

export default AuthInput;

