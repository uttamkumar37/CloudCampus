/**
 * Authenticated Axios instance.
 *
 * Request interceptor  — attaches Bearer token from in-memory auth store.
 * Response interceptor — on 401, attempts silent token refresh via authClient;
 *                        on refresh failure, clears auth (forces re-login).
 *
 * NOTE: SecureStore persistence wired in D2; tokens live in memory for D1.
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

// ── Request: attach access token ─────────────────────────────────────────────
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ── Response: handle 401 with silent refresh ──────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetryConfig;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }
      try {
        const { data } = await authClient.post<{ accessToken: string }>(
          '/v1/auth/refresh',
          { refreshToken },
        );
        useAuthStore.getState().setAccessToken(data.accessToken);
        original.headers.set('Authorization', `Bearer ${data.accessToken}`);
        return axiosInstance(original as AxiosRequestConfig);
      } catch {
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
