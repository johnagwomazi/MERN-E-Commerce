import { useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut, ShieldCheck, Search, Menu, X, ShoppingCart, ChevronRight, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/context/useAppStore';

const Navbar = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const cart = useAppStore((state) => state.cart);
  const adminOrders = useAppStore((state) => state.adminOrders);
  const products = useAppStore((state) => state.products);
  const logout = useAppStore((state) => state.logout);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const cartCount = (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);
  const pendingOrderCount = adminOrders?.pendingOrders?.length || 0;
  const mobileCategories = useMemo(() => {
    const uniqueCategories = [...new Set((products || []).map((product) => product.category).filter(Boolean))];
    return ['All', ...uniqueCategories].slice(0, 10);
  }, [products]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setMobileCategoriesOpen(false);
  };

  const handleSearch = () => {
    const query = search.trim();
    if (!query) return;
    navigate(`/?q=${encodeURIComponent(query)}`);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
    setMobileCategoriesOpen(false);
  };

  const handleCategorySelect = (category) => {
    const query = category === 'All' ? '/' : `/?category=${encodeURIComponent(category)}`;
    navigate(query);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setMobileCategoriesOpen(false);
  };

  return (
<header className="w-[100vw] sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[100vw] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link to="/" className="flex shrink-0 items-center gap-2 sm:gap-3 text-ink group">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 items-center justify-center rounded-xl bg-[#6d4df2] text-xs sm:text-sm font-bold text-white shadow-[0_10px_25px_rgba(109,77,242,0.3)] transition-transform group-hover:scale-105">
            N
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-ink/45 leading-none">
              NovaShop
            </p>
            <p className="mt-0.5 text-xs sm:text-base font-black tracking-tight leading-none">
              Commerce
            </p>
          </div>
        </Link>


        {/* DESKTOP SEARCH */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="hidden flex-1 max-w-xl items-center rounded-full border border-ink/5 bg-paper/60 pl-4 pr-1.5 py-1.5 focus-within:border-[#6d4df2]/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#6d4df2]/5 transition-all lg:flex"
        >
          <Search size={18} className="shrink-0 text-ink/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-ink/35 text-ink"
            placeholder="Search for products, brands and more..."
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-[#6d4df2] px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#5b3ee0]"
          >
            Search
          </button>
        </form>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-1 text-sm font-medium text-ink/80 lg:flex">
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-full px-4 py-2 hover:bg-ink/5 transition-colors"
          >
            <ShoppingCart size={16} className="text-ink/70" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6d4df2] px-1.5 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {user.role === 'manager' || user.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="relative flex items-center gap-2 rounded-full px-4 py-2 hover:bg-ink/5 transition-colors"
                >
                  <ShieldCheck size={16} className="text-ink/70" />
                  <span>Management</span>
                  {pendingOrderCount > 0 ? (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6d4df2] px-1.5 text-xs font-bold text-white">
                      {pendingOrderCount}
                    </span>
                  ) : null}
                </Link>
              ) : null}

              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-ink/5 transition-colors"
              >
                <User size={16} className="text-ink/70" />
                <span className="hidden sm:inline">{user.name}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 hover:bg-ink/5 transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="ml-2 rounded-full bg-[#6d4df2] px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#5b3ee0] transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>


{/* MOBILE ACTIONS */}
<div className="ml-auto flex items-center gap-2 lg:hidden">
  <Link
    to="/cart"
    className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white"
  >
    <ShoppingCart size={20} />

    {cartCount > 0 && (
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6d4df2] px-1 text-[10px] font-bold text-white">
        {cartCount}
      </span>
    )}
  </Link>

  <button
    type="button"
    onClick={() => {
      setMobileMenuOpen((current) => !current);
      setMobileSearchOpen(false);
    }}
    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white"
  >
    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
  </button>
</div>
      </div>

      {/* MOBILE SEARCH PANEL
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:hidden">
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            mobileSearchOpen ? 'max-h-20 pb-3 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper px-4 py-3 shadow-sm">
            <Search size={18} className="shrink-0 text-ink/40" />
            <input
              autoFocus={mobileSearchOpen}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch();
              }}
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
              placeholder="Search products..."
            />
            <button
              type="button"
              onClick={handleSearch}
              className="shrink-0 rounded-full bg-[#6d4df2] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5d3fe0]"
            >
              Go
            </button>
          </div>
        </div>
      </div> */}
      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-x-0 top-16 z-40 h-[calc(100vh-4rem)] bg-white transition-all duration-300 lg:hidden ${
          mobileMenuOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-4 pointer-events-none opacity-0'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {/* SEARCH */}
          <div className="border-b border-slate-100 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2"
            >
              <Search size={18} className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-sm outline-none"
              />

              <button
                type="submit"
                className="rounded-lg bg-[#6d4df2] px-4 py-2 text-xs font-semibold text-white"
              >
                Search
              </button>
            </form>
          </div>

          {/* USER CARD */}
          {user ? (
            <div className="border-b border-slate-100 p-4">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-[#6d4df2]/5 p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6d4df2] text-white">
                  <User size={20} />
                </div>

                <div className="flex-1">
                  <p className="font-bold text-slate-900">
                    {user.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    View Dashboard
                  </p>
                </div>

                <ChevronRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="border-b border-slate-100 p-4">
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl bg-[#6d4df2] font-semibold text-white"
              >
                Create Account
              </Link>

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 flex justify-center text-sm font-medium text-[#6d4df2]"
              >
                Already have an account? Login
              </Link>
            </div>
          )}

          {/* CATEGORIES */}
          <div className="border-b border-slate-100">
            <button
              type="button"
              onClick={() =>
                setMobileCategoriesOpen((current) => !current)
              }
              className="flex w-full items-center justify-between px-4 py-4 font-semibold"
            >
              <span>Browse Categories</span>

              <ChevronDown
                size={18}
                className={`transition-transform ${
                  mobileCategoriesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                mobileCategoriesOpen
                  ? 'max-h-[500px]'
                  : 'max-h-0'
              }`}
            >
              <div className="grid grid-cols-2 gap-2 p-4">
                {mobileCategories.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleCategorySelect(item)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm font-medium"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ACCOUNT LINKS */}
          {user && (
            <div className="p-2">
              {(user.role === 'manager' ||
                user.role === 'admin') && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-4 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} />

                    <span>Management</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {pendingOrderCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6d4df2] px-1 text-[10px] font-bold text-white">
                        {pendingOrderCount}
                      </span>
                    )}

                    <ChevronRight size={16} />
                  </div>
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-4 text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />

                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

  );
};

export default Navbar;
