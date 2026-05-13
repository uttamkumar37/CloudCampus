-- V8: Composite and partial indexes for common query patterns (EUP-013 / B5).
--
-- Purpose: All primary-key and basic single-column indexes were created inline in
-- V1-V6. This migration adds the composite and partial (filtered) indexes that
-- cover the most frequent multi-column access patterns expected at scale.
--
-- Design rules applied:
--   1. WHERE clause partial indexes are used where rows have a dominant active state,
--      so index scans on inactive rows are never wasted.
--   2. DESC on time columns matches the default "newest first" sort in list queries.
--   3. Every index is created with IF NOT EXISTS to make reruns safe.
--   4. Indexes for tables that do not exist yet (students, classes, etc.) are deferred
--      to the migration that creates those tables.

-- ── Tenant table ──────────────────────────────────────────────────────────────

-- Super Admin: list tenants filtered by status (ACTIVE / SUSPENDED / ARCHIVED).
CREATE INDEX IF NOT EXISTS idx_tenants_status
    ON tenants(status);

-- Super Admin: newest tenants first dashboard widget.
CREATE INDEX IF NOT EXISTS idx_tenants_created_at
    ON tenants(created_at DESC);

-- ── Users table ───────────────────────────────────────────────────────────────

-- Most common query: "list all users with role X inside tenant Y"
-- e.g. list all TEACHER_ADMIN in a tenant for the admin dashboard.
CREATE INDEX IF NOT EXISTS idx_users_tenant_role
    ON users(tenant_id, role);

-- Status dashboard: "list all SUSPENDED users inside a tenant"
CREATE INDEX IF NOT EXISTS idx_users_tenant_status
    ON users(tenant_id, status);

-- Hot-path lookup for login: tenant + username (username is already globally unique
-- but this composite supports future per-tenant username uniqueness if policy changes).
CREATE INDEX IF NOT EXISTS idx_users_tenant_username
    ON users(tenant_id, username);

-- ── Audit log table ───────────────────────────────────────────────────────────

-- Category drill-down within a tenant + time window (e.g. all AUTH events this month).
-- Covers the most common audit search UX: tenant → category → date range.
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_category_created
    ON audit_log(tenant_id, category, created_at DESC);

-- Event-type drill-down within a tenant (e.g. all LOGIN_FAILED events).
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_event_created
    ON audit_log(tenant_id, event_type, created_at DESC);

-- ── Schools table ─────────────────────────────────────────────────────────────

-- Partial index: active schools within a tenant (the dominant access pattern).
-- Replaces a full-scan of idx_schools_tenant_id for the common active-only case.
CREATE INDEX IF NOT EXISTS idx_schools_tenant_active
    ON schools(tenant_id)
    WHERE status = 'ACTIVE';

-- ── Tenant features table ─────────────────────────────────────────────────────

-- Partial index: only rows where the feature is explicitly enabled.
-- Hot-path for FeatureFlagService DB fallback — filters out disabled rows at index level.
CREATE INDEX IF NOT EXISTS idx_tenant_features_enabled
    ON tenant_features(tenant_id)
    WHERE enabled = TRUE;
