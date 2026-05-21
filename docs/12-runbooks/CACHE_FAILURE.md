# Cache Failure

## Steps
1. Check Redis health and auth.
2. Expect login lockout, OTP, feature cache, rate-limit, QR token, denylist impact.
3. Restart Redis or fail over.
4. Warm critical feature caches if needed.
5. Review security impact of lost denylist entries.

## Required Checks
- Tenant isolation remains intact.
- No secrets or PII are pasted into tickets/logs.
- Manual DB changes are approved, backed up, and audited.
- Customer-visible communication uses exact impact and recovery times.
