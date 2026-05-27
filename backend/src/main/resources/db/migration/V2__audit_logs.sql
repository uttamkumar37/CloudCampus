CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36),
    actor_type VARCHAR(80) NOT NULL,
    actor_id VARCHAR(36),
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    summary VARCHAR(500) NOT NULL,
    metadata_json TEXT,
    correlation_id VARCHAR(80),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_audit_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_audit_logs_school FOREIGN KEY (school_id) REFERENCES schools(id)
);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_school_id ON audit_logs(school_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
