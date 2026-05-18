# CloudCampus — Disaster Recovery Reference

**Version:** 1.0 | **Updated:** 2026-05-18 | **Owner:** Platform Ops

---

## 1. Purpose

This document defines CloudCampus RPO (Recovery Point Objective) and RTO (Recovery Time Objective) targets for three service tiers, maps those targets against the current backup infrastructure, and identifies the gaps that must be closed before each tier can be committed to in contracts.

---

## 2. Definitions

| Term | Definition |
|------|------------|
| **RPO** | Maximum acceptable data loss measured in time. An RPO of 6 h means at most 6 hours of committed transactions may be lost in a disaster. |
| **RTO** | Maximum acceptable downtime from the moment a failure is declared. An RTO of 2 h means the service must be restored and serving traffic within 2 hours of incident declaration. |
| **Disaster** | Any event that makes the primary database, storage, or application tier unavailable and requires recovery from backup. Includes: host failure, data-volume corruption, accidental mass deletion, ransomware, or total data-centre loss. |
| **Restore** | The process of decrypting a backup, loading it into a target PostgreSQL instance, running Flyway migrations if needed, validating row counts, and restarting the application. |

---

## 3. Service Tiers and Targets

### 3.1 MVP Tier — Controlled Pilot

> Suitable for ≤ 5 tenants under close operational support. No contractual SLA.

| Metric | Target | Basis |
|--------|--------|-------|
| **RPO** | 24 hours | Daily `pg_dump` at 02:00 UTC — worst-case loss is everything since last backup |
| **RTO** | 4 hours | Manual restore via `drill.sh`, application restart, DNS propagation |
| **Backup frequency** | 1× / day | `infra/pgbackup/crontab` — `0 0 2 * * *` |
| **Backup retention** | 7 days | `RETENTION_DAYS=7` default |
| **Commitment** | Best-effort, no credit obligation | Contractual terms must reflect this |

**Gaps for MVP (currently met):** None. Daily encrypted backup to MinIO is operational today.

---

### 3.2 Standard Production Tier

> Suitable for paid customers, 1–100 schools per tenant. Contractual SLA required.

| Metric | Target | Basis |
|--------|--------|-------|
| **RPO** | 6 hours | 4× daily `pg_dump` — `0 0 */6 * * *` |
| **RTO** | 2 hours | Documented runbook, on-call response ≤ 30 min, restore ≤ 90 min |
| **Backup frequency** | 4× / day | Requires crontab update |
| **Backup retention** | 14 days | Requires `RETENTION_DAYS=14` |
| **Commitment** | Contractual; service credits if RTO/RPO breached | |

**Gaps to close before committing to this tier:**

| Gap | Action | Task |
|-----|--------|------|
| Backup runs only once daily | Change crontab to `0 0 */6 * * *` | Ops |
| Restore is manual with no runbook | Write and drill the restore runbook | TASK-009 |
| No backup freshness alert | Add Prometheus alert if backup is > 8 h old | TASK-008 |
| Retention is 7 days | Set `RETENTION_DAYS=14` | Ops |
| `drill.sh` has never been run in staging | Run monthly restore drill and record results | TASK-007 |

---

### 3.3 Enterprise Tier

> Suitable for large school chains, government, and compliance-critical customers. Strict contractual SLA.

| Metric | Target | Basis |
|--------|--------|-------|
| **RPO** | 1 hour | Hourly `pg_dump` OR WAL archiving with PITR |
| **RTO** | 1 hour | Standby replica (hot standby or read replica), documented failover runbook, on-call 24/7 |
| **Backup frequency** | Continuous (WAL) or 1× / hour | WAL archiving preferred |
| **Backup retention** | 30 days | Contractual requirement |
| **Commitment** | Contractual; service credits + dedicated ops contact | |

**Gaps to close before committing to this tier:**

| Gap | Action | Task |
|-----|--------|------|
| No WAL archiving or PITR | Enable `archive_mode`, configure `archive_command` to MinIO | Future |
| No hot standby / read replica | Provision streaming replication or managed RDS read replica | Future |
| No automated failover | Configure Patroni or cloud-managed HA (RDS Multi-AZ) | Future |
| Restore is not automated | Automated restore pipeline with health-check gate | Future |
| No 24/7 on-call rotation | Define on-call schedule and escalation policy | Future |
| Retention is 7 days | Set `RETENTION_DAYS=30` | Ops |

---

## 4. Current Backup Architecture

