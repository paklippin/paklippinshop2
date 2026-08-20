import { useState } from 'react';
import { navigate } from '@/lib/router';
import { useAuth } from '@/lib/AuthContext';
import { Mail, Lock, User as UserIcon, Phone, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';

interface AuthPageProps { mode: 'login' | 'signup'; }

export function AuthPage({ mode }: AuthPageProps) {
  const { login, signup, refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isSignup = mode === 'signup';
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) { await signup(email, password, fullName, phone); }
      else { await login(email, password); }
      await refreshProfile();
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('Invalid credentials')) setError('Invalid email or password.');
      else if (msg.includes('already registered')) setError('Email already registered. Please log in.');
      else setError(msg);
    } finally { setLoading(false); }
  }
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-green-600 text-white font-bold text-2xl">PL</div>
            <h1 className="text-2xl font-bold text-gray-900">{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="mt-1 text-sm text-gray-500">{isSignup ? 'Join PakLippin and start shopping' : 'Sign in to your PakLippin account'}</p>
          </div>
          {error && <div className="mb-4 flex items-start gap-2 rounded-lg bg-brand-red-50 px-4 py-3 text-sm text-brand-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><div className="relative"><UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ahmed Khan" className="input-field pl-10" /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><div className="relative"><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="03XX-XXXXXXX" className="input-field pl-10" /></div></div>
            </>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field pl-10" /></div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="input-field pl-10" /></div></div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">{loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}{loading ? (isSignup ? 'Creating...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In')}</button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            {isSignup ? <>Already have an account? <button onClick={() => navigate('/login')} className="font-medium text-brand-green-600">Sign in</button></> : <>Don't have an account? <button onClick={() => navigate('/signup')} className="font-medium text-brand-green-600">Sign up</button></>}
          </div>
        </div>
      </div>
    </div>
  );
}
