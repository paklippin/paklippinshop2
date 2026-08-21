import { useEffect, useState } from 'react';
import { navigate, useRoute } from '../lib/router';
import { products as productsApi, categories as categoriesApi } from '../lib/api';
import { useCart } from '../lib/CartContext';
import type { Product } from '../lib/types';
import { formatPKR } from '../lib/types';
import { ShoppingCart, Search, Loader2 } from 'lucide-react';

export function ShopPage() {
  const route = useRoute();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  useEffect(() => {
    const params = new URLSearchParams(route.split('?')[1]);
    const cat = params.get('category');
    if (cat) setSelectedCategory(cat);
  }, [route]);
  useEffect(() => {
    setLoading(true);
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    productsApi.list(cat).then(data => { setProducts(data); setLoading(false); });
    categoriesApi.list().then(setCategories);
  }, [selectedCategory]);
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shop</h1>
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setSelectedCategory('all')} className={'px-4 py-2 rounded-lg text-sm font-medium ' + (selectedCategory === 'all' ? 'bg-brand-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>All</button>
        {categories.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={'px-4 py-2 rounded-lg text-sm font-medium capitalize ' + (selectedCategory === cat ? 'bg-brand-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{cat}</button>)}
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-brand-green-600" /></div>
      : filtered.length === 0 ? <div className="text-center py-12 text-gray-500"><p className="text-lg">No products found</p></div>
      : <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(p => (
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
        </div>}
    </div>
  );
}
