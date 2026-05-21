# Audit Log Retention Policy

> Status: draft (T-16) — needs sign-off from Security / Compliance before becoming policy.

CloudCampus writes to several audit-style tables. Without an explicit retention policy they grow without bound, slow down queries, and increase the blast radius of any breach. This document defines per-table retention and the mechanism that enforces it.

## Tables in scope

| Table | Purpose | Default retention | Implementation |
|---|---|---|---|
| `audit_log` | All write operations on tenant data (entity-level diffs) | **24 months** | partition pruning + nightly job |
| `upload_audit_log` | Every file upload (who, what, virus-scan status) | **24 months** | nightly purge job |
| `website_audit_timeline` | Public-website edits (who changed which page section) | **36 months** | nightly purge job |
| `website_rollback_audit_log` | Public-website rollbacks executed | **36 months** | nightly purge job |
| `investor_room_access_log` | External investor-room visits | **18 months** | nightly purge job |
| `experience_events` | Click/view stream from the experience studio | **6 months** | partition drop (V81 partitions) |
| `notification_logs` | Email/SMS/push delivery + status | **12 months** | nightly purge job |
| `whatsapp_message_logs` | WhatsApp delivery + status | **12 months** | nightly purge job |
| `flyway_schema_history` | Migration history | **forever** | never purged |
| `payment_gateway_events` | Razorpay webhook idempotency | **24 months** | nightly purge job |

Customer-specific retention overrides (e.g. an enterprise plan asking for 7 years on `audit_log`) live in `tenant_configs` under the `audit.retention.<table>` namespace.

## Why these numbers

- **24 months** for `audit_log` matches typical Indian schools' annual-audit cycle (board accounts, exam-result audits) plus a generous one-year buffer.
- **6 months** for `experience_events` is enough for product-analytics dashboards; older data is rolled up into the `experience_metric_summaries` table.
- **18 months** for `investor_room_access_log` because investor cycles are typically 12–18 months end-to-end.
- **24 months** for `payment_gateway_events` matches Razorpay's own retention so reconciliations against their portal still work.

## Mechanism

### Partition-pruned tables

`experience_events` (V81) is partitioned by month. The nightly partition manager drops partitions older than the retention window:

```sql
-- Pseudocode for the scheduled job
SELECT pg_partman.drop_partition_time(
    parent_table   => 'public.experience_events',
    retention      => '6 months',
    retention_keep_table => false
);
```

### Row-level purge tables

For tables that are not partitioned, a `@Scheduled` Spring bean runs at 02:30 UTC daily:

```java
@Scheduled(cron = "0 30 2 * * *")
public void purgeAuditLogs() {
    int n = jdbc.update("""
        DELETE FROM audit_log
         WHERE created_at < NOW() - INTERVAL '24 months'
    """);
    log.info("audit_log retention purge removed {} rows", n);
}
```

Per-table retention windows are kept in `application.yml` under `app.retention.*` so they can be tuned without a code change. Customer overrides are read from `tenant_configs` and win over the defaults.

> **Implementation status:** The scheduled bean is **not yet implemented**. T-16 produced this policy; the scheduled cleanup is the follow-up task. Until then, run the purge manually each quarter or accept unbounded growth.

## Right-to-be-forgotten (DPDP / GDPR)

When a user invokes their right-to-be-forgotten:

1. Identify all rows in audit tables that reference the user (use `actor_user_id`, `subject_user_id`, etc.).
2. **Do not delete** — that would break the audit trail. Instead, replace PII fields with `'REDACTED'` and keep the row.
3. Log the redaction itself (meta-audit row in `audit_log`).
4. Email the user a confirmation receipt with the audit-event id.

## Open questions for sign-off

- Should `audit_log` distinguish between **financial** (long retention) and **operational** (shorter retention) categories?
- Is 24 months too short for `payment_gateway_events` from a tax-audit perspective (India CBDT typically requests 7-8 years)?
- Do we need a separate cold-storage tier (e.g. monthly Parquet dumps to S3 Glacier) once a partition rolls off?
