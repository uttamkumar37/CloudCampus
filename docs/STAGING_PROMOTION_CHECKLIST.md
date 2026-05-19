# Staging Promotion Checklist

Last updated: 2026-05-19

## Purpose

This checklist decides whether a release candidate can be promoted from staging to production. It requires green CI, smoke tests, migrations, backups, rollback readiness, and explicit approval.

Promotion is blocked until every required gate is complete and linked in the release ticket.

## Release Ticket Header

Record these before running the checklist:

| Field | Required value |
|---|---|
| Release version | Git tag or release candidate identifier. |
| Commit SHA | Exact Git commit tested in staging. |
| Backend image | Immutable image SHA/tag; do not promote `latest` by itself. |
| Frontend image | Immutable image SHA/tag or build artifact identifier. |
| Staging URL | URL used for smoke/load validation. |
| Target production window | Date, time, timezone, and expected duration. |
| Release owner | Person accountable for go/no-go. |
| Rollback owner | Person accountable for rollback execution. |

## Gate 1: Green CI

Promotion requires the current commit to pass all CI jobs.

| Check | Evidence |
|---|---|
| Backend build and tests | GitHub Actions `Backend - Build & Test` passed; `mvn verify --batch-mode --no-transfer-progress`. |
| Frontend build | GitHub Actions `Frontend - TypeScript & Build` passed; `npm run build`. |
| Mobile type check | GitHub Actions `Mobile - TypeScript Check` passed; `npx tsc --noEmit`. |
| Secret scan | TruffleHog job passed. |
| Dependency scan | OWASP Dependency Check passed or approved exception is linked. |
| Docker image | Backend image built and pushed with immutable SHA tag. |

Block promotion if any required job is skipped, red, stale, or from a different commit SHA.

## Gate 2: Staging Environment

| Check | Evidence |
|---|---|
| Staging uses candidate images | Runtime image IDs match the release ticket. |
| Staging profile active | Backend runs with `application-staging.yml` settings. |
| Production-like dependencies | PostgreSQL, Redis, RabbitMQ, MinIO, SMTP/provider sandbox, and Prometheus are reachable. |
| Secrets are staging-specific | JWT, encryption, SMTP, Razorpay, AI, and bootstrap secrets are not dev or production values. |
| Observability is live | `/actuator/prometheus` is scraped and staging logs are searchable. |
| No active critical alerts | Backend down, DB, Redis, backup, queue, and AI budget alerts are clear or explained. |

## Gate 3: Migrations

Use `docs/MIGRATION_GATE_CHECKLIST.md` for the detailed migration gate.

| Check | Evidence |
|---|---|
| Flyway dry run | Candidate migrations applied in staging or scratch restore. |
| Flyway history | `flyway_schema_history` has no failed migration row. |
| Migration versioning | New migrations use the next unused version and do not edit applied files. |
| Rollback notes | Release ticket states whether app rollback is schema-compatible. |
| Query/index proof | New indexes or heavy backfills include staging timing or `EXPLAIN` evidence. |
| Tenant safety | New tenant-scoped tables/queries include tenant isolation notes. |

Useful check:

```sql
SELECT version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;
```

## Gate 4: Backups and Restore

| Check | Evidence |
|---|---|
| Fresh backup exists | Backup object name and timestamp are recorded. |
| Backup alerts clear | `BackupNotFresh` and `BackupMetricAbsent` are not firing. |
| Restore drill recent | Latest `infra/pgbackup/drill.sh` result is linked. |
| High-risk restore proof | For destructive or high-risk schema/data changes, scratch restore validation is linked. |
| RPO understood | Release owner records expected RPO if a restore is required during the window. |

## Gate 5: Smoke Tests

Run smoke tests after staging deployment and after migrations.

| Check | Command or workflow |
|---|---|
| Health | `curl -sf https://<staging-host>/actuator/health` returns healthy status. |
| k6 smoke | `k6 run --env BASE_URL=https://<staging-host> --env ADMIN_USERNAME=... --env ADMIN_PASSWORD=... infra/load-tests/smoke.js` |
| Auth | Login and token refresh work for Super Admin and school roles. |
| Tenant isolation | School admin sees only expected school data. |
| Public website | Homepage, pages, navigation, theme, and SEO endpoints respond. |
| Payments | Webhook endpoint is reachable in sandbox; idempotency path is checked if changed. |
| Queues | RabbitMQ queues have consumers and no unexplained backlog. |
| Files | MinIO upload/download or presigned URL path works if storage code changed. |

## Gate 6: Staging Load and Regression Evidence

| Check | Evidence |
|---|---|
| Required load tier selected | MVP, Standard, or Enterprise claim gate from `docs/SEEDED_STAGING_LOAD_TEST_PLAN.md`. |
| k6 required scripts | Smoke, auth, reports, school-admin, and public-website scenarios passed or exceptions are approved. |
| Performance thresholds | p95, 5xx rate, DB pool, Redis, RabbitMQ, JVM heap, and CPU thresholds are recorded. |
| Queue stress | Queue stress evidence is linked if notifications or async processing changed. |
| Index impact | New indexes/backfills have before/after query-plan or latency evidence. |
| Regression notes | Any known regressions have owner, severity, and mitigation. |

## Gate 7: Rollback Readiness

Use `docs/ROLLBACK_DEPLOYMENT_PLAYBOOK.md`.

| Check | Evidence |
|---|---|
| Previous image known | Previous backend/frontend immutable image SHAs are recorded. |
| Rollback command ready | Kubernetes, Docker Compose, or platform-specific rollback command is written in the ticket. |
| DB rollback posture clear | App rollback is marked safe, forward-fix only, or restore-required. |
| Feature flags ready | Risky features can be disabled without redeploy where applicable. |
| Support brief ready | Support owner has tenant-visible risk notes and escalation channel. |

## Gate 8: Approval

| Risk | Required approvers |
|---|---|
| Low-risk app-only release | Release owner, backend owner, frontend owner. |
| Migration release | Release owner, backend owner, DB/DevOps owner. |
| Payment, auth, tenant isolation, or upload changes | Release owner, backend owner, security owner, support owner. |
| High-risk or enterprise customer release | CTO/architecture owner, release owner, backend owner, DB/DevOps owner, support owner. |

Approval must be explicit in the release ticket. Silence is not approval.

## Go/No-Go

Promotion is GO only when:

1. CI is green for the exact commit SHA.
2. Staging runs the exact candidate image/build.
3. Flyway migration gate passes.
4. Backup and restore evidence is linked.
5. Smoke tests pass.
6. Required load/regression evidence passes.
7. Rollback readiness is documented.
8. Required approvers have approved.
9. No unresolved P0/P1/P2 bugs remain for the release scope.

Promotion is NO-GO if any gate is missing, stale, or not tied to the candidate commit.

## Validation

TASK-033 validation command:

```bash
rg -n "staging promotion|promotion checklist" docs PRODUCTION_READY_ROADMAP.md
```
