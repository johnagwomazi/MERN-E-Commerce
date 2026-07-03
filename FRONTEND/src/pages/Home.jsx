import { useEffect, useMemo, useState } from 'react';
import { Zap, Truck, Sparkles } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';
import ProductCard from '@/components/ProductCard';
import { CardSkeleton } from '@/components/Skeletons';
import SectionTitle from '@/components/SectionTitle';

const Home = () => {
  const loadProducts = useAppStore((state) => state.loadProducts);
  const products = useAppStore((state) => state.products);
  const cart = useAppStore((state) => state.cart);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState('All');
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

  return (
    <div className="mx-auto grid max-w-[1720px] gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,1.25fr)_240px] lg:px-6">
      <aside className="hidden rounded-[1.75rem] border border-white/70 bg-white p-4 lg:block">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Categories</p>
          {categories.slice(0, 10).map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium ${
                category === item ? 'bg-[#6d4df2] text-white' : 'bg-paper text-ink'
              }`}
            >
              <span>{item}</span>
              <span className="text-xs opacity-70">{item === 'All' ? products.length : products.filter((p) => p.category === item).length}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#7a5af8_0%,#b46ff7_52%,#ff7aa8_100%)] p-8 text-white shadow-[0_24px_80px_rgba(109,77,242,0.25)]">
            <p className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.35em]">New Collection</p>
            <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">Find your style, love your look.</h1>
            <p className="mt-4 max-w-lg text-white/80">Shop the best deals, save with coupons, and checkout securely without losing the live payment flow.</p>
            {search ? <p className="mt-4 text-sm text-white/80">Search results for: <span className="font-semibold">{search}</span></p> : null}
          </div>
<div className="grid grid-cols-3 gap-3 sm:grid-cols-3 xl:grid-cols-1">
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
        className="rounded-[1.5rem] border border-white/70 bg-white p-5 transition hover:shadow-md"
      >
        {/* MOBILE VIEW */}
        <div className="flex flex-col items-center justify-center gap-1 sm:hidden">
          <Icon className="h-6 w-6 text-ink" />
          <span className="text-xs font-medium text-ink">{item.label}</span>
        </div>

        {/* TABLET + DESKTOP VIEW (unchanged) */}
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

        {/* <section className="rounded-[1.75rem] border border-white/70 bg-white p-5">
          <SectionTitle eyebrow="Quick access" title="Product categories" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {categories.slice(0, 6).map((item) => (
              <button key={item} onClick={() => setCategory(item)} className="rounded-2xl bg-paper px-4 py-5 text-sm font-semibold">
                {item}
              </button>
            ))}
          </div>
        </section> */}

        <section className="rounded-[1.75rem] border border-white/70 bg-white p-5">
          <SectionTitle
            eyebrow="Catalog"
            title={category === 'All' ? 'All products' : category}
          />
          {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => <CardSkeleton key={index} />)}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-[1.5rem] bg-paper px-4 py-10 text-center text-ink/60">
              No products found
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visible.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          )}
        </section>

        {featured.length ? (
          <section className="rounded-[1.75rem] border border-white/70 bg-white p-5">
            <SectionTitle eyebrow="Featured" title="Best deals" />
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {featured.slice(0, 4).map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          </section>
        ) : null}
      </section>

      <aside className="hidden md:block space-y-6">
          <div className="rounded-[1.5rem] border border-white/70 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Mini cart</p>
          <div className="mt-3 space-y-3 text-sm">
            {(cart?.items || []).slice(0, 4).map((item) => (
                <div key={item.productId?._id} className="flex items-center justify-between gap-2">
                <span className="truncate text-ink/80">{item.productId?.name}</span>
                <span className="shrink-0 rounded-full bg-paper px-2 py-1 text-xs font-semibold text-ink">x{item.quantity}</span>
              </div>
            ))}
            {!((cart?.items || []).length) ? <p className="text-ink/50">Your cart is empty.</p> : null}
          </div>
        </div>
      </aside>
        
        <a
        href="https://wa.me/2349158524386?text=Hello%20I%20need%20support"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-green-500 px-5 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-green-600"
        aria-label="Contact support on WhatsApp"
      >
        <MessageCircle size={22} />
        <span className="hidden sm:inline font-medium">Contact Us</span>
      </a>

    </div>
  );
};

export default Home;
