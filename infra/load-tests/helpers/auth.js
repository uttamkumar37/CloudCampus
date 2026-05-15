import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

/**
 * Obtain a JWT access token for the given credentials.
 * Returns the token string, or null if login fails.
 * Call this in setup() and pass the token to default().
 */
export function login(username, password) {
  const res = http.post(
    `${BASE_URL}/v1/auth/login`,
    JSON.stringify({ username, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(res, { 'login 200': (r) => r.status === 200 });
  if (res.status !== 200) return null;
  return res.json('data.accessToken');
}

/** Returns headers with Authorization bearer token. */
export function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export { BASE_URL };
