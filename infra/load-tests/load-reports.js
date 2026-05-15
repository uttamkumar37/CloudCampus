/**
 * Reports load test — CC-1703
 *
 * Simulates school-admin users generating attendance, fee, and performance
 * reports concurrently. These are the heaviest read paths — each hits the
 * report aggregation service which runs multi-table JOINs and is backed by
 * Redis caching (first call is a cache miss; subsequent calls are cache hits).
 *
 * Required env vars (all have defaults for local dev):
 *   BASE_URL         — API base (default: http://localhost:8080)
 *   ADMIN_USERNAME   — school-admin login (default: superadmin)
 *   ADMIN_PASSWORD   — password (default: admin123)
 *   SCHOOL_ID        — UUID of the school to query
 *   ACADEMIC_YEAR_ID — UUID of the academic year
 *   EXAM_ID          — UUID of an exam for performance report
 *
 * Usage:
 *   k6 run \
 *     --env SCHOOL_ID=<uuid> \
 *     --env ACADEMIC_YEAR_ID=<uuid> \
 *     --env EXAM_ID=<uuid> \
 *     infra/load-tests/load-reports.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from './helpers/auth.js';

const reportDuration = new Trend('report_duration', true);
const reportFailed   = new Rate('report_failed');

export const options = {
  stages: [
    { duration: '30s', target: 5  },
    { duration: '2m',  target: 20 },
    { duration: '30s', target: 0  },
  ],
  thresholds: {
    report_duration:   ['p(95)<2000'],   // reports are heavier — 2 s p95
    report_failed:     ['rate<0.01'],
    http_req_failed:   ['rate<0.01'],
  },
};

export function setup() {
  const token = login(
    __ENV.ADMIN_USERNAME || 'superadmin',
    __ENV.ADMIN_PASSWORD || 'admin123'
  );
  if (!token) throw new Error('Reports load test: login failed');
  return { token };
}

export default function ({ token }) {
  const headers  = authHeaders(token);
  const schoolId = __ENV.SCHOOL_ID        || 'REPLACE_WITH_SCHOOL_ID';
  const yearId   = __ENV.ACADEMIC_YEAR_ID || 'REPLACE_WITH_YEAR_ID';
  const examId   = __ENV.EXAM_ID          || 'REPLACE_WITH_EXAM_ID';
  const base     = `${BASE_URL}/v1/school-admin/schools/${schoolId}/reports`;

  group('attendance report', () => {
    const start = Date.now();
    const r = http.get(`${base}/attendance?academicYearId=${yearId}`, { headers });
    reportDuration.add(Date.now() - start);
    const ok = check(r, { 'attendance 200': (res) => res.status === 200 });
    reportFailed.add(!ok);
  });

  sleep(0.5);

  group('fee report', () => {
    const start = Date.now();
    const r = http.get(`${base}/fees?academicYearId=${yearId}`, { headers });
    reportDuration.add(Date.now() - start);
    const ok = check(r, { 'fees 200': (res) => res.status === 200 });
    reportFailed.add(!ok);
  });

  sleep(0.5);

  group('performance report', () => {
    const start = Date.now();
    const r = http.get(`${base}/performance?examId=${examId}`, { headers });
    reportDuration.add(Date.now() - start);
    const ok = check(r, { 'performance 200': (res) => res.status === 200 });
    reportFailed.add(!ok);
  });

  sleep(1);
}
