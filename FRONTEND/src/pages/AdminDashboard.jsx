import { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';

const empty = { name: '', description: '', price: '', image: '', category: '', inventoryCount: '', featured: false };

const AdminDashboard = () => {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const loadAdminProducts = useAppStore((state) => state.loadAdminProducts);
  const loadSettings = useAppStore((state) => state.loadSettings);
  const adminProducts = useAppStore((state) => state.adminProducts);
  const settings = useAppStore((state) => state.settings);
  const createProduct = useAppStore((state) => state.createProduct);
  const updateProduct = useAppStore((state) => state.updateProduct);
  const deleteProduct = useAppStore((state) => state.deleteProduct);
  const toggleFeaturedProduct = useAppStore((state) => state.toggleFeaturedProduct);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [form, setForm] = useState(empty);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState('');
  const isAdmin = user?.role === 'admin';
  const canViewAnalytics = user?.role === 'admin' || user?.role === 'manager';
  const pathname = location.pathname;

  const navItems = [
    { label: 'Dashboard', to: '/admin', show: true },
    { label: 'Orders', to: '/admin/orders', show: true },
    { label: 'Analytics', to: '/admin/analytics', show: canViewAnalytics },
    { label: 'People', to: '/admin/people', show: isAdmin },
    { label: 'Pending Uploads', to: '/admin/pending-uploads', mobileLabel: 'Uploads', show: isAdmin }
  ].filter((item) => item.show);

  useEffect(() => {
    loadAdminProducts();
    if (isAdmin) loadSettings();
  }, [loadAdminProducts, loadSettings, isAdmin]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      inventoryCount: Number(form.inventoryCount),
      approvalStatus: isAdmin ? 'approved' : undefined
    };

    if (editingId) {
      await updateProduct(editingId, payload);
    } else {
      await createProduct(payload);
    }

    setForm(empty);
    setPreview('');
    setEditingId('');
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setForm((current) => ({ ...current, image: result }));
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      image: product.image || '',
      category: product.category || '',
      inventoryCount: product.inventoryCount ?? '',
      featured: Boolean(product.featured)
    });
    setPreview(product.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId('');
    setForm(empty);
    setPreview('');
  };

  return (
    <div className="mx-auto max-w-[1600px] overflow-x-hidden px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(9,17,31,0.08)] ring-1 ring-ink/5">
            <div className="bg-[linear-gradient(135deg,#111827_0%,#6d4df2_52%,#ff7aa8_100%)] px-6 py-6 text-white">
              <p className="text-xs uppercase tracking-[0.35em] text-white/70">Admin</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">Dashboard</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">Navigate products, orders, analytics, and approvals from one place.</p>
            </div>
            <nav className="space-y-1 p-3">
              {navItems.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-paper ${active ? 'bg-[linear-gradient(135deg,rgba(109,77,242,0.14),rgba(255,122,168,0.14))] text-ink shadow-sm ring-1 ring-[#6d4df2]/10' : 'text-ink/70'}`}
                  >
                    <span>{item.label}</span>
                    {active ? <span className="h-2 w-2 rounded-full bg-[#6d4df2]" /> : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(9,17,31,0.08)] sm:p-8 lg:p-10">
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Admin dashboard</p>
            <div className="mt-4 max-w-3xl">
              <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl lg:text-5xl">Manage products with a cleaner command center.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/65 sm:text-base">
                Upload, edit, feature, and moderate products from a premium workspace built for speed, clarity, and scale.
              </p>
            </div>
          </section>

          <div className="lg:hidden">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(9,17,31,0.08)] backdrop-blur-xl">
              <nav
                className="flex items-center gap-2 overflow-x-auto scroll-smooth px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Admin navigation"
              >
                {navItems.map((item) => {
                  const active = pathname === item.to;
                  const label = item.mobileLabel || item.label;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      aria-current={active ? 'page' : undefined}
                      className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${active ? 'bg-[#6d4df2] text-white shadow-md' : 'bg-paper text-ink/75 hover:bg-white'}`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {isAdmin ? (
            <section className="rounded-[1.5rem] border border-white/70 bg-white p-6 shadow-[0_18px_60px_rgba(9,17,31,0.06)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Approval settings</p>
                  <h2 className="mt-2 text-xl font-bold text-ink">Require Manager Product Approval</h2>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ requireManagerApproval: !settings?.requireManagerApproval })}
                  className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all ${settings?.requireManagerApproval ? 'bg-[#6d4df2] text-white shadow-md' : 'bg-paper text-ink hover:bg-[#e8e2ff]'}`}
                >
                  {settings?.requireManagerApproval ? 'On' : 'Off'}
                </button>
              </div>
            </section>
          ) : null}

          <form onSubmit={submit} className="grid gap-4 rounded-[1.5rem] border border-white/70 bg-white p-6 shadow-[0_18px_60px_rgba(9,17,31,0.06)] md:grid-cols-2 sm:p-8">
            <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-ink">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              {editingId ? (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center justify-center rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
            <input required className="rounded-2xl border border-ink/10 bg-paper p-4 outline-none transition-colors placeholder:text-ink/35 focus:border-[#6d4df2]/30 focus:bg-white" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required className="rounded-2xl border border-ink/10 bg-paper p-4 outline-none transition-colors placeholder:text-ink/35 focus:border-[#6d4df2]/30 focus:bg-white" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input required className="rounded-2xl border border-ink/10 bg-paper p-4 outline-none transition-colors placeholder:text-ink/35 focus:border-[#6d4df2]/30 focus:bg-white" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input required className="rounded-2xl border border-ink/10 bg-paper p-4 outline-none transition-colors placeholder:text-ink/35 focus:border-[#6d4df2]/30 focus:bg-white" placeholder="Stock" type="number" value={form.inventoryCount} onChange={(e) => setForm({ ...form, inventoryCount: e.target.value })} />
            <textarea required className="min-h-32 rounded-2xl border border-ink/10 bg-paper p-4 outline-none transition-colors placeholder:text-ink/35 focus:border-[#6d4df2]/30 focus:bg-white md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-ink">Product image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full rounded-2xl border border-ink/10 bg-paper p-4 outline-none transition-colors file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink hover:bg-white" />
              {preview ? <img src={preview} alt="Preview" className="mt-4 h-40 w-40 rounded-2xl object-cover shadow-sm" /> : null}
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured product
            </label>
            <button className="rounded-full bg-[#6d4df2] px-5 py-4 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#5f3ed8]">
              {editingId ? 'Save Changes' : 'Upload Product'}
            </button>
          </form>

          <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white shadow-[0_18px_60px_rgba(9,17,31,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper">
                  <tr>
                    <th className="p-4">Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminProducts.map((product) => (
                    <tr key={product._id} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="h-12 w-12 rounded-xl object-cover" />
                          <span className="font-medium text-ink">{product.name}</span>
                        </div>
                      </td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>{product.inventoryCount}</td>
                      <td>
                        <button type="button" onClick={() => toggleFeaturedProduct(product)} className="rounded-full bg-paper px-3 py-1 transition-colors hover:bg-white">
                          {product.featured ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 sm:justify-start">
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="inline-flex items-center justify-center rounded-full bg-paper p-2 transition-all hover:bg-white sm:px-3 sm:py-1"
                            aria-label="Edit product"
                          >
                            <Edit size={16} />
                            <span className="ml-1 hidden sm:inline">Edit</span>
                          </button>
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => deleteProduct(product._id)}
                              className="inline-flex items-center justify-center rounded-full bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100 sm:px-3 sm:py-1"
                              aria-label="Delete product"
                            >
                              <Trash2 size={16} />
                              <span className="ml-1 hidden sm:inline">Delete</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
