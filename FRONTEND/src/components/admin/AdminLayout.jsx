import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, LayoutDashboard, ShoppingBag, UploadCloud, Users } from 'lucide-react';
import { useAppStore } from '@/context/useAppStore';

const AdminLayout = () => {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const adminOrders = useAppStore((state) => state.adminOrders);
  const pendingProducts = useAppStore((state) => state.pendingProducts);
  const isAdmin = user?.role === 'admin';
  const canViewAnalytics = user?.role === 'admin' || user?.role === 'manager';
  const totalOrders = (adminOrders?.pendingOrders?.length || 0) + (adminOrders?.deliveredOrders?.length || 0);
  const pendingUploadsCount = pendingProducts?.length || 0;

  const navItems = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, show: true },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingBag, count: totalOrders, show: true },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3, show: canViewAnalytics },
    { label: 'People', to: '/admin/people', icon: Users, show: isAdmin },
    { label: 'Pending Uploads', to: '/admin/pending-uploads', mobileLabel: 'Uploads', icon: UploadCloud, count: pendingUploadsCount, show: isAdmin }
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-80 lg:flex">
        <div className="flex h-full w-full flex-col overflow-hidden border-r border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(9,17,31,0.08)] backdrop-blur-xl">
          <nav className="flex-1 space-y-1 overflow-y-auto p-3 pt-6">
            {navItems.map((item) => {
              const active = item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-paper ${active ? 'bg-[linear-gradient(135deg,rgba(109,77,242,0.14),rgba(255,122,168,0.14))] text-ink shadow-sm ring-1 ring-[#6d4df2]/10' : 'text-ink/70'}`}
                >
                  <item.icon size={18} className={active ? 'text-[#6d4df2]' : 'text-ink/50'} />
                  <span className="flex items-center gap-2">
                    <span>{item.label}</span>
                    {typeof item.count === 'number' ? (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? 'text-white/80 bg-[#6d4df2]' : 'bg-paper text-ink/55'}`}>
                        {item.count}
                      </span>
                    ) : null}
                  </span>
                  {active ? <span className="ml-auto h-2 w-2 rounded-full bg-[#6d4df2]" /> : <span className="ml-auto" />}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-ink/5 px-6 py-5 text-xs text-ink/45">
            Signed in as <span className="font-semibold text-ink">{user?.name || 'Admin'}</span>
          </div>
        </div>
      </aside>

      <div className="lg:hidden">
        <div className="sticky top-0 z-20 border-b border-white/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-ink/45">Admin</p>
              <p className="text-sm font-bold text-ink">{user?.name || 'Control Center'}</p>
            </div>
            <Link to="/" className="rounded-full bg-paper px-4 py-2 text-xs font-semibold text-ink">
              View Store
            </Link>
          </div>
          <nav
            className="flex items-center gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Admin navigation"
          >
            {navItems.map((item) => {
              const active = item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.to);
              const label = item.mobileLabel || item.label;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-3 text-[11px] font-semibold leading-none transition-all duration-200 active:scale-[0.98] ${active ? 'bg-[#6d4df2] text-white shadow-md' : 'bg-paper text-ink/75 hover:bg-white'}`}
                >
                  <item.icon size={18} />
                  <span className="text-center">
                    {typeof item.count === 'number' ? `${item.count} ` : ''}
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="min-w-0 lg:pl-80">
        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
