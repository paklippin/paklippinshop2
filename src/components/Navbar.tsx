import { navigate } from './lib/router';
import { useAuth } from './lib/AuthContext';
import { useCart } from './lib/CartContext';
import { ShoppingCart, Package, LogOut, User, Store } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <Store size={28} className="text-brand-green-600" />
            <span className="text-xl font-bold text-gray-900">PakLippin</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/shop')} className="text-sm font-medium text-gray-600 hover:text-brand-green-600">Shop</button>
            <button onClick={() => navigate('/cart')} className="relative p-2 text-gray-600 hover:text-brand-green-600">
              <ShoppingCart size={20} />
              {itemCount > 0 && <span className="absolute -top-1 -right-1 bg-brand-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{itemCount}</span>}
            </button>
            {user ? (
              <>
                <button onClick={() => navigate('/orders')} className="p-2 text-gray-600 hover:text-brand-green-600"><Package size={20} /></button>
                {user.role === 'admin' && <button onClick={() => navigate('/admin')} className="text-sm font-medium text-brand-green-600">Admin</button>}
                <div className="flex items-center gap-2 text-sm text-gray-500"><User size={16} /><span className="hidden sm:inline">{user.full_name}</span></div>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-brand-red-600"><LogOut size={18} /></button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="btn-primary text-sm">Sign In</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
