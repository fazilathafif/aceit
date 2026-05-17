import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, saveAdminToken } from '../../lib/adminApi';

export default function AdminLoginScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'setup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('All fields are required.'); return; }
    if (mode === 'setup' && !name.trim()) { setError('Admin name is required.'); return; }
    setLoading(true);
    try {
      let res;
      if (mode === 'setup') {
        res = await adminApi.makeFirstAdmin(name, email, password);
      } else {
        res = await adminApi.login(email, password);
      }
      saveAdminToken(res.token, remember);
      navigate('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors placeholder-slate-500';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-3">
            <span className="text-2xl">🛡</span>
          </div>
          <h1 className="text-2xl font-bold">AceIt Admin</h1>
          <p className="text-slate-500 text-sm mt-1">System Administration</p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
          {(['login', 'setup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                mode === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m === 'login' ? 'Admin Sign In' : 'First-Time Setup'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'setup' && (
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Admin Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="Super Admin"
                className={inputCls}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@aceit.app"
              autoComplete="email"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder={mode === 'setup' ? 'Min. 8 characters' : '••••••••'}
                autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"
              >
                {showPw ? 'hide' : 'show'}
              </button>
            </div>
          </div>

          {/* Remember me — login mode only */}
          {mode === 'login' && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
              <span className="text-sm text-slate-300">Remember me</span>
            </label>
          )}

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 mt-1"
          >
            {loading ? 'Please wait…' : mode === 'setup' ? 'Create Admin Account' : 'Sign In'}
          </button>
        </form>

        {mode === 'setup' && (
          <p className="text-slate-600 text-xs text-center mt-4">
            This form only works when no admin account exists yet.
          </p>
        )}
      </div>
    </div>
  );
}
