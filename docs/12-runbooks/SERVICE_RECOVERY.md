# Service Recovery

## Steps
1. Recover infra dependencies first.
2. Start backend and verify `/actuator/health`.
3. Verify auth/login and tenant-scoped smoke tests.
4. Start frontend/mobile access paths.
5. Monitor metrics, logs, and queues for one full traffic cycle.

## Required Checks
- Tenant isolation remains intact.
- No secrets or PII are pasted into tickets/logs.
- Manual DB changes are approved, backed up, and audited.
- Customer-visible communication uses exact impact and recovery times.
