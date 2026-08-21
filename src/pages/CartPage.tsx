import { navigate } from '../lib/router';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';
import { formatPKR } from '../lib/types';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';

export function CartPage() {
  const { items, removeItem, clearCart, total, itemCount } = useCart();
  const { user } = useAuth();
  if (items.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add some products to get started!</p>
      <button onClick={() => navigate('/shop')} className="btn-primary">Browse Products</button>
    </div>
  );
  const deliveryFee = total >= 2000 ? 0 : 150;
  const grandTotal = total + deliveryFee;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({itemCount} items)</h1>
        <button onClick={clearCart} className="text-sm text-brand-red-600 hover:underline">Clear All</button>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-green-50 to-brand-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.image_url ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover rounded-lg" /> : <span className="text-2xl">🛍️</span>}
              </div>
              <div className="flex-1 min-w-0"><h3 className="font-medium text-gray-900 truncate">{item.product_name}</h3><p className="text-sm text-gray-500">{formatPKR(item.price)} each</p></div>
              <div className="text-right"><p className="font-bold text-gray-900">{formatPKR(item.price * item.quantity)}</p><p className="text-xs text-gray-400">Qty: {item.quantity}</p></div>
              <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-brand-red-600"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
        <div className="card p-6 h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatPKR(total)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="font-medium">{deliveryFee === 0 ? 'Free' : formatPKR(deliveryFee)}</span></div>
            {deliveryFee > 0 && <p className="text-xs text-brand-green-600">Add Rs {2000 - total} more for free delivery</p>}
            <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-brand-green-700">{formatPKR(grandTotal)}</span></div>
          </div>
          <button onClick={() => { if (!user) { navigate('/login'); return; } navigate('/checkout'); }} className="btn-primary w-full mt-4 py-3">{user ? 'Proceed to Checkout' : 'Sign In to Checkout'}</button>
        </div>
      </div>
    </div>
  );
}
