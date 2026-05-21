/**
 * Enterprise smoke test
 *
 * Covers the routes that matter for investor demos and enterprise readiness:
 * backend health, public website, public showcase APIs, and authenticated
 * Super Admin/SaaS control surfaces when credentials are supplied.
 *
 * Usage:
 *   k6 run infra/load-tests/enterprise-smoke.js
 *   k6 run --env BASE_URL=https://staging.cloudcampus.io infra/load-tests/enterprise-smoke.js
 *   k6 run --env ADMIN_USERNAME=superadmin --env ADMIN_PASSWORD=... infra/load-tests/enterprise-smoke.js
 */

import http from 'k6/http';
import { check, group } from 'k6';
import { BASE_URL, login, authHeaders } from './helpers/auth.js';

export const options = {
  vus: 2,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export function setup() {
  if (!__ENV.ADMIN_PASSWORD) return { token: '' };
  return { token: login(__ENV.ADMIN_USERNAME || 'superadmin', __ENV.ADMIN_PASSWORD) };
}

export default function ({ token }) {
  group('health and public website', () => {
    check(http.get(`${BASE_URL}/actuator/health/readiness`), { 'readiness 200': (r) => r.status === 200 });
    check(http.get(`${BASE_URL}/v1/public/website`), { 'public website 2xx': (r) => r.status >= 200 && r.status < 300 });
    check(http.get(`${BASE_URL}/v1/public/website/navigation`), { 'navigation 2xx': (r) => r.status >= 200 && r.status < 300 });
    check(http.get(`${BASE_URL}/v1/public/website/showcase/demo`), { 'demo showcase 2xx': (r) => r.status >= 200 && r.status < 300 });
  });

  if (token) {
    const headers = authHeaders(token);
    group('super admin control surfaces', () => {
      check(http.get(`${BASE_URL}/v1/tenants/stats`, { headers }), { 'tenant stats 2xx': (r) => r.status >= 200 && r.status < 300 });
      check(http.get(`${BASE_URL}/v1/super-admin/subscription-plans`, { headers }), { 'subscription plans 2xx': (r) => r.status >= 200 && r.status < 300 });
      check(http.get(`${BASE_URL}/v1/super-admin/ai/usage`, { headers }), { 'ai usage accepts auth': (r) => r.status < 500 });
    });
  }
}
