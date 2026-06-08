# Super Admin Scale Validation

This runbook validates the Super Admin portal against large platform datasets:

- 1000+ schools
- 1,000,000 students
- 50,000 staff rows
- large audit logs, notification logs, invoices, and report export jobs

## What Was Added

- Real stats tables: `platform_stats`, `tenant_stats`, `school_stats`
- Stats reconciliation job: `cloudcampus.platform.stats.reconcile-cron`, default `0 */10 * * * *`
- Platform report export worker: `cloudcampus.platform.report-export.worker-delay-ms`, default `30000`
- Seed SQL generator: `tests/performance/super-admin-scale-seed-sql.mjs`
- k6 smoke script: `tests/performance/super-admin-platform-smoke.k6.js`

## Start Local Stack

```bash
docker compose -f docker-compose.local.yml up -d --build
```

Wait until backend readiness is up:

```bash
curl -fsS http://127.0.0.1:18080/actuator/health/readiness
```

## Generate Seed SQL

Small rehearsal:

```bash
node tests/performance/super-admin-scale-seed-sql.mjs \
  --tenants=10 \
  --schools=20 \
  --students=1000 \
  --staff=100 \
  --audit-logs=1000 \
  --notifications=1000 \
  --invoices=1000 \
  > /tmp/cloudcampus-scale-small.sql
```

Full staging-scale seed:

```bash
node tests/performance/super-admin-scale-seed-sql.mjs \
  --tenants=1000 \
  --schools=1000 \
  --students=1000000 \
  --staff=50000 \
  --student-users=false \
  --audit-logs=5000000 \
  --notifications=1000000 \
  --invoices=100000 \
  --batch-size=1000 \
  > /tmp/cloudcampus-scale-full.sql
```

Load into local Postgres:

```bash
docker compose -f docker-compose.local.yml exec -T postgres \
  psql -U cloudcampus -d cloudcampus \
  < /tmp/cloudcampus-scale-full.sql
```

The generator uses the real schema and refreshes `school_stats`, `tenant_stats`, and `platform_stats` at the end. Run the full seed only on a disposable local or staging database with enough disk.

## Get A Super Admin Token

Use a real Super Admin login token. For local bootstrap, sign in as the configured local-only Super Admin and copy the current access token from the login response or browser session storage.

```bash
export SUPER_ADMIN_TOKEN='paste-access-token-here'
export BASE_URL='http://127.0.0.1:18080'
```

## Run k6 Smoke

Read-heavy smoke:

```bash
k6 run tests/performance/super-admin-platform-smoke.k6.js
```

Include export enqueue timing:

```bash
INCLUDE_EXPORT_POST=true VUS=5 HOLD=30s \
  k6 run tests/performance/super-admin-platform-smoke.k6.js
```

Default targets:

- Dashboard summary and platform metrics: p95 under 500 ms
- Paginated lists: p95 under 800 ms
- Search pages: p95 under 1500 ms
- Export enqueue: p95 under 300 ms

## Endpoints Covered

- `GET /v1/super-admin/dashboard/summary`
- `GET /v1/super-admin/platform-metrics`
- `GET /v1/super-admin/tenants?page=0&size=50`
- `GET /v1/super-admin/tenants?search=...`
- `GET /v1/super-admin/schools?page=0&size=50`
- `GET /v1/super-admin/schools?search=...`
- `GET /v1/super-admin/audit-logs?page=0&size=50`
- `GET /v1/super-admin/revenue/summary`
- `GET /v1/super-admin/revenue/invoices?page=0&size=50`
- `GET /v1/super-admin/notifications/summary`
- `GET /v1/super-admin/notifications/deliveries?page=0&size=50`
- `GET /v1/super-admin/reports/summary`
- `GET /v1/super-admin/reports/exports?page=0&size=50`
- Optional `POST /v1/super-admin/reports/exports`

## Query Plan Checks

Run these when p95 is above target:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM students WHERE school_id = '20000000-0000-4000-8000-000000000001' AND active = TRUE;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM notification_deliveries WHERE status = 'FAILED' ORDER BY created_at DESC LIMIT 50;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM tenant_invoices WHERE status = 'ISSUED' ORDER BY issued_at DESC LIMIT 50;
```

## Known Limits

- Platform exports now enqueue, process asynchronously, write a CSV row, and move through `QUEUED -> PROCESSING -> COMPLETED` or `FAILED`.
- Current project storage keeps generated report content in the database `TEXT` column. That is acceptable for platform summaries/directories, but true multi-million-row exports should move to object storage before customer production.
- The seed generator is direct SQL for performance databases. Do not run it on a shared customer database.
