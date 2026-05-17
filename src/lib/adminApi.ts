const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const KEY = 'aceit_admin_token';

export function getAdminToken(): string | null {
  return sessionStorage.getItem(KEY);
}
export function saveAdminToken(token: string) {
  sessionStorage.setItem(KEY, token);
}
export function clearAdminToken() {
  sessionStorage.removeItem(KEY);
}

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export const adminApi = {
  login: (email: string, password: string) =>
    req<{ token: string; admin: { id: string; name: string; email: string } }>(
      'POST', '/api/admin/login', { email, password },
    ),
  makeFirstAdmin: (name: string, email: string, password: string) =>
    req<{ token: string; admin: { id: string; name: string; email: string } }>(
      'POST', '/api/admin/make-first-admin', { name, email, password },
    ),

  // Stats
  stats: () =>
    req<{ totalUsers: number; premiumUsers: number; weeklySignups: number }>(
      'GET', '/api/admin/stats',
    ),

  // Users
  listUsers: (q: string, page: number) =>
    req<{ users: AdminUser[]; total: number; page: number; pages: number }>(
      'GET', `/api/admin/users?q=${encodeURIComponent(q)}&page=${page}&limit=20`,
    ),
  getUser: (id: string) =>
    req<AdminUserDetail>('GET', `/api/admin/users/${id}`),
  createUser: (data: CreateUserInput) =>
    req<AdminUser>('POST', '/api/admin/users', data),
  updateUser: (id: string, data: Partial<{ name: string; email: string; exam: string; classLevel: string }>) =>
    req<AdminUser>('PATCH', `/api/admin/users/${id}`, data),
  resetPassword: (id: string, newPassword: string) =>
    req<{ ok: boolean }>('PATCH', `/api/admin/users/${id}/password`, { newPassword }),
  setSubscription: (id: string, status: string, plan?: string) =>
    req<unknown>('PATCH', `/api/admin/users/${id}/subscription`, { status, plan }),
  deleteUser: (id: string) =>
    req<{ ok: boolean }>('DELETE', `/api/admin/users/${id}`),

  // Plans
  listPlans: () =>
    req<AdminPlan[]>('GET', '/api/admin/plans'),
  createPlan: (data: PlanInput) =>
    req<AdminPlan>('POST', '/api/admin/plans', data),
  updatePlan: (id: string, data: Partial<PlanInput & { isActive: boolean; sortOrder: number }>) =>
    req<AdminPlan>('PATCH', `/api/admin/plans/${id}`, data),
  deletePlan: (id: string) =>
    req<{ ok: boolean }>('DELETE', `/api/admin/plans/${id}`),
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  exam: string;
  classLevel: string;
  isPremium?: boolean;
  plan?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  exam: string;
  classLevel: string;
  createdAt: string;
  subscription: { status: string; plan: string | null; currentPeriodEnd: string | null } | null;
  gameProfile: { xp: number; streak: number; totalQuizzes: number } | null;
}

export interface AdminUserDetail extends AdminUser {
  examDate: string | null;
  isAdmin: boolean;
  _count: { quizHistory: number; revisionQueue: number; bookmarks: number };
}

export interface PlanInput {
  name: string;
  billingCycle: string;
  priceUsd: number;
  features: string[];
  stripePriceId?: string;
}

export interface AdminPlan {
  id: string;
  name: string;
  billingCycle: string;
  priceUsd: number;
  features: string[];
  isActive: boolean;
  stripePriceId: string | null;
  sortOrder: number;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}
