# Tenant Isolation

## Implementation Pattern
- Tenant-owned entities carry `tenantId`.
- `RequestContext` holds tenant id set by JWT authentication.
- Hibernate tenant filter support exists as a guardrail.
- Repositories commonly expose `findBy...AndTenantId` methods.
- Integration tests include tenant isolation and cross-tenant isolation coverage.

## Required Query Rule
Every tenant-owned read, update, delete, aggregation, export, or count must include tenant scope.

## Cross-Tenant Denial Pattern
- If a record exists in another tenant, return not found or forbidden without leaking existence.
- Never accept tenant id from request body as authority.
- Public routes that resolve by tenant code/domain must explicitly load only published/public-safe data.
