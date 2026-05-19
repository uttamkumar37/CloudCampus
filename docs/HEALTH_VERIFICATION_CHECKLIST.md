# Health Verification Checklist

Last updated: 2026-05-19

## Purpose

This checklist verifies CloudCampus health after deployment, rollback, staging promotion, or incident recovery. It covers backend health, frontend routes, auth, public site, payments, queues, and metrics.

Run it after every staging deployment and production deployment. For production, run internal actuator checks from the private network because production actuator is bound to the management port.

## Environment Inputs

| Variable | Example | Required |
|---|---|---|
| `BASE_URL` | `https://staging.cloudcampus.io` | Public/API base URL. |
| `ACTUATOR_URL` | `http://backend.internal:8081` | Internal actuator base URL in prod/staging. |
| `ADMIN_USERNAME` | `admin@staging.cloudcampus.io` | Smoke-test admin user. |
| `ADMIN_PASSWORD` | From secret manager | Smoke-test admin password. |
| `RABBITMQ_MANAGEMENT_URL` | `http://rabbitmq.internal:15672` | Queue inspection URL. |
| `PROMETHEUS_URL` | `http://prometheus.internal:9090` | Prometheus API URL. |

## Gate 1: Backend Actuator

| Check | Command | Pass condition |
|---|---|---|
| Backend health | `curl -sf "$ACTUATOR_URL/actuator/health"` | HTTP 200 and status is `UP`. |
| Liveness | `curl -sf "$ACTUATOR_URL/actuator/health/liveness"` | HTTP 200. |
| Readiness | `curl -sf "$ACTUATOR_URL/actuator/health/readiness"` | HTTP 200. |
| Prometheus endpoint | `curl -sf "$ACTUATOR_URL/actuator/prometheus" | head` | Metrics are returned. |

Production exposes only `health` and `prometheus`; do not require `/actuator/info` in production.

## Gate 2: Smoke Test

Run the existing k6 smoke test:

```bash
k6 run \
  --env BASE_URL="$BASE_URL" \
  --env ADMIN_USERNAME="$ADMIN_USERNAME" \
  --env ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  infra/load-tests/smoke.js
```

Pass condition:

1. Health group passes.
2. Login group passes.
3. Tenants list group passes.
4. `http_req_failed` remains below the script threshold.
5. p95 duration remains below the script threshold.

If k6 is not available, run the same minimum checks with `curl` and document that k6 runtime validation was blocked.

## Gate 3: Frontend Routes

| Route | Check | Pass condition |
|---|---|---|
| Admin shell | `curl -sf "$BASE_URL/"` | HTML returns and static assets load without 404/5xx. |
| Login route | Browser or curl route check | Login screen renders. |
| Super Admin route | Authenticated browser check | Dashboard shell renders without JavaScript crash. |
| School Admin route | Authenticated browser check | Dashboard, students, fees, and attendance links render. |
| Public website route | `curl -sf "$BASE_URL/"` plus public API checks | Public content is visible and not blocked by auth. |

Browser validation should include one hard refresh to catch stale asset references after deployment.

## Gate 4: Auth

| Check | Command or action | Pass condition |
|---|---|---|
| Login | `POST /v1/auth/login` through smoke test or API client. | Returns token/session response. |
| Refresh | Existing frontend silent refresh or API check. | Refresh succeeds without 401 loop. |
| Role access | Authenticated request to a role-scoped route. | Correct role succeeds. |
| Tenant isolation | School admin list/dashboard. | User sees only expected school/tenant data. |
| Public routes | Unauthenticated `/v1/public/**`, `/v1/experience/public/**`, and `/actuator/health`. | Public endpoints do not require auth. |

## Gate 5: Public Site

| Endpoint | Pass condition |
|---|---|
| `GET /v1/public/website` | HTTP 200 and public website metadata returned. |
| `GET /v1/public/website/pages` | HTTP 200 and published pages list returned. |
| `GET /v1/public/website/navigation` | HTTP 200 and navigation returned. |
| `GET /v1/public/website/theme` | HTTP 200 and theme returned. |
| `GET /v1/public/website/seo?routePath=/` | HTTP 200 and SEO metadata returned. |
| `GET /v1/public/website/showcase/demo` | HTTP 200. |
| `GET /v1/public/website/showcase/investors` | HTTP 200. |

Suggested command:

