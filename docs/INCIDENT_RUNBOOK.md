# CloudCampus — Incident Recovery Runbook

**Version:** 1.0 | **Updated:** 2026-05-18 | **Owner:** Platform Ops  
**Related:** `docs/DISASTER_RECOVERY.md` · `infra/pgbackup/drill.sh` · `PRODUCTION_READY_ROADMAP.md`

---

## Quick-Reference: What is down?

| Symptom | Playbook |
|---------|----------|
| Backend returning 5xx, DB connection errors | [PB-1 — PostgreSQL Restore](#pb-1--postgresql-restore) |
| Login works but sessions keep expiring, rate limits not enforced | [PB-2 — Redis Outage](#pb-2--redis-outage) |
| Notifications not delivered, queue depth rising | [PB-3 — RabbitMQ Queue Backlog](#pb-3--rabbitmq-queue-backlog) |
| File uploads failing, photos/documents not loading | [PB-4 — MinIO Object Storage Failure](#pb-4--minio-object-storage-failure) |
| Any P1/P2 incident requiring customer notice | [PB-5 — Tenant Communication](#pb-5--tenant-communication) |
| `BackupNotFresh` or `BackupMetricAbsent` alert | [PB-1 §1.2](#12-diagnose) then [PB-1 §1.3](#13-restore-procedure) |

---

## 1. Severity Definitions

| Level | Definition | Response target | Escalation |
|-------|-----------|----------------|------------|
| **P1** | Total service outage — all tenants affected | 30 min (Standard) / 15 min (Enterprise) | CTO + customer success immediately |
| **P2** | Partial degradation — subset of tenants or features | 2 hours | Engineering lead |
| **P3** | Performance degradation — service functional but slow | Next business day | Engineering team |

---

## 2. Incident Declaration

1. **Declare** — post in `#incidents` Slack channel: `[INC-YYYY-MM-DD-NNN] Declaring P{level} — {one-line description}`.
2. **Start the timer** — note the wall-clock time. RTO tracking begins now.
3. **Assign incident commander** — one person drives the response; others assist.
4. **Open the post-mortem doc** — copy the template from [Section 8](#8-post-mortem-template) immediately; fill it in as the incident progresses.
5. **Notify stakeholders** — if P1/P2, trigger [PB-5](#pb-5--tenant-communication) in parallel with remediation.

---

## PB-1 — PostgreSQL Restore

**Triggers:** Backend cannot connect to DB · `pg_isready` fails · data corruption detected · accidental mass deletion · `BackupNotFresh` alert firing for > 1 h with no fix.

### 1.1 Triage

```bash
# Is the container running?
docker ps | grep cloudcampus-postgres

# Can postgres accept connections?
docker exec cloudcampus-postgres pg_isready -U cloudcampus -d cloudcampus

# Recent postgres logs
docker logs --tail 100 cloudcampus-postgres

# Backend datasource health
curl -s http://localhost:8080/actuator/health | jq '.components.db'
```

**If the container is running and `pg_isready` returns OK** — the problem is likely in the application layer, not the DB itself. Check connection pool (`hikaricp_connections_active` in Grafana) and slow-query logs before escalating to a full restore.

### 1.2 Diagnose

Determine which recovery path applies:

| Scenario | Action |
|----------|--------|
| Container crash / OOM — data intact | Restart: `docker compose restart postgres` |
| Volume corruption or data loss | Proceed to §1.3 full restore |
| Accidental DELETE/UPDATE on specific tables | Attempt point-in-row restore from backup (§1.3), restore only affected tables using `pg_restore -t <table>` |
| Disk full on postgres volume | Expand volume or free space, then restart — do NOT restore |

### 1.3 Restore Procedure

> **RTO target (Standard tier):** 2 hours from incident declaration to service-up.

**Step 1 — Provision restore target**

```bash
# Option A: in-place restore — stop the app, drop and recreate the DB
docker compose stop backend   # or the Spring Boot process

docker exec -it cloudcampus-postgres psql -U cloudcampus -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='cloudcampus' AND pid <> pg_backend_pid();"

docker exec -it cloudcampus-postgres psql -U cloudcampus postgres \
  -c "DROP DATABASE IF EXISTS cloudcampus;" \
  -c "CREATE DATABASE cloudcampus OWNER cloudcampus;"

# Option B: restore to a new instance / scratch DB first, validate, then cut over
```

**Step 2 — Identify latest backup**

```bash
docker exec cloudcampus-pgbackup \
  mc ls drillcheck/cloudcampus-backups/pg/cloudcampus/ --quiet | sort | tail -5
```

Note the timestamp of the latest `.dump.gpg` file — this determines the actual RPO.

**Step 3 — Download and decrypt**

```bash
LATEST="<paste object name from step 2>"
BACKUP_PASSPHRASE="$(cat /run/secrets/backup_passphrase)"   # or from .env

docker exec cloudcampus-pgbackup sh -c "
  mc cp drillcheck/cloudcampus-backups/pg/cloudcampus/${LATEST} /tmp/restore.dump.gpg
  gpg --batch --yes --passphrase '${BACKUP_PASSPHRASE}' \
      --decrypt --output /tmp/restore.dump /tmp/restore.dump.gpg
  echo 'Decrypt OK — size:' \$(du -sh /tmp/restore.dump | cut -f1)
"
```

**Step 4 — Restore**

```bash
docker exec cloudcampus-pgbackup \
  pg_restore \
    --host=postgres --port=5432 \
    --username=cloudcampus --dbname=cloudcampus \
    --no-password --no-owner --no-privileges \
    --exit-on-error \
    /tmp/restore.dump
echo "Exit code: $?"
```

**Step 5 — Validate**

```bash
docker exec cloudcampus-pgbackup psql \
  --host=postgres --port=5432 --username=cloudcampus --dbname=cloudcampus \
  --no-password --tuples-only -c "
    SELECT 'tenants', COUNT(*) FROM tenants
    UNION ALL SELECT 'schools', COUNT(*) FROM schools
    UNION ALL SELECT 'users', COUNT(*) FROM users
    UNION ALL SELECT 'flyway_migrations', COUNT(*) FROM flyway_schema_history WHERE success = true;
  "
```

All counts must be > 0. Confirm the latest Flyway migration version matches the application version.

**Step 6 — Restart application and verify**

```bash
docker compose start backend

# Wait for health
until curl -sf http://localhost:8080/actuator/health | grep -q '"status":"UP"'; do
  sleep 5; echo "waiting..."
done

# Smoke test
curl -s http://localhost:8080/actuator/health | jq .
```

**Step 7 — Record actual RPO and RTO**

Log in the post-mortem:
- **Actual RPO:** `NOW() - backup_timestamp` (time of the restored dump)
- **Actual RTO:** time from incident declaration to service-up

### 1.4 Cleanup

```bash
docker exec cloudcampus-pgbackup rm -f /tmp/restore.dump /tmp/restore.dump.gpg
```

---

## PB-2 — Redis Outage

**Triggers:** `RedisDown` alert · `redis-cli ping` fails · backend logs `RedisConnectionFailureException`.

**Impact:**
- JWT denylist is unavailable — logged-out tokens may be accepted until Redis recovers (window = token TTL, default 1 h)
- Rate limiting inactive — auth and API endpoints temporarily unprotected from brute force
- Tenant status cache rebuilds from DB on first request per tenant — slightly elevated DB load
- **No data loss** — Redis is ephemeral by design; all state is reconstructed from PostgreSQL on reconnect

### 2.1 Triage

```bash
docker ps | grep cloudcampus-redis
docker logs --tail 100 cloudcampus-redis

# Test connectivity
docker exec cloudcampus-redis redis-cli -a "${REDIS_PASSWORD}" ping
# Expected: PONG
```

### 2.2 Recovery

```bash
# Restart container (data persists in redis_data volume — save 60 1 is enabled)
docker compose restart redis

# Confirm backend reconnects automatically (Spring Redis auto-reconnects)
docker logs --tail 50 cloudcampus-backend | grep -i redis
```

Spring Boot's Lettuce client reconnects automatically — no application restart required.

### 2.3 Post-recovery checks

- Verify `RedisDown` alert resolves in Alertmanager within 2 minutes of restart.
- If the outage lasted > 1 h: force-expire all active JWTs by rotating `JWT_SECRET` and restarting the backend. This logs all users out but closes the denylist gap.
- Rate-limit counters reset to zero on Redis restart — this is acceptable.

---

## PB-3 — RabbitMQ Queue Backlog

**Triggers:** `RabbitMQQueueDepthHigh` alert (queue > 1000 messages) · notifications not being delivered · consumers crashing.

**Impact:**
- Notifications (email, push, SMS) are delayed, not lost — messages persist in the broker until consumed
- In-flight messages at the moment of a full broker failure may be lost (broker has no external backup); idempotent consumers re-derive state from DB

### 3.1 Triage

```bash
# Check queue depths via management API
curl -s -u "${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}" \
  http://localhost:15672/api/queues | jq '.[] | {name: .name, messages: .messages, consumers: .consumers}'

# Check consumer count — 0 consumers = consumers are down, not the broker
# Check message rate — messages_rate = 0 with messages > 0 = consumers stuck
```

### 3.2 Recovery paths

| Cause | Action |
|-------|--------|
| Consumers down (0 consumers on queue) | Restart backend: `docker compose restart backend` |
| Consumer processing too slow | Scale consumers (horizontal pod scaling in prod) or check for a slow downstream (email provider, push gateway) |
| Poison message causing consumer crash loop | Inspect DLX (dead-letter exchange) — remove the bad message, then restart consumer |
| Broker OOM / crash | `docker compose restart rabbitmq` — messages in durable queues survive restart |

```bash
# Inspect dead-letter queue
curl -s -u "${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}" \
  http://localhost:15672/api/queues/%2F/notification.dead-letter | jq '{messages: .messages}'

# Purge DLX only after investigation (messages are permanently deleted)
# curl -X DELETE -u ... http://localhost:15672/api/queues/%2F/notification.dead-letter/contents
```

### 3.3 Post-recovery checks

- Queue depth drops to near-zero within a few minutes of consumers reconnecting.
- Verify `RabbitMQQueueDepthHigh` alert resolves.
- Check notification delivery logs for any customers who missed a notification during the backlog window.

---

## PB-4 — MinIO Object Storage Failure

**Triggers:** File upload API returning 5xx · photos and documents not loading · `mc ready local` fails.

> **WARNING — MinIO has no backup.** File loss from MinIO is permanent. Prioritise diagnosis and recovery over speed. Do NOT delete any data during the investigation.

### 4.1 Triage

```bash
docker ps | grep cloudcampus-minio
docker logs --tail 100 cloudcampus-minio

# MinIO health
curl -sf http://localhost:9000/minio/health/live && echo OK || echo FAIL
curl -sf http://localhost:9000/minio/health/cluster && echo CLUSTER_OK || echo CLUSTER_FAIL

# List buckets
docker exec cloudcampus-minio mc ls local/
```

### 4.2 Recovery paths

| Cause | Action |
|-------|--------|
| Container crash (data intact) | `docker compose restart minio` — data in `minio_data` volume survives |
| Disk full | Free space on host, then restart. Monitor `DiskSpaceHigh` alert proactively |
| Volume corruption | Mount the volume read-only on a recovery machine and attempt `mc mirror` to a new volume before any writes |
| Data-centre loss / total volume loss | **Permanent data loss** — files cannot be recovered. Notify affected tenants per PB-5 |

```bash
# After restart — verify bucket contents are accessible
docker exec cloudcampus-minio mc ls local/cloudcampus-media/ | wc -l
```

### 4.3 Reducing future risk

MinIO currently shares a failure domain with the primary database backup (same instance). Until cross-bucket replication is configured (Standard tier requirement per `docs/DISASTER_RECOVERY.md`), communicate to customers that uploaded files are not independently backed up.

---

## PB-5 — Tenant Communication

Use this playbook in parallel with any P1 or P2 incident to keep affected tenants informed.

### 5.1 Who to notify

| Incident scope | Notify |
|----------------|--------|
| All tenants affected (P1) | All tenant admin contacts + status page update |
| Subset of tenants affected | Only affected tenant admins |
| Single tenant affected | That tenant's admin contact only |
| Internal-only impact (no user-visible degradation) | No external notification required |

### 5.2 Initial notification (within 30 min of P1 declaration)

Send via email to affected tenant admin contacts:

```
Subject: [CloudCampus] Service disruption — [date] [HH:MM UTC]

We are currently investigating a service disruption affecting [description of
impact, e.g. "file uploads" or "the CloudCampus platform"].

Our team is actively working on a resolution. We will send an update within
[30 / 60] minutes.

We apologise for the inconvenience.
— CloudCampus Platform Team
```

### 5.3 Progress update (every 30–60 min during active P1)

```
Subject: [CloudCampus] Update — Service disruption [date]

Status: Investigating / Identified / Fixing / Monitoring

What happened: [brief description — not blame or technical detail]
Current impact: [what is and is not working]
Next update: [time]

— CloudCampus Platform Team
```

### 5.4 Resolution notification

```
Subject: [CloudCampus] Resolved — Service disruption [date]

The service disruption affecting [description] has been resolved as of [HH:MM UTC].

Duration: [X hours Y minutes]
Impact: [what was affected]
Root cause: [one sentence, non-technical]
What we are doing to prevent recurrence: [one sentence]

We apologise for the disruption to your operations.
— CloudCampus Platform Team
```

### 5.5 Data loss notification (if applicable)

If any data loss occurred, the communication must be explicit and immediate regardless of severity:

```
Subject: [CloudCampus] URGENT — Data loss notification [date]

We are writing to inform you of a data loss event affecting your CloudCampus
account.

What was lost: [specific description — e.g. "uploaded files added between
14:00 and 18:00 UTC on [date]"]
What was NOT affected: [e.g. "student records, fee payments, and attendance
data are intact"]

We are deeply sorry for this loss. A member of our team will contact you
within [2 hours / 24 hours] to discuss next steps and any remediation.

— CloudCampus Platform Team (CTO CC'd)
```

---

## 6. Alert → Playbook Mapping

| Alert name | Severity | Playbook | First action |
|------------|----------|----------|-------------|
| `BackendDown` | critical | PB-1 §1.1 | Check container, then logs |
| `ConnectionPoolNearExhaustion` | critical | PB-1 §1.1 | Check slow queries in Grafana |
| `BackupNotFresh` | critical | PB-1 §1.2 | Check pgbackup container logs |
| `BackupMetricAbsent` | warning | PB-1 §1.2 | Check if pgbackup is running |
| `RedisDown` | critical | PB-2 §2.1 | Check container, restart |
| `RabbitMQQueueDepthHigh` | warning | PB-3 §3.1 | Check consumer count |
| `DiskSpaceHigh` | warning | PB-4 §4.2 | Identify which mountpoint, free space |
| `JvmHeapCritical` | critical | — | Heap dump, restart backend |
| `HighErrorRate` | warning | — | Check logs for root cause |

---

## 7. Escalation

| Severity | On-call response target | Escalation path |
|----------|------------------------|-----------------|
| P1 — Total outage | 30 min (Standard) / 15 min (Enterprise) | Incident commander → Engineering lead → CTO + customer success |
| P2 — Partial degradation | 2 hours | Incident commander → Engineering lead |
| P3 — Performance | Next business day | Engineering team |

Alertmanager is configured to email `ops@cloudcampus.io` for all `critical` alerts (repeat every 1 h) and `warning` alerts (repeat every 4 h). Update `infra/alertmanager/alertmanager.yml` with PagerDuty or Slack routes before Standard tier launch.

---

## 8. Post-Mortem Template

Copy this to a shared doc immediately after declaring the incident. Fill it in as you go — do not wait until the incident is resolved.

```markdown
# Post-Mortem: [INC-YYYY-MM-DD-NNN] — [one-line title]

**Date:** YYYY-MM-DD  
**Severity:** P1 / P2 / P3  
**Incident Commander:**  
**Duration:** HH:MM (declared at HH:MM UTC, resolved at HH:MM UTC)  
**Actual RPO:** (if DB restore: time between backup timestamp and failure)  
**Actual RTO:** (time from declaration to service-up)  

## Impact
- Tenants affected:
- Features affected:
- Data lost (yes/no):

## Timeline
| Time (UTC) | Event |
|------------|-------|
| HH:MM | Incident declared |
| HH:MM | Root cause identified |
| HH:MM | Fix applied |
| HH:MM | Service restored |
| HH:MM | Monitoring confirmed green |

## Root Cause
[One paragraph — what went wrong and why]

## Contributing Factors
- 

## What Went Well
- 

## Action Items
| Item | Owner | Due |
|------|-------|-----|
| | | |
```

---

## 9. Related Documents

- `docs/DISASTER_RECOVERY.md` — RPO/RTO targets, backup architecture, tier gap analysis
- `infra/pgbackup/drill.sh` — automated restore drill script
- `infra/pgbackup/backup.sh` — backup implementation (step 8 pushes `cc_backup_last_success_timestamp_seconds`)
- `infra/prometheus/alert_rules.yml` — `BackupNotFresh`, `BackupMetricAbsent`, and all other alert definitions
- `infra/alertmanager/alertmanager.yml` — alert routing and notification configuration
- `.github/workflows/dr-drill.yml` — monthly CI restore drill
