import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';

/* ---------------- ACCORDION ---------------- */
const AccordionItem = ({ label, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-ink/10">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink hover:text-[#6d4df2]"
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="pb-5 text-sm leading-7 text-ink/65">
          {children}
        </div>
      )}
    </div>
  );
};

/* ---------------- PAGE ---------------- */
const ProductDetail = () => {
  const { id } = useParams();

  const loadProduct = useAppStore((s) => s.loadProduct);
  const product = useAppStore((s) => s.product);
  const catalogProduct = useAppStore((s) =>
    s.products.find((item) => String(item._id) === String(id))
  );
  const productLoading = useAppStore((s) => s.productLoading);
  const productError = useAppStore((s) => s.productError);
  const addToCart = useAppStore((s) => s.addToCart);
  const cartLoadingProductId = useAppStore((s) => s.cartLoadingProductId);

  const [activeImg, setActiveImg] = useState(0);

  /* stable image list */
  const images = useMemo(() => {
    const source = product?._id === id ? product : catalogProduct;
    if (!source?.image) return [];
    return [source.image, source.image, source.image];
  }, [catalogProduct, id, product]);

  useEffect(() => {
    if (id) {
      loadProduct(id).catch(() => {});
    }
    setActiveImg(0);
  }, [id, loadProduct]);

  const activeProduct = product?._id === id ? product : catalogProduct;

  if (productLoading || !activeProduct) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-ink/50">
          {productLoading ? 'Loading product...' : productError || 'Loading product...'}
        </p>
      </div>
    );
  }

  const isLoading = cartLoadingProductId === activeProduct._id;
  const outOfStock = activeProduct.inventoryCount <= 0;
  const currentImage = images[activeImg] || activeProduct.image;

  const next = () =>
    setActiveImg((p) => (p + 1) % images.length);

  const prev = () =>
    setActiveImg((p) => (p - 1 + images.length) % images.length);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">

      {/* BACK */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs text-ink/50 hover:text-ink"
      >
        <ArrowLeft size={14} />
        Back to products
      </Link>

      {/* GRID */}
      <div className="grid gap-10 lg:grid-cols-[1fr_440px]">

        {/* ================= IMAGE SECTION ================= */}
        <div className="flex flex-col gap-3 lg:flex-row-reverse">

          {/* MAIN IMAGE (FIXED + NO OVERFLOW GLITCH) */}
          <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-sm">
              <img
              src={currentImage}
              alt={activeProduct.name}
              className="h-[420px] w-full object-cover lg:h-[80vh]"
            />

            {/* MOBILE ARROWS ONLY */}
            <div className="lg:hidden">
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* THUMBNAILS (DESKTOP ONLY) */}
          <div className="hidden lg:flex lg:w-[90px] lg:flex-col lg:gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`overflow-hidden rounded-xl border-2 transition ${
                  activeImg === i
                    ? 'border-[#6d4df2]'
                    : 'border-transparent hover:border-[#6d4df2]/30'
                }`}
              >
                <img
                  src={img}
                  alt=""
                  className="aspect-[3/4] w-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* MOBILE DOTS */}
          <div className="flex justify-center gap-2 lg:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-1.5 rounded-full transition ${
                  activeImg === i
                    ? 'w-6 bg-[#6d4df2]'
                    : 'w-1.5 bg-ink/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ================= INFO ================= */}
        <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-24">

          {/* CATEGORY + STOCK */}
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#6d4df2] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              {activeProduct.category}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                outOfStock
                  ? 'bg-red-50 text-red-600'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {outOfStock ? 'Out of stock' : 'In stock'}
            </span>
          </div>

          {/* TITLE */}
          <h1 className="mt-4 text-3xl font-bold text-ink sm:text-[2.2rem]">
            {activeProduct.name}
          </h1>

          {/* PRICE */}
          <p className="mt-3 text-2xl font-semibold text-ink">
            {formatCurrency(activeProduct.price)}
          </p>

          <hr className="my-6 border-ink/10" />

          {/* QUICK INFO (UNCHANGED) */}
<div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-3">
  <div className="rounded-xl bg-paper p-2 sm:p-3">
    <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-ink/40">
      Stock
    </p>
    <p className="text-xs sm:text-sm font-semibold">
      {outOfStock ? 'Unavailable' : `${activeProduct.inventoryCount} left`}
    </p>
  </div>

  <div className="rounded-xl bg-paper p-2 sm:p-3">
    <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-ink/40">
      Dispatch
    </p>
    <p className="text-xs sm:text-sm font-semibold">1–3 days</p>
  </div>

  <div className="rounded-xl bg-paper p-2 sm:p-3">
    <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-ink/40">
      Returns
    </p>
    <p className="text-xs sm:text-sm font-semibold">30 days</p>
  </div>
</div>

          {/* CTA */}
          <button
            onClick={() => addToCart(activeProduct._id, 1)}
            disabled={isLoading || outOfStock}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#6d4df2] py-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <ShoppingCart size={16} />
            )}
            {isLoading ? 'Adding...' : outOfStock ? 'Sold out' : 'Add to cart'}
          </button>

          {/* ACCORDIONS (UNCHANGED) */}
          <div className="mt-6">
            <AccordionItem label="Description">
              {activeProduct.description}
            </AccordionItem>

            <AccordionItem label="Shipping">
              Orders ship in 1–3 business days. Tracking included.
            </AccordionItem>

            <AccordionItem label="Returns">
              30-day return window for unused items.
            </AccordionItem>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
