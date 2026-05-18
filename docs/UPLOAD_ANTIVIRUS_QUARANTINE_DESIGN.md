# Upload Antivirus and Quarantine Design

Status: TASK-012 design complete. This is a design-only control; implementation is intentionally deferred until approved.

## Goals

- Prevent unscanned or malware-positive uploads from being served through presigned download URLs.
- Keep upload UX predictable: accepted files move through explicit scan states and users see actionable status.
- Preserve forensic evidence for security review without exposing suspicious files to normal document flows.
- Support future scanner backends without coupling application code to one vendor.

## Scope

Initial scope covers student document uploads stored through `StorageService` and tracked by `student_documents`. The same pattern should later be reused for teacher video resources and public website media.

Out of scope for this task:

- Running ClamAV or a commercial scanner in the current Docker stack.
- Changing the upload API response contract.
- Retrofitting scan-state columns or background workers.

## Proposed Scan States

| State | Meaning | Download URL behavior |
|---|---|---|
| `PENDING_SCAN` | Upload metadata is accepted and object is in a private staging prefix, waiting for scanner pickup. | Deny with a "file is still being scanned" message. |
| `SCANNING` | A scanner worker has claimed the object. | Deny with a "file is still being scanned" message. |
| `CLEAN` | Scanner found no malware and object has been promoted to the clean prefix. | Allow presigned URL generation. |
| `INFECTED` | Scanner detected malware. | Deny; show "file failed security scan" message. |
| `QUARANTINED` | Object is retained in quarantine for admin review or evidence. | Deny for normal users and school admins. |
| `SCAN_FAILED` | Scanner could not complete after retries or timed out. | Deny; show "file could not be verified" message. |
| `DELETED` | Document metadata was deleted; object should no longer be served. | Deny. |

Future schema change:

- Add `scan_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_SCAN'` to `student_documents`.
- Add `scan_attempts INT NOT NULL DEFAULT 0`.
- Add `scan_started_at`, `scan_completed_at`, `scan_error`, and `quarantined_at`.
- Add an index on `(tenant_id, scan_status, uploaded_at)` for worker polling and admin review.

## Storage Prefixes

Use separate prefixes in the existing MinIO bucket first; separate buckets can be introduced later if operationally useful.

| Prefix | Purpose | Access policy |
|---|---|---|
| `uploads/staging/{tenantId}/{schoolId}/{documentId}/...` | New objects awaiting scan. | Application write, scanner read, no user presigned GET. |
| `uploads/clean/{tenantId}/{schoolId}/{documentId}/...` | Objects that passed scan. | Application read/delete, user presigned GET allowed. |
| `uploads/quarantine/{tenantId}/{schoolId}/{documentId}/...` | Infected or unverifiable objects. | Security/admin-only, no user presigned GET. |
| `uploads/deleted/{tenantId}/{schoolId}/{documentId}/...` | Optional short retention for delete recovery. | No user presigned GET; lifecycle delete policy. |

Promotion rule:

1. Upload writes to `uploads/staging/...`.
2. Scanner reads from staging.
3. If clean, copy to `uploads/clean/...`, verify checksum/size, then delete staging object.
4. If infected or failed permanently, copy to `uploads/quarantine/...`, verify checksum/size, then delete staging object.
5. `student_documents.object_key` points only to the current canonical object key.

## Scanner Architecture

Recommended first implementation: a dedicated scanner worker container using ClamAV.

Flow:

1. API accepts upload, validates MIME/magic bytes, enforces quota, writes metadata as `PENDING_SCAN`, and stores object under staging.
2. API records upload audit event with scan status `PENDING_SCAN` once audit schema supports scan metadata.
3. Scanner worker polls `student_documents` rows in `PENDING_SCAN` or consumes a future queue event.
4. Worker changes status to `SCANNING` with a compare-and-set update to avoid duplicate scanner claims.
5. Worker streams the object to ClamAV using `clamd` or local `clamscan`.
6. Worker updates scan status and object prefix.
7. Download URL generation checks `scan_status == CLEAN` before calling MinIO.

Scanner abstraction:

- Define a `MalwareScanner` interface with `ScanResult scan(InputStream stream, String filename, String mimeType)`.
- Initial implementation: `ClamAvMalwareScanner`.
- Future implementations: cloud malware scanning service, S3 object lambda, or vendor API.

## Retry and Timeout Policy

