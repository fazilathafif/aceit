import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Preferences, Exam, ClassLevel, QuizHistory } from '../types';

// ─── Demo accounts (never persisted, always available) ────────────────────────
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 'demo_neet',
    name: 'NEET Student',
    email: 'demo@neet',
    exam: 'NEET',
    classLevel: 'Both',
    passwordHash: '',
    password: 'demo',
  },
  {
    id: 'demo_jee',
    name: 'JEE Student',
    email: 'demo@jee',
    exam: 'JEE_MAIN',
    classLevel: 'Both',
    passwordHash: '',
    password: 'demo',
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
const KEYS = {
  users: 'aceit_users',
  prefs: (id: string) => `aceit_prefs_${id}`,
  history: (id: string) => `aceit_history_${id}`,
};

function encode(pw: string) {
  return btoa(pw);
}

function readUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.users) ?? '[]');
  } catch {
    return [];
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

function readSession(): string | null {
  return (
    localStorage.getItem('aceit_session') ??
    sessionStorage.getItem('aceit_session')
  );
}

function writeSession(id: string, remember: boolean) {
  if (remember) {
    localStorage.setItem('aceit_session', id);
    sessionStorage.removeItem('aceit_session');
  } else {
    sessionStorage.setItem('aceit_session', id);
    localStorage.removeItem('aceit_session');
  }
}

function clearSession() {
  localStorage.removeItem('aceit_session');
  sessionStorage.removeItem('aceit_session');
}

function resolveUser(id: string | null): User | null {
  if (!id) return null;
  const demo = DEMO_USERS.find((d) => d.id === id);
  if (demo) return demo;
  return readUsers().find((u) => u.id === id) ?? null;
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  preferences: Preferences | null;
  isDemo: boolean;
  login: (email: string, password: string, remember: boolean) => string | null; // returns error msg or null
  loginDemo: (id: 'demo_neet' | 'demo_jee') => void;
  register: (name: string, email: string, password: string, exam: Exam, classLevel: ClassLevel) => string | null;
  logout: () => void;
  savePreferences: (prefs: Preferences) => void;
  erasePreferences: () => void;
  addHistory: (entry: QuizHistory) => void;
  getHistory: () => QuizHistory[];
  clearHistory: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => resolveUser(readSession()));
  const [preferences, setPreferences] = useState<Preferences | null>(() => {
    const id = readSession();
    if (!id) return null;
    try {
      return JSON.parse(localStorage.getItem(KEYS.prefs(id)) ?? 'null');
    } catch {
      return null;
    }
  });

  const isDemo = user?.id.startsWith('demo_') ?? false;

  const login = useCallback(
    (email: string, password: string, remember: boolean): string | null => {
      const normalised = email.trim().toLowerCase();

      // Check demo users
      const demo = DEMO_USERS.find(
        (d) => d.email === normalised && d.password === password
      );
      if (demo) {
        writeSession(demo.id, remember);
        setUser(demo);
        try {
          setPreferences(JSON.parse(localStorage.getItem(KEYS.prefs(demo.id)) ?? 'null'));
        } catch {
          setPreferences(null);
        }
        return null;
      }

      // Check registered users
      const found = readUsers().find((u) => u.email === normalised);
      if (!found) return 'No account found with that email.';
      if (found.passwordHash !== encode(password)) return 'Incorrect password.';

      writeSession(found.id, remember);
      setUser(found);
      try {
        setPreferences(JSON.parse(localStorage.getItem(KEYS.prefs(found.id)) ?? 'null'));
      } catch {
        setPreferences(null);
      }
      return null;
    },
    []
  );

  const loginDemo = useCallback((id: 'demo_neet' | 'demo_jee') => {
    const demo = DEMO_USERS.find((d) => d.id === id)!;
    writeSession(demo.id, false);
    setUser(demo);
    try {
      setPreferences(JSON.parse(localStorage.getItem(KEYS.prefs(demo.id)) ?? 'null'));
    } catch {
      setPreferences(null);
    }
  }, []);

  const register = useCallback(
    (
      name: string,
      email: string,
      password: string,
      exam: Exam,
      classLevel: ClassLevel
    ): string | null => {
      const normalised = email.trim().toLowerCase();
      if (readUsers().some((u) => u.email === normalised))
        return 'An account with this email already exists.';

      const newUser: User = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: normalised,
        exam,
        classLevel,
        passwordHash: encode(password),
      };
      writeUsers([...readUsers(), newUser]);
      writeSession(newUser.id, true);
      setUser(newUser);
      setPreferences(null);
      return null;
    },
    []
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setPreferences(null);
  }, []);

  const savePreferences = useCallback(
    (prefs: Preferences) => {
      if (!user) return;
      localStorage.setItem(KEYS.prefs(user.id), JSON.stringify(prefs));
      setPreferences(prefs);
    },
    [user]
  );

  const erasePreferences = useCallback(() => {
    if (!user) return;
    localStorage.removeItem(KEYS.prefs(user.id));
    setPreferences(null);
  }, [user]);

  const addHistory = useCallback(
    (entry: QuizHistory) => {
      if (!user) return;
      const key = KEYS.history(user.id);
      const existing: QuizHistory[] = JSON.parse(
        localStorage.getItem(key) ?? '[]'
      );
      localStorage.setItem(key, JSON.stringify([entry, ...existing].slice(0, 50)));
    },
    [user]
  );

  const getHistory = useCallback((): QuizHistory[] => {
    if (!user) return [];
    try {
      return JSON.parse(localStorage.getItem(KEYS.history(user.id)) ?? '[]');
    } catch {
      return [];
    }
  }, [user]);

  const clearHistory = useCallback(() => {
    if (!user) return;
    localStorage.removeItem(KEYS.history(user.id));
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        isDemo,
        login,
        loginDemo,
        register,
        logout,
        savePreferences,
        erasePreferences,
        addHistory,
        getHistory,
        clearHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
