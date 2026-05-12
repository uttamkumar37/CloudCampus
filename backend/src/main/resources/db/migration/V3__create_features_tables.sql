-- V3: Feature flag foundation — Feature Catalog + Tenant Feature Mapping.
--
-- Design goals:
--   1. Centralised feature registry (Super Admin manages features).
--   2. Per-tenant feature enable/disable with optional JSON config.
--   3. All feature checks are cached in Redis (TTL 5 min) — never hot-path DB queries.
--
-- Feature types (stored as VARCHAR, validated at application layer):
--   CORE     — always enabled, cannot be disabled
--   OPTIONAL — tenant-configurable, no subscription required
--   PREMIUM  — requires an active subscription plan
--   BETA     — controlled rollout to selected tenants

CREATE TABLE IF NOT EXISTS features (
    key         VARCHAR(100) PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    type        VARCHAR(20)  NOT NULL CHECK (type IN ('CORE','OPTIONAL','PREMIUM','BETA')),
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_features (
    tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL REFERENCES features(key) ON DELETE CASCADE,
    enabled     BOOLEAN     NOT NULL DEFAULT FALSE,
    -- Optional per-tenant configuration overrides for this feature (e.g. SMS provider key).
    config      JSONB,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (tenant_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_tenant_features_tenant_id ON tenant_features(tenant_id);

-- Seed the CORE features that are always available to every tenant.
INSERT INTO features (key, name, type, description) VALUES
    ('STUDENT_MANAGEMENT', 'Student Management', 'CORE',   'Core student lifecycle management'),
    ('TEACHER_MANAGEMENT', 'Teacher Management', 'CORE',   'Core teacher and staff management'),
    ('ATTENDANCE_MANUAL',  'Manual Attendance',  'CORE',   'Manual class attendance marking'),
    ('FEE_COLLECTION',     'Fee Collection',     'CORE',   'Basic fee collection and receipts'),
    ('COMMUNICATION_SMS',  'SMS Notifications',  'OPTIONAL','SMS notification dispatch'),
    ('COMMUNICATION_EMAIL','Email Notifications','OPTIONAL','Email notification dispatch'),
    ('COMMUNICATION_PUSH', 'Push Notifications', 'OPTIONAL','Mobile push notification dispatch'),
    ('ATTENDANCE_QR',      'QR Code Attendance', 'PREMIUM','QR-based attendance scanning'),
    ('ATTENDANCE_GPS',     'GPS Attendance',     'PREMIUM','GPS geo-fenced attendance'),
    ('ONLINE_EXAMS',       'Online Examinations','PREMIUM','Online exam delivery and auto-grading'),
    ('WEBSITE_BUILDER',    'Website Builder',    'PREMIUM','School website builder and CMS'),
    ('AI_COPILOT',         'AI Copilot',         'PREMIUM','AI-powered ERP assistant'),
    ('ANALYTICS_ADVANCED', 'Advanced Analytics', 'PREMIUM','Cross-module analytics and reporting')
ON CONFLICT (key) DO NOTHING;
