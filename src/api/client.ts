const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('pushup_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('pushup_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('pushup_token');
}

// Format local date YYYY-MM-DD
export function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body: { username: string; password: string; confirmPassword?: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { username: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiRequest('/auth/me'),

  // Pushups
  addPushups: (count: number) =>
    apiRequest('/pushups', {
      method: 'POST',
      body: JSON.stringify({ count, clientDate: getLocalDateString() }),
    }),
  getToday: () =>
    apiRequest(`/pushups/today?date=${getLocalDateString()}`),
  getRecent: (limit = 10) =>
    apiRequest(`/pushups/recent?limit=${limit}`),
  getHistory: () =>
    apiRequest('/pushups/history'),

  // Stats
  getLeaderboard: (type: 'today' | 'overall') =>
    apiRequest(`/stats/leaderboard?type=${type}&date=${getLocalDateString()}`),
  getMyStats: () =>
    apiRequest(`/stats/me?date=${getLocalDateString()}`),
  getActivity: (days = 7) =>
    apiRequest(`/stats/activity?days=${days}`),
};
