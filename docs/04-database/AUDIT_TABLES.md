# Audit Tables

## Audit Tables Detected
- General audit log from `V4__create_audit_log.sql`.
- Upload audit log from `V83__create_upload_audit_log.sql`.
- Website rollback audit log from `V84__create_website_rollback_audit_log.sql`.
- Website audit timeline from `V85__create_website_audit_timeline.sql`.
- Investor room access log from `V86__create_investor_room_access_log.sql`.

## Rules
- Audit records should include tenant, actor, action, target type/id, timestamp, and relevant metadata.
- Never store secrets or full sensitive payloads in audit metadata.
- Audit writes should be asynchronous where possible but must not silently mask repeated failures.
- Lifecycle and financial corrections require explicit audit entries.
