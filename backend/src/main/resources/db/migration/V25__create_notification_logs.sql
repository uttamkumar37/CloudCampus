-- V25: Notification audit log (CC-1002 — Email/SMS baseline)
-- Stores every notification dispatch attempt (email or SMS) with its outcome.
-- This is the source of truth for "was this notification sent?" without
-- coupling the notification system to any external provider's data store.

CREATE TABLE notification_logs (
    id              UUID            PRIMARY KEY,
    tenant_id       UUID            NOT NULL REFERENCES tenants(id),
    school_id       UUID            REFERENCES schools(id),

    -- Channel: EMAIL | SMS
    channel         VARCHAR(20)     NOT NULL,

    -- Template used for this dispatch
    template_code   VARCHAR(100),

    -- Destination address — email or E.164 phone number
    recipient       VARCHAR(255)    NOT NULL,

    -- Email subject line (null for SMS)
    subject         VARCHAR(500),

    -- QUEUED → SENT | FAILED
    status          VARCHAR(20)     NOT NULL,

    -- Non-null only when status = FAILED; truncated at 2000 chars
    error_message   VARCHAR(2000),

    -- Set when status transitions to SENT
    sent_at         TIMESTAMPTZ,

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- Index: tenant-scoped queries (TenantFilterAspect)
CREATE INDEX idx_notif_log_tenant  ON notification_logs(tenant_id);

-- Index: school admin list view — filter by school
CREATE INDEX idx_notif_log_school  ON notification_logs(school_id);

-- Index: channel-based reporting
CREATE INDEX idx_notif_log_channel ON notification_logs(channel);

-- Index: status-based filtering (e.g. failed retries)
CREATE INDEX idx_notif_log_status  ON notification_logs(status);

-- Index: default sort — newest first
CREATE INDEX idx_notif_log_created ON notification_logs(created_at DESC);
