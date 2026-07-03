const AuthButton = ({ loading, children, className = '', ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(17,24,39,0.2)] transition hover:bg-[#0f172a] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
};

export default AuthButton;

