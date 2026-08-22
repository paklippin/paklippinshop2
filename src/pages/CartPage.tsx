import { useNavigate } from '@/lib/router';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { formatPKR } from '@/lib/types';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  ShoppingCart,
} from 'lucide-react';

export function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const { session } = useAuth();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <ShoppingCart size={48} className="text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">
          Browse our products and add items to your cart.
        </p>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-6">
          <ShoppingBag size={18} />
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <button
        onClick={() => navigate('/shop')}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-green-600"
      >
        <ArrowLeft size={18} />
        Continue Shopping
      </button>

      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Shopping Cart ({totalItems})
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="card divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-4 p-4">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="h-24 w-24 shrink-0 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500">{item.product.category}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-brand-red-50 hover:text-brand-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-1.5 text-gray-600 hover:text-brand-green-600"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-1.5 text-gray-600 hover:text-brand-green-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-lg font-bold text-brand-green-700">
                      {formatPKR(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={clearCart}
            className="mt-4 text-sm font-medium text-brand-red-600 hover:text-brand-red-700"
          >
            Clear entire cart
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPKR(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium text-brand-green-600">
                  {totalPrice >= 5000 ? 'FREE' : 'Rs 200'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-base">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-brand-green-700">
                    {formatPKR(totalPrice + (totalPrice >= 5000 ? 0 : 200))}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(session ? '/checkout' : '/login')}
              className="btn-primary mt-6 w-full"
            >
              {session ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
