# Production Issues

## Steps
1. Check health endpoint and error rate.
2. Review backend logs and recent migrations.
3. Check Postgres, Redis, RabbitMQ, MinIO, and external providers.
4. Rollback app if deployment-caused.
5. Escalate data issues before manual DB edits.

## Required Checks
- Tenant isolation remains intact.
- No secrets or PII are pasted into tickets/logs.
- Manual DB changes are approved, backed up, and audited.
- Customer-visible communication uses exact impact and recovery times.
