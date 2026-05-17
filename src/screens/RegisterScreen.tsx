import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Exam, ClassLevel } from '../types';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [exam, setExam] = useState<Exam>('NEET');
  const [classLevel, setClassLevel] = useState<ClassLevel>('Both');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const err = await register(name, email, password, exam, classLevel);
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col px-5 pb-10 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 pt-12 pb-6">
        <Link to="/login" className="text-slate-400 hover:text-white text-xl">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-slate-400 text-sm">Join AceIt and start preparing</p>
        </div>
      </header>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Name */}
        <Field label="Full Name">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="Arjun Sharma"
            autoComplete="name"
            className={inputCls}
          />
        </Field>

        {/* Email */}
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputCls}
          />
        </Field>

        {/* Password */}
        <Field label="Password">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              className={`${inputCls} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
            >
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </Field>

        {/* Exam */}
        <Field label="Target Exam">
          <div className="grid grid-cols-3 gap-2">
            {(['NEET', 'JEE_MAIN', 'JEE_ADVANCED'] as Exam[]).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setExam(e)}
                className={`py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                  exam === e
                    ? 'bg-primary border-primary text-white'
                    : 'border-slate-600 text-slate-400'
                }`}
              >
                {e.replace('_', ' ')}
              </button>
            ))}
          </div>
        </Field>

        {/* Class */}
        <Field label="Class Level">
          <div className="grid grid-cols-3 gap-2">
            {(['11', '12', 'Both'] as ClassLevel[]).map((cl) => (
              <button
                key={cl}
                type="button"
                onClick={() => setClassLevel(cl)}
                className={`py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                  classLevel === cl
                    ? 'bg-primary border-primary text-white'
                    : 'border-slate-600 text-slate-400'
                }`}
              >
                {cl === 'Both' ? 'Both' : `Class ${cl}`}
              </button>
            ))}
          </div>
        </Field>

        {/* Error */}
        {error && (
          <p className="text-danger text-xs bg-danger/10 border border-danger/30 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-sm active:scale-95 transition-all disabled:opacity-60 mt-2"
        >
          {loading ? 'Creating account…' : 'Create Account 🚀'}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-400 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}

const inputCls =
  'w-full bg-slate-800 border border-slate-700 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-slate-600';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
