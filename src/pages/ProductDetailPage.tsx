import { useEffect, useState } from 'react';
import { navigate, useRoute } from './lib/router';
import { products as productsApi } from './lib/api';
import { useCart } from './lib/CartContext';
import type { Product } from './lib/types';
import { formatPKR } from './lib/types';
import { ShoppingCart, ArrowLeft, Loader2, Minus, Plus } from 'lucide-react';

export function ProductDetailPage() {
  const route = useRoute();
  const productId = route.split('/')[2];
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    productsApi.get(productId).then(data => { setProduct(data); setLoading(false); }).catch(() => setLoading(false));
  }, [productId]);
  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-brand-green-600" /></div>;
  if (!product) return <div className="text-center py-20"><p className="text-xl font-bold text-gray-900">Product not found</p><button onClick={() => navigate('/shop')} className="btn-primary mt-4">Back to Shop</button></div>;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green-600 mb-6"><ArrowLeft size={18} /> Back to Shop</button>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-80 md:h-96 bg-gradient-to-br from-brand-green-50 to-brand-orange-50 rounded-xl flex items-center justify-center">
          {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-xl" /> : <span className="text-6xl">🛍️</span>}
        </div>
        <div>
          <span className="text-sm text-brand-green-600 font-medium uppercase">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          <p className="text-2xl font-bold text-brand-green-700 mt-4">{formatPKR(product.price)}</p>
          <p className="text-gray-600 mt-4">{product.description}</p>
          <div className="mt-6"><span className={'text-sm font-medium ' + (product.stock > 0 ? 'text-brand-green-600' : 'text-brand-red-600')}>{product.stock > 0 ? 'In Stock (' + product.stock + ' available)' : 'Out of Stock'}</span></div>
          {product.stock > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1.5 border rounded-lg hover:bg-gray-50"><Minus size={16} /></button>
                  <span className="w-8 text-center font-medium">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-1.5 border rounded-lg hover:bg-gray-50"><Plus size={16} /></button>
                </div>
              </div>
              <button onClick={() => { addItem(product.id, product.name, product.price, product.image_url, product.stock, qty); navigate('/cart'); }} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg"><ShoppingCart size={20} /> Add to Cart — {formatPKR(product.price * qty)}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