```bash
for path in \
  /v1/public/website \
  /v1/public/website/pages \
  /v1/public/website/navigation \
  /v1/public/website/theme \
  '/v1/public/website/seo?routePath=/' \
  /v1/public/website/showcase/demo \
  /v1/public/website/showcase/investors
do
  curl -sf "$BASE_URL$path" >/dev/null || exit 1
done
```

## Gate 6: Payments

| Check | Pass condition |
|---|---|
| Payment config | Razorpay sandbox/prod enablement matches environment. |
| Student payment-order endpoint | Authenticated seeded student can create a payment order in sandbox when payments are enabled. |
| School-admin payment-order endpoint | Authenticated school admin can create an order for a seeded fee record when payments are enabled. |
| Verify endpoint | `POST /v1/payment/verify` rejects invalid signatures and accepts sandbox-valid signatures. |
| Webhook endpoint | `POST /v1/payment/webhooks/razorpay` rejects invalid signatures with no side effects. |
| Idempotency | Duplicate webhook event IDs are ignored, not double-recorded. |
| Metrics | `cloudcampus_finance_payments_total` and payment amount metrics remain present when payment flows are exercised. |

Do not run real-money payment verification as a health check. Use sandbox credentials or signature-rejection checks.

## Gate 7: Queues

| Check | Command | Pass condition |
|---|---|---|
| Queue list | RabbitMQ management API `/api/queues`. | `cc.notifications.email`, `cc.notifications.sms`, and `cc.notifications.dead` exist. |
| Consumers | Queue JSON `consumers`. | Active queues have consumers after backend startup. |
| Backlog | Queue JSON `messages`. | No unexplained sustained backlog. |
| DLQ | `cc.notifications.dead` depth. | Empty unless a known poison-message test was run. |
| Alert | Prometheus `RabbitMQQueueDepthHigh`. | Not firing after deploy. |

Suggested command:

```bash
curl -s -u "$RABBITMQ_USERNAME:$RABBITMQ_PASSWORD" \
  "$RABBITMQ_MANAGEMENT_URL/api/queues" \
  | jq '.[] | {name, messages, messages_unacknowledged, consumers}'
```

## Gate 8: Metrics and Alerts

| Check | Command | Pass condition |
|---|---|---|
| Backend scrape | Prometheus query `up{job="cloudcampus-backend"}`. | Value is `1`. |
| HTTP metrics | Query request metrics in Prometheus. | New samples arrive after smoke test. |
| JVM metrics | Query `jvm_memory_used_bytes`. | New samples arrive. |
| AI metrics | Query `cloudcampus_ai_budget_utilization_percent`. | Present for active tenants when AI metrics publisher runs. |
| Backup freshness | `BackupNotFresh`, `BackupMetricAbsent`. | Not firing. |
| Queue alert | `RabbitMQQueueDepthHigh`. | Not firing unless expected during queue stress. |
| Backend down alert | Backend scrape alert. | Not firing. |

Suggested Prometheus checks:

```bash
curl -s "$PROMETHEUS_URL/api/v1/query?query=up%7Bjob%3D%22cloudcampus-backend%22%7D" | jq .
curl -s "$PROMETHEUS_URL/api/v1/alerts" | jq '.data.alerts[] | {alertname: .labels.alertname, state: .state}'
```

## Gate 9: Completion Record

Record these in the release or incident ticket:

| Field | Required evidence |
|---|---|
| Verification time | Timestamp and timezone. |
| Build/image | Backend and frontend image SHA/tag. |
| Health result | Actuator health output summary. |
| Smoke result | k6 summary or curl fallback. |
| Auth result | User/role tested. |
| Public site result | Endpoint list tested. |
| Payment result | Sandbox or invalid-signature checks. |
| Queue result | Queue depth and consumer snapshot. |
| Metrics result | Prometheus scrape and alert snapshot. |
| Owner | Person who performed verification. |

## Go/No-Go

Health verification is GO only when:

1. Backend health and readiness pass.
2. Smoke test passes.
3. Frontend critical routes render.
4. Auth and tenant isolation checks pass.
5. Public website endpoints pass.
6. Payment health checks pass or payments are explicitly disabled for the environment.
7. Queue consumers are present and backlog is stable.
8. Prometheus scrape is healthy and no unexplained critical alerts are firing.

Any failure is a NO-GO until fixed, rolled back, or explicitly accepted by the incident commander/release owner.

## Validation

TASK-034 validation command:

```bash
rg -n "health verification|smoke test|actuator" docs PRODUCTION_READY_ROADMAP.md
```
