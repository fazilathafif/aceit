const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function getToken(): string | null {
  return localStorage.getItem('aceit_token') ?? sessionStorage.getItem('aceit_token');
}

export function saveToken(token: string, remember: boolean) {
  if (remember) {
    localStorage.setItem('aceit_token', token);
    sessionStorage.removeItem('aceit_token');
  } else {
    sessionStorage.setItem('aceit_token', token);
    localStorage.removeItem('aceit_token');
  }
}

export function clearToken() {
  localStorage.removeItem('aceit_token');
  sessionStorage.removeItem('aceit_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                     => request<T>(path),
  post:   <T>(path: string, body: unknown)      => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)      => request<T>(path, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)      => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                     => request<T>(path, { method: 'DELETE' }),
};
