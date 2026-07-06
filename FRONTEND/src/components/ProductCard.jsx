import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useAppStore } from '@/context/useAppStore';
import { useToast } from '@/components/ToastProvider';

const ProductCard = ({ product }) => {
  const addToCart = useAppStore((state) => state.addToCart);
  const cartLoadingProductId = useAppStore((state) => state.cartLoadingProductId);
  const { success, error: showError } = useToast();
  const isAdding = cartLoadingProductId === product._id;

  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAdd = useCallback(async (e) => {
    e.preventDefault(); 
    if (isAdding) return;
    try {
      await addToCart(product._id, 1);
      success('Item added to cart');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to add item to cart.';
      showError(message);
    }
  }, [addToCart, product._id, isAdding, showError, success]);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-[0_12px_30px_rgba(9,17,31,0.06)] active:scale-[0.99] md:active:scale-100">
      
      {/* Image Container Zone */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 sm:aspect-[4/5]">
        {/* Visual Loading Skeleton Background */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-slate-200/60" />
        )}
        
        <img
          src={product.image || "/api/placeholder/400/500"}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-cover object-center transition-all duration-500 ease-out md:group-hover:scale-105 ${
            imageLoaded ? 'scale-100 opacity-100 blur-0' : 'scale-95 opacity-0 blur-sm'
          }`}
        />

        {/* Floating Badges & Action Buttons */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2 pointer-events-none select-none z-10">
          <span className="rounded-md bg-white/95 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 shadow-sm border border-slate-100/50">
            {product.category}
          </span>
          {product.featured && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6d4df2] text-white shadow-md shadow-[#6d4df2]/20">
              <Star size={13} fill="currentColor" strokeWidth={0} />
            </div>
          )}
        </div>

        {/* Complete Card Overlay Navigation Link */}
        <Link 
          to={`/product/${product._id}`} 
          className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d4df2] focus-visible:ring-offset-2 z-0"
          aria-label={`View details for ${product.name}`}
        />
      </div>

      {/* Content Space Block */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div className="space-y-1.5">
          {/* Rating Engine Mock */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(4)].map((_, i) => (
                <Star key={i} size={11} fill="currentColor" strokeWidth={0} />
              ))}
              <Star size={11} className="text-slate-200" fill="currentColor" strokeWidth={0} />
            </div>
            <span className="text-[11px] font-medium text-slate-400">(4.8)</span>
          </div>

          <Link to={`/product/${product._id}`} className="block focus:outline-none group-hover:text-[#6d4df2]">
            <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-slate-800 transition-colors duration-200 sm:text-base">
              {product.name}
            </h3>
          </Link>
          
          <p className="line-clamp-2 text-xs leading-normal text-slate-400">
            {product.description}
          </p>
        </div>

        {/* Pricing Actions Group Zone */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Price</span>
            <p className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              {formatCurrency(product.price)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdding}
            aria-label={`Add ${product.name} to your active cart`}
            className="relative z-10 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#6d4df2] px-3.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#5b3de0] active:scale-[0.95] disabled:pointer-events-none disabled:bg-slate-100 disabled:text-slate-400 shadow-sm sm:h-11 sm:px-4"
          >
            {isAdding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ShoppingCart size={14} strokeWidth={2.5} />
            )}
            <span className="hidden xs:inline">
              {isAdding ? 'Adding...' : 'Add'}
            </span>
            <span className="inline xs:hidden">
              {isAdding ? '' : 'Add'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
