import { useState } from 'react';
import { Music } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AuthPage() {
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) await signUp(email, password);
      else await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm space-y-6 animate-[fade-in_0.4s_ease-out]">
        <div className="text-center">
          <div className="flex justify-center mb-4"><Music className="w-12 h-12 text-primary-500" /></div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">Voice Profile Analyzer</h1>
          <p className="text-gray-400 text-sm mt-1">Discover your voice</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          {error && <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm text-red-500">{error}</div>}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-lg px-3 py-2 text-sm border bg-gray-800 border-gray-700 text-white" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full rounded-lg px-3 py-2 text-sm border bg-gray-800 border-gray-700 text-white" placeholder="Min 6 characters" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary-600 hover:bg-primary-700 text-white py-2.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50">
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
          <button type="button" onClick={() => setIsSignUp(s => !s)} className="w-full text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200">
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}
