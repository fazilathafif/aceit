import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../lib/api';

interface Subscription {
  status: string;       // free | active | cancelled | past_due
  plan: string | null;  // monthly | yearly | null
  currentPeriodEnd: string | null;
}

interface SubscriptionContextValue {
  isPremium: boolean;
  subscription: Subscription;
  loading: boolean;
  startCheckout: (plan: 'monthly' | 'yearly') => Promise<void>;
  openPortal: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DEFAULT_SUB: Subscription = { status: 'free', plan: null, currentPeriodEnd: null };

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ userId, children }: { userId: string | null; children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription>(DEFAULT_SUB);
  const [loading, setLoading] = useState(false);

  const isPremium = subscription.status === 'active';

  const refresh = useCallback(async () => {
    if (!userId || userId.startsWith('demo_')) return;
    setLoading(true);
    try {
      const sub = await api.get<Subscription>('/api/subscription');
      setSubscription(sub);
    } catch {
      // fail silently — default to free
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const startCheckout = useCallback(async (plan: 'monthly' | 'yearly') => {
    try {
      const { url, message } = await api.post<{ url: string | null; message?: string }>(
        '/api/subscription/checkout', { plan }
      );
      if (url) {
        window.location.href = url;
      } else {
        alert(message ?? 'Stripe checkout not configured yet.');
      }
    } catch (e) {
      alert((e as Error).message);
    }
  }, []);

  const openPortal = useCallback(async () => {
    try {
      const { url, message } = await api.post<{ url: string | null; message?: string }>(
        '/api/subscription/portal', {}
      );
      if (url) {
        window.open(url, '_blank');
      } else {
        alert(message ?? 'Stripe portal not configured yet.');
      }
    } catch (e) {
      alert((e as Error).message);
    }
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isPremium, subscription, loading, startCheckout, openPortal, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return ctx;
}
