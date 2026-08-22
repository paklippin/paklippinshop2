import { useState } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User as UserIcon, Phone, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'signup';
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
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
      if (isSignup) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone },
          },
        });
        if (signUpError) throw signUpError;
        await refreshProfile();
        navigate('/');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        await refreshProfile();
        navigate('/');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (msg.includes('already registered')) {
        setError('This email is already registered. Please log in instead.');
      } else if (msg.includes('Password should be at least')) {
        setError('Password must be at least 6 characters long.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Logo */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-green-600 text-white font-bold text-2xl shadow-lg">
              PL
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isSignup
                ? 'Join PakLippin and start shopping'
                : 'Sign in to your PakLippin account'}
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-brand-red-50 px-4 py-3 text-sm text-brand-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label className="label-text">Full Name</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ahmed Khan"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-text">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="label-text">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  {isSignup ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium text-brand-green-600 hover:text-brand-green-700"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="font-medium text-brand-green-600 hover:text-brand-green-700"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        {isSignup && (
          <p className="mt-4 text-center text-xs text-gray-400">
            The first account created becomes the admin. All subsequent
            accounts are customers.
          </p>
        )}
      </div>
    </div>
  );
}
