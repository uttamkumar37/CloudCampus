CREATE TABLE student_import_jobs (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    bulk_job_id VARCHAR(36) NOT NULL UNIQUE,
    requested_by_user_id VARCHAR(36) NOT NULL,
    rows_json CLOB NOT NULL,
    validation_errors_json CLOB NOT NULL,
    created_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP,
    CONSTRAINT fk_student_import_jobs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_student_import_jobs_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_student_import_jobs_bulk_job FOREIGN KEY (bulk_job_id) REFERENCES bulk_jobs(id),
    CONSTRAINT fk_student_import_jobs_requested_by FOREIGN KEY (requested_by_user_id) REFERENCES user_accounts(id)
);

CREATE INDEX idx_student_import_jobs_school_created_at ON student_import_jobs(school_id, created_at);
CREATE INDEX idx_student_import_jobs_requested_by ON student_import_jobs(requested_by_user_id);
