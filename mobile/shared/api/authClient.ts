/**
 * Plain Axios instance for auth endpoints (login, refresh).
 * No interceptors — avoids circular dependency with token refresh.
 */
import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

const authClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

export default authClient;
