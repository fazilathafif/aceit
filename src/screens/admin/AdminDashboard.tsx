import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, clearAdminToken, getAdminToken } from '../../lib/adminApi';
import type { AdminUser } from '../../lib/adminApi';

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="text-slate-400 text-xs mt-0.5">{label}</p>
    </div>
  );
}

function SubBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    free: 'bg-slate-700 text-slate-400 border-slate-600',
    cancelled: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    past_due: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${map[status] ?? map.free}`}>
      {status}
    </span>
  );
}

// ── Edit User Modal ───────────────────────────────────────────────────────────

function EditModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: (u: AdminUser) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [exam, setExam] = useState(user.exam);
  const [classLevel, setClassLevel] = useState(user.classLevel);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminApi.updateUser(user.id, { name, email, exam, classLevel });
      onSaved({ ...user, ...updated });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm outline-none transition-colors';
  const labelCls = 'text-xs font-medium text-slate-400 mb-1 block';

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-bold mb-4">Edit User</h2>
      <form onSubmit={save} className="space-y-3">
        <div><label className={labelCls}>Name</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className={labelCls}>Email</label><input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div>
          <label className={labelCls}>Exam</label>
          <select className={inputCls} value={exam} onChange={(e) => setExam(e.target.value)}>
            <option value="NEET">NEET</option>
            <option value="JEE_MAIN">JEE Main</option>
            <option value="JEE_ADVANCED">JEE Advanced</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Class Level</label>
          <select className={inputCls} value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
            <option value="Both">Both</option>
          </select>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-slate-200">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 font-semibold disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

// ── Reset Password Modal ──────────────────────────────────────────────────────

function ResetPwModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [newPw, setNewPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 6) { setError('Minimum 6 characters.'); return; }
    setSaving(true);
    try {
      await adminApi.resetPassword(userId, newPw);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-bold mb-4">Reset Password</h2>
      {done ? (
        <div className="text-center py-4">
          <p className="text-emerald-400 text-sm font-semibold mb-4">Password updated.</p>
          <button onClick={onClose} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold">Close</button>
        </div>
      ) : (
        <form onSubmit={save} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">New Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => { setNewPw(e.target.value); setError(''); }}
                placeholder="Min. 6 characters"
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm outline-none pr-12"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                {showPw ? 'hide' : 'show'}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-slate-200">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 font-semibold disabled:opacity-60">
              {saving ? 'Saving…' : 'Reset'}
            </button>
          </div>
        </form>
      )}
    </Overlay>
  );
}

// ── Subscription Modal ────────────────────────────────────────────────────────

function SubModal({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: (u: AdminUser) => void }) {
  const current = user.subscription?.status ?? 'free';
  const [status, setStatus] = useState(current);
  const [plan, setPlan] = useState(user.subscription?.plan ?? 'monthly');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.setSubscription(user.id, status, status === 'active' ? plan : undefined);
      onSaved({ ...user, subscription: { ...user.subscription, status, plan: status === 'active' ? plan : null, currentPeriodEnd: null } });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setSaving(false);
    }
  }

  const selectCls = 'w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm outline-none';

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-bold mb-1">Manage Subscription</h2>
      <p className="text-slate-500 text-xs mb-4">{user.name} · {user.email}</p>
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">Status</label>
          <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="free">Free</option>
            <option value="active">Active (Premium)</option>
            <option value="cancelled">Cancelled</option>
            <option value="past_due">Past Due</option>
          </select>
        </div>
        {status === 'active' && (
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Plan</label>
            <select className={selectCls} value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-slate-200">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 font-semibold disabled:opacity-60">
            {saving ? 'Saving…' : 'Update'}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteModal({ user, onClose, onDeleted }: { user: AdminUser; onClose: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    await adminApi.deleteUser(user.id);
    onDeleted();
    onClose();
  }

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-bold mb-2">Delete User?</h2>
      <p className="text-slate-400 text-sm mb-1"><span className="text-white font-semibold">{user.name}</span></p>
      <p className="text-slate-500 text-xs mb-5">{user.email} · This will permanently delete all their data and cannot be undone.</p>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-slate-200">Cancel</button>
        <button onClick={confirm} disabled={busy} className="flex-1 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 font-semibold disabled:opacity-60">
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Overlay>
  );
}

// ── Overlay wrapper ───────────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

type Modal =
  | { type: 'edit'; user: AdminUser }
  | { type: 'password'; userId: string }
  | { type: 'sub'; user: AdminUser }
  | { type: 'delete'; user: AdminUser };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'users' | 'stats'>('users');
  const [stats, setStats] = useState<{ totalUsers: number; premiumUsers: number; weeklySignups: number } | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [draftQ, setDraftQ] = useState('');
  const [modal, setModal] = useState<Modal | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');

  // Guard: redirect if no admin token
  useEffect(() => {
    if (!getAdminToken()) navigate('/admin/login', { replace: true });
  }, [navigate]);

  // Load stats
  useEffect(() => {
    adminApi.stats().then(setStats).catch(() => {});
  }, []);

  // Load users whenever q or page changes
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError('');
    try {
      const data = await adminApi.listUsers(q, page);
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoadingUsers(false);
    }
  }, [q, page]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  function signOut() {
    clearAdminToken();
    navigate('/admin/login', { replace: true });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQ(draftQ);
  }

  function patchUser(updated: AdminUser) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (stats && updated.subscription) {
      // optimistically refresh stats
      adminApi.stats().then(setStats).catch(() => {});
    }
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setTotal((n) => n - 1);
    adminApi.stats().then(setStats).catch(() => {});
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm">🛡</div>
          <div>
            <p className="font-bold text-sm leading-none">AceIt Admin</p>
            <p className="text-slate-500 text-[10px] mt-0.5">System Dashboard</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </header>

      {/* Tab bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6">
        <div className="flex gap-1">
          {(['users', 'stats'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'users' ? `Users${total ? ` (${total})` : ''}` : 'Stats'}
            </button>
          ))}
        </div>
      </div>

      <main className="p-6 max-w-6xl mx-auto">

        {/* ── Stats tab ── */}
        {tab === 'stats' && (
          <div className="space-y-6">
            {stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
                <StatCard label="Premium Subscribers" value={stats.premiumUsers} icon="⭐" />
                <StatCard label="New This Week" value={stats.weeklySignups} icon="📈" />
              </div>
            ) : (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {stats && (
              <div className="bg-slate-800 rounded-2xl p-5 space-y-3">
                <h2 className="font-semibold text-sm">Conversion Rate</h2>
                {stats.totalUsers > 0 ? (
                  <>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Free → Premium</span>
                      <span className="text-white font-semibold">
                        {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (stats.premiumUsers / stats.totalUsers) * 100)}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 text-sm">No users yet.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Users tab ── */}
        {tab === 'users' && (
          <div className="space-y-4">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="search"
                value={draftQ}
                onChange={(e) => setDraftQ(e.target.value)}
                placeholder="Search by name or email…"
                className="flex-1 bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-2 text-sm outline-none placeholder-slate-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Search
              </button>
            </form>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-slate-500 py-12 text-sm">No users found.</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block bg-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="text-left px-4 py-3 font-medium">User</th>
                        <th className="text-left px-4 py-3 font-medium">Exam</th>
                        <th className="text-left px-4 py-3 font-medium">Subscription</th>
                        <th className="text-left px-4 py-3 font-medium">XP</th>
                        <th className="text-left px-4 py-3 font-medium">Joined</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-slate-500 text-xs">{u.email}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-300 text-xs">{u.exam.replace('_', ' ')}</td>
                          <td className="px-4 py-3">
                            <SubBadge status={u.subscription?.status ?? 'free'} />
                          </td>
                          <td className="px-4 py-3 text-slate-300 text-xs">{u.gameProfile?.xp ?? 0} XP</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(u.createdAt)}</td>
                          <td className="px-4 py-3">
                            <UserActions user={u} onAction={setModal} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="sm:hidden space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className="bg-slate-800 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{u.name}</p>
                          <p className="text-slate-500 text-xs truncate">{u.email}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <SubBadge status={u.subscription?.status ?? 'free'} />
                            <span className="text-slate-600 text-[10px]">{u.exam.replace('_', ' ')}</span>
                            <span className="text-slate-600 text-[10px]">{u.gameProfile?.xp ?? 0} XP</span>
                          </div>
                        </div>
                        <UserActions user={u} onAction={setModal} compact />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1.5 rounded-lg text-xs border border-slate-700 text-slate-400 disabled:opacity-40 hover:text-slate-200"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs text-slate-500">Page {page} of {pages}</span>
                    <button
                      disabled={page === pages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg text-xs border border-slate-700 text-slate-400 disabled:opacity-40 hover:text-slate-200"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {modal?.type === 'edit' && (
        <EditModal user={modal.user} onClose={() => setModal(null)} onSaved={(u) => { patchUser(u); setModal(null); }} />
      )}
      {modal?.type === 'password' && (
        <ResetPwModal userId={modal.userId} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'sub' && (
        <SubModal user={modal.user} onClose={() => setModal(null)} onSaved={(u) => { patchUser(u); setModal(null); }} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal user={modal.user} onClose={() => setModal(null)} onDeleted={() => removeUser(modal.user.id)} />
      )}
    </div>
  );
}

// ── Actions dropdown (inline menu) ───────────────────────────────────────────

function UserActions({
  user,
  onAction,
  compact = false,
}: {
  user: AdminUser;
  onAction: (m: Modal) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const actions = [
    { label: 'Edit details', icon: '✏️', handler: () => onAction({ type: 'edit', user }) },
    { label: 'Reset password', icon: '🔑', handler: () => onAction({ type: 'password', userId: user.id }) },
    { label: 'Subscription', icon: '⭐', handler: () => onAction({ type: 'sub', user }) },
    { label: 'Delete user', icon: '🗑', handler: () => onAction({ type: 'delete', user }), danger: true },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`${compact ? 'p-2' : 'px-3 py-1.5'} rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors`}
      >
        {compact ? '⋯' : 'Actions ▾'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={() => { a.handler(); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-slate-700 transition-colors ${a.danger ? 'text-red-400' : 'text-slate-300'}`}
              >
                <span>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
