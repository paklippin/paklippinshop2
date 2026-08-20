import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth } from './api';
import type { User } from './types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, full_name: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('paklippin_user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const u = await auth.login(email, password) as User;
    setUser(u);
    localStorage.setItem('paklippin_user', JSON.stringify(u));
  };

  const signup = async (email: string, password: string, full_name: string, phone?: string) => {
    const u = await auth.signup(email, password, full_name, phone) as User;
    setUser(u);
    localStorage.setItem('paklippin_user', JSON.stringify(u));
  };

  const refreshProfile = async () => {
    const stored = localStorage.getItem('paklippin_user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('paklippin_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
