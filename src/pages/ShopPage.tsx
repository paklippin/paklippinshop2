import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { useRoute } from '@/lib/router';

export function ShopPage() {
  const route = useRoute();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Parse category from hash query
  const queryCategory = useMemo(() => {
    const queryIdx = route.indexOf('?');
    if (queryIdx === -1) return '';
    const params = new URLSearchParams(route.slice(queryIdx + 1));
    return params.get('category') || '';
  }, [route]);

  useEffect(() => {
    if (queryCategory) setSelectedCategory(queryCategory);
  }, [queryCategory]);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: sortBy === 'newest' })
      .then(({ data }) => {
        setProducts((data as Product[]) || []);
        setLoading(false);
      });
  }, [sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    }
    return result;
  }, [products, selectedCategory, search, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-fade-in">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Shop All Products</h1>

      {/* Search + sort */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 focus:border-brand-green-600 focus:outline-none focus:ring-2 focus:ring-brand-green-600/20"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-brand-green-600 text-white shadow-sm'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card h-72 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">No products found</p>
          <p className="text-sm text-gray-400">Try a different search or category</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
