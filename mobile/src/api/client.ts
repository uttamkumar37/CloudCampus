// Axios client for the CloudCampus backend.
//
// Base URL comes from app.json `expo.extra.apiBaseUrl`. The bearer token and
// tenant header are injected per-request from whatever the AuthContext set last.
// 401 responses fire a single refresh attempt; on refresh failure the session
// is cleared and the caller sees a normal 401 to react to.

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { clearSession, loadSession, saveSession, StoredSession } from '../auth/storage';

const extra = Constants.expoConfig?.extra ?? {};
function resolveApiBaseUrl(): string {
  const configured = String(extra.apiBaseUrl ?? 'http://localhost:8080');
  if (Platform.OS === 'android') {
    if (extra.apiBaseUrlAndroid) return String(extra.apiBaseUrlAndroid);
    return configured.replace('http://localhost:', 'http://10.0.2.2:');
  }
  return configured;
}

export const API_BASE_URL: string = resolveApiBaseUrl();
export const DEFAULT_TENANT_ID: string = extra.defaultTenantId ?? 'jnv-lucknow-demo';

let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;
let currentTenantHeader: string | null = DEFAULT_TENANT_ID;

export function setAuthHeaders(accessToken: string | null, refreshToken: string | null, tenantHeader: string | null) {
  currentAccessToken = accessToken;
  currentRefreshToken = refreshToken;
  currentTenantHeader = tenantHeader || null;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  if (currentAccessToken) {
    config.headers['Authorization'] = `Bearer ${currentAccessToken}`;
  }
  // X-Tenant-Id is informational; the backend prefers the JWT claim. We send
  // it anyway because some pre-login endpoints (login, public) read it.
  if (currentTenantHeader) {
    config.headers['X-Tenant-Id'] = currentTenantHeader;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (!currentRefreshToken) return null;
  try {
    const resp = await axios.post(
      `${API_BASE_URL}/v1/auth/refresh`,
      { refreshToken: currentRefreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 },
    );
    const data = resp.data?.data;
    if (!data?.accessToken) return null;
    const session: StoredSession = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + (data.expiresIn ?? 900) * 1000,
      tenantHeader: currentTenantHeader,
      user: {
        userId: data.userId,
        role: data.role,
        tenantId: data.tenantId ?? null,
        schoolId: data.schoolId ?? null,
        requiresPasswordChange: data.requiresPasswordChange,
        features: data.features ?? [],
      },
    };
    await saveSession(session);
    setAuthHeaders(session.accessToken, session.refreshToken, currentTenantHeader);
    return session.accessToken;
  } catch {
    await clearSession();
    setAuthHeaders(null, null, currentTenantHeader);
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const status = error?.response?.status;
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (status === 401 && original && !original._retry && currentRefreshToken) {
      original._retry = true;
      refreshing = refreshing ?? tryRefresh();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newToken}` };
        return api.request(original);
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth API helpers ─────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: string;
  userId: string;
  tenantId: string | null;
  schoolId: string | null;
  requiresPasswordChange?: boolean;
  features?: string[];
}

export async function loginApi(
  username: string,
  password: string,
  tenantId: string,
): Promise<LoginResponse> {
  setAuthHeaders(null, null, tenantId || null);
  const resp = await api.post('/v1/auth/login', { username, password });
  if (!resp.data?.success) {
    throw new Error(resp.data?.error?.message ?? 'Login failed');
  }
  return resp.data.data as LoginResponse;
}

// Try to hydrate from stored session on startup.
export async function loadStoredSession(): Promise<StoredSession | null> {
  const s = await loadSession();
  if (!s) return null;
  setAuthHeaders(s.accessToken, s.refreshToken, s.tenantHeader ?? DEFAULT_TENANT_ID);
  return s;
}