| Failure | Retry policy | Final state |
|---|---|---|
| Scanner container unavailable | Retry every 5 minutes, max 12 attempts. | `SCAN_FAILED` after 1 hour. |
| ClamAV signature update in progress | Retry with exponential backoff. | `SCAN_FAILED` if still unavailable after max attempts. |
| Object not found in staging | Retry twice to cover object-store consistency or transient MinIO errors. | `SCAN_FAILED`. |
| Scanner timeout | Retry up to 3 times. | `SCAN_FAILED`. |
| Malware detected | No retry required unless scanner result is explicitly inconclusive. | `INFECTED`, then move to `QUARANTINED`. |

Worker timeouts:

- Per-file scan timeout: 60 seconds for documents up to 10 MB.
- Worker claim timeout: if `SCANNING` older than 15 minutes, return to `PENDING_SCAN` unless attempts are exhausted.
- Signature freshness: scanner must expose signature age; alert when signatures are older than 24 hours.

## User Messaging

| Actor | State | Message |
|---|---|---|
| School admin upload success | `PENDING_SCAN` | "Upload received. The file will be available after security scanning." |
| School admin list view | `PENDING_SCAN` or `SCANNING` | "Scanning" badge; download disabled. |
| School admin download attempt | `PENDING_SCAN` or `SCANNING` | "This file is still being scanned. Please try again shortly." |
| School admin download attempt | `INFECTED` or `QUARANTINED` | "This file failed security scanning and is unavailable. Contact support if you believe this is an error." |
| School admin download attempt | `SCAN_FAILED` | "This file could not be verified. Please upload it again or contact support." |
| Parent/student future view | Any non-clean state | Do not expose the file row unless product explicitly wants pending-status visibility. |

Do not reveal malware family names to end users. Store scanner details for admin/security review only.

## Admin Review

Admin review should be Super Admin or security-operator only.

Review queue filters:

- Tenant
- School
- Scan status
- Uploaded by
- Uploaded date range
- Scanner result
- Correlation ID

Allowed actions:

- View metadata only by default.
- Download quarantined file only with explicit break-glass permission and a separate audit event.
- Mark false positive and rescan.
- Permanently delete quarantined object.
- Notify tenant admin with a templated message.

Audit events to add:

- `SCAN_STARTED`
- `SCAN_CLEAN`
- `SCAN_INFECTED`
- `SCAN_FAILED`
- `QUARANTINE_MOVED`
- `QUARANTINE_REVIEWED`
- `QUARANTINE_DELETED`
- `QUARANTINE_FALSE_POSITIVE_RESCAN`

## API and Data Changes for Future Implementation

Student document response should eventually include:

- `scanStatus`
- `scanCompletedAt`
- `downloadAvailable`

Download URL generation must enforce:

```text
document exists
AND tenant/school/student access is valid
AND scan_status = CLEAN
AND object_key starts with uploads/clean/
```

Admin review endpoint candidates:

- `GET /v1/super-admin/storage/quarantine`
- `GET /v1/super-admin/storage/quarantine/{documentId}`
- `POST /v1/super-admin/storage/quarantine/{documentId}/rescan`
- `DELETE /v1/super-admin/storage/quarantine/{documentId}`

## Observability and Alerts

Metrics:

- `cloudcampus_upload_scan_total{result="clean|infected|failed"}`
- `cloudcampus_upload_scan_duration_seconds`
- `cloudcampus_upload_scan_queue_depth`
- `cloudcampus_upload_quarantine_objects_total`
- `cloudcampus_upload_scanner_signature_age_seconds`

Alerts:

- Scanner unavailable for 10 minutes.
- Scan queue depth grows for 15 minutes.
- Any `INFECTED` result creates warning alert and security ticket.
- Signature age exceeds 24 hours.
- `SCAN_FAILED` rate exceeds 5 percent in 15 minutes.

## Rollout Plan

1. Add scan-state columns and audit events behind a feature flag.
2. Deploy ClamAV scanner container and health checks in staging.
3. Change upload path to write staging objects with `PENDING_SCAN`.
4. Block presigned URLs unless scan status is `CLEAN`.
5. Add admin quarantine review API.
6. Add frontend scan badges and disabled download states.
7. Backfill existing documents as `CLEAN_LEGACY` or queue them for scanning before enforcement.

## Acceptance Coverage

| Requirement | Covered by |
|---|---|
| Scan states | Proposed scan-state table and future schema changes. |
| Quarantine bucket/prefix | `uploads/quarantine/...` prefix and promotion rules. |
| User messaging | User messaging matrix. |
| Retries | Retry and timeout policy. |
| Admin review | Admin review queue, actions, and audit events. |
