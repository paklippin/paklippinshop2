import { useEffect, useState } from 'react';
import { useNavigate, useRoute, parseRoute } from '@/lib/router';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ClipboardList,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { AdminOverview } from '@/pages/admin/AdminOverview';
import { AdminPOS } from '@/pages/admin/AdminPOS';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminOrders } from '@/pages/admin/AdminOrders';
import { AdminOrderDetail } from '@/pages/admin/AdminOrderDetail';

export function AdminPage() {
  const route = useRoute();
  const navigate = useNavigate();
  const { profile, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const parsed = parseRoute(route);
  const subPage = parsed.params[0] || 'dashboard';
  const orderId = parsed.params[1];

  useEffect(() => {
    if (!loading && (!profile || !isAdmin)) {
      navigate('/');
    }
  }, [profile, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div>
          <p className="text-xl font-bold text-gray-900">Access Denied</p>
          <p className="mt-2 text-gray-500">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS — Point of Sale', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
  ];

  function handleNav(id: string) {
    navigate(`/admin/${id}`);
    setSidebarOpen(false);
  }

  function renderPage() {
    switch (subPage) {
      case 'dashboard':
        return <AdminOverview />;
      case 'pos':
        return <AdminPOS />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return orderId ? (
          <AdminOrderDetail orderId={orderId} />
        ) : (
          <AdminOrders />
        );
      default:
        return <AdminOverview />;
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900 transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red-600 text-sm font-bold text-white">
              AD
            </div>
            <span className="font-bold text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                subPage === item.id
                  ? 'bg-brand-green-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 p-3">
          <div className="mb-2 rounded-lg bg-gray-800 p-3">
            <p className="text-xs font-medium text-white">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <LogOut size={18} />
            Back to Store
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-gray-900">Admin Panel</span>
        </div>

        <div className="p-4 md:p-6">{renderPage()}</div>
      </div>
    </div>
  );
}
