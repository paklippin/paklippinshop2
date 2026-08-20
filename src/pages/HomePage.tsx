import { useEffect, useState } from 'react';
import { navigate } from '@/lib/router';
import { products as productsApi, categories as categoriesApi } from '@/lib/api';
import { useCart } from '@/lib/CartContext';
import type { Product } from '@/lib/types';
import { formatPKR } from '@/lib/types';
import { ShoppingCart, Truck, Shield, RefreshCw } from 'lucide-react';

export function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const { addItem } = useCart();
  useEffect(() => {
    productsApi.list().then(setFeatured);
    categoriesApi.list().then(setCategories);
  }, []);
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-green-700 via-brand-green-600 to-brand-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Welcome to PakLippin</h1>
          <p className="text-lg sm:text-xl text-brand-green-100 mb-8 max-w-2xl mx-auto">Discover authentic Pakistani products delivered to your doorstep.</p>
          <button onClick={() => navigate('/shop')} className="bg-white text-brand-green-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-brand-green-50">Start Shopping</button>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-3 gap-6">
          {[{icon:Truck,t:'Free Delivery',d:'On orders over Rs 2,000'},{icon:Shield,t:'Secure Payment',d:'JazzCash, EasyPaisa & COD'},{icon:RefreshCw,t:'Easy Returns',d:'7-day return policy'}].map(({icon:Icon,t,d}) => (
            <div key={t} className="card p-6 text-center"><Icon size={32} className="text-brand-green-600 mx-auto mb-3" /><h3 className="font-bold text-gray-900">{t}</h3><p className="text-sm text-gray-500">{d}</p></div>
          ))}
        </div>
      </section>
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => <button key={cat} onClick={() => navigate('/shop?category='+cat)} className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:border-brand-green-500 hover:text-brand-green-600 capitalize">{cat}</button>)}
          </div>
        </section>
      )}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.slice(0, 8).map(p => (
            <div key={p.id} className="card overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-brand-green-50 to-brand-orange-50 flex items-center justify-center cursor-pointer" onClick={() => navigate('/product/'+p.id)}>
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-4xl">🛍️</span>}
              </div>
              <div className="p-4">
                <span className="text-xs text-brand-green-600 font-medium uppercase">{p.category}</span>
                <h3 className="font-semibold text-gray-900 mt-1 cursor-pointer hover:text-brand-green-600" onClick={() => navigate('/product/'+p.id)}>{p.name}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-brand-green-700">{formatPKR(p.price)}</span>
                  <button onClick={() => addItem(p.id, p.name, p.price, p.image_url, p.stock)} className="p-2 bg-brand-green-100 text-brand-green-700 rounded-lg hover:bg-brand-green-200"><ShoppingCart size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
