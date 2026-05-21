# Indexing Strategy

## Existing Direction
Migrations include performance indexes, school-id indexes, notification UUID defaults, tenant FK/index corrections, and idempotency support for payment gateway events.

## Rules
- Every high-cardinality tenant-owned lookup should have a composite index that starts with `tenant_id` or includes tenant in the leading predicate path.
- Add indexes for new list filters used by frontend/mobile pages.
- Payment webhook idempotency keys must be unique.
- Public website route paths and tenant/school slugs must have uniqueness constraints matching application rules.
- Do not add indexes without checking write-path cost for attendance, analytics, and audit-heavy tables.
