# Offline Strategy

## Current Implementation
The mobile app stores authentication session data and renders live role-aware API sync cards. It does not yet implement a full offline-first domain cache.

## Required Future Strategy
- Cache read-only student/parent/teacher dashboard data by tenant, user, and school.
- Queue mutations only where conflict rules are explicit.
- Never queue payment verification, password reset, or security-sensitive operations offline.
- Encrypt sensitive cached data and wipe it on logout.
- Preserve server authority for attendance, fees, and exam results.
