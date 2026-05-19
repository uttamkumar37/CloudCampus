# Audit Retention Policy

## Scope

This audit retention policy applies to CloudCampus audit and evidence records:

- `audit_log`
- `upload_audit_log`
- `platform_website_audit_timeline`
- `platform_website_rollback_audit_log`
- `investor_room_access_log`
- Future SSO, MFA, SCIM, payment, export, support-access, and security audit
  streams.

The goal is to keep audit records immutable, searchable for operations, exportable
for tenant/compliance review, limited in personal data, and resistant to
tampering.

## Current State

Implemented foundations:

- `audit_log` is documented as append-only and represented by an entity with no
  update setters.
- `AuditLogService` writes asynchronously in `REQUIRES_NEW` transactions and
  does not roll back business operations on audit failure.
- Upload audit, investor room access audit, website timeline, and website
  rollback audit records are modeled as immutable insert-only events.
- Several audit tables intentionally avoid foreign keys to business records so
  deleted resources do not erase their audit history.
- The existing user data-retention job covers soft-deleted `users` rows only; it
  is not an audit-log purge.

Open gaps:

- No formal retention window by audit class.
- No tenant-facing audit export contract.
- No DB-level guard preventing updates/deletes to audit tables.
- No archive process from hot PostgreSQL tables to immutable object storage.
- No standard PII minimization rules for audit metadata.

## Retention Classes

| Audit class | Tables/events | Hot retention | Archive retention | Reason |
|---|---|---:|---:|---|
| Security-critical audit | Auth, MFA, session/device, SSO, SCIM, role changes, tenant lifecycle, suspicious access | 24 months | 7 years | Security investigations, enterprise contracts, regulator inquiries. |
| Data-access audit | Upload/download URL, investor room access, export events, support access | 24 months | 7 years | Evidence of access to student, finance, and investor data. |
| Financial audit | Payment, invoice, refund, subscription, GST/tax events | 36 months | 8 years | Accounting and tax evidence; jurisdiction-specific extension may apply. |
| Website/content audit | Public website publish, rollback, content timeline | 12 months | 3 years | Operational rollback evidence and public content provenance. |
| System audit | Retention purge, scheduled job, bootstrap, migration, integration health | 12 months | 3 years | Operational diagnostics and post-incident review. |
| Debug/application logs | Loki/container logs, traces | 7 days minimum, 30 days target for production | Optional incident archive | Not a compliance audit source; high PII risk if retained indefinitely. |

Hot retention means queryable in PostgreSQL by application/admin tooling. Archive
retention means exported to immutable object storage and removed from hot tables
only after export verification.

## Immutable Audit Requirements

Audit records must be append-only:

- Application code must never call `delete*`, update queries, or setters on audit
  entities.
- Audit table migrations must not add mutable status columns unless they are
  explicitly modeled as new event rows instead.
- Corrections must be new compensating audit events, not edits to old rows.
- Hard deletes from hot audit tables are allowed only after verified archival and
  retention eligibility.

Recommended DB hardening:

- Add `BEFORE UPDATE OR DELETE` triggers on audit tables that reject mutation
  unless a controlled archival role is active.
- Give the backend application role `INSERT` and selected `SELECT` on audit
  tables; do not grant broad `UPDATE` or `DELETE`.
- Use a separate archival database role for retention jobs.
- Record every archive/delete batch in `audit_log` as a system event.

## Archive and Purge Process

The audit archival job should run monthly after backups complete:

1. Select audit records older than their hot-retention window by table and
   retention class.
2. Export records to object storage as compressed JSONL or Parquet.
3. Partition export paths by table and month:
   `audit-archive/{table}/year=YYYY/month=MM/part-000.jsonl.gz`.
4. Write a manifest with row count, time range, SHA-256 digest, source table,
   export timestamp, and job correlation id.
5. Store the manifest in the same immutable bucket prefix.
6. Verify object write, digest, and row count.
7. Delete hot rows only after verification and a fresh database backup.
8. Write a `SYSTEM_AUDIT_ARCHIVE_COMPLETED` audit event with counts, range, and
   manifest key.

Archive deletion after the archive-retention window requires an approved
retention ticket and a separate manifest of deleted archive objects.

## Tenant Audit Export

Tenant audit exports should be available to Tenant Admins and Super Admins with
strict scoping.

