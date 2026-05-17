/**
 * Stress test — CC-1704
 *
 * Pushes the system past its comfortable load to find the breaking point.
 * Ramps to 200 concurrent VUs over 5 minutes, then drops to zero.
 * Monitors for increased error rate and latency degradation.
 *
 * Targets the most resource-intensive paths:
 *   - Login (BCrypt + JWT + Redis token write)
 *   - Health (lightweight — used as baseline comparator)
 *
 * Run in a non-production environment only. The rate limiter
 * (20 req/user/min) will kick in — expect 429s at high VU counts;
 * these are counted separately so they don't contaminate the error SLO.
 *
 * Usage:
 *   k6 run infra/load-tests/stress.js
 *   k6 run --env BASE_URL=https://staging.cloudcampus.io infra/load-tests/stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL } from './helpers/auth.js';

// H-25: Refuse to run with a default/fallback credential — force explicit env vars.
const ADMIN_USERNAME = __ENV.ADMIN_USERNAME || 'superadmin';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD env var is required — set it with --env ADMIN_PASSWORD=<value>');
}

const latency     = new Trend('stress_latency', true);
const errorRate   = new Rate('stress_errors');
const rateLimited = new Rate('stress_rate_limited');

export const options = {
  stages: [
    { duration: '1m',  target: 50  },   // warm-up
    { duration: '2m',  target: 100 },   // load
    { duration: '2m',  target: 200 },   // stress
    { duration: '1m',  target: 0   },   // recovery
  ],
  thresholds: {
    // Stress thresholds are deliberately looser — we expect some degradation.
    stress_latency:    ['p(95)<3000'],
    stress_errors:     ['rate<0.05'],    // <5% hard errors (excl. 429s)
    http_req_failed:   ['rate<0.10'],
  },
};

export default function () {
  const start = Date.now();

  // Mix of lightweight (health) and heavy (login) requests.
  const path = Math.random() < 0.3
    ? '/actuator/health'
    : '/v1/auth/login';

  let res;
  if (path === '/actuator/health') {
    res = http.get(`${BASE_URL}${path}`);
  } else {
    res = http.post(
      `${BASE_URL}${path}`,
      JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  latency.add(Date.now() - start);

  // Track 429s separately — expected from the rate limiter, not an app error.
  if (res.status === 429) {
    rateLimited.add(1);
  } else {
    rateLimited.add(0);
    errorRate.add(res.status >= 500);
    check(res, { 'not 5xx': (r) => r.status < 500 });
  }

  sleep(0.5);
}
