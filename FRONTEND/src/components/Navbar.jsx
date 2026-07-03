import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut, ShieldCheck, Search, Menu, X, ShoppingCart } from 'lucide-react';
import { useAppStore } from '@/context/useAppStore';

const Navbar = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const cart = useAppStore((state) => state.cart);
  const adminOrders = useAppStore((state) => state.adminOrders);
  const logout = useAppStore((state) => state.logout);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const cartCount = (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);
  const pendingOrderCount = adminOrders?.pendingOrders?.length || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleSearch = () => {
    const query = search.trim();
    if (!query) return;
    navigate(`/?q=${encodeURIComponent(query)}`);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-ink">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6d4df2] text-sm font-bold text-white shadow-[0_15px_40px_rgba(109,77,242,0.35)]">
            N
          </div>
          <div className="hidden sm:block">
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">NovaShop</p>
            <p className="text-lg font-bold">Modern commerce</p>
          </div>
        </Link>

        <div className="hidden flex-1 items-center rounded-full border border-ink/10 bg-paper px-4 py-3 lg:flex">
          <Search size={18} className="text-ink/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
            placeholder="Search for products, brands and more..."
          />
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-full bg-[#6d4df2] px-4 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          
          {/* SEARCH ICON */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((current) => !current)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ink/10 bg-paper text-ink"
            aria-label="Toggle search"
          >
            <Search size={18} />
          </button>

          {/* CART ICON (NEW) */}
          <Link
            to="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ink/10 bg-paper text-ink"
            aria-label="Go to cart"
          >
            <ShoppingCart size={18} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6d4df2] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* MENU ICON */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ink/10 bg-paper text-ink"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="hidden items-center gap-2 text-sm text-ink/80 lg:ml-auto lg:flex">
<Link
  to="/cart"
  className="relative flex items-center gap-2 rounded-full px-4 py-2 hover:bg-ink/5"
>
  <ShoppingCart size={17} />
  Cart

  {cartCount > 0 && (
    <span className="ml-1 inline-flex min-w-6 items-center justify-center rounded-full bg-[#6d4df2] px-2 py-0.5 text-xs font-bold text-white">
      {cartCount}
    </span>
  )}
</Link>
          {user ? (
            <>
              {user.role === 'manager' || user.role === 'admin' ? (
                <Link to="/admin" className="relative flex items-center gap-2 rounded-full px-4 py-2 hover:bg-ink/5">
                  <ShieldCheck size={17} />
                  Management
                  {pendingOrderCount > 0 ? (
                    <span className="ml-1 inline-flex min-w-6 items-center justify-center rounded-full bg-[#6d4df2] px-2 py-0.5 text-xs font-bold text-white">
                      {pendingOrderCount}
                    </span>
                  ) : null}
                </Link>
              ) : null}
              <Link to="/dashboard" className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-ink/5">
                <User size={17} />
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full bg-[#6d4df2] px-4 py-2 font-medium text-white"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 hover:bg-ink/5">
                Login
              </Link>
              <Link to="/signup" className="rounded-full bg-[#6d4df2] px-4 py-2 text-white">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>

      

      <div className="mx-auto max-w-[1600px] px-4 pb-3 sm:px-6 lg:hidden">
        <div
          className={`overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white transition-all duration-300 ${
            mobileSearchOpen ? 'max-h-24 opacity-100' : 'max-h-0 border-transparent opacity-0'
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <Search size={18} className="text-ink/40" />
            <input
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
              className="rounded-full bg-[#6d4df2] px-4 py-2 text-sm font-semibold text-white"
            >
              Go
            </button>
          </div>
        </div>

        <div
          className={`mt-3 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 border-transparent opacity-0'
          }`}
        >
          <div className="flex flex-col gap-2 p-3 text-sm text-ink/80">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl bg-paper px-4 py-3">
                  <span className="flex items-center gap-2">
                    <User size={16} />
                    {user.name}
                  </span>
                </Link>
                {user.role === 'manager' || user.role === 'admin' ? (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl bg-paper px-4 py-3">
                    <span className="flex items-center gap-2">
                      <ShieldCheck size={16} />
                      Management
                      {pendingOrderCount > 0 ? (
                        <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-[#6d4df2] px-2 py-0.5 text-xs font-bold text-white">
                          {pendingOrderCount}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl bg-[#6d4df2] px-4 py-3 text-left font-medium text-white"
                >
                  <span className="flex items-center gap-2">
                    <LogOut size={16} />
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl bg-paper px-4 py-3">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl bg-[#6d4df2] px-4 py-3 text-white">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
