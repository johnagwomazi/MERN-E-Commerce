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
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((current) => !current);
              setMobileMenuOpen(false);
            }}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
              mobileSearchOpen
                ? 'border-[#6d4df2]/30 bg-[#6d4df2]/10 text-[#6d4df2]'
                : 'border-ink/10 bg-paper text-ink/70'
            }`}
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
          >
            <Search size={18} />
          </button>

          <Link
            to="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ink/10 bg-paper text-ink/70"
            aria-label="Go to cart"
            onClick={() => {
              setMobileMenuOpen(false);
              setMobileSearchOpen(false);
            }}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#6d4df2] px-1 text-[10px] font-bold text-white">
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
            className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
              mobileMenuOpen
                ? 'border-[#6d4df2]/30 bg-[#6d4df2]/10 text-[#6d4df2]'
                : 'border-ink/10 bg-paper text-ink/70'
            }`}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            {!mobileMenuOpen && pendingOrderCount > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#6d4df2]" />
            )}
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

           {/* MOBILE CONTROLS & PANEL ROW CONTAINER */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:hidden">
        
        {/* MOBILE SEARCH PANEL DROPDOWN */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            mobileSearchOpen ? 'max-h-20 opacity-100 pb-3' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex items-center gap-2 rounded-2xl border border-ink/5 bg-paper p-2"
          >
            <Search size={18} className="text-ink/40 ml-2 shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch();
              }}
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35 text-ink"
              placeholder="Search products..."
            />
            <button
              type="submit"
              className="rounded-xl bg-[#6d4df2] px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              Go
            </button>
          </form>
        </div>

        {/* MOBILE MENU PANEL */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[32rem] opacity-100 pb-4' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-1.5 rounded-2xl border border-ink/5 bg-paper/50 p-2 text-sm font-medium text-ink/80">
           {/* MOBILE CATEGORIES */}
          <div className="mb-2 overflow-hidden rounded-2xl border border-ink/10 bg-white">
            <button
              type="button"
              onClick={() => setMobileCategoriesOpen((current) => !current)}
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <span className="font-semibold text-ink">
                Browse Categories
              </span>

              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${
                  mobileCategoriesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                mobileCategoriesOpen
                  ? 'max-h-[400px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="grid grid-cols-2 gap-2 p-3">
                {mobileCategories.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleCategorySelect(item)}
                    className="rounded-xl bg-slate-50 px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 border border-ink/5 text-ink shadow-sm active:bg-paper/40 transition-colors"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6d4df2]/10 text-[#6d4df2]">
                    <User size={16} />
                  </span>
                  <span className="flex-1 truncate font-bold text-ink">{user.name}</span>
                  <ChevronRight size={16} className="text-ink/30" />
                </Link>
                
                {(user.role === 'manager' || user.role === 'admin') && (
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-white/60 active:bg-paper/40 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6d4df2]/10 text-[#6d4df2]">
                        <ShieldCheck size={16} />
                      </span>
                      <span>Management</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {pendingOrderCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6d4df2] px-1.5 text-xs font-bold text-white">
                          {pendingOrderCount}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-ink/30" />
                    </div>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 hover:bg-red-50/50 transition-colors text-left"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <LogOut size={16} />
                  </span>
                  <span>Logout</span>
                </button>

                <div className="mt-1 overflow-hidden rounded-2xl border border-ink/5 bg-white">
                  <button
                    type="button"
                    onClick={() => setMobileCategoriesOpen((current) => !current)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-ink transition-colors hover:bg-paper/70"
                    aria-expanded={mobileCategoriesOpen}
                  >
                    <span>Categories</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${mobileCategoriesOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div
                    className={`grid overflow-hidden transition-all duration-300 ease-out ${
                      mobileCategoriesOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-2 p-3">
                      {mobileCategories.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleCategorySelect(item)}
                          className="rounded-xl border border-ink/10 bg-paper px-3 py-2.5 text-left text-xs font-semibold text-ink transition-colors hover:bg-white"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-1">
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="flex items-center justify-center rounded-xl border border-ink/10 bg-white py-2.5 text-center transition-colors active:bg-paper/40"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="flex items-center justify-center rounded-xl bg-[#6d4df2] py-2.5 text-center font-semibold text-white shadow-sm active:bg-[#5b3ee0] transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>

  );
};

export default Navbar;
