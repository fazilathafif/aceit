import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, loginDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    // Tiny delay for UX feel
    await new Promise((r) => setTimeout(r, 300));
    const err = await login(email, password, remember);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      navigate('/');
    }
  }

  function handleDemo(id: 'demo_neet' | 'demo_jee') {
    loginDemo(id);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center px-5 max-w-lg mx-auto">
      {/* Logo */}
      <div className="text-center mb-8">
        <p className="text-5xl mb-3">🎓</p>
        <h1 className="text-3xl font-bold">AceIt</h1>
        <p className="text-slate-400 text-sm mt-1">Study Smart - On the Go</p>
        <p className="text-slate-600 text-xs mt-1">© Afif</p>
      </div>

      {/* Demo buttons */}
      <div className="w-full mb-6">
        <p className="text-center text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
          Try a demo account
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleDemo('demo_neet')}
            className="bg-indigo-900/60 border border-indigo-700 rounded-2xl p-3.5 text-left active:scale-95 transition-transform"
          >
            <p className="text-base">🧬</p>
            <p className="font-semibold text-sm mt-1">NEET Student</p>
            <p className="text-xs text-slate-400">Physics · Chem · Bio</p>
          </button>
          <button
            onClick={() => handleDemo('demo_jee')}
            className="bg-indigo-900/60 border border-indigo-700 rounded-2xl p-3.5 text-left active:scale-95 transition-transform"
          >
            <p className="text-base">📐</p>
            <p className="font-semibold text-sm mt-1">JEE Student</p>
            <p className="text-xs text-slate-400">Physics · Chem · Math</p>
          </button>
        </div>
        <button
          onClick={() => navigate('/admin/login')}
          className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl p-3 flex items-center gap-3 active:scale-95 transition-transform"
        >
          <span className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-base flex-shrink-0">🛡</span>
          <div className="text-left">
            <p className="font-semibold text-sm">Sysadmin Panel</p>
            <p className="text-xs text-slate-500">User &amp; subscription management</p>
          </div>
          <span className="ml-auto text-slate-600 text-xs">→</span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-full flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-slate-700" />
        <span className="text-xs text-slate-500">or sign in with your account</span>
        <div className="flex-1 h-px bg-slate-700" />
      </div>

      {/* Sign-in form */}
      <form onSubmit={handleSignIn} className="w-full space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full bg-slate-800 border border-slate-700 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-slate-600"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full bg-slate-800 border border-slate-700 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-slate-600 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
            >
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 accent-indigo-500 rounded"
          />
          <span className="text-sm text-slate-300">Remember me</span>
        </label>

        {/* Error */}
        {error && (
          <p className="text-danger text-xs bg-danger/10 border border-danger/30 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-sm active:scale-95 transition-all disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-400">
        New here?{' '}
        <Link to="/register" className="text-primary font-semibold">
          Create account →
        </Link>
      </p>
    </div>
  );
}
