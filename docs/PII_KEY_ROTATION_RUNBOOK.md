# PII Encryption Key Rotation Runbook (T-22)

CloudCampus encrypts selected PII columns (phone, address, etc.) at rest with AES-256-GCM. The key lives in the `ENCRYPTION_SECRET` environment variable (≥ 32 chars), supplied from AWS Secrets Manager / HashiCorp Vault.

This runbook describes how to rotate the key safely without downtime or data loss.

## Frequency

- **Routine**: every 12 months (per the documented security policy).
- **Emergency**: immediately, when the previous key is known or suspected to be compromised.

## Prerequisites

- An incident channel open (rotation is a P2 by default; emergency rotation is P0).
- Production DB has full backup completed within the last 6 hours.
- The new key has been minted in Secrets Manager under a new version (do **not** overwrite the old version yet).

## Schema requirement (future)

The current cipher columns store only the ciphertext. For zero-downtime rotation each encrypted column needs an adjacent `<col>_key_id` column so we can distinguish ciphertext encrypted with the old key from ciphertext encrypted with the new key.

Migration sketch (write before first rotation):

```sql
ALTER TABLE students       ADD COLUMN phone_key_id          SMALLINT DEFAULT 1;
ALTER TABLE students       ADD COLUMN address_key_id        SMALLINT DEFAULT 1;
ALTER TABLE student_parent_links ADD COLUMN phone_key_id    SMALLINT DEFAULT 1;
-- … repeat for every encrypted PII column …
```

Application code already supports a `keyId → key` lookup map; today it has a single entry (id=1).

## Rotation procedure (zero-downtime, dual-key window)

```
Phase 1  Provision new key as key id 2 (alongside the existing key id 1).
Phase 2  Deploy app build that reads BOTH keys and writes new rows with key id 2.
Phase 3  Run the rewrap utility to re-encrypt all existing rows from id 1 → id 2.
Phase 4  Validate: SELECT COUNT(*) FROM <table> WHERE <col>_key_id = 1 should equal 0.
Phase 5  Remove key id 1 from secrets manager + app config.
Phase 6  Drop the legacy key from the app's key map in the next deploy.
```

### Phase 1 — provision new key

```bash
aws secretsmanager put-secret-value \
  --secret-id cloudcampus/prod/encryption-keys \
  --secret-string '{"v1":"<old key>","v2":"<new 32-char key>"}'
```

### Phase 2 — app config (Helm values / ECS task def)

```yaml
ENCRYPTION_KEY_ACTIVE: '2'
ENCRYPTION_KEY_V1: ${SECRETS.cloudcampus.encryption-keys.v1}
ENCRYPTION_KEY_V2: ${SECRETS.cloudcampus.encryption-keys.v2}
```

Deploy via the normal CI/CD pipeline (`deploy.yml`).

### Phase 3 — rewrap utility

Run the rewrap CLI from a maintenance pod / one-off ECS task. The utility:

1. Streams every row from every PII-encrypted table.
2. Decrypts with the row's `<col>_key_id`.
3. Re-encrypts with the active key id.
4. Updates the row, including the new `<col>_key_id`.
5. Logs progress every 10k rows for observability.

```bash
java -jar cloudcampus-rewrap-cli.jar \
     --from-key-id 1 --to-key-id 2 \
     --batch-size 1000 \
     --tables students,student_parent_links,staff
```

The stub for this CLI lives at `backend/src/main/java/com/cloudcampus/common/crypto/RewrapCli.java`. Implementation is intentionally a TODO — it depends on the column-level encryption interceptor refactor.

### Phase 4 — validation queries

```sql
SELECT 'students.phone'           AS col, COUNT(*) AS legacy FROM students WHERE phone_key_id = 1
UNION ALL
SELECT 'students.address',       COUNT(*) FROM students WHERE address_key_id = 1
UNION ALL
SELECT 'parent_links.phone',     COUNT(*) FROM student_parent_links WHERE phone_key_id = 1;
-- Every row must show legacy = 0.
```

### Phase 5 — drop old key

Once Phase 4 returns all zeros for at least 24 hours:

```bash
aws secretsmanager update-secret \
  --secret-id cloudcampus/prod/encryption-keys \
  --secret-string '{"v2":"<new key>"}'   # v1 dropped
```

### Phase 6 — app cleanup

Remove `ENCRYPTION_KEY_V1` from Helm values / task def. Bump the app version.

## Failure recovery

- **Rewrap halts mid-run**: safe to re-run. The utility is idempotent — rows already on the new key id are skipped.
- **App restarts mid-rewrap**: traffic continues normally (dual-key window). Rewrap can be resumed.
- **New key is compromised before Phase 5**: revert to old key by setting `ENCRYPTION_KEY_ACTIVE=1` and running rewrap in the opposite direction.

## What this audit did

- Documented the runbook (this file).
- Did **not** add the `<col>_key_id` columns yet (touches every encrypted table and needs a separate, carefully-staged migration).
- Did **not** implement the rewrap CLI yet (depends on the schema migration above).

Both follow-ups are tracked as separate tasks in the audit (T-22 follow-up A: schema; T-22 follow-up B: CLI).
