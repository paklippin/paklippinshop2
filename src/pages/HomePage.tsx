import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { useNavigate } from '@/lib/router';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setProducts((data as Product[]) || []);
        setLoading(false);
      });
  }, []);

  const categories = [
    { name: 'Clothing', icon: '🧥', color: 'bg-brand-green-50 text-brand-green-700' },
    { name: 'Electronics', icon: '📱', color: 'bg-brand-orange-50 text-brand-orange-700' },
    { name: 'Footwear', icon: '👟', color: 'bg-brand-red-50 text-brand-red-700' },
    { name: 'Grocery', icon: '🛒', color: 'bg-brand-green-50 text-brand-green-700' },
    { name: 'Accessories', icon: '👜', color: 'bg-brand-orange-50 text-brand-orange-700' },
    { name: 'Sports', icon: '🏏', color: 'bg-brand-red-50 text-brand-red-700' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-green-700 via-brand-green-600 to-brand-green-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-orange-400 blur-3xl" />
          <div className="absolute right-10 bottom-0 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-16 md:flex-row md:py-24">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block rounded-full bg-brand-orange-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg">
              Pakistan's #1 Online Marketplace
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
              PakLippin's Best
              <br />
              <span className="text-brand-orange-400">Delivered to You</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-brand-green-50">
              From traditional clothing to electronics, groceries, and more.
              Pay with EasyPaisa, JazzCash, Bank Transfer, Card, or Cash on Delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={() => navigate('/shop')}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-brand-green-700 shadow-lg transition-all hover:scale-105 hover:bg-gray-50"
              >
                <ShoppingCart size={20} />
                Start Shopping
              </button>
              <button
                onClick={() => navigate('/track')}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Track Order
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
          <div className="hidden flex-1 md:block">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-48 rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30" />
                  <div className="h-32 rounded-2xl bg-brand-orange-500/30 backdrop-blur-sm ring-1 ring-white/30" />
                </div>
                <div className="space-y-4 pt-12">
                  <div className="h-32 rounded-2xl bg-brand-orange-500/30 backdrop-blur-sm ring-1 ring-white/30" />
                  <div className="h-48 rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
          {[
            { icon: Truck, title: 'Fast Delivery', desc: 'All over Pakistan' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: '100% protected' },
            { icon: Tag, title: 'Best Prices', desc: 'Guaranteed lowest' },
            { icon: ShoppingCart, title: 'Easy Returns', desc: '7-day return policy' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-green-50 text-brand-green-600">
                <item.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Shop by Category</h2>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/shop?category=${cat.name}`)}
              className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all hover:scale-105 ${cat.color}`}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-1 text-sm font-medium text-brand-green-600 hover:text-brand-green-700"
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
