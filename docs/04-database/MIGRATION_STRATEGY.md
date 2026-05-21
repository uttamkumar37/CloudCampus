# Migration Strategy

## Flyway Rules
- Add a new `V<number>__description.sql` for every schema/data migration.
- Never edit a migration already run outside your local throwaway database.
- Keep migrations deterministic and idempotent where seed data can collide.
- Use `ON CONFLICT` for demo/platform seed records where appropriate.
- Add indexes and constraints in separate, reviewable migrations for large tables.

## Validation
- Backend CI runs `mvn verify`, which validates migrations through tests.
- OpenAPI publish boots the app with PostgreSQL service and dev profile.
- Production release must take a database backup before applying migrations.
