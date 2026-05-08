import axios from 'axios';
import { getAuthSession } from '../store/authStore';

/**
 * Android emulator reaches host machine via 10.0.2.2.
 * iOS simulator uses localhost.
 * Real devices need your machine's LAN IP set in EXPO_PUBLIC_API_URL.
 */
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const session = getAuthSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  if (session?.tenantSlug) {
    config.headers['X-Tenant-Slug'] = session.tenantSlug;
  }
  return config;
});
