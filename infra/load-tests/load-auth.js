/**
 * Auth load test — CC-1703
 *
 * Ramps to 50 concurrent users hitting the login endpoint to measure
 * throughput and error rate of the authentication path including JWT
 * generation and BCrypt verification.
 *
 * Expected SLOs:
 *   p95 latency  < 500 ms
 *   error rate   < 1 %
 *
 * Usage:
 *   k6 run infra/load-tests/load-auth.js
 *   k6 run --env BASE_URL=https://staging.cloudcampus.io infra/load-tests/load-auth.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { BASE_URL } from './helpers/auth.js';

const loginDuration = new Trend('login_duration', true);
const loginFailed   = new Rate('login_failed');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // ramp up
    { duration: '1m',  target: 50 },   // sustain
    { duration: '30s', target: 0  },   // ramp down
  ],
  thresholds: {
    login_duration:    ['p(95)<500'],
    login_failed:      ['rate<0.01'],
    http_req_failed:   ['rate<0.01'],
  },
};

const CREDENTIALS = {
  username: __ENV.ADMIN_USERNAME || 'superadmin',
  password: __ENV.ADMIN_PASSWORD || 'admin123',
};

export default function () {
  const start = Date.now();
  const res = http.post(
    `${BASE_URL}/v1/auth/login`,
    JSON.stringify(CREDENTIALS),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const ok = check(res, {
    'status 200':      (r) => r.status === 200,
    'has accessToken': (r) => r.json('data.accessToken') !== null,
  });

  loginDuration.add(Date.now() - start);
  loginFailed.add(!ok);

  sleep(1);
}
