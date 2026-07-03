import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useAppStore } from '@/context/useAppStore';

const ProductCard = ({ product }) => {
  const addToCart = useAppStore((state) => state.addToCart);
  const cartLoadingProductId = useAppStore((state) => state.cartLoadingProductId);
  const isAdding = cartLoadingProductId === product._id;
  const isOutOfStock = product.inventoryCount === 0;

  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAdd = useCallback(async (e) => {
    e.preventDefault(); // Prevents bubbling if nested inside interactive zones
    if (isOutOfStock || isAdding) return;
    await addToCart(product._id, 1);
  }, [addToCart, product._id, isOutOfStock, isAdding]);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(9,17,31,0.08)]">
      {/* Image Container Zone */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50">
        {/* Visual Loading Skeleton Background */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-slate-200/70" />
        )}
        
        <img
          src={product.image || "/api/placeholder/400/500"}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
            imageLoaded ? 'scale-100 opacity-100 blur-0' : 'scale-95 opacity-0 blur-sm'
          }`}
        />

        {/* Floating Badges */}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2 pointer-events-none select-none">
          <span className="rounded-full bg-slate-900/80 backdrop-blur-[4px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
            {product.category}
          </span>
          {product.featured && (
            <span className="rounded-full bg-[#6d4df2] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-md shadow-[#6d4df2]/20">
              Featured
            </span>
          )}
        </div>

        {/* Complete Card Overlay Navigation Link */}
        <Link 
          to={`/product/${product._id}`} 
          className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d4df2] focus-visible:ring-offset-2"
          aria-label={`View details for ${product.name}`}
        />
      </div>

      {/* Content Space Block */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="space-y-2.5">
          <Link to={`/product/${product._id}`} className="block focus:outline-none group-hover:text-[#6d4df2]">
            <h3 className="line-clamp-1 text-base font-bold tracking-tight text-slate-900 transition-colors duration-200">
              {product.name}
            </h3>
          </Link>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {product.description}
          </p>

          {/* Rating Engine Mock */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(4)].map((_, i) => (
                <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
              ))}
              <Star size={13} className="text-slate-200" fill="currentColor" strokeWidth={0} />
            </div>
            <span className="text-xs font-semibold text-slate-400">(4.8)</span>
          </div>
        </div>

        {/* Pricing Actions Group Zone */}
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-50 pt-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Price</span>
            <p className="text-xl font-black tracking-tight text-slate-900">
              {formatCurrency(product.price)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdding || isOutOfStock}
            aria-label={isOutOfStock ? `${product.name} is Sold Out` : `Add ${product.name} to your active cart`}
            className="relative z-10 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6d4df2] px-4 text-xs font-bold text-white transition-all duration-200 hover:bg-[#5b3de0] active:scale-[0.98] disabled:pointer-events-none disabled:bg-slate-100 disabled:text-slate-400 shadow-sm shadow-[#6d4df2]/10"
          >
            {isAdding ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ShoppingCart size={15} strokeWidth={2.5} />
            )}
            <span>
              {isAdding ? 'Adding...' : isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
