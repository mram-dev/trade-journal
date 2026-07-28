const TOKEN_KEY = 'tj_token';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const sep = path.includes('?') ? '&' : '?';
  const url = `${path}${sep}token=${token}`;
  const headers: Record<string, string> = { ...(options.headers as any) };
  // only set JSON content-type when we actually send a body (DELETE/GET must not)
  if (options.body != null && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });
  if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
  const text = await res.text();
  const body = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
  if (!res.ok) throw new Error(body.error || res.statusText || 'Request failed');
  return body as T;
}

function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '/login';
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export const api = {
  // Auth
  login: (password: string) =>
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(async r => {
      const data = await r.json();
      if (data.ok && data.token) setToken(data.token);
      return data;
    }),

  // Trades
  getTrades: (params?: Record<string, string>) =>
    request<{ trades: any[] }>(`/api/trades${params ? '?' + new URLSearchParams(params) : ''}`),
  getTrade: (id: number) => request<any>(`/api/trades/${id}`),
  createTrade: (data: any) => request<any>('/api/trades', { method: 'POST', body: JSON.stringify(data) }),
  updateTrade: (id: number, data: any) => request<any>(`/api/trades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrade: (id: number) => request<any>(`/api/trades/${id}`, { method: 'DELETE' }),
  restoreTrade: (id: number) => request<any>(`/api/trades/${id}/restore`, { method: 'PUT' }),
  closeTrade: (id: number, data: any) => request<any>(`/api/trades/${id}/close`, { method: 'PUT', body: JSON.stringify(data) }),

  // Stats
  getStats: (accountId?: number) => request<any>(`/api/stats${accountId ? `?account_id=${accountId}` : ''}`),

  // Strategies
  getStrategies: () => request<{ strategies: any[] }>('/api/strategies'),
  createStrategy: (data: any) => request<any>('/api/strategies', { method: 'POST', body: JSON.stringify(data) }),
  updateStrategy: (id: number, data: any) => request<any>(`/api/strategies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStrategy: (id: number) => request<any>(`/api/strategies/${id}`, { method: 'DELETE' }),

  // Accounts
  getAccounts: () => request<{ accounts: any[] }>('/api/accounts'),
  createAccount: (data: any) => request<any>('/api/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id: number, data: any) => request<any>(`/api/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: (id: number) => request<any>(`/api/accounts/${id}`, { method: 'DELETE' }),
  setDefaultAccount: (id: number) => request<any>(`/api/accounts/default/${id}`, { method: 'PUT' }),

  // Settings
  getSettings: () => request<Record<string, string>>('/api/settings'),
  saveSetting: (key: string, value: string, current_password?: string) =>
    request<any>('/api/settings', { method: 'PUT', body: JSON.stringify({ key, value, current_password }) }),

  // Journal
  getJournal: () => request<{ entries: any[] }>('/api/journal'),
  saveJournal: (data: any) => request<any>('/api/journal', { method: 'PUT', body: JSON.stringify(data) }),
};
