CREATE TABLE bulk_jobs (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    job_type VARCHAR(80) NOT NULL,
    requested_by_user_id VARCHAR(36) NOT NULL,
    status VARCHAR(32) NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    processed_records INTEGER NOT NULL DEFAULT 0,
    success_records INTEGER NOT NULL DEFAULT 0,
    failed_records INTEGER NOT NULL DEFAULT 0,
    input_file_reference VARCHAR(500),
    error_file_reference VARCHAR(500),
    metadata_json CLOB NOT NULL,
    last_error VARCHAR(1000),
    requested_at TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_bulk_jobs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_bulk_jobs_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_bulk_jobs_requested_by FOREIGN KEY (requested_by_user_id) REFERENCES user_accounts(id)
);

CREATE INDEX idx_bulk_jobs_tenant_school_status ON bulk_jobs(tenant_id, school_id, status);
CREATE INDEX idx_bulk_jobs_requested_by ON bulk_jobs(requested_by_user_id);
CREATE INDEX idx_bulk_jobs_type_status ON bulk_jobs(job_type, status);
CREATE INDEX idx_bulk_jobs_status_updated_at ON bulk_jobs(status, updated_at);
