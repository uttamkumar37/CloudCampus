CREATE TABLE platform_website_rollback_audit_log (
    id UUID PRIMARY KEY,
    snapshot_id UUID NOT NULL REFERENCES platform_website_publish_snapshots(id) ON DELETE RESTRICT,
    snapshot_label VARCHAR(120) NOT NULL,
    actor_id UUID NULL,
    restored_counts_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pwr_audit_snapshot_created_at
    ON platform_website_rollback_audit_log(snapshot_id, created_at DESC);
