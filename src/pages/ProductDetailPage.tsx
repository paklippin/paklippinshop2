import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import { formatPKR } from '@/lib/types';
import { useCart } from '@/lib/CartContext';
import {
  ShoppingCart,
  Check,
  ArrowLeft,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setProduct((data as Product) || null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-1/4 animate-pulse rounded bg-gray-200" />
            <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-xl font-semibold text-gray-700">Product not found</p>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-4">
          Back to Shop
        </button>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (!product || outOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!product || outOfStock) return;
    addToCart(product, quantity);
    navigate('/cart');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-fade-in">
      <button
        onClick={() => navigate('/shop')}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-green-600"
      >
        <ArrowLeft size={18} />
        Back to Shop
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
          <img
            src={product.image_url}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
          <span className="absolute left-4 top-4 badge bg-white/90 text-gray-700 shadow-sm">
            {product.category}
          </span>
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-brand-red-600 px-6 py-2 text-lg font-semibold text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-3 text-3xl font-bold text-brand-green-700">
            {formatPKR(product.price)}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span
              className={`badge ${
                outOfStock
                  ? 'bg-brand-red-100 text-brand-red-700'
                  : 'bg-brand-green-100 text-brand-green-700'
              }`}
            >
              {outOfStock ? 'Out of Stock' : `${product.stock} in stock`}
            </span>
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity selector */}
          {!outOfStock && (
            <div className="mt-6">
              <label className="label-text">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-gray-300">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-gray-600 hover:text-brand-green-600"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="p-2.5 text-gray-600 hover:text-brand-green-600"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Subtotal: {formatPKR(product.price * quantity)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex-1 ${
                added ? 'bg-brand-green-100 text-brand-green-700' : 'btn-outline'
              }`}
            >
              {added ? (
                <>
                  <Check size={18} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Add to Cart
                </>
              )}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="btn-primary flex-1"
            >
              Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-200 pt-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <Truck size={22} className="text-brand-green-600" />
              <span className="text-xs font-medium text-gray-600">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <ShieldCheck size={22} className="text-brand-green-600" />
              <span className="text-xs font-medium text-gray-600">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <RotateCcw size={22} className="text-brand-green-600" />
              <span className="text-xs font-medium text-gray-600">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
