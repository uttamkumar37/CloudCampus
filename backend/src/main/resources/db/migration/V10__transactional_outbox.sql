CREATE TABLE outbox_events (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36),
    aggregate_type VARCHAR(80) NOT NULL,
    aggregate_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(120) NOT NULL,
    event_key VARCHAR(160) UNIQUE,
    payload_json CLOB NOT NULL,
    status VARCHAR(24) NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMP,
    locked_at TIMESTAMP,
    locked_by VARCHAR(80),
    last_error VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP,
    CONSTRAINT fk_outbox_events_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_outbox_events_school FOREIGN KEY (school_id) REFERENCES schools(id)
);

CREATE INDEX idx_outbox_events_status_created_at ON outbox_events(status, created_at);
CREATE INDEX idx_outbox_events_next_attempt_at ON outbox_events(next_attempt_at);
CREATE INDEX idx_outbox_events_tenant_id ON outbox_events(tenant_id);
CREATE INDEX idx_outbox_events_school_id ON outbox_events(school_id);
CREATE INDEX idx_outbox_events_aggregate ON outbox_events(aggregate_type, aggregate_id);
