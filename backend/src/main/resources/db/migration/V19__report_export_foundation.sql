CREATE TABLE report_export_jobs (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    requested_by_user_id VARCHAR(36) NOT NULL,
    bulk_job_id VARCHAR(36) NOT NULL,
    report_type VARCHAR(80) NOT NULL,
    format VARCHAR(20) NOT NULL,
    parameters_json TEXT NOT NULL,
    requested_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    CONSTRAINT fk_report_export_jobs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_report_export_jobs_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_report_export_jobs_requested_by FOREIGN KEY (requested_by_user_id) REFERENCES user_accounts(id),
    CONSTRAINT fk_report_export_jobs_bulk_job FOREIGN KEY (bulk_job_id) REFERENCES bulk_jobs(id),
    CONSTRAINT uk_report_export_jobs_bulk_job UNIQUE (bulk_job_id)
);

CREATE TABLE report_export_files (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    report_export_job_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(180) NOT NULL,
    content_type VARCHAR(120) NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_report_export_files_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_report_export_files_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_report_export_files_job FOREIGN KEY (report_export_job_id) REFERENCES report_export_jobs(id),
    CONSTRAINT uk_report_export_files_job UNIQUE (report_export_job_id)
);

CREATE INDEX idx_report_export_jobs_school_requested ON report_export_jobs(school_id, requested_at);
CREATE INDEX idx_report_export_jobs_bulk ON report_export_jobs(bulk_job_id);
CREATE INDEX idx_report_export_files_school_created ON report_export_files(school_id, created_at);
