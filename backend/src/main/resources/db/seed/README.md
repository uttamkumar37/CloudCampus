# db/seed — Dev-only seed migrations

Flyway migrations placed in this directory are **only loaded by the `dev` profile**. Staging and prod explicitly set `spring.flyway.locations: classpath:db/migration`, so anything written here will never touch a customer database.

## When to put a migration here

- It seeds demo data for dev/QA/screenshots/AI training.
- It depends on data shape that only exists in the demo tenant (e.g. JNV Lucknow with `c0000000-...`).
- It would be embarrassing or regulatory-risky if it ran on a real customer DB by mistake (e.g. synthetic Aadhaar-shaped IDs, fake parent contact info).

## When NOT to put a migration here

- It changes schema (CREATE TABLE, ALTER TABLE, CREATE INDEX) — those belong in `db/migration` so every environment gets them.
- It inserts essential reference data needed by code paths (e.g. role rows, plan codes) — those belong in `db/migration`.

## Naming convention

Use the same `V<n>__name.sql` format. Use a sub-version range agreed with the team to keep numbers from colliding (e.g. demo seeds use `V8XXX_*` to leave room).

## Existing seed-style migrations in db/migration

The following migrations are seed data but were originally placed in `db/migration` and **must not be moved** because their checksums are already recorded:

- `V42__jnv_lucknow_seed.sql`
- `V58__full_jnv_lucknow_seed.sql`
- `V59__greenwood_demo_tenant.sql`
- `V89__jnv_lucknow_students_and_profiles.sql`
- `V90__jnv_lucknow_academic_activity.sql`
- `V91__jnv_lucknow_profile_and_enrichment_data.sql`
- `V92__demo_admin_anonymise_owner_pii.sql`
- `V93__demo_anonymise_synthetic_aadhaar.sql`

See `db/migration/MIGRATION_GRAVEYARD.md` for the history of which seeds worked vs. silently no-op'd.

## Future direction

The intent is that *new* dev-only seed migrations go in `db/seed`. Over time the legacy seeds in `db/migration` will simply be guarded by tenant existence checks (most already are), so running them against a fresh customer DB returns immediately with `RAISE NOTICE 'skipping'`.
