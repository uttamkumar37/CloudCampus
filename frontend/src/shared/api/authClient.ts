import axios from 'axios';
import env from '@/config/env';

/**
 * Plain Axios instance — no auth interceptors.
 * Used exclusively for auth endpoints (/v1/auth/*) to prevent
 * circular dependency and infinite retry loops on refresh calls.
 */
const authClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

export default authClient;
