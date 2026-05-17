import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, Preferences, Exam, ClassLevel, QuizHistory } from '../types';
import { api, saveToken, clearToken } from '../lib/api';

interface AuthContextValue {
  user: User | null;
  preferences: Preferences | null;
  isDemo: boolean;
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<string | null>;
  loginDemo: (id: 'demo_neet' | 'demo_jee') => void;
  register: (name: string, email: string, password: string, exam: Exam, classLevel: ClassLevel) => Promise<string | null>;
  logout: () => void;
  savePreferences: (prefs: Preferences) => void;
  erasePreferences: () => void;
  addHistory: (entry: Omit<QuizHistory, 'id'>) => Promise<void>;
  getHistory: () => QuizHistory[];
  clearHistory: () => Promise<void>;
  setExamDateRemote: (date: string) => Promise<void>;
}

// ─── Demo accounts (local only, never hit the server) ─────────────────────────
const DEMO_USERS: User[] = [
  { id: 'demo_neet', name: 'NEET Student', email: 'demo@neet', exam: 'NEET', classLevel: 'Both', passwordHash: '' },
  { id: 'demo_jee',  name: 'JEE Student',  email: 'demo@jee',  exam: 'JEE_MAIN', classLevel: 'Both', passwordHash: '' },
];

const PREFS_KEY = (id: string) => `aceit_prefs_${id}`;
const HISTORY_KEY = (id: string) => `aceit_history_${id}`;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [history, setHistory]         = useState<QuizHistory[]>([]);
  const [loading, setLoading]         = useState(true);

  const isDemo = user?.id.startsWith('demo_') ?? false;

  // ── On mount: restore session ───────────────────────────────────────────────
  useEffect(() => {
    async function restore() {
      const token = localStorage.getItem('aceit_token') ?? sessionStorage.getItem('aceit_token');
      if (!token) { setLoading(false); return; }
      try {
        const u = await api.get<User>('/api/auth/me');
        setUser(u);
        setPreferences(readLocalPrefs(u.id));
        setHistory(readLocalHistory(u.id));
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  // ── localStorage helpers ────────────────────────────────────────────────────
  function readLocalPrefs(id: string): Preferences | null {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY(id)) ?? 'null'); } catch { return null; }
  }
  function readLocalHistory(id: string): QuizHistory[] {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY(id)) ?? '[]'); } catch { return []; }
  }

  // ── Auth actions ────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string, remember: boolean): Promise<string | null> => {
    // Demo shortcut
    const demoEmail = email.trim().toLowerCase();
    const demo = DEMO_USERS.find((d) => d.email === demoEmail);
    if (demo && password === 'demo') {
      saveToken('demo_token', remember);
      setUser(demo);
      setPreferences(readLocalPrefs(demo.id));
      setHistory(readLocalHistory(demo.id));
      return null;
    }
    try {
      const { token, user: u } = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password });
      saveToken(token, remember);
      setUser(u);
      setPreferences(readLocalPrefs(u.id));
      setHistory(readLocalHistory(u.id));
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  }, []);

  const loginDemo = useCallback((id: 'demo_neet' | 'demo_jee') => {
    const demo = DEMO_USERS.find((d) => d.id === id)!;
    saveToken('demo_token', false);
    setUser(demo);
    setPreferences(readLocalPrefs(demo.id));
    setHistory(readLocalHistory(demo.id));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, exam: Exam, classLevel: ClassLevel): Promise<string | null> => {
    try {
      const { token, user: u } = await api.post<{ token: string; user: User }>('/api/auth/register', { name, email, password, exam, classLevel });
      saveToken(token, true);
      setUser(u);
      setPreferences(null);
      setHistory([]);
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setPreferences(null);
    setHistory([]);
  }, []);

  // ── Preferences ─────────────────────────────────────────────────────────────
  const savePreferences = useCallback((prefs: Preferences) => {
    if (!user) return;
    localStorage.setItem(PREFS_KEY(user.id), JSON.stringify(prefs));
    setPreferences(prefs);
  }, [user]);

  const erasePreferences = useCallback(() => {
    if (!user) return;
    localStorage.removeItem(PREFS_KEY(user.id));
    setPreferences(null);
  }, [user]);

  // ── Quiz history ─────────────────────────────────────────────────────────────
  const addHistory = useCallback(async (entry: Omit<QuizHistory, 'id'>) => {
    if (!user) return;
    // Save to server (non-demo)
    if (!isDemo) {
      try {
        await api.post('/api/quiz/history', entry);
      } catch { /* fail silently, keep local copy */ }
    }
    // Always keep local copy for instant reads
    const updated = [{ ...entry, id: Date.now().toString() } as QuizHistory, ...history].slice(0, 100);
    localStorage.setItem(HISTORY_KEY(user.id), JSON.stringify(updated));
    setHistory(updated);
  }, [user, isDemo, history]);

  const getHistory = useCallback((): QuizHistory[] => history, [history]);

  const clearHistory = useCallback(async () => {
    if (!user) return;
    if (!isDemo) {
      try { await api.delete('/api/quiz/history'); } catch { /* ignore */ }
    }
    localStorage.removeItem(HISTORY_KEY(user.id));
    setHistory([]);
  }, [user, isDemo]);

  // ── Exam date ────────────────────────────────────────────────────────────────
  const setExamDateRemote = useCallback(async (date: string) => {
    if (!isDemo) {
      await api.patch('/api/auth/exam-date', { examDate: date });
    }
    setUser((u) => u ? { ...u, examDate: date as unknown as Date } : u);
  }, [isDemo]);

  return (
    <AuthContext.Provider value={{
      user, preferences, isDemo, loading,
      login, loginDemo, register, logout,
      savePreferences, erasePreferences,
      addHistory, getHistory, clearHistory,
      setExamDateRemote,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
