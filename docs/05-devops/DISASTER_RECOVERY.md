# Disaster Recovery

## Recovery Order
1. Freeze deploys and identify blast radius.
2. Restore Postgres to a known-good point.
3. Restore object storage if documents/media are affected.
4. Start Redis/Rabbit infrastructure.
5. Start backend, then frontend.
6. Run smoke tests for auth, school admin, student, finance, public website, and mobile login.
7. Review audit/payment reconciliation.

## DR Drill
Use `.github/workflows/dr-drill.yml` and `infra/pgbackup/drill.sh` as the operational starting point.