Export requirements:

- Filter by tenant, date range, event category, actor, and resource.
- Include only events for the tenant unless requested by Super Admin.
- Include Super Admin actions affecting the tenant, even when `tenant_id` is null
  in the source event, by using resource metadata where available.
- Generate CSV and JSONL.
- Watermark exports with tenant id, requested by, generated at, and correlation
  id.
- Write an audit event for every export request and download.
- Expire generated export files after 7 days.

Access rules:

- Tenant Admin may export only their tenant.
- School Admin may view/export school-scoped audit only when that feature is
  explicitly enabled.
- Super Admin may export cross-tenant audit after step-up authentication.
- Support impersonation, if introduced, must always be included in tenant export.

## Access Control

| Operation | Allowed roles | Extra control |
|---|---|---|
| View own-tenant audit | Tenant Admin | Tenant scope enforced server-side. |
| View school audit | School Admin | School access check; feature-gated. |
| View cross-tenant audit | Super Admin | Step-up auth and audit reason. |
| Export tenant audit | Tenant Admin, Super Admin | Rate limit, date-range cap, audit export event. |
| Export cross-tenant audit | Super Admin | Step-up auth, reason required, export watermark. |
| Archive audit | System archival role | ShedLock, manifest, backup check. |
| Delete archived audit | System archival role | Approved retention ticket and manifest. |

Direct database audit access should be limited to production DBA/security roles
and should be break-glass audited outside the application when possible.

## PII Handling

Audit records may contain personal data such as usernames, user ids, IP
addresses, user-agent strings, file names, object keys, and free-text metadata.

Rules:

- Do not store secrets, passwords, OTPs, MFA codes, backup codes, refresh tokens,
  access tokens, SAML assertions, OIDC tokens, SCIM bearer tokens, payment card
  data, or raw private keys in audit records.
- Prefer IDs and stable references over names and free text.
- Hash or truncate sensitive technical identifiers where full value is not
  required, for example user-agent hash instead of raw user-agent.
- For public/investor access logs, store partial IP or full IP only when security
  review requires it.
- Treat object keys and file names as potentially sensitive student PII.
- Redact metadata before tenant export when fields are internal-only or
  cross-tenant.

Exported audit files must inherit the same encryption, retention, and access
controls as database backups.

## Tamper Resistance

Minimum controls:

- PostgreSQL backups include audit tables.
- Archive objects use bucket versioning and object-lock/WORM mode where
  available.
- Archive manifests include SHA-256 digests and row counts.
- Archive job writes a completion audit event.
- Alert when audit write failure logs exceed threshold.
- Alert when archive job fails or archive manifest count does not match source
  rows.

Recommended follow-up controls:

- Add hash chaining per audit table/month using previous row hash, row payload
  hash, and monthly manifest hash.
- Stream security-critical audit events to an external SIEM or append-only log
  sink.
- Add DB triggers to block update/delete from the application role.
- Add periodic audit integrity verification that samples hot rows and archive
  manifests.

## Legal Hold

Legal hold pauses purge and archive deletion for selected tenants, users,
resources, or date ranges.

Legal hold requirements:

- Store hold scope, reason, requester, approver, start time, and optional end
  time.
- Apply holds before hot-table purge and archive-object deletion.
- Audit hold create/update/release events.
- Do not expose legal-hold details to tenant users unless explicitly approved.

## Implementation Plan

1. Add retention-class documentation to each audit table owner.
2. Add audit export endpoints with tenant scoping and export audit events.
3. Add archive manifest table and immutable object storage path.
4. Add monthly archive job guarded by ShedLock.
5. Add DB triggers/permissions to enforce immutable audit behavior.
6. Add alert rules for audit write failures and archive job failures.
7. Add legal-hold model before enabling archive deletion.
8. Add hash-chain integrity verification for security-critical audit streams.

## Validation Checklist

- Audit export requires role-based access and tenant/school scope.
- Export event is itself audited.
- Archive job verifies object digest and row count before deleting hot rows.
- Audit purge skips rows under legal hold.
- Application database role cannot update or delete audit rows.
- PII redaction tests cover metadata, file names, object keys, IP addresses, and
  user-agent data.
- Retention policy is referenced in compliance docs and release gates before
  enterprise launch.
