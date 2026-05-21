# Database Failure

## Steps
1. Stop write-heavy jobs if DB is unstable.
2. Check Postgres health, disk, locks, connections, and slow queries.
3. Fail over or restore according to backup plan.
4. Run Flyway/schema validation after recovery.
5. Reconcile audit/payment gaps.

## Required Checks
- Tenant isolation remains intact.
- No secrets or PII are pasted into tickets/logs.
- Manual DB changes are approved, backed up, and audited.
- Customer-visible communication uses exact impact and recovery times.
