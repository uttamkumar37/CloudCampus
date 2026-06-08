<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Performance Test Plan

Status: CURRENT_IMPLEMENTED

| Scenario | Data shape | Requirement | Status |
| --- | --- | --- | --- |
| Super Admin dashboard/platform metrics | Thousands tenants/schools/users | `/dashboard/summary` and `/platform-metrics` p95 under 500ms in `tests/performance/super-admin-platform-smoke.k6.js`. | CURRENT_IMPLEMENTED smoke coverage; CURRENT_PARTIAL environment SLA |
| Super Admin tenant/school/user lists | Thousands tenants/schools/users | Paged list and search p95 targets: lists under 800ms, search under 1500ms. | CURRENT_IMPLEMENTED smoke coverage; CURRENT_PARTIAL environment SLA |
| Audit search | High audit volume | `/audit-logs` bounded page under 800ms; created/action/tenant indexes exist. | CURRENT_IMPLEMENTED smoke coverage; CURRENT_PARTIAL environment SLA |
| Notifications and revenue | Many deliveries/invoices | `/notifications/deliveries` and `/revenue/invoices` paginated p95 under 800ms. | CURRENT_IMPLEMENTED smoke coverage; CURRENT_PARTIAL environment SLA |
| Report export | Large student/fee data | Export job list under 800ms; optional enqueue under 300ms; generation stays async. | CURRENT_IMPLEMENTED smoke coverage; CURRENT_PARTIAL environment SLA |
| AI governance lists | Many recommendations/rules/runs | `/ai/recommendations`, `/ai/automation-rules`, and `/ai/automation-runs` paginated p95 under 800ms. | CURRENT_IMPLEMENTED smoke coverage; CURRENT_PARTIAL environment SLA |
| Role dashboard | Large school records | Fast summary/cached aggregates where needed. | CURRENT_PARTIAL |

Seed data:
- `tests/performance/super-admin-scale-seed-sql.mjs` supports tenant, school, student, staff, audit, notification, invoice, AI recommendation, automation rule, and automation run volumes.
- Run the k6 smoke with `SUPER_ADMIN_TOKEN` and optional `INCLUDE_EXPORT_POST=true` only in environments where creating a report export job is acceptable.
