# Migration Gate Checklist

Last updated: 2026-05-19

## Purpose

This migration gate blocks unsafe database changes before they reach staging or production. CloudCampus uses Flyway as the only schema owner; Hibernate must remain `ddl-auto: validate`.

The current latest migration is `V86__create_investor_room_access_log.sql`. The next real migration should use the next unused version. Do not reuse historical versions or edit migrations that may already have run outside a disposable local database.

## Blocking Rules

Any `NO` in this table blocks release until corrected.

| Gate | Required answer |
|---|---|
| Flyway owns the change | Migration is a new file in `backend/src/main/resources/db/migration`; no manual production DDL is planned. |
| Version is forward-only | New migration uses the next unused `V###__description.sql` version; no existing migration checksum changes. |
| Historical gaps are preserved | Placeholder files such as `V48__DELETED.sql` are not edited or reused. |
| Staging dry run completed | Migration ran successfully against a restored or production-like staging database. |
| Backup exists | A fresh encrypted PostgreSQL backup exists before production migration starts. |
| Restore path is known | Latest restore drill or scratch restore validation is linked in the release ticket. |
| Rollback notes exist | Release ticket explains app rollback, DB forward-fix constraints, and data recovery options. |
| Tenant safety checked | New tenant-scoped tables include `tenant_id`, indexes, and tenant-filter behavior where applicable. |
| Data volume reviewed | Backfills, index builds, and table rewrites have estimated row counts and timeout/lock notes. |
| Observability ready | Migration logs, slow queries, DB locks, app startup, and Flyway failure are watched during deploy. |

## Required Evidence

Attach these to the release ticket before approval:

| Evidence | Command or artifact |
|---|---|
| Migration list | `ls backend/src/main/resources/db/migration | sort -V | tail -20` |
| Flyway validation | Backend startup or migration job log showing `validate-on-migrate` passed. |
| Staging dry run | Staging migration log with applied version and elapsed time. |
| Backup proof | Backup object name, timestamp, and `cc_backup_last_success_timestamp_seconds` value or backup job log. |
| Restore proof | Latest `infra/pgbackup/drill.sh` result, or scratch restore validation for high-risk migrations. |
| Rollback notes | Written release-ticket section covering app rollback and DB recovery strategy. |
| Query plan proof | For new indexes or heavy backfills: before/after `EXPLAIN (ANALYZE, BUFFERS)` or staging timing. |

## Expand/Contract Pattern

Use expand/contract for any change that can break old application versions.

| Phase | Allowed migration | Application behavior |
|---|---|---|
| Expand | Add nullable columns, new tables, new indexes, new constraints as `NOT VALID`, compatibility views, or dual-write targets. | Old and new app versions both work. |
| Backfill | Populate new columns or tables in batches with lock and timeout controls. | App reads old path or supports both paths. |
| Switch | Deploy app that reads from the new shape while preserving old fields. | Rollback can still run against the expanded schema. |
| Contract | Drop old columns/tables, enforce `NOT NULL`, validate constraints, or remove compatibility views. | Only after old app version is no longer needed. |

Do not combine expand and contract in a single production release unless the table is tiny, disposable, and explicitly approved.

## Unsafe Migration Patterns

These patterns require architecture approval and a specific mitigation plan:

| Pattern | Risk | Safer approach |
|---|---|---|
| `DROP TABLE` or `DROP COLUMN` | Old app rollback breaks; data loss is immediate. | Defer to contract phase after backup and retention window. |
| `ALTER COLUMN ... TYPE` on large tables | Table rewrite and long lock. | Add new column, backfill, switch reads, contract later. |
| `SET NOT NULL` on existing large table | Full table scan and lock risk. | Backfill, add `CHECK ... NOT VALID`, validate, then set `NOT NULL` in a maintenance window. |
| `CREATE INDEX` on large table | Write blocking if not concurrent. | Use PostgreSQL `CREATE INDEX CONCURRENTLY` with Flyway transaction handling reviewed. |
| Large single-statement backfill | Long transaction, bloat, replication lag. | Batch backfill with idempotent chunks and progress logging. |
| Editing an applied migration | Flyway checksum failure. | Add a new forward-fix migration. |
| Out-of-order migration | Production has `out-of-order: false`. | Use the next version only. |
| Extension creation in app migration | May require elevated privileges and block startup. | Pre-provision extension or document managed-DB requirement. |

## Dry Run Procedure

Run this before production approval:

1. Restore a recent encrypted backup to a scratch or staging database.
2. Start the backend or migration job with the candidate build and production-like Flyway settings.
3. Confirm Flyway validation passes and the new migration applies once.
4. Capture elapsed time, lock warnings, slow queries, and any table rewrite observations.
5. Run app smoke tests for auth, tenant switching, public website, payments, queues, and the feature touched by the migration.
6. Re-run the migration job or app startup to confirm idempotent no-op behavior after the migration is recorded.

Useful checks:

```bash
ls backend/src/main/resources/db/migration | sort -V | tail -20
```

```sql
SELECT version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;
```

```sql
SELECT pid, state, wait_event_type, wait_event, query
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY query_start NULLS LAST;
```

## Backup Gate

Production migration must not start unless:

1. A fresh backup completed successfully after the final pre-deploy data writes that matter for the release window.
2. The backup object name and timestamp are recorded in the release ticket.
3. The backup is encrypted and stored in the configured backup bucket.
4. `BackupNotFresh` and `BackupMetricAbsent` are not firing.
5. For high-risk migrations, a scratch restore has validated `flyway_schema_history`, `schools`, and `users` row counts.

## Rollback Notes Template

Every migration release ticket must include:

```text
Migration:
Risk:
Backward compatible: yes/no
App rollback image:
DB rollback strategy:
Forward-fix strategy:
Backup object:
Dry-run environment:
Dry-run result:
Expected locks/table rewrites:
Post-migration smoke tests:
Owner:
Approval:
```

Rollback guidance:

| Migration type | Rollback posture |
|---|---|
| Add table, nullable column, additive index | App rollback is usually safe; leave DB expanded. |
| Backfill | App rollback depends on read path; keep old columns until verified. |
| Constraint validation | App rollback may be safe; data correction may require forward fix. |
| Drop/rename/contract | App rollback is unsafe unless old app no longer depends on removed schema. |
| Data deletion | Restore or targeted recovery from backup may be required. |

## Approval

Required approvers:

| Risk | Approvers |
|---|---|
| Low additive migration | Backend owner and release owner. |
| Medium migration with backfill, index, FK, or constraint | Backend owner, release owner, and DevOps/DB owner. |
| High destructive or contract migration | CTO/architecture approval, backend owner, release owner, DevOps/DB owner, and customer-communication owner. |

## Validation

TASK-031 validation command:

```bash
rg -n "migration gate|Flyway|expand/contract" docs PRODUCTION_READY_ROADMAP.md
```
