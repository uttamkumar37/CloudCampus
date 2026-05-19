# Rollback Deployment Playbook

Last updated: 2026-05-19

## Purpose

This playbook defines how to roll back a bad CloudCampus deployment while protecting tenant data. It covers application image rollback, database rollback constraints, and validation after rollback.

Use this when a release causes elevated errors, failed health checks, broken core workflows, failed Flyway migration startup, queue backlog, payment issues, or tenant-visible regression.

## Rollback Decision Matrix

| Situation | Preferred action | DB action |
|---|---|---|
| App-only regression, no migration | Image rollback to previous known-good backend/frontend. | None. |
| Additive backward-compatible migration | Image rollback is allowed if old app still works with expanded schema. | Leave schema in place. |
| Failed migration before app starts | Stop rollout and keep previous app image serving traffic. | Fix with a new forward migration or restore only if data was damaged. |
| Contract/destructive migration | Do not image rollback blindly. Escalate to incident commander and DB owner. | Forward fix or restore from backup may be required. |
| Data corruption or mass deletion | Declare incident and follow DB restore runbook. | Restore or targeted recovery from backup. |
| Public website content issue | Use Website Builder snapshot rollback first. | No DB restore unless platform data is corrupt. |

## Roles

| Role | Responsibility |
|---|---|
| Incident commander | Owns rollback decision, timeline, and stakeholder updates. |
| Release owner | Identifies current and previous image tags, rollout status, and changed components. |
| Backend owner | Validates API, Flyway, queues, payments, AI, and tenant workflows. |
| Frontend owner | Validates portal/public website routes and asset versioning. |
| DB owner | Decides whether schema is rollback-safe, forward-fix only, or restore required. |
| Support owner | Tracks affected tenants and prepares customer communication if needed. |

## Preconditions

Before every production deployment, the release ticket must record:

1. Current production image tags or SHAs for backend and frontend.
2. Candidate image tags or SHAs.
3. Previous three known-good image SHAs retained in the registry.
4. Migration risk from `docs/MIGRATION_GATE_CHECKLIST.md`.
5. Backup object name and timestamp.
6. Smoke test commands and expected results.
7. Rollback owner and approval contact.

## App Rollback Procedure

### 1. Freeze rollout

Stop further promotion immediately.

Kubernetes example:

```bash
kubectl rollout pause deployment/cloudcampus-backend -n cloudcampus
kubectl rollout pause deployment/cloudcampus-frontend -n cloudcampus
```

Docker Compose example:

```bash
docker compose ps
docker compose logs --tail=200 backend
```

### 2. Confirm blast radius

Record:

| Check | Evidence |
|---|---|
| Current release tag | Backend/frontend image SHA or tag. |
| Failing signal | Alert name, error rate, failing endpoint, failed workflow, or tenant report. |
| Migration state | Latest successful row in `flyway_schema_history`. |
| Affected tenants | Tenant IDs, school IDs, workflow, and start time. |
| Data writes after deploy | Whether new writes occurred under the bad version. |

Useful DB check:

```sql
SELECT version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;
```

### 3. Roll back image

Use the previous known-good immutable image tag. Do not use `latest`.

Kubernetes example:

```bash
kubectl set image deployment/cloudcampus-backend \
  backend=ghcr.io/<org>/cloudcampus-backend:<previous-sha> \
  -n cloudcampus

kubectl rollout status deployment/cloudcampus-backend -n cloudcampus
```

Frontend example:

```bash
kubectl set image deployment/cloudcampus-frontend \
  frontend=ghcr.io/<org>/cloudcampus-frontend:<previous-sha> \
  -n cloudcampus

kubectl rollout status deployment/cloudcampus-frontend -n cloudcampus
```

Docker Compose example:

```bash
export BACKEND_IMAGE=ghcr.io/<org>/cloudcampus-backend:<previous-sha>
export FRONTEND_IMAGE=ghcr.io/<org>/cloudcampus-frontend:<previous-sha>
docker compose up -d backend frontend
```

### 4. Watch startup

Backend rollback is not complete until the previous image starts cleanly with the current schema.

```bash
curl -sf http://localhost:8080/actuator/health
curl -sf http://localhost:8081/actuator/health
```

