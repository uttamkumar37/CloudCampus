# Deployment SOP

Last updated: 2026-05-19

## Purpose

This deployment SOP defines the standard CloudCampus production release procedure. It covers pre-deploy checks, deployment execution, migration handling, smoke tests, rollback, and communication.

Use this for every backend, frontend, infrastructure, public website, payment, mobile API, or database release. Mobile store releases use this SOP for backend/API readiness and `docs/MOBILE_RELEASE_CHECKLIST.md` for store-specific gates.

## Required References

| Area | Source |
|---|---|
| Staging promotion | `docs/STAGING_PROMOTION_CHECKLIST.md` |
| Migration safety | `docs/MIGRATION_GATE_CHECKLIST.md` |
| Rollback | `docs/ROLLBACK_DEPLOYMENT_PLAYBOOK.md` |
| Health verification | `docs/HEALTH_VERIFICATION_CHECKLIST.md` |
| Alert routing | `docs/ALERT_ROUTING_PLAN.md` |
| Incident recovery | `docs/INCIDENT_RUNBOOK.md` |

## Roles

| Role | Responsibility |
|---|---|
| Release owner | Owns release ticket, timeline, go/no-go, and final sign-off. |
| Backend owner | Owns backend image, API health, Flyway, queues, payments, AI, and tenant workflows. |
| Frontend owner | Owns frontend artifact, static assets, admin portal, and public website checks. |
| DB owner | Owns migration review, backup gate, locks, and schema rollback posture. |
| DevOps owner | Owns deployment commands, image registry, secrets, infra health, and monitoring. |
| Support owner | Owns tenant-facing notes, escalation channel, and customer communication. |
| Rollback owner | Owns rollback decision execution if go/no-go fails during or after deploy. |

No production deployment starts without a named release owner and rollback owner.

## Release Ticket

Create or update the release ticket before deployment.

| Field | Required |
|---|---|
| Release version | Git tag or release candidate ID. |
| Commit SHA | Exact commit being deployed. |
| Backend image | Immutable SHA/tag; never `latest` alone. |
| Frontend artifact | Immutable build artifact or image SHA/tag. |
| Mobile impact | Whether mobile clients require a compatible API or store release. |
| Migration list | New Flyway files or `none`. |
| Feature flags | Flags to enable, disable, or watch. |
| Backup evidence | Fresh backup object/timestamp or reason not required for app-only release. |
| Rollback plan | Previous image/artifact, rollback command, and DB rollback posture. |
| Communication owner | Person responsible for support/customer messaging. |
| Deployment window | Start time, expected duration, timezone, and freeze window. |

## Phase 1: Pre-Deploy Gate

Deployment may proceed only when all applicable checks are green.

| Gate | Pass condition |
|---|---|
| CI | Backend tests, frontend build, mobile type check when impacted, secret scan, dependency scan, and image build are green for the commit SHA. |
| Staging | Candidate image/artifact is deployed to staging and matches the release ticket. |
| Staging smoke | Health, auth, tenant isolation, public site, payments, queues, and touched workflows pass. |
| Migration gate | `docs/MIGRATION_GATE_CHECKLIST.md` is complete for any Flyway change. |
| Backup | Fresh encrypted backup exists before production migration or high-risk deploy. |
| Restore proof | Latest restore drill or scratch restore proof is linked for high-risk changes. |
| Observability | Prometheus scrape, logs, and alert routes are available. |
| Rollback readiness | Previous known-good image/artifact and rollback command are recorded. |
| Approval | Required approvers have explicitly approved in the release ticket. |

Block deployment if any required check is stale, skipped, tied to a different commit, or lacks an owner.

## Phase 2: Communication Before Deploy

Before starting:

1. Announce the release window in the engineering/support channel.
2. State release version, impacted services, expected user impact, and release owner.
3. Confirm rollback owner is available.
4. Confirm support owner has tenant-visible risk notes.
5. Confirm no active P0/P1 incident is in progress unless this deployment is the approved mitigation.

For tenant-visible maintenance, customer communication must include window, expected impact, support contact, and next update time.

## Phase 3: Deploy Execution

Use the platform-specific deployment command recorded in the release ticket. Prefer immutable image SHAs and automated deployment pipelines.

Generic deployment order:

1. Freeze unrelated production changes.
2. Confirm current production image/artifact and active replicas.
3. Deploy backend or migration job according to the migration posture.
4. Deploy frontend/static artifact after backend compatibility is confirmed.
5. Apply feature flag changes only after dependent services are healthy.
6. Watch logs, metrics, error rates, queue depth, and Flyway output during rollout.

Kubernetes example:

```bash
kubectl set image deployment/cloudcampus-backend \
  backend=ghcr.io/<org>/cloudcampus-backend:<candidate-sha> \
  -n cloudcampus

kubectl rollout status deployment/cloudcampus-backend -n cloudcampus
```

Docker Compose example:

```bash
export BACKEND_IMAGE=ghcr.io/<org>/cloudcampus-backend:<candidate-sha>
export FRONTEND_IMAGE=ghcr.io/<org>/cloudcampus-frontend:<candidate-sha>
docker compose up -d backend frontend
```

Do not deploy from a developer machine unless the release ticket explicitly approves the emergency procedure.

## Phase 4: Migration Procedure

