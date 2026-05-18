/**
 * Smoke test — CC-1703
 *
 * Quick sanity check: verifies all critical paths respond correctly
 * under minimal load (3 VUs, 30 seconds). Run before any load test
 * to confirm the environment is healthy.
 *
 * Usage:
 *   k6 run infra/load-tests/smoke.js
 *   k6 run --env BASE_URL=https://staging.cloudcampus.io infra/load-tests/smoke.js
 */

import http from 'k6/http';
import { check, group } from 'k6';
import { login, authHeaders, BASE_URL } from './helpers/auth.js';

export const options = {
  vus: 3,
  duration: '30s',
  thresholds: {
    http_req_failed:   ['rate<0.01'],          // <1% errors
    http_req_duration: ['p(95)<1000'],         // p95 < 1 s
  },
};

// H-25: Refuse to run with a default/fallback credential — force explicit env vars.
const ADMIN_USERNAME = __ENV.ADMIN_USERNAME || 'superadmin';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD env var is required — set it with --env ADMIN_PASSWORD=<value>');
}

export function setup() {
  const token = login(ADMIN_USERNAME, ADMIN_PASSWORD);
  if (!token) throw new Error('Smoke test: login failed — check credentials and server');
  return { token };
}

export default function ({ token }) {
  const headers = authHeaders(token);

  group('health', () => {
    const r = http.get(`${BASE_URL}/actuator/health`);
    check(r, { 'health 200': (res) => res.status === 200 });
  });

  group('auth — token refresh', () => {
    // Just hit login again to verify auth endpoint stays healthy under concurrency.
    const r = http.post(
      `${BASE_URL}/v1/auth/login`,
      JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(r, { 'login 200': (res) => res.status === 200 });
  });

  group('tenants list', () => {
    const r = http.get(`${BASE_URL}/v1/tenants`, { headers });
    check(r, { 'tenants 200': (res) => res.status === 200 });
  });
}
