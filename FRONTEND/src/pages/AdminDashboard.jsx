import { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';

const empty = { name: '', description: '', price: '', image: '', category: '', inventoryCount: '', featured: false };

const AdminDashboard = () => {
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
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#7a5af8_0%,#b46ff7_52%,#ff7aa8_100%)] p-8 text-white shadow-[0_24px_80px_rgba(109,77,242,0.25)]">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Admin dashboard</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Manage products safely.</h1>
        <p className="mt-4 max-w-2xl text-white/80">Upload, edit, and feature products from one protected screen.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/admin/orders" className="rounded-full bg-white px-5 py-3 font-semibold text-[#6d4df2]">Orders</Link>
          {canViewAnalytics ? <Link to="/admin/analytics" className="rounded-full bg-white/15 px-5 py-3 font-semibold text-white">Analytics</Link> : null}
          {isAdmin ? <Link to="/admin/people" className="rounded-full bg-white/15 px-5 py-3 font-semibold text-white">People</Link> : null}
          {isAdmin ? <Link to="/admin/pending-uploads" className="rounded-full bg-white/15 px-5 py-3 font-semibold text-white">Pending Uploads</Link> : null}
        </div>
      </div>
      {isAdmin ? (
        <div className="mt-6 rounded-[1.5rem] border border-white/70 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Approval Settings</p>
              <h2 className="text-xl font-bold text-ink">Require Manager Product Approval</h2>
            </div>
            <button
              type="button"
              onClick={() => updateSettings({ requireManagerApproval: !settings?.requireManagerApproval })}
              className={`rounded-full px-5 py-3 font-semibold ${settings?.requireManagerApproval ? 'bg-[#6d4df2] text-white' : 'bg-paper text-ink'}`}
            >
              {settings?.requireManagerApproval ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/70 bg-white p-6 md:grid-cols-2">
        <div className="md:col-span-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          {editingId ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
        <input required className="rounded-2xl border border-ink/10 bg-paper p-4 outline-none" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required className="rounded-2xl border border-ink/10 bg-paper p-4 outline-none" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input required className="rounded-2xl border border-ink/10 bg-paper p-4 outline-none" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input required className="rounded-2xl border border-ink/10 bg-paper p-4 outline-none" placeholder="Stock" type="number" value={form.inventoryCount} onChange={(e) => setForm({ ...form, inventoryCount: e.target.value })} />
        <textarea required className="min-h-32 rounded-2xl border border-ink/10 bg-paper p-4 outline-none md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-ink">Product image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full rounded-2xl border border-ink/10 bg-paper p-4 outline-none" />
          {preview ? <img src={preview} alt="Preview" className="mt-4 h-40 w-40 rounded-2xl object-cover" /> : null}
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Featured product
        </label>
        <button className="rounded-full bg-[#6d4df2] px-5 py-4 font-semibold text-white">
          {editingId ? 'Save Changes' : 'Upload Product'}
        </button>
      </form>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper"><tr><th className="p-4">Name</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
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
                <td><button type="button" onClick={() => toggleFeaturedProduct(product)} className="rounded-full bg-paper px-3 py-1">{product.featured ? 'Yes' : 'No'}</button></td>
                <td className="p-4">
        <div className="flex items-center gap-2 justify-end sm:justify-start">

          {/* EDIT */}
          <button
            type="button"
            onClick={() => startEdit(product)}
            className="inline-flex items-center justify-center rounded-full bg-paper p-2 sm:px-3 sm:py-1"
            aria-label="Edit product"
          >
            <Edit size={16} />
            <span className="hidden sm:inline ml-1">Edit</span>
          </button>

          {/* DELETE */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => deleteProduct(product._id)}
              className="inline-flex items-center justify-center rounded-full bg-red-50 p-2 text-red-600 sm:px-3 sm:py-1"
              aria-label="Delete product"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline ml-1">Delete</span>
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
  );
};

export default AdminDashboard;
