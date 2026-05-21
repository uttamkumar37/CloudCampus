# Backup Recovery

## Assets To Back Up
- PostgreSQL database.
- MinIO object storage buckets.
- Redis is mostly cache/ephemeral, but evaluate persistence for OTP/session/denylist expectations.
- Environment secrets and configuration.

## Repo Support
`infra/pgbackup` contains backup and drill scripts.

## Recovery Rules
- Test restore regularly, not only backup creation.
- Verify Flyway schema version after restore.
- Validate MinIO object references against restored DB records.
- Keep audit logs intact through restore.
