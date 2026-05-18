CREATE TABLE platform_website_audit_timeline (
    id UUID PRIMARY KEY,
    event_type VARCHAR(80) NOT NULL,
    resource_type VARCHAR(60) NOT NULL,
    resource_id UUID NULL,
    resource_label VARCHAR(255) NOT NULL,
    actor_id UUID NULL,
    details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pwat_created_at
    ON platform_website_audit_timeline(created_at DESC);

CREATE INDEX idx_pwat_resource
    ON platform_website_audit_timeline(resource_type, resource_id, created_at DESC);
