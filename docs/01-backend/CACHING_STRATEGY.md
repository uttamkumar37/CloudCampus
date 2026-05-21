# Caching Strategy

## Redis Uses Detected
- Feature flags: `ff:{tenantId}` sets cached per tenant.
- Login lockout and general rate-limit counters.
- Password reset OTP hashes.
- JWT denylist entries.
- QR attendance tokens.
- Tenant suspension checks.

## Spring Cache Uses Detected
- Academic years by school.
- Classes by academic year.
- Sections by class.
- Subjects by school/active state.
- Experience content blocks and investor rooms.

## Rules
- Cache keys must include tenant or school scope when data is tenant-owned.
- Mutations must evict every cache key that can expose stale state.
- Do not cache authorization decisions without an explicit short TTL and invalidation strategy.
- Public content cache must be invalidated on publish/rollback.
