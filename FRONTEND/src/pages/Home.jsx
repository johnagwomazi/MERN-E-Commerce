import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, ShoppingBag, Zap, Truck, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';
import ProductCard from '@/components/ProductCard';
import { CardSkeleton } from '@/components/Skeletons';
import SectionTitle from '@/components/SectionTitle';
import { formatCurrency } from '@/utils/formatCurrency';

const Home = () => {
  const loadProducts = useAppStore((state) => state.loadProducts);
  const products = useAppStore((state) => state.products);
  const cart = useAppStore((state) => state.cart);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState('All');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const search = searchParams.get('q') || '';

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((product) => product.category))],
    [products]
  );

  const featured = products.filter((product) => product.featured);
  const visible = products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category;
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (featured.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % featured.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [featured.length]);

  useEffect(() => {
    if (featuredIndex >= featured.length) {
      setFeaturedIndex(0);
    }
  }, [featuredIndex, featured.length]);

  const currentFeatured = featured[featuredIndex];

  return (
    <div className="mx-auto grid max-w-full gap-6 px-4 py-4 sm:py-6 lg:grid-cols-[220px_minmax(0,1.25fr)_240px] lg:px-6">
      
      {/* DESKTOP SIDEBAR CATEGORIES */}
      <aside className="hidden rounded-[1.75rem] border border-white/70 bg-white p-4 lg:block">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Categories</p>
          {categories.slice(0, 10).map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${
                category === item ? 'bg-[#6d4df2] text-white' : 'bg-paper text-ink hover:bg-paper/80'
              }`}
            >
              <span>{item}</span>
              <span className="text-xs opacity-70">
                {item === 'All' ? products.length : products.filter((p) => p.category === item).length}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN CONTAINER */}
       <section className="space-y-6">
        
        {/* HERO BANNER & QUICK LINKS */}
        <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] bg-black/70 p-6 sm:p-8 text-white shadow-lg flex flex-col justify-between">
            {currentFeatured ? (
              <>
                <img
                  src={currentFeatured.image}
                  alt={currentFeatured.name}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-20"
                />
              </>
            ) : null}

            <div className="relative z-10">
              <p className="inline-flex rounded-full border border-white/20 px-3 py-1 text-[10px] sm:text-xs uppercase tracking-[0.35em]">
                {currentFeatured ? 'Featured Collection' : 'New Collection'}
              </p>
              
              {/* Slideshow dynamic heading node */}
              <h1 className="mt-4 max-w-xl text-3xl font-black tracking-tight sm:mt-5 sm:text-5xl line-clamp-2">
                {currentFeatured ? currentFeatured.name : 'Find your style, love your look.'}
              </h1>
              
              {/* Slideshow dynamic description node */}
              <p className="mt-3 max-w-lg text-sm text-white/80 sm:mt-4 line-clamp-2 sm:line-clamp-none">
                {currentFeatured ? currentFeatured.description : 'Shop the best deals, save with coupons, and checkout securely without losing the live payment flow.'}
              </p>
              
              {search && (
                <p className="mt-3 text-xs sm:text-sm text-white/80">
                  Search results for: <span className="font-semibold">{search}</span>
                </p>
              )}
            </div>

            {/* Slide Action Controls & Stepper - Only injects contextually if products exist */}
            {currentFeatured && (
              <div className="relative z-10 mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/product/${currentFeatured._id}`}
                    className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:scale-[1.02]"
                  >
                    View Product
                  </Link>
                  <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] sm:text-xs font-medium backdrop-blur-sm">
                    {formatCurrency(currentFeatured.price)}
                  </span>
                </div>

                {/* Micro indicator dots panels */}
                <div className="flex items-center gap-1">
                  {featured.slice(0, 5).map((product, index) => (
                    <button
                      key={product._id}
                      type="button; shadow-none"
                      onClick={() => setFeaturedIndex(index)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === featuredIndex ? 'w-4 bg-white' : 'w-1 bg-white/40'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* QUICK PROMO CARDS */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:grid-cols-1">
            {[
              { label: 'Flash Sale', icon: Zap },
              { label: 'Free Shipping', icon: Truck },
              { label: 'New Arrivals', icon: Sparkles },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href="#"
                  className="rounded-[1.25rem] sm:rounded-[1.5rem] border border-white/70 bg-white p-3 sm:p-5 text-center sm:text-left transition hover:shadow-md"
                >
                  {/* MOBILE VIEW */}
                  <div className="flex flex-col items-center justify-center gap-1 sm:hidden">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper">
                      <Icon className="h-5 w-5 text-ink" />
                    </div>
                    <span className="text-[11px] font-semibold text-ink leading-tight">{item.label}</span>
                  </div>

                  {/* TABLET + DESKTOP VIEW */}
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-ink">{item.label}</p>
                    <p className="mt-2 text-sm text-ink/60">
                      Curated picks from your storefront.
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* MOBILE CATEGORIES SCROLLBAR */}
        <div className="block lg:hidden">
          <div className="w-[100vw] flex gap-1 overflow-x-none pb-1 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`shrink-0 snap-items rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                  category === item ? 'bg-[#6d4df2] text-white' : 'bg-white border border-white/70 text-ink'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>


               {/* CORE PRODUCT CATALOG */}
        <section className="rounded-[1.75rem] border border-white/70 bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <SectionTitle
            eyebrow="Catalog"
            title={category === 'All' ? 'All products' : category}
          />
          
          {error && (
            <div className="mb-5 rounded-2xl bg-red-50/80 border border-red-100 px-4 py-3 text-red-700 text-sm font-medium backdrop-blur-sm">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/10 bg-paper/40 px-4 py-16 text-center text-sm font-medium text-ink/40">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
              {visible.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* FEATURED CAROUSEL/GRID */}
        {featured.length ? (
          <section className="rounded-[1.75rem] border border-white/70 bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <SectionTitle eyebrow="Featured" title="Best deals" />
            <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-4">
              {featured.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        ) : null}
      </section>


      {/* RIGHT SIDEBAR MINI CART */}
      <aside className="hidden lg:block space-y-6">
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Mini cart</p>
          <div className="mt-3 space-y-3 text-sm">
            {(cart?.items || []).slice(0, 4).map((item) => (
              <div key={item.productId?._id} className="flex items-center justify-between gap-2">
                <span className="truncate text-ink/80">{item.productId?.name}</span>
                <span className="shrink-0 rounded-full bg-paper px-2 py-1 text-xs font-semibold text-ink">x{item.quantity}</span>
              </div>
            ))}
            {!((cart?.items || []).length) && <p className="text-ink/50">Your cart is empty.</p>}
          </div>
        </div>
      </aside>
        
      {/* FLOATING ACTION SUPPORT BUTTON */}
      <a
        href="https://wa.me/2349158524386?text=Hello%20I%20need%20support"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-12 w-12 sm:h-auto sm:w-auto items-center justify-center sm:justify-start gap-3 rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-green-600 sm:px-5 sm:py-3"
        aria-label="Contact support on WhatsApp"
      >
        <MessageCircle size={22} />
        <span className="hidden sm:inline font-medium">Contact Us</span>
      </a>

    </div>
  );
};

export default Home;
