# Queue Failure

## Steps
1. Check RabbitMQ node and queue depths.
2. Inspect notification and experience DLQs.
3. Pause producers only if queues threaten primary state.
4. Replay idempotent messages after fix.
5. Document lost/deferred notifications.

## Required Checks
- Tenant isolation remains intact.
- No secrets or PII are pasted into tickets/logs.
- Manual DB changes are approved, backed up, and audited.
- Customer-visible communication uses exact impact and recovery times.
