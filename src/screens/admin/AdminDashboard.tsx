import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, clearAdminToken, getAdminToken } from '../../lib/adminApi';
import type { AdminUser, AdminPlan, PlanInput } from '../../lib/adminApi';

// ── Shared helpers ────────────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
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

const inputCls = 'w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm outline-none transition-colors';
const labelCls = 'text-xs font-medium text-slate-400 mb-1 block';

// ── Create User Modal ─────────────────────────────────────────────────────────

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: AdminUser) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [exam, setExam] = useState('NEET');
  const [classLevel, setClassLevel] = useState('Both');
  const [isPremium, setIsPremium] = useState(false);
  const [plan, setPlan] = useState('monthly');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) { setError('Name, email and password are required.'); return; }
    setSaving(true);
    try {
      const user = await adminApi.createUser({ name, email, password, exam, classLevel, isPremium, plan: isPremium ? plan : undefined });
      onCreated(user);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-bold mb-1">Create Test User</h2>
      <p className="text-slate-500 text-xs mb-4">Add a demo or test account for QA purposes.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div><label className={labelCls}>Full Name</label><input className={inputCls} value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="Arjun Sharma" /></div>
        <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="test@aceit.app" /></div>
        <div>
          <label className={labelCls}>Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} className={`${inputCls} pr-12`} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Min. 6 characters" />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{showPw ? 'hide' : 'show'}</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Exam</label>
            <select className={inputCls} value={exam} onChange={(e) => setExam(e.target.value)}>
              <option value="NEET">NEET</option>
              <option value="JEE_MAIN">JEE Main</option>
              <option value="JEE_ADVANCED">JEE Advanced</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Class</label>
            <select className={inputCls} value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
              <option value="Both">Both</option>
            </select>
          </div>
        </div>

        {/* Subscription toggle */}
        <div className="bg-slate-900 rounded-xl p-3 space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium">Grant Premium Access</span>
            <button
              type="button"
              onClick={() => setIsPremium((v) => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${isPremium ? 'bg-indigo-600' : 'bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPremium ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
          {isPremium && (
            <div>
              <label className={labelCls}>Plan</label>
              <select className={inputCls} value={plan} onChange={(e) => setPlan(e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-slate-200">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 font-semibold disabled:opacity-60">
            {saving ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

// ── Edit User Modal ───────────────────────────────────────────────────────────

function EditUserModal({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: (u: AdminUser) => void }) {
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

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-bold mb-4">Edit User</h2>
      <form onSubmit={save} className="space-y-3">
        <div><label className={labelCls}>Name</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className={labelCls}>Email</label><input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div>
          <label className={labelCls}>Exam</label>
          <select className={inputCls} value={exam} onChange={(e) => setExam(e.target.value)}>
            <option value="NEET">NEET</option><option value="JEE_MAIN">JEE Main</option><option value="JEE_ADVANCED">JEE Advanced</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Class Level</label>
          <select className={inputCls} value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
            <option value="11">Class 11</option><option value="12">Class 12</option><option value="Both">Both</option>
          </select>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-slate-200">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 font-semibold disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
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
    try { await adminApi.resetPassword(userId, newPw); setDone(true); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed.'); }
    finally { setSaving(false); }
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
            <label className={labelCls}>New Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={newPw} onChange={(e) => { setNewPw(e.target.value); setError(''); }} placeholder="Min. 6 characters" className={`${inputCls} pr-12`} />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{showPw ? 'hide' : 'show'}</button>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-slate-200">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 font-semibold disabled:opacity-60">{saving ? 'Saving…' : 'Reset'}</button>
          </div>
        </form>
      )}
    </Overlay>
  );
}

// ── Subscription Modal ────────────────────────────────────────────────────────

function SubModal({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: (u: AdminUser) => void }) {
  const [status, setStatus] = useState(user.subscription?.status ?? 'free');
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
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed.'); }
    finally { setSaving(false); }
  }

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-bold mb-1">Manage Subscription</h2>
      <p className="text-slate-500 text-xs mb-4">{user.name} · {user.email}</p>
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="free">Free</option>
            <option value="active">Active (Premium)</option>
            <option value="cancelled">Cancelled</option>
            <option value="past_due">Past Due</option>
          </select>
        </div>
        {status === 'active' && (
          <div>
            <label className={labelCls}>Plan</label>
            <select className={inputCls} value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-slate-200">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 font-semibold disabled:opacity-60">{saving ? 'Saving…' : 'Update'}</button>
        </div>
      </form>
    </Overlay>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteUserModal({ user, onClose, onDeleted }: { user: AdminUser; onClose: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  async function confirm() { setBusy(true); await adminApi.deleteUser(user.id); onDeleted(); onClose(); }

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-bold mb-2">Delete User?</h2>
      <p className="text-slate-400 text-sm mb-1"><span className="text-white font-semibold">{user.name}</span></p>
      <p className="text-slate-500 text-xs mb-5">{user.email} · All data will be permanently deleted.</p>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-slate-200">Cancel</button>
        <button onClick={confirm} disabled={busy} className="flex-1 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 font-semibold disabled:opacity-60">{busy ? 'Deleting…' : 'Delete'}</button>
      </div>
    </Overlay>
  );
}

// ── User Actions Dropdown ─────────────────────────────────────────────────────

type UserModal =
  | { type: 'edit'; user: AdminUser }
  | { type: 'password'; userId: string }
  | { type: 'sub'; user: AdminUser }
  | { type: 'delete'; user: AdminUser };

function UserActions({ user, onAction, compact = false }: { user: AdminUser; onAction: (m: UserModal) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const actions = [
    { label: 'Edit details', icon: '✏️', handler: () => onAction({ type: 'edit', user }) },
    { label: 'Reset password', icon: '🔑', handler: () => onAction({ type: 'password', userId: user.id }) },
    { label: 'Subscription', icon: '⭐', handler: () => onAction({ type: 'sub', user }) },
    { label: 'Delete user', icon: '🗑', handler: () => onAction({ type: 'delete', user }), danger: true },
  ];
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className={`${compact ? 'p-2' : 'px-3 py-1.5'} rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors`}>
        {compact ? '⋯' : 'Actions ▾'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
            {actions.map((a) => (
              <button key={a.label} onClick={() => { a.handler(); setOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-slate-700 transition-colors ${a.danger ? 'text-red-400' : 'text-slate-300'}`}>
                <span>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, onEdit, onDelete }: { plan: AdminPlan; onEdit: (p: AdminPlan) => void; onDelete: (p: AdminPlan) => void }) {
  const cycleLabel: Record<string, string> = { free: 'Free tier', monthly: '/month', yearly: '/year', lifetime: 'one-time' };
  return (
    <div className={`bg-slate-800 rounded-2xl p-5 border ${plan.isActive ? 'border-slate-700' : 'border-slate-700/40 opacity-60'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base">{plan.name}</h3>
            {!plan.isActive && <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-semibold">Inactive</span>}
          </div>
          <p className="text-2xl font-bold text-indigo-400 mt-1">
            {plan.priceUsd === 0 ? 'Free' : `$${plan.priceUsd.toFixed(2)}`}
            <span className="text-slate-500 text-sm font-normal ml-1">{cycleLabel[plan.billingCycle] ?? plan.billingCycle}</span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(plan)} className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-xs">✏️</button>
          <button onClick={() => onDelete(plan)} className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-red-400 text-xs">🗑</button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-slate-400">
          <span className="text-white font-semibold">{plan.subscriberCount}</span> {plan.billingCycle === 'free' ? 'free users' : 'subscribers'}
        </span>
        {plan.stripePriceId && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold">Stripe linked</span>}
      </div>

      <ul className="space-y-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>{f}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Plan Edit/Create Modal ────────────────────────────────────────────────────

function PlanModal({
  plan,
  onClose,
  onSaved,
}: {
  plan?: AdminPlan;
  onClose: () => void;
  onSaved: (p: AdminPlan) => void;
}) {
  const isEdit = !!plan;
  const [name, setName] = useState(plan?.name ?? '');
  const [billingCycle, setBillingCycle] = useState(plan?.billingCycle ?? 'monthly');
  const [priceUsd, setPriceUsd] = useState(plan?.priceUsd.toString() ?? '4.99');
  const [stripePriceId, setStripePriceId] = useState(plan?.stripePriceId ?? '');
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [featuresText, setFeaturesText] = useState((plan?.features ?? []).join('\n'));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const price = parseFloat(priceUsd);
    if (!name || isNaN(price)) { setError('Name and a valid price are required.'); return; }
    const features = featuresText.split('\n').map((f) => f.trim()).filter(Boolean);
    setSaving(true);
    try {
      const data: PlanInput & { isActive?: boolean } = { name, billingCycle, priceUsd: price, features, stripePriceId: stripePriceId || undefined, isActive };
      const saved = isEdit
        ? await adminApi.updatePlan(plan!.id, data)
        : await adminApi.createPlan(data);
      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-bold mb-4">{isEdit ? 'Edit Plan' : 'Create Plan'}</h2>
      <form onSubmit={save} className="space-y-3">
        <div><label className={labelCls}>Plan Name</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monthly" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Billing Cycle</label>
            <select className={inputCls} value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
              <option value="free">Free</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Price (USD)</label>
            <input type="number" step="0.01" min="0" className={inputCls} value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} />
          </div>
        </div>
        <div><label className={labelCls}>Stripe Price ID <span className="text-slate-600">(optional)</span></label><input className={inputCls} value={stripePriceId} onChange={(e) => setStripePriceId(e.target.value)} placeholder="price_..." /></div>
        <div>
          <label className={labelCls}>Features <span className="text-slate-600">(one per line)</span></label>
          <textarea
            className={`${inputCls} h-32 resize-none`}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder={"Unlimited quizzes\nAI Tutor\nMock tests"}
          />
        </div>
        {isEdit && (
          <label className="flex items-center justify-between cursor-pointer bg-slate-900 rounded-xl px-3 py-2.5">
            <span className="text-sm">Active</span>
            <button type="button" onClick={() => setIsActive((v) => !v)} className={`w-10 h-5 rounded-full transition-colors relative ${isActive ? 'bg-indigo-600' : 'bg-slate-600'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
        )}
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-slate-200">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 font-semibold disabled:opacity-60">{saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}</button>
        </div>
      </form>
    </Overlay>
  );
}

// ── Delete Plan Confirm ───────────────────────────────────────────────────────

function DeletePlanModal({ plan, onClose, onDeleted }: { plan: AdminPlan; onClose: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  async function confirm() { setBusy(true); await adminApi.deletePlan(plan.id); onDeleted(); onClose(); }
  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-bold mb-2">Delete Plan?</h2>
      <p className="text-slate-400 text-sm mb-5"><span className="text-white font-semibold">{plan.name}</span> — this only removes the plan record, existing subscribers are unaffected.</p>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-slate-200">Cancel</button>
        <button onClick={confirm} disabled={busy} className="flex-1 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 font-semibold disabled:opacity-60">{busy ? 'Deleting…' : 'Delete'}</button>
      </div>
    </Overlay>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

type ActiveModal =
  | UserModal
  | { type: 'createUser' }
  | { type: 'editPlan'; plan: AdminPlan }
  | { type: 'createPlan' }
  | { type: 'deletePlan'; plan: AdminPlan };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'users' | 'plans' | 'stats'>('users');

  // Stats
  const [stats, setStats] = useState<{ totalUsers: number; premiumUsers: number; weeklySignups: number } | null>(null);

  // Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [draftQ, setDraftQ] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');

  // Plans
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Modal
  const [modal, setModal] = useState<ActiveModal | null>(null);

  useEffect(() => {
    if (!getAdminToken()) navigate('/admin/login', { replace: true });
  }, [navigate]);

  useEffect(() => { adminApi.stats().then(setStats).catch(() => {}); }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true); setUsersError('');
    try {
      const data = await adminApi.listUsers(q, page);
      setUsers(data.users); setTotal(data.total); setPages(data.pages);
    } catch (err: unknown) {
      setUsersError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally { setLoadingUsers(false); }
  }, [q, page]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const loadPlans = useCallback(async () => {
    setLoadingPlans(true);
    try { setPlans(await adminApi.listPlans()); }
    finally { setLoadingPlans(false); }
  }, []);

  useEffect(() => { if (tab === 'plans') loadPlans(); }, [tab, loadPlans]);

  function signOut() { clearAdminToken(); navigate('/admin/login', { replace: true }); }
  function handleSearch(e: React.FormEvent) { e.preventDefault(); setPage(1); setQ(draftQ); }
  function patchUser(updated: AdminUser) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    adminApi.stats().then(setStats).catch(() => {});
  }
  function removeUser(id: string) { setUsers((prev) => prev.filter((u) => u.id !== id)); setTotal((n) => n - 1); adminApi.stats().then(setStats).catch(() => {}); }
  function addUser(u: AdminUser) { setUsers((prev) => [u, ...prev]); setTotal((n) => n + 1); adminApi.stats().then(setStats).catch(() => {}); }
  function patchPlan(updated: AdminPlan) { setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p))); }
  function addPlan(p: AdminPlan) { setPlans((prev) => [...prev, p].sort((a, b) => a.sortOrder - b.sortOrder)); }
  function removePlan(id: string) { setPlans((prev) => prev.filter((p) => p.id !== id)); }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const tabs = [
    { key: 'users', label: `Users${total ? ` (${total})` : ''}` },
    { key: 'plans', label: 'Plans' },
    { key: 'stats', label: 'Stats' },
  ] as const;

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
        <button onClick={signOut} className="text-xs text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg transition-colors">
          Sign Out
        </button>
      </header>

      {/* Tab bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === t.key ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="p-6 max-w-6xl mx-auto">

        {/* ── Users tab ── */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <input
                  type="search" value={draftQ} onChange={(e) => setDraftQ(e.target.value)}
                  placeholder="Search by name or email…"
                  className="flex-1 bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-2 text-sm outline-none placeholder-slate-500"
                />
                <button type="submit" className="bg-slate-800 border border-slate-700 hover:border-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Search</button>
              </form>
              <button
                onClick={() => setModal({ type: 'createUser' })}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                + Add User
              </button>
            </div>

            {usersError && <p className="text-red-400 text-sm">{usersError}</p>}

            {loadingUsers ? (
              <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
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
                          <td className="px-4 py-3"><p className="font-semibold text-white">{u.name}</p><p className="text-slate-500 text-xs">{u.email}</p></td>
                          <td className="px-4 py-3 text-slate-300 text-xs">{u.exam.replace('_', ' ')}</td>
                          <td className="px-4 py-3"><SubBadge status={u.subscription?.status ?? 'free'} />{u.subscription?.plan && <span className="ml-1 text-slate-500 text-[10px]">{u.subscription.plan}</span>}</td>
                          <td className="px-4 py-3 text-slate-300 text-xs">{u.gameProfile?.xp ?? 0} XP</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(u.createdAt)}</td>
                          <td className="px-4 py-3"><UserActions user={u} onAction={(m) => setModal(m)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
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
                          </div>
                        </div>
                        <UserActions user={u} onAction={(m) => setModal(m)} compact />
                      </div>
                    </div>
                  ))}
                </div>

                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg text-xs border border-slate-700 text-slate-400 disabled:opacity-40 hover:text-slate-200">← Prev</button>
                    <span className="text-xs text-slate-500">Page {page} of {pages}</span>
                    <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg text-xs border border-slate-700 text-slate-400 disabled:opacity-40 hover:text-slate-200">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Plans tab ── */}
        {tab === 'plans' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Define pricing tiers, features, and Stripe Price IDs.</p>
              </div>
              <button onClick={() => setModal({ type: 'createPlan' })} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                + Add Plan
              </button>
            </div>

            {loadingPlans ? (
              <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    onEdit={(pl) => setModal({ type: 'editPlan', plan: pl })}
                    onDelete={(pl) => setModal({ type: 'deletePlan', plan: pl })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Stats tab ── */}
        {tab === 'stats' && (
          <div className="space-y-6">
            {stats ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                    { label: 'Premium Subscribers', value: stats.premiumUsers, icon: '⭐' },
                    { label: 'New This Week', value: stats.weeklySignups, icon: '📈' },
                  ].map((c) => (
                    <div key={c.label} className="bg-slate-800 rounded-xl p-4">
                      <p className="text-2xl mb-1">{c.icon}</p>
                      <p className="text-2xl font-bold">{c.value.toLocaleString()}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{c.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-800 rounded-2xl p-5 space-y-3">
                  <h2 className="font-semibold text-sm">Free → Premium Conversion</h2>
                  {stats.totalUsers > 0 ? (
                    <>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>{stats.premiumUsers} of {stats.totalUsers} users</span>
                        <span className="text-white font-semibold">{((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (stats.premiumUsers / stats.totalUsers) * 100)}%` }} />
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-500 text-sm">No users yet.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {modal?.type === 'createUser' && <CreateUserModal onClose={() => setModal(null)} onCreated={(u) => { addUser(u); setModal(null); }} />}
      {modal?.type === 'edit' && <EditUserModal user={modal.user} onClose={() => setModal(null)} onSaved={(u) => { patchUser(u); setModal(null); }} />}
      {modal?.type === 'password' && <ResetPwModal userId={modal.userId} onClose={() => setModal(null)} />}
      {modal?.type === 'sub' && <SubModal user={modal.user} onClose={() => setModal(null)} onSaved={(u) => { patchUser(u); setModal(null); }} />}
      {modal?.type === 'delete' && <DeleteUserModal user={modal.user} onClose={() => setModal(null)} onDeleted={() => { removeUser(modal.user.id); setModal(null); }} />}
      {modal?.type === 'createPlan' && <PlanModal onClose={() => setModal(null)} onSaved={(p) => { addPlan(p); setModal(null); }} />}
      {modal?.type === 'editPlan' && <PlanModal plan={modal.plan} onClose={() => setModal(null)} onSaved={(p) => { patchPlan(p); setModal(null); }} />}
      {modal?.type === 'deletePlan' && <DeletePlanModal plan={modal.plan} onClose={() => setModal(null)} onDeleted={() => { removePlan(modal.plan.id); setModal(null); }} />}
    </div>
  );
}
