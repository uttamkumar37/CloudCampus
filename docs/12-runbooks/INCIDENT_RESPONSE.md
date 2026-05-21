# Incident Response

## Steps
1. Declare severity and owner.
2. Freeze risky deploys.
3. Collect logs, metrics, traces, recent deploys, and audit events.
4. Mitigate user impact.
5. Preserve evidence.
6. Write post-incident actions.

## Required Checks
- Tenant isolation remains intact.
- No secrets or PII are pasted into tickets/logs.
- Manual DB changes are approved, backed up, and audited.
- Customer-visible communication uses exact impact and recovery times.