```
┌─────────────────────┐     pg_dump      ┌────────────────────┐
│  PostgreSQL 16       │ ──────────────▶  │  /tmp/pgbackup/    │
│  (primary, single)   │   custom format  │  cloudcampus_T.dump│
└─────────────────────┘                  └────────┬───────────┘
                                                   │ GPG AES-256
                                                   ▼
                                         ┌────────────────────┐
                                         │  /tmp/pgbackup/    │
                                         │  cloudcampus_T.gpg │
                                         └────────┬───────────┘
                                                   │ mc cp
                                                   ▼
                                         ┌────────────────────┐
                                         │  MinIO             │
                                         │  cloudcampus-backups│
                                         │  /pg/cloudcampus/  │
                                         │  YYYYMMDDTHHMMSSZ  │
                                         │  .dump.gpg         │
                                         └────────────────────┘
```

**Key properties:**
- Schedule: Daily at 02:00 UTC (supercronic in pgbackup sidecar container)
- Format: `pg_dump --format=custom --compress=9` — supports selective table restore
- Encryption: GPG symmetric AES-256; passphrase stored in Docker secret / env var
- Retention: 7 days (configurable via `RETENTION_DAYS`)
- Transport: MinIO client (`mc`) — same MinIO instance used for application media

**Current limitations:**
- **No WAL archiving** — only full snapshots, no point-in-time recovery between snapshots
- **Single MinIO instance** — backup storage and primary object storage share one failure domain
- **No cross-region replication** — a data-centre-level event destroys both primary DB and backup
- **No Redis backup** — Redis holds JWT denylist, rate-limit counters, and tenant status cache; loss means logged-in users are forced to re-authenticate (acceptable for MVP)
- **No RabbitMQ message persistence beyond broker restart** — in-flight messages may be lost during full broker failure

---

## 5. Data Loss Scope by Component

| Component | Backup | RPO (MVP) | Loss on total failure |
|-----------|--------|-----------|----------------------|
| PostgreSQL (tenants, schools, students, fees, …) | Daily `pg_dump` → MinIO | 24 h | Up to 24 h of transactions |
| MinIO (photos, documents, exports) | None | ∞ (no backup) | Permanent file loss |
| Redis (JWT denylist, rate limits, cache) | None (ephemeral by design) | N/A | Users re-authenticate; cache rebuilds from DB |
| RabbitMQ (in-flight events) | None | N/A | In-flight messages lost; idempotent consumers recover |

**Action required before Standard/Enterprise tier:** MinIO must be backed up or replicated. The simplest path is enabling MinIO server-side replication to a second bucket in a separate storage account.

---

## 6. Restore Procedure (Manual — MVP)

> Full step-by-step procedure will be written in `docs/INCIDENT_RUNBOOK.md` (TASK-009).
> The steps below summarise the current `drill.sh` flow.

1. **Declare incident** — notify stakeholders, start incident timer.
2. **Identify target backup** — find the latest `.dump.gpg` in MinIO: `mc ls backup/cloudcampus-backups/pg/cloudcampus/ | sort | tail -1`
3. **Provision restore target** — new PostgreSQL instance or scratch DB on the existing server.
4. **Download and decrypt** — `mc cp <object> /tmp/restore.dump.gpg && gpg --decrypt ... > /tmp/restore.dump`
5. **Restore** — `pg_restore --host=... --dbname=<target> /tmp/restore.dump`
6. **Validate** — run `drill.sh` validation checks: `flyway_schema_history`, `schools`, `users` row counts.
7. **Point application** — update `SPRING_DATASOURCE_URL` / DNS and restart application containers.
8. **Verify** — confirm health endpoint returns 200, run smoke tests, check Grafana dashboards.
9. **Close incident** — record actual RPO and RTO in post-mortem.

> The `infra/pgbackup/drill.sh` script automates steps 1–6 for DR testing. Run monthly.

---

## 7. Drill Schedule

| Tier | Drill frequency | Script | Evidence required |
|------|----------------|--------|-------------------|
| MVP | Quarterly | `sh infra/pgbackup/drill.sh` | Exit code 0 log saved to ops drive |
| Standard | Monthly | `sh infra/pgbackup/drill.sh` | Exit code 0 + elapsed time recorded |
| Enterprise | Monthly + after every schema migration | Automated CI job | Grafana annotation + post-mortem |

Drill results must be retained for 12 months for compliance audits.

---

## 8. Escalation

| Severity | On-call response target | Escalation |
|----------|------------------------|------------|
| P1 — Total outage | 30 min (Standard) / 15 min (Enterprise) | CTO + customer success |
| P2 — Partial degradation | 2 hours | Engineering lead |
| P3 — Performance degradation | Next business day | Engineering team |

---

## 9. Related Documents

- `infra/pgbackup/backup.sh` — backup implementation
- `infra/pgbackup/drill.sh` — restore drill script
- `infra/pgbackup/crontab` — backup schedule
- `docs/INCIDENT_RUNBOOK.md` — full restore runbook (TASK-009, not yet written)
- `PRODUCTION_READY_ROADMAP.md` — TASK-007 (drill), TASK-008 (verification), TASK-009 (runbook)
