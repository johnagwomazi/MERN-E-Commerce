const AuthCard = ({ children }) => {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_24px_90px_rgba(15,23,42,0.12)] sm:p-8">
      {children}
    </div>
  );
};

export default AuthCard;

