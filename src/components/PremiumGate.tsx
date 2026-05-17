import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import type { ReactNode } from 'react';

interface Props {
  feature: string;
  children: ReactNode;
}

export default function PremiumGate({ feature, children }: Props) {
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  if (isPremium) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center">
      <div className="bg-gradient-to-br from-indigo-900/60 to-violet-900/60 border border-indigo-700/40 rounded-2xl p-8 max-w-sm w-full">
        <p className="text-4xl mb-4">🔒</p>
        <h2 className="text-lg font-bold mb-2">Premium Feature</h2>
        <p className="text-slate-400 text-sm mb-6">
          <span className="text-white font-medium capitalize">{feature}</span> is available on the Premium plan.
          Unlock unlimited quizzes, mock tests, AI study path, and more.
        </p>
        <button
          onClick={() => navigate('/pricing')}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform text-sm"
        >
          View Plans →
        </button>
        <p className="text-slate-600 text-xs mt-3">$4.99/month · cancel anytime</p>
      </div>
    </div>
  );
}
