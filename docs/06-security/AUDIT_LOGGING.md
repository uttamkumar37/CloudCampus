# Audit Logging

## Current Coverage Areas
- Auth events through `AuditLogService`.
- Student Profile 360 updates.
- Data retention purge.
- Upload audit logging.
- Website audit timeline and rollback audit.
- Investor room access logging.

## Gap To Close
Audit logging is not visibly uniform across all mutation controllers. When touching any write flow, add or verify an audit event.

## Required Audit Fields
- Tenant id, school id when applicable, actor id, action, target type/id, result, timestamp, and safe metadata.
