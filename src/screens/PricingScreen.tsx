import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import BottomNav from '../components/BottomNav';

const FEATURES = [
  { label: 'Unlimited quizzes',        free: true  },
  { label: 'Flashcards (10/day)',       free: true  },
  { label: 'Daily challenge',           free: true  },
  { label: 'Stats overview',            free: true  },
  { label: 'Full mock tests',           free: false },
  { label: 'AI tutor',                  free: false },
  { label: 'Study path + AI schedule',  free: false },
  { label: 'Analytics & trends',        free: false },
  { label: 'Arena (Speed Round, Duel)', free: false },
  { label: 'Social & leaderboard',      free: false },
  { label: 'Formula sheets & concepts', free: false },
  { label: 'Unlimited revision queue',  free: false },
];

export default function PricingScreen() {
  const navigate = useNavigate();
  const { isPremium, subscription, startCheckout, openPortal, loading } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 max-w-lg mx-auto">
      <header className="px-5 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 text-sm mb-3 block">← Back</button>
        <p className="text-slate-400 text-sm">UNLOCK EVERYTHING</p>
        <h1 className="text-2xl font-bold mt-1">AceIt Premium 🚀</h1>
      </header>

      <main className="px-5 space-y-5">

        {/* Current plan badge */}
        {isPremium && (
          <div className="bg-green-900/30 border border-green-700/50 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-300">✓ You're on Premium</p>
              {subscription.currentPeriodEnd && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={openPortal}
              className="text-xs text-primary font-medium"
            >
              Manage →
            </button>
          </div>
        )}

        {/* Billing toggle */}
        {!isPremium && (
          <div className="flex bg-slate-800 rounded-xl p-0.5 gap-0.5">
            {(['monthly', 'yearly'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setBillingCycle(c)}
                className={`flex-1 py-2 rounded-[10px] text-xs font-semibold transition-colors capitalize flex items-center justify-center gap-1.5 ${
                  billingCycle === c ? 'bg-primary text-white' : 'text-slate-400'
                }`}
              >
                {c === 'yearly' ? (
                  <><span>Yearly</span><span className="bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">-33%</span></>
                ) : 'Monthly'}
              </button>
            ))}
          </div>
        )}

        {/* Price card */}
        {!isPremium && (
          <div className="bg-gradient-to-br from-indigo-900/70 to-violet-900/70 border border-indigo-700/40 rounded-2xl p-6 text-center">
            <p className="text-slate-300 text-sm mb-1">AceIt Premium</p>
            {billingCycle === 'monthly' ? (
              <>
                <p className="text-5xl font-black text-white">$4.99</p>
                <p className="text-indigo-300 text-sm mt-1">per month</p>
              </>
            ) : (
              <>
                <p className="text-5xl font-black text-white">$39.99</p>
                <p className="text-indigo-300 text-sm mt-1">per year <span className="text-green-400">($3.33/mo)</span></p>
              </>
            )}
            <button
              onClick={() => startCheckout(billingCycle)}
              disabled={loading}
              className="w-full mt-5 bg-white text-indigo-700 font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? 'Loading…' : `Upgrade to Premium →`}
            </button>
            <p className="text-slate-500 text-[10px] mt-3">Cancel anytime · Secure checkout via Stripe</p>
          </div>
        )}

        {/* Feature comparison */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 px-4 py-2 bg-slate-700/50">
            <p className="text-xs font-semibold text-slate-400 col-span-2">Feature</p>
            <div className="grid grid-cols-2 gap-1">
              <p className="text-xs font-semibold text-slate-400 text-center">Free</p>
              <p className="text-xs font-semibold text-indigo-300 text-center">Pro</p>
            </div>
          </div>
          {FEATURES.map((f, i) => (
            <div key={f.label} className={`grid grid-cols-3 px-4 py-3 ${i % 2 === 0 ? '' : 'bg-slate-700/20'}`}>
              <p className="text-xs text-slate-300 col-span-2">{f.label}</p>
              <div className="grid grid-cols-2 gap-1">
                <p className="text-center text-sm">{f.free ? '✓' : <span className="text-slate-600">—</span>}</p>
                <p className="text-center text-sm text-indigo-300">✓</p>
              </div>
            </div>
          ))}
        </div>

      </main>

      <BottomNav active="profile" />
    </div>
  );
}
