import { useEffect } from 'react';
import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';

const PendingUploads = () => {
  const loadPendingProducts = useAppStore((state) => state.loadPendingProducts);
  const pendingProducts = useAppStore((state) => state.pendingProducts);
  const approveProduct = useAppStore((state) => state.approveProduct);
  const rejectProduct = useAppStore((state) => state.rejectProduct);
  const adminLoading = useAppStore((state) => state.adminLoading);
  const error = useAppStore((state) => state.error);

  useEffect(() => { loadPendingProducts(); }, [loadPendingProducts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Pending uploads</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Review manager products</h1>
      </div>
      {error ? <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
      <div className="mt-6 space-y-4">
        {adminLoading ? <div className="rounded-2xl bg-white p-6">Loading pending uploads...</div> : null}
        {pendingProducts.map((product) => (
          <div key={product._id} className="rounded-[1.5rem] border border-white/70 bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img src={product.image} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
                <div>
                  <h3 className="text-lg font-bold text-ink">{product.name}</h3>
                  <p className="text-sm text-ink/60">{product.category}</p>
                  <p className="text-sm text-ink/60">{formatCurrency(product.price)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approveProduct(product._id)} className="rounded-full bg-[#6d4df2] px-4 py-2 font-semibold text-white">Approve</button>
                <button onClick={() => rejectProduct(product._id)} className="rounded-full bg-red-50 px-4 py-2 font-semibold text-red-600">Reject</button>
              </div>
            </div>
          </div>
        ))}
        {!pendingProducts.length && !adminLoading ? <div className="rounded-2xl bg-white p-6 text-ink/60">No pending uploads.</div> : null}
      </div>
    </div>
  );
};

export default PendingUploads;