If the old image fails because the schema contracted or changed incompatibly, stop and use the DB rollback constraints section. Do not repeatedly restart.

## DB Rollback Constraints

Flyway migrations are forward-only in normal operations. Production has `out-of-order: false` and `ddl-auto: validate`, so schema ownership remains with Flyway.

| DB change | Rollback rule |
|---|---|
| New nullable column | Keep it. Old app usually ignores it. |
| New table | Keep it unless it causes app startup or query failure. |
| New additive index | Keep it unless it causes write regressions, then add a forward migration to drop it. |
| New constraint | If it blocks writes, add a forward migration to relax or defer it. |
| Backfill | Do not undo unless data is wrong. Add a corrective forward migration or targeted script. |
| Drop or rename | Image rollback may be unsafe. Restore or forward-fix after DB owner approval. |
| Data deletion | Treat as incident. Use backup restore or targeted table recovery. |

Do not:

1. Edit an applied Flyway migration.
2. Delete rows from `flyway_schema_history` without explicit DB-owner approval.
3. Run ad hoc production DDL without a recorded incident ticket.
4. Restore the whole database without incident commander approval and tenant communication.

## DB Recovery Options

| Option | When to use | Notes |
|---|---|---|
| Forward-fix migration | Bad schema is compatible enough for app to keep running or can be fixed quickly. | Preferred for most schema mistakes. |
| Disable feature flag | Bad behavior is feature-scoped and schema is safe. | Fastest low-risk mitigation. |
| Targeted data repair | Small, known set of corrupted rows. | Requires SQL review, backup reference, and audit trail. |
| Table-level restore | One or a few tables corrupted. | Follow `docs/INCIDENT_RUNBOOK.md`; validate FKs and tenant boundaries. |
| Full DB restore | Wide data corruption, destructive migration, or unrecoverable state. | Major incident. RPO/RTO apply. |

Backup reference:

```bash
sh infra/pgbackup/drill.sh
```

## Validation After Rollback

Run these checks before declaring rollback complete:

| Area | Check |
|---|---|
| Backend health | `/actuator/health` returns `UP`; DB and MinIO components are healthy. |
| Frontend | Admin portal and public website load expected static assets. |
| Auth | Login, refresh token, and role-scoped route access work. |
| Tenant isolation | School admin sees only their school data. |
| Public website | `/v1/public/website`, pages, navigation, theme, and SEO routes respond. |
| Payments | Webhook endpoint is reachable; idempotency table has no new duplicate errors. |
| Queues | RabbitMQ notification queues drain; DLQ does not grow unexpectedly. |
| AI | AI endpoints are either healthy or feature-disabled; usage metrics still publish. |
| Migrations | `flyway_schema_history` has no failed migration row. |
| Metrics | Prometheus scrape succeeds; critical alerts are clearing. |

Suggested smoke commands:

```bash
curl -sf http://localhost:8080/actuator/health
curl -sf http://localhost:8080/v1/public/website
curl -sf http://localhost:8080/v1/public/website/navigation
```

Queue check:

```bash
curl -s -u "${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}" \
  "http://localhost:15672/api/queues" \
  | jq '.[] | {name, messages, messages_unacknowledged, consumers}'
```

Flyway check:

```sql
SELECT version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;
```

## Communication

| Time | Message |
|---|---|
| Decision | Announce rollback started, impacted services, owner, and next update time. |
| During rollback | Share health, error rate, tenant impact, and whether DB recovery is involved. |
| Complete | Share final image tag, validation result, residual risks, and support guidance. |
| Post-incident | File post-mortem within 48 hours for tenant-visible incidents. |

## Completion Criteria

Rollback is complete only when:

1. Previous known-good app image is running.
2. Health checks pass.
3. Smoke tests pass.
4. Flyway has no failed migration row.
5. Queue backlog and DLQ are stable.
6. Critical alerts have cleared or are acknowledged with an owner.
7. Affected tenants and support have been updated.
8. The release ticket records exact rollback time, image SHAs, validation evidence, and follow-up owner.

## Validation

TASK-032 validation command:

```bash
rg -n "rollback deployment|deploy rollback|image rollback" docs PRODUCTION_READY_ROADMAP.md
```
