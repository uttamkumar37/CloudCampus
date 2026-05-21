# Security Rules

## Identity
- Access tokens are short-lived JWTs.
- Refresh tokens rotate and can be revoked/denylisted.
- Login lockout and rate limits are Redis-backed.
- Passwords use BCrypt through the configured `PasswordEncoder`.

## Authorization
- Route-level authorization is configured in `SecurityConfig`.
- Method-level authorization uses `@PreAuthorize` for role-sensitive controllers.
- Frontend/mobile role checks are not security controls.

## Tenant Isolation
- Tenant-owned tables carry `tenantId`.
- Repository methods must scope reads and writes by tenant.
- Hibernate tenant filter and `RequestContext` are guardrails, not permission to omit explicit ownership checks on sensitive flows.

## Data Protection
- Never log tokens, passwords, OTPs, payment secrets, AI provider keys, or raw PII payloads.
- Use MinIO/storage service for documents; never write uploads directly to repo or local disk in production paths.
- Validate file type, quota, and authorization before upload/download.

## Public Endpoints
- Public routes must be explicitly listed in `SecurityConfig`.
- Public analytics must be rate-limited and PII-minimized.
- Public website route/path inputs must use route-safe validation.
