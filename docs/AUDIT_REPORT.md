# CloudCampus Architectural Audit Report

Date: 2026-05-01
Scope: backend, frontend, docs, Docker, CI naming and tenancy consistency.

## 1. Critical Findings

1. Tenant context header inconsistency
- Multiple layers used X-Tenant-ID wording while product UX was slug-first.
- Risk: integration confusion and wrong tenant context in external clients.
- Action taken: standardized contracts to X-Tenant-Slug with legacy fallback support in filter.

2. Internal identifier exposure in authentication/profile flows
- Login/session/profile contracts exposed technical identifiers (UUID/schema-level fields).
- Risk: unnecessary leakage of internal model details in UI/API contracts.
- Action taken: sanitized auth/profile payloads and frontend session storage to avoid internal IDs.

3. Fee payment API trusted client-provided receiver UUID
- Payment request accepted receivedByUserId from frontend.
- Risk: spoofable actor attribution from client payload.
- Action taken: backend now derives payer receiver user ID from authenticated principal.

## 2. Improvement Findings

1. Mapper consistency gap in tenant module
- Tenant mapping logic was embedded in service implementation.
- Action taken: introduced tenant mapper component and wired service to mapper.

2. Naming drift and product branding mismatch
- Legacy CampusCloud naming remained in workflow labels and defaults.
- Action taken: aligned visible naming to CloudCampus and normalized DB naming in env/workflows.

3. Documentation drift
- Existing docs had outdated auth/header/runtime details and stale links.
- Action taken: rewrote key docs to match current architecture and contracts.

## 3. Optional Findings

1. Package-level separation target (modules/common/infra/config)
- Current code is modular monolith but not fully grouped into infra namespace.
- Recommendation: perform phased package migration by module to avoid high-risk big-bang refactor.

2. UUID-heavy domain contracts
- Several feature APIs still use UUID identifiers in domain payloads.
- Recommendation: introduce public IDs/slugs for external contracts where business-safe.

## 4. Implemented Changes

Backend:
- TenantRequestFilter supports:
  - primary header X-Tenant-Slug
  - legacy fallback X-Tenant-ID
  - unchanged subdomain resolution
- Auth DTOs and service:
  - removed internal ID/schema exposure from login/profile responses
  - profile now returns tenantSlug and schoolName
- Tenant DTO:
  - removed internal UUID id from TenantResponse
- Tenant module:
  - added TenantMapper and wired service to mapper
- Fees module:
  - removed receivedByUserId from create payment request
  - derive receiver user ID from authenticated principal
- Added test:
  - TenantRequestFilterTest covering primary and legacy header resolution

Frontend:
- Axios client now sends X-Tenant-Slug
- Auth session storage no longer persists userId
- Auth/profile contracts aligned with sanitized backend responses
- Profile UI now shows school/workspace instead of schema/user UUID
- Super admin tenant table keys switched to public slug
- Fees payment UI no longer sends receivedByUserId

Docs and config:
- Updated README.md
- Updated docs/02_SETUP.md
- Updated docs/03_ARCHITECTURE.md
- Updated docs/07_API_REFERENCE.md
- Updated frontend/README.md
- Standardized CI/env visible naming to CloudCampus where applicable

## 5. Production Readiness Check (Post-Refactor)

Status: improved, with remaining roadmap items.

Validated by design:
- Tenant context entrypoint is now slug-first and backward compatible.
- Auth/profile contracts are less coupled to internal persistence details.
- API envelope remains standardized.
- Security posture improved by removing client-controlled payment actor UUID.

Pending for full production hardening:
- Expand domain-level public identifier strategy beyond auth/tenant.
- Add broader integration tests for role and tenant isolation edge cases.
- Introduce environment-specific compose/profile strategy for prod deployment.

## 6. Roadmap

Phase 1 (short-term)
- Add API contract tests for all auth/tenant endpoints.
- Add integration tests for cross-tenant isolation in key modules.
- Add explicit prod compose/deployment guide and secret management checklist.

Phase 2 (mid-term)
- Introduce publicId strategy for externally-facing domain entities.
- Move schema provisioning implementation into dedicated infra package.
- Add mapper coverage for additional modules (student/teacher/fees).

Phase 3 (long-term)
- Converge package structure toward modules/common/infra/config.
- Add audit-event stream for security-sensitive actions.
- Add SLO dashboards and operational runbooks.
