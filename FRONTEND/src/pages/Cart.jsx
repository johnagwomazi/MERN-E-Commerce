import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';

const Cart = () => {
  const navigate = useNavigate();
  const cart = useAppStore((state) => state.cart);
  const updateCartItem = useAppStore((state) => state.updateCartItem);
  const removeCartItem = useAppStore((state) => state.removeCartItem);
  const clearCart = useAppStore((state) => state.clearCart);
  const items = cart?.items || [];
  const getProduct = (item) =>
    (item.productId && typeof item.productId === 'object' ? item.productId : item.productSnapshot) || null;
  const subtotal = items.reduce((sum, item) => sum + (getProduct(item)?.price || 0) * item.quantity, 0);

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="space-y-4">
        <h1 className="text-3xl font-black">Your cart</h1>
        {items.map((item, index) => {
          const product = getProduct(item);
          const productId = product?._id || item.productId;
          const itemId = productId || `cart-item-${index}`;

          return (
          <div key={itemId} className="flex gap-4 rounded-[1.5rem] border border-white/70 bg-white p-4">
            <img src={product?.image} alt={product?.name} className="h-28 w-28 rounded-2xl object-cover" />
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p className="font-semibold">{product?.name}</p>
                <p className="text-sm text-ink/60">{formatCurrency(product?.price || 0)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateCartItem(productId, Math.max(1, item.quantity - 1))} className="rounded-full bg-paper p-2"><Minus size={16} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateCartItem(productId, item.quantity + 1)} className="rounded-full bg-paper p-2"><Plus size={16} /></button>
                <button onClick={() => removeCartItem(productId)} className="ml-auto rounded-full bg-red-50 p-2 text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
          );
        })}
        {!items.length ? <div className="rounded-[1.5rem] border border-white/70 bg-white p-6">Your cart is empty.</div> : null}
        {items.length ? (
          <button
            type="button"
            onClick={clearCart}
            className="rounded-full bg-red-50 px-5 py-3 font-semibold text-red-600"
          >
            Remove all items
          </button>
        ) : null}
      </section>

      <aside className="h-fit rounded-[1.5rem] border border-white/70 bg-white p-6">
        <h2 className="text-xl font-bold">Order summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
          <div className="flex justify-between border-t pt-3 text-base font-bold"><span>Total</span><span>{formatCurrency(subtotal)}</span></div>
        </div>
        <button onClick={() => navigate('/checkout')} className="mt-6 w-full rounded-full bg-[#6d4df2] px-5 py-4 font-semibold text-white">Checkout</button>
      </aside>
    </div>
  );
};

export default Cart;
