/**
 * Authenticated Axios instance.
 *
 * Request interceptor  — attaches Bearer token from in-memory auth store.
 * Response interceptor — on 401, attempts silent token refresh via authClient.
 *
 * M-07: 401 request queue prevents concurrent refresh race.
 * If multiple requests fire simultaneously and all receive 401, only the first
 * triggers a real /refresh call. All other requests are queued and replayed
 * with the new token once the refresh resolves, preserving token rotation
 * correctness (each refresh token can only be used once).
 */
import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import authClient from './authClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── 401 queue state (module-level, shared across all interceptor calls) ───────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  for (const pending of failedQueue) {
    if (error) pending.reject(error);
    else pending.resolve(token!);
  }
  failedQueue = [];
}

// ── Request: attach access token ─────────────────────────────────────────────
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ── Response: handle 401 with silent refresh + queue ─────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as { response?: { status: number }; config: RetryConfig };
    const original   = axiosError.config;

    if (axiosError.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // A refresh is already in flight — queue this request until it resolves
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return axiosInstance(original as AxiosRequestConfig);
      });
    }

    original._retry = true;
    isRefreshing    = true;

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      useAuthStore.getState().clearAuth();
      processQueue(error, null);
      isRefreshing = false;
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      authClient
        .post<{ accessToken: string }>('/v1/auth/refresh', { refreshToken })
        .then(({ data }) => {
          useAuthStore.getState().setAccessToken(data.accessToken);
          processQueue(null, data.accessToken);
          original.headers.set('Authorization', `Bearer ${data.accessToken}`);
          resolve(axiosInstance(original as AxiosRequestConfig));
        })
        .catch((refreshError) => {
          processQueue(refreshError, null);
          useAuthStore.getState().clearAuth();
          reject(refreshError);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  },
);

export default axiosInstance;
