-- V9: Performance indexes for public-schema tables
-- Tenant-schema indexes are managed in TenantServiceImpl.initializeTenantTables()

-- ── tenants ───────────────────────────────────────────────────────────────────
-- Supports countByActiveTrue() and dashboard active/inactive counts
CREATE INDEX IF NOT EXISTS idx_tenants_active
    ON public.tenants (active);

-- Composite: slug + active — used in TenantRequestFilter subdomain resolution
CREATE INDEX IF NOT EXISTS idx_tenants_slug_active
    ON public.tenants (slug, active);

-- created_at: supports countByCreatedAtAfter() and findAllByOrderByCreatedAtDesc()
CREATE INDEX IF NOT EXISTS idx_tenants_created_at
    ON public.tenants (created_at DESC);

-- ── audit columns on tenants ──────────────────────────────────────────────────
ALTER TABLE public.tenants
    ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by   UUID,
    ADD COLUMN IF NOT EXISTS updated_by   UUID,
    ADD COLUMN IF NOT EXISTS logo_url     VARCHAR(512),
    ADD COLUMN IF NOT EXISTS primary_color VARCHAR(20);

-- ── tenant_subscriptions ──────────────────────────────────────────────────────
-- (table created in V3 as tenant_subscriptions; V3 already adds these indexes,
--  so this block is intentionally empty — indexes exist via V3)
