import axios, { type InternalAxiosRequestConfig } from 'axios';
import env from '@/config/env';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import authClient from './authClient';
import type { ApiResponse } from '@/shared/types/api';

interface RefreshData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Configured Axios instance for all protected API calls. */
const api = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach in-memory access token ────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: 401 → silent refresh → retry queued requests ───────────────────
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function drainQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((entry) => {
    if (error) entry.reject(error);
    else entry.resolve(token!);
  });
  failedQueue = [];
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetryConfig;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const { refreshToken, clearAuth, setTokens, user } =
      useAuthStore.getState();

    if (!refreshToken) {
      clearAuth();
      return Promise.reject(error);
    }

    // Queue subsequent 401s while a refresh is already in flight
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) =>
        failedQueue.push({ resolve, reject }),
      ).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await authClient.post<ApiResponse<RefreshData>>(
        '/v1/auth/refresh',
        { refreshToken },
      );
      const refreshed = data.data!;

      setTokens(refreshed.accessToken, refreshed.refreshToken, user!);
      drainQueue(null, refreshed.accessToken);

      original.headers.Authorization = `Bearer ${refreshed.accessToken}`;
      return api(original);
    } catch (err) {
      drainQueue(err, null);
      clearAuth();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
