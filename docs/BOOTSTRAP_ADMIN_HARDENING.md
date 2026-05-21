# Bootstrap Admin Hardening (T-08)

## Problem

The first super-admin user is currently created from `BOOTSTRAP_ADMIN_PASSWORD` + `BOOTSTRAP_ADMIN_EMAIL` env vars on every boot, by `SuperAdminBootstrap`. Risks:

1. Anyone with read access to `.env` (current value: `admin123`) can log in as super-admin.
2. The env vars remain set in production secret stores indefinitely; they should be one-shot.
3. There is no automated forced-password-change on first login even though the column `users.force_password_change` exists in the schema.

## Proposed change

### Phase 1 — Force password change (small, safe)

When `SuperAdminBootstrap` creates the initial super-admin row, set `force_password_change = TRUE`. The existing `JwtAuthenticationFilter` already surfaces this via `requiresPasswordChange` in the login response, and the frontend already routes the user to the change-password page (see `LoginPage.tsx`). So this is a one-line backend change plus a verification path.

### Phase 2 — One-shot bootstrap

Add a new migration introducing a `system_bootstrap` table:

```sql
CREATE TABLE system_bootstrap (
    id              INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),   -- singleton row
    bootstrap_done  BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMPTZ
);
INSERT INTO system_bootstrap (id) VALUES (1) ON CONFLICT DO NOTHING;
```

Modify `SuperAdminBootstrap.run()` to:

```java
if (jdbc.queryForObject("SELECT bootstrap_done FROM system_bootstrap WHERE id = 1", Boolean.class)) {
    log.info("Bootstrap already completed — ignoring BOOTSTRAP_ADMIN_* env vars.");
    return;
}
// ... create super-admin row ...
jdbc.update("UPDATE system_bootstrap SET bootstrap_done = TRUE, completed_at = now() WHERE id = 1");
```

After the first successful boot the env vars are dead — even if an attacker reads them they cannot use them.

### Phase 3 — Replace env vars with a setup API

Eventually, replace the env-driven bootstrap with a `POST /v1/system/setup` endpoint that:

1. Is only callable when `system_bootstrap.bootstrap_done = FALSE`.
2. Accepts the desired admin email + a temporary password (or generates one and emails it).
3. Returns 410 Gone on every subsequent call.

This removes secrets from CI / Helm / Kubernetes manifests entirely.

## Rollout plan

| Step | Risk | Effort |
|---|---|---|
| Phase 1 — `force_password_change = TRUE` in seed | Low — already supported on FE | 30 min |
| Phase 2 — `system_bootstrap` table + idempotent bootstrap | Low — guarded by migration | 1 hour |
| Phase 3 — `/v1/system/setup` endpoint | Medium — replaces env mechanism | 4-6 hours |

## What this audit did

This audit document **only writes the plan**. It does **not** ship the change because:

- The current dev environment has `admin123` baked in everywhere; flipping force_password_change for the demo admin would break the team's day-to-day login until everyone updates their dev DB.
- Production has zero existing super-admins (still pre-launch) so even Phase 2 is safe to do *immediately before* the first real deploy.

**Recommended next step:** ship Phase 1 + Phase 2 in a single PR the day before the first staging deploy.
