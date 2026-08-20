import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { cart as cartApi } from './api';
import { useAuth } from './AuthContext';
import type { CartItem } from './types';

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, productName: string, price: number, imageUrl: string, stock: number, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (user) { cartApi.get(user.id).then(setItems).catch(() => {}); }
    else {
      const stored = localStorage.getItem('paklippin_cart');
      if (stored) { try { setItems(JSON.parse(stored)); } catch {} }
    }
  }, [user]);

  useEffect(() => {
    if (!user) { localStorage.setItem('paklippin_cart', JSON.stringify(items)); }
  }, [items, user]);

  const addItem = async (productId: string, productName: string, price: number, imageUrl: string, stock: number, quantity = 1) => {
    if (user) {
      await cartApi.add(user.id, productId, quantity);
      const updated = await cartApi.get(user.id);
      setItems(updated);
    } else {
      setItems(prev => {
        const existing = prev.find(i => i.product_id === productId);
        if (existing) {
          return prev.map(i => i.product_id === productId ? { ...i, quantity: i.quantity + quantity } : i);
        }
        return [...prev, { id: "temp-" + Date.now(), product_id: productId, product_name: productName, price, image_url: imageUrl, stock, quantity }];
      });
    }
  };

  const removeItem = async (itemId: string) => {
    if (user) { await cartApi.remove(user.id, itemId); const updated = await cartApi.get(user.id); setItems(updated); }
    else { setItems(prev => prev.filter(i => i.id !== itemId)); }
  };

  const clearCart = async () => {
    if (user) { await cartApi.clear(user.id); }
    setItems([]);
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount, loading: false }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
