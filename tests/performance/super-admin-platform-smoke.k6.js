import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:18080').replace(/\/+$/, '');
const TOKEN = __ENV.SUPER_ADMIN_TOKEN;
const INCLUDE_EXPORT_POST = (__ENV.INCLUDE_EXPORT_POST || 'false').toLowerCase() === 'true';
const TENANT_SEARCH = __ENV.TENANT_SEARCH || 'PERF-T';
const SCHOOL_SEARCH = __ENV.SCHOOL_SEARCH || 'Performance School';

if (!TOKEN) {
  throw new Error('SUPER_ADMIN_TOKEN is required.');
}

const thresholds = {
  http_req_failed: ['rate<0.01'],
  'http_req_duration{endpoint:dashboardSummary}': ['p(95)<500'],
  'http_req_duration{endpoint:platformMetrics}': ['p(95)<500'],
  'http_req_duration{endpoint:tenantList}': ['p(95)<800'],
  'http_req_duration{endpoint:tenantSearch}': ['p(95)<1500'],
  'http_req_duration{endpoint:schoolList}': ['p(95)<800'],
  'http_req_duration{endpoint:schoolSearch}': ['p(95)<1500'],
  'http_req_duration{endpoint:userList}': ['p(95)<800'],
  'http_req_duration{endpoint:platformSearch}': ['p(95)<1500'],
  'http_req_duration{endpoint:auditLogs}': ['p(95)<800'],
  'http_req_duration{endpoint:revenueSummary}': ['p(95)<500'],
  'http_req_duration{endpoint:invoiceList}': ['p(95)<800'],
  'http_req_duration{endpoint:notificationSummary}': ['p(95)<500'],
  'http_req_duration{endpoint:notificationList}': ['p(95)<800'],
  'http_req_duration{endpoint:reportsSummary}': ['p(95)<800'],
  'http_req_duration{endpoint:reportExportList}': ['p(95)<800'],
  'http_req_duration{endpoint:aiRecommendationList}': ['p(95)<800'],
  'http_req_duration{endpoint:automationRuleList}': ['p(95)<800'],
  'http_req_duration{endpoint:automationRunList}': ['p(95)<800'],
};

if (INCLUDE_EXPORT_POST) {
  thresholds['http_req_duration{endpoint:exportEnqueue}'] = ['p(95)<300'];
}

export const options = {
  scenarios: {
    super_admin_platform_smoke: {
      executor: 'ramping-vus',
      stages: [
        { duration: __ENV.RAMP_UP || '30s', target: Number(__ENV.VUS || 20) },
        { duration: __ENV.HOLD || '2m', target: Number(__ENV.VUS || 20) },
        { duration: __ENV.RAMP_DOWN || '30s', target: 0 },
      ],
    },
  },
  thresholds,
};

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/json',
};

export default function () {
  group('Super Admin dashboard and metrics', () => {
    get('/v1/super-admin/dashboard/summary', 'dashboardSummary');
    get('/v1/super-admin/platform-metrics', 'platformMetrics');
  });

  group('Super Admin paginated directories', () => {
    get('/v1/super-admin/tenants?page=0&size=50', 'tenantList');
    get(`/v1/super-admin/tenants?page=0&size=50&search=${encodeURIComponent(TENANT_SEARCH)}`, 'tenantSearch');
    get('/v1/super-admin/schools?page=0&size=50', 'schoolList');
    get(`/v1/super-admin/schools?page=0&size=50&search=${encodeURIComponent(SCHOOL_SEARCH)}`, 'schoolSearch');
    get('/v1/super-admin/users?page=0&size=50', 'userList');
    get(`/v1/super-admin/search?page=0&size=25&q=${encodeURIComponent(TENANT_SEARCH)}`, 'platformSearch');
  });

  group('Super Admin high-volume logs and money', () => {
    get('/v1/super-admin/audit-logs?page=0&size=50', 'auditLogs');
    get('/v1/super-admin/revenue/summary', 'revenueSummary');
    get('/v1/super-admin/revenue/invoices?page=0&size=50', 'invoiceList');
  });

  group('Super Admin notifications and reports', () => {
    get('/v1/super-admin/notifications/summary', 'notificationSummary');
    get('/v1/super-admin/notifications/deliveries?page=0&size=50', 'notificationList');
    get('/v1/super-admin/reports/summary', 'reportsSummary');
    get('/v1/super-admin/reports/exports?page=0&size=50', 'reportExportList');
  });

  group('Super Admin AI governance', () => {
    get('/v1/super-admin/ai/recommendations?page=0&size=50', 'aiRecommendationList');
    get('/v1/super-admin/ai/automation-rules?page=0&size=50', 'automationRuleList');
    get('/v1/super-admin/ai/automation-runs?page=0&size=50', 'automationRunList');
  });

  if (INCLUDE_EXPORT_POST) {
    group('Super Admin export enqueue', () => {
      const response = http.post(
        `${BASE_URL}/v1/super-admin/reports/exports`,
        JSON.stringify({ reportType: 'PLATFORM_SUMMARY', format: 'CSV' }),
        {
          headers: { ...headers, 'Content-Type': 'application/json' },
          tags: { endpoint: 'exportEnqueue' },
        },
      );
      check(response, {
        'export enqueue returns 202': (res) => res.status === 202,
      });
    });
  }

  sleep(Number(__ENV.SLEEP_SECONDS || 1));
}

function get(path, endpoint) {
  const response = http.get(`${BASE_URL}${path}`, {
    headers,
    tags: { endpoint },
  });
  check(response, {
    [`${endpoint} returns 200`]: (res) => res.status === 200,
  });
  return response;
}