For releases with Flyway changes:

| Step | Requirement |
|---|---|
| Validate migration list | New migration versions are forward-only and no applied migration was edited. |
| Confirm backup | Backup object and timestamp are recorded immediately before migration. |
| Run migration | Backend startup or migration job applies Flyway with production settings. |
| Watch locks | Monitor DB locks, slow queries, connection pool, and app startup. |
| Verify Flyway | `flyway_schema_history` has the expected version and no failed rows. |
| Smoke touched path | Run the feature workflow affected by the migration. |

Useful Flyway check:

```sql
SELECT version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;
```

If migration fails before app startup, stop rollout and keep previous app image serving traffic. Do not edit applied migrations or manually delete Flyway history rows.

## Phase 5: Post-Deploy Smoke Test

Run `docs/HEALTH_VERIFICATION_CHECKLIST.md` immediately after deployment.

Minimum smoke checks:

| Area | Required check |
|---|---|
| Backend health | Internal actuator health/readiness or production health endpoint returns healthy. |
| Frontend | Admin portal loads, login route renders, and static assets are not 404/5xx. |
| Auth | Login, refresh, and role-scoped access work. |
| Tenant isolation | School admin sees only expected school/tenant data. |
| Public site | Public website and SEO endpoints respond. |
| Payments | Payment config matches environment; webhook signature rejection/idempotency path works if payment code changed. |
| Queues | RabbitMQ queues have consumers, backlog is stable, DLQ is not unexpectedly growing. |
| Metrics | Prometheus scrape is healthy and critical alerts are not firing. |

Record command output summaries, timestamps, and owner in the release ticket.

## Phase 6: Monitoring Window

Watch production for at least 30 minutes after low-risk releases and at least 2 hours after migrations, auth, payments, queue, upload, public website, or tenant-isolation changes.

| Signal | Watch for |
|---|---|
| HTTP errors | 5xx spike, 401/403 loops, public route regressions. |
| Latency | p95/p99 regression in API and public website routes. |
| DB | Connection pool saturation, lock waits, failed Flyway row, slow queries. |
| Redis | Connectivity, token refresh failures, rate-limit errors. |
| RabbitMQ | Queue depth, consumers, dead-letter growth. |
| Payments | Webhook failures, duplicate idempotency errors, failed payment-order creation. |
| Push/email | Notification failure spike if notification code changed. |
| Logs/traces | New exceptions with tenant/user/correlation context. |
| Support | Tenant tickets or school-admin reports after release. |

## Phase 7: Rollback Decision

Use `docs/ROLLBACK_DEPLOYMENT_PLAYBOOK.md` if any no-go signal appears.

Rollback triggers:

1. Health/readiness fails after deployment.
2. Login or token refresh breaks.
3. Tenant isolation, payment, upload, or data integrity regression is suspected.
4. Public website or admin shell is unavailable.
5. Migration blocks startup or creates DB lock/latency incident.
6. Queue backlog or DLQ grows unexpectedly.
7. Critical alert fires and cannot be explained quickly.

Rollback rules:

| Change type | Action |
|---|---|
| App-only regression | Roll back image/artifact to previous known-good version. |
| Additive migration | Image rollback may be allowed if old app works with expanded schema. |
| Contract/destructive migration | Do not blindly roll back image; DB owner decides forward-fix or restore path. |
| Feature-scoped regression | Prefer disabling feature flag if it fully mitigates. |
| Data corruption | Declare incident and follow DB recovery runbook. |

## Phase 8: Communication After Deploy

On success:

1. Announce deployment complete.
2. Include release version, image/artifact SHAs, smoke result, monitoring owner, and residual risks.
3. Tell support which workflows changed and what tenant reports to watch for.

On rollback or failed deployment:

1. Announce rollback started with impact, owner, and next update time.
2. Share whether DB recovery is involved.
3. Announce rollback complete only after validation passes.
4. File an incident/postmortem for tenant-visible P0/P1/P2 impact.

## Completion Criteria

Deployment is complete only when:

1. Candidate app/artifact is running in production.
2. Migrations, if any, are successful and recorded.
3. Smoke tests pass.
4. Critical alerts are clear or assigned with explicit acceptance.
5. Queue backlog and DLQ are stable.
6. Support has release notes and known-risk guidance.
7. Release ticket includes evidence, timestamps, owners, and approval.
8. Monitoring window has an assigned owner.

## Deploy Checklist

Use this short checklist during the release call:

```text
Pre-deploy:
- CI green for exact commit SHA
- Staging promotion checklist complete
- Migration gate complete or not applicable
- Backup/restore evidence linked
- Previous known-good image/artifact recorded
- Rollback command recorded
- Approvals captured

Deploy:
- Announce start
- Confirm current production images
- Deploy backend/migration
- Verify health/Flyway
- Deploy frontend/static artifact
- Apply feature flags

Validate:
- Run health verification checklist
- Smoke auth, tenant isolation, public site, payments, queues, metrics
- Watch logs/traces/alerts/support reports

Close:
- Announce result
- Record evidence
- Assign monitoring owner
- Open follow-ups for any exceptions
```

## Validation

TASK-050 validation command:

```bash
rg -n "deployment SOP|release SOP|deploy checklist" docs PRODUCTION_READY_ROADMAP.md
```
