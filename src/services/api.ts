import type { AnonymousSessionInfo, DashboardStats, SecurityAnalysisResult, UserProfile } from '../types';

const API_BASE = '/api';

export function getAnonymousSessionId(): string {
  let id = localStorage.getItem('threatlens_anon_session_id');
  if (!id) {
    id = `anon-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;
    localStorage.setItem('threatlens_anon_session_id', id);
  }
  return id;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('threatlens_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export class ApiError extends Error {
  public code?: string;
  public status: number;
  public requiresAuth?: boolean;
  public anonymousSession?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = data?.code;
    this.requiresAuth = data?.requiresAuth;
    this.anonymousSession = data?.anonymousSession;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const anonId = getAnonymousSessionId();
  const headers = {
    'Content-Type': 'application/json',
    'X-ThreatLens-Anon-Session': anonId,
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || `Request failed with status ${res.status}`, res.status, data);
  }

  return data as T;
}

export const api = {
  // Anonymous Session Check
  getAnonymousStatus: () => request<AnonymousSessionInfo>('/scan/anonymous/status'),

  // Scans
  scanUrl: (url: string) => request<SecurityAnalysisResult>('/scan/url', {
    method: 'POST',
    body: JSON.stringify({ url }),
  }),

  scanMessage: (message: string) => request<SecurityAnalysisResult>('/scan/message', {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),

  scanScreenshot: (image: string, filename?: string) => request<SecurityAnalysisResult>('/scan/screenshot', {
    method: 'POST',
    body: JSON.stringify({ image, filename }),
  }),

  scanQr: (payload: string, metaSource?: string) => request<SecurityAnalysisResult>('/scan/qr', {
    method: 'POST',
    body: JSON.stringify({ payload, metaSource }),
  }),

  getScans: (params?: { q?: string; level?: string; type?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.level) query.set('level', params.level);
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    return request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      scans: SecurityAnalysisResult[];
    }>(`/scans?${query.toString()}`);
  },

  getScanById: (id: string) => request<SecurityAnalysisResult>(`/scans/${id}`),

  deleteScan: (id: string) => request<{ message: string }>(`/scans/${id}`, {
    method: 'DELETE',
  }),

  clearAllScans: () => request<{ message: string }>('/scans', {
    method: 'DELETE',
  }),

  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),

  // Auth
  register: (name: string, email: string, password: string) => request<{
    token: string;
    user: UserProfile;
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ 
      name, 
      email, 
      password,
      anonymousSessionId: getAnonymousSessionId()
    }),
  }),

  login: (email: string, password: string) => request<{
    token: string;
    user: UserProfile;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ 
      email, 
      password,
      anonymousSessionId: getAnonymousSessionId()
    }),
  }),

  getMe: () => request<{ user: UserProfile }>('/auth/me'),

  updateProfile: (name: string) => request<{ user: UserProfile }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  }),

  updatePassword: (currentPassword: string, newPassword: string) => request<{ message: string }>('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),

  deleteAccount: () => request<{ message: string }>('/auth/account', {
    method: 'DELETE',
  }),
};
