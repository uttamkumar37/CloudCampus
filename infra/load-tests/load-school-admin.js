/**
 * School admin load test — TASK-027
 *
 * Exercises the core school-admin weekday workflow:
 *   - login
 *   - dashboard
 *   - students
 *   - fees
 *   - attendance reads and write path
 *   - reports
 *
 * Required env vars:
 *   ADMIN_USERNAME        — school-admin username
 *   ADMIN_PASSWORD        — school-admin password
 *   SCHOOL_ID             — seeded school UUID
 *   ACADEMIC_YEAR_ID      — seeded academic year UUID
 *   CLASS_ID              — seeded class UUID
 *   STUDENT_ID            — seeded student UUID in CLASS_ID
 *   FEE_RECORD_ID         — seeded fee record UUID for STUDENT_ID
 *   EXAM_ID               — seeded exam UUID for performance report
 *   ATTENDANCE_SESSION_ID — open seeded attendance session UUID for write upserts
 *
 * Optional env vars:
 *   BASE_URL              — default: http://localhost:8080
 *   SECTION_ID            — section UUID for section-scoped attendance reports
 *   FROM_DATE             — default: today
 *   TO_DATE               — default: today
 *   ATTENDANCE_DATE       — default: TO_DATE
 *
 * Usage:
 *   k6 run \
 *     --env BASE_URL=https://staging.cloudcampus.io \
 *     --env ADMIN_USERNAME=<school-admin> \
 *     --env ADMIN_PASSWORD=<password> \
 *     --env SCHOOL_ID=<uuid> \
 *     --env ACADEMIC_YEAR_ID=<uuid> \
 *     --env CLASS_ID=<uuid> \
 *     --env STUDENT_ID=<uuid> \
 *     --env FEE_RECORD_ID=<uuid> \
 *     --env EXAM_ID=<uuid> \
 *     --env ATTENDANCE_SESSION_ID=<uuid> \
 *     infra/load-tests/load-school-admin.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from './helpers/auth.js';

const flowDuration = new Trend('school_admin_flow_duration', true);
const flowFailed = new Rate('school_admin_flow_failed');
const writeFailed = new Rate('school_admin_write_failed');

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    school_admin_flow_duration: ['p(95)<1500'],
    school_admin_flow_failed: ['rate<0.01'],
    school_admin_write_failed: ['rate<0.01'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

const requiredEnv = [
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'SCHOOL_ID',
  'ACADEMIC_YEAR_ID',
  'CLASS_ID',
  'STUDENT_ID',
  'FEE_RECORD_ID',
  'EXAM_ID',
  'ATTENDANCE_SESSION_ID',
];

function requireEnv(name) {
  const value = __ENV[name];
  if (!value) {
    throw new Error(`${name} env var is required for seeded staging school-admin load tests`);
  }
  return value;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function setup() {
  const config = Object.fromEntries(requiredEnv.map((name) => [name, requireEnv(name)]));
  config.SECTION_ID = __ENV.SECTION_ID || '';
  config.FROM_DATE = __ENV.FROM_DATE || todayIso();
  config.TO_DATE = __ENV.TO_DATE || todayIso();
  config.ATTENDANCE_DATE = __ENV.ATTENDANCE_DATE || config.TO_DATE;

  const token = login(config.ADMIN_USERNAME, config.ADMIN_PASSWORD);
  if (!token) {
    throw new Error('School-admin load test: login failed. Check ADMIN_USERNAME and ADMIN_PASSWORD.');
  }

  return { token, config };
}

export default function ({ token, config }) {
  const startedAt = Date.now();
  const headers = authHeaders(token);
  let failed = false;

  group('dashboard', () => {
    failed = requestOk('dashboard', http.get(
      `${BASE_URL}/v1/school-admin/schools/${config.SCHOOL_ID}/dashboard`,
      { headers }
    )) || failed;
  });

  group('students', () => {
    failed = requestOk('students list', http.get(
      `${BASE_URL}/v1/school-admin/schools/${config.SCHOOL_ID}/students`,
      { headers }
    )) || failed;
    failed = requestOk('student detail', http.get(
      `${BASE_URL}/v1/school-admin/students/${config.STUDENT_ID}`,
      { headers }
    )) || failed;
  });

  group('fees', () => {
    failed = requestOk('fee records by school', http.get(
      `${BASE_URL}/v1/school-admin/schools/${config.SCHOOL_ID}/fee-records?academicYearId=${config.ACADEMIC_YEAR_ID}`,
      { headers }
    )) || failed;
    failed = requestOk('fee record detail', http.get(
      `${BASE_URL}/v1/school-admin/fee-records/${config.FEE_RECORD_ID}`,
      { headers }
    )) || failed;
    failed = requestOk('fee receipt', http.get(
      `${BASE_URL}/v1/school-admin/fee-records/${config.FEE_RECORD_ID}/receipt`,
      { headers }
    )) || failed;
  });

  group('attendance reads', () => {
    failed = requestOk('attendance sessions by school', http.get(
      `${BASE_URL}/v1/school-admin/schools/${config.SCHOOL_ID}/attendance/sessions?date=${config.ATTENDANCE_DATE}`,
      { headers }
    )) || failed;

    const sectionParam = config.SECTION_ID ? `&sectionId=${config.SECTION_ID}` : '';
    failed = requestOk('attendance sessions by class', http.get(
      `${BASE_URL}/v1/school-admin/classes/${config.CLASS_ID}/attendance/sessions?from=${config.FROM_DATE}&to=${config.TO_DATE}${sectionParam}`,
      { headers }
    )) || failed;
    failed = requestOk('student attendance report', http.get(
      `${BASE_URL}/v1/school-admin/students/${config.STUDENT_ID}/attendance/report?from=${config.FROM_DATE}&to=${config.TO_DATE}`,
      { headers }
    )) || failed;
    failed = requestOk('class attendance report', http.get(
      `${BASE_URL}/v1/school-admin/classes/${config.CLASS_ID}/attendance/report?from=${config.FROM_DATE}&to=${config.TO_DATE}${sectionParam}`,
      { headers }
    )) || failed;
  });

  group('attendance write path', () => {
    const status = ['PRESENT', 'ABSENT', 'LATE'][(__ITER + __VU) % 3];
    const response = http.post(
      `${BASE_URL}/v1/school-admin/attendance/sessions/${config.ATTENDANCE_SESSION_ID}/mark`,
      JSON.stringify({
        records: [{ studentId: config.STUDENT_ID, status, remarks: 'k6 seeded staging upsert' }],
        lockSession: false,
      }),
      { headers }
    );
    const writeDidFail = requestOk('attendance mark upsert', response);
    writeFailed.add(writeDidFail);
    failed = writeDidFail || failed;
  });

  group('reports', () => {
    failed = requestOk('attendance report', http.get(
      `${BASE_URL}/v1/school-admin/schools/${config.SCHOOL_ID}/reports/attendance?academicYearId=${config.ACADEMIC_YEAR_ID}`,
      { headers }
    )) || failed;
    failed = requestOk('fee report', http.get(
      `${BASE_URL}/v1/school-admin/schools/${config.SCHOOL_ID}/reports/fees?academicYearId=${config.ACADEMIC_YEAR_ID}`,
      { headers }
    )) || failed;
    failed = requestOk('performance report', http.get(
      `${BASE_URL}/v1/school-admin/schools/${config.SCHOOL_ID}/reports/performance?examId=${config.EXAM_ID}`,
      { headers }
    )) || failed;
  });

  flowDuration.add(Date.now() - startedAt);
  flowFailed.add(failed);
  sleep(1);
}

function requestOk(name, response) {
  const ok = check(response, {
    [`${name} 2xx`]: (r) => r.status >= 200 && r.status < 300,
  });
  return !ok;
}

