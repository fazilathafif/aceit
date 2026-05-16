import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

export type AppMode = 'focus' | 'balanced' | 'compete';

interface ModeFeatures {
  gamification: boolean;
  wellbeing: boolean;
  arena: boolean;
  social: boolean;
}

const MODE_FEATURES: Record<AppMode, ModeFeatures> = {
  focus:    { gamification: false, wellbeing: false, arena: false, social: false },
  balanced: { gamification: true,  wellbeing: true,  arena: true,  social: false },
  compete:  { gamification: true,  wellbeing: true,  arena: true,  social: true  },
};

interface ModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  can: (feature: keyof ModeFeatures) => boolean;
}

const ModeContext = createContext<ModeContextValue | null>(null);

const MODE_KEY = (userId: string) => `aceit_mode_${userId}`;

export function ModeProvider({ children, userId }: { children: ReactNode; userId: string | null }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    if (!userId) return 'balanced';
    try {
      const stored = localStorage.getItem(MODE_KEY(userId));
      if (stored === 'focus' || stored === 'balanced' || stored === 'compete') return stored;
    } catch { /* ignore */ }
    return 'balanced';
  });

  useEffect(() => {
    if (!userId) return;
    try {
      const stored = localStorage.getItem(MODE_KEY(userId));
      if (stored === 'focus' || stored === 'balanced' || stored === 'compete') {
        setModeState(stored);
      } else {
        setModeState('balanced');
      }
    } catch { /* ignore */ }
  }, [userId]);

  const setMode = useCallback((m: AppMode) => {
    setModeState(m);
    if (userId) localStorage.setItem(MODE_KEY(userId), m);
  }, [userId]);

  const can = useCallback((feature: keyof ModeFeatures) => MODE_FEATURES[mode][feature], [mode]);

  return (
    <ModeContext.Provider value={{ mode, setMode, can }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used inside ModeProvider');
  return ctx;
}
