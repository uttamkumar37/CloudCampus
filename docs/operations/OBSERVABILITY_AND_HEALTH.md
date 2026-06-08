<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Observability And Health

Status: CURRENT_IMPLEMENTED

| Signal | Source | Status |
| --- | --- | --- |
| Platform health | /v1/super-admin/platform-health and /v1/system/readiness. | CURRENT_IMPLEMENTED |
| Audit logs | audit_logs and Super Admin audit endpoint. | CURRENT_IMPLEMENTED |
| Outbox backlog | outbox_events and health metrics. | CURRENT_IMPLEMENTED |
| Report backlog | report_export_jobs and health metrics. | CURRENT_IMPLEMENTED |
| Notification failures | notification deliveries summary/list/detail. | CURRENT_IMPLEMENTED |
| AI usage/budget | AI usage summary/audit tables. | CURRENT_IMPLEMENTED |
| Prometheus/Grafana | Not discovered. | NOT_FOUND_IN_CODEBASE |

Verified June 8, 2026: `tests/performance/super-admin-platform-smoke.k6.js` exercises platform health-adjacent Super Admin flows for dashboard metrics, platform metrics, directories/search, audit logs, notifications, revenue, report exports, AI recommendations, automation rules, and automation runs.
