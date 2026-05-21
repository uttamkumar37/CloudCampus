# Performance And Scale Audit

## Current Foundations

- PostgreSQL indexes exist for core tenant, school, student, staff, attendance, fee, notice, timetable, AI, website, audit, and upload tables.
- Redis, RabbitMQ, MinIO, Prometheus, Grafana, Loki, Tempo, Alertmanager, and backup tooling are present in local infrastructure.
- k6 load tests already cover auth, school admin, reports, stress, and public website paths.

## Priority API Rules

- Every large list must support pagination, filtering, stable sort, and tenant/school scoped indexes.
- Dashboard APIs should aggregate server-side and return bounded payloads.
- AI, notification, report, upload scanning, and bulk import work must move through queues.
- Analytics and audit tables need retention/partition strategy before million-record claims.

## Next Index Review Targets

- AI usage by tenant and time.
- Website leads/events by tenant, page, and created time.
- Fee records by school, academic year, status, and due date.
- Homework/assignments by school, assigned teacher, due date, and status.
- Parent/student linked views by tenant and relationship.
