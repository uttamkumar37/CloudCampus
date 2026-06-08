CREATE TABLE platform_stats (
    id VARCHAR(40) PRIMARY KEY,
    total_tenant_count BIGINT NOT NULL DEFAULT 0,
    active_tenant_count BIGINT NOT NULL DEFAULT 0,
    total_school_count BIGINT NOT NULL DEFAULT 0,
    active_school_count BIGINT NOT NULL DEFAULT 0,
    total_student_count BIGINT NOT NULL DEFAULT 0,
    active_student_count BIGINT NOT NULL DEFAULT 0,
    total_staff_count BIGINT NOT NULL DEFAULT 0,
    active_staff_count BIGINT NOT NULL DEFAULT 0,
    total_user_count BIGINT NOT NULL DEFAULT 0,
    active_user_count BIGINT NOT NULL DEFAULT 0,
    pending_invoice_count BIGINT NOT NULL DEFAULT 0,
    overdue_invoice_count BIGINT NOT NULL DEFAULT 0,
    paid_invoice_count BIGINT NOT NULL DEFAULT 0,
    failed_notification_count BIGINT NOT NULL DEFAULT 0,
    pending_outbox_count BIGINT NOT NULL DEFAULT 0,
    pending_report_export_count BIGINT NOT NULL DEFAULT 0,
    last_calculated_at TIMESTAMP NOT NULL
);

CREATE TABLE tenant_stats (
    tenant_id VARCHAR(36) PRIMARY KEY,
    school_count BIGINT NOT NULL DEFAULT 0,
    active_school_count BIGINT NOT NULL DEFAULT 0,
    student_count BIGINT NOT NULL DEFAULT 0,
    active_student_count BIGINT NOT NULL DEFAULT 0,
    staff_count BIGINT NOT NULL DEFAULT 0,
    active_staff_count BIGINT NOT NULL DEFAULT 0,
    user_count BIGINT NOT NULL DEFAULT 0,
    active_user_count BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_tenant_stats_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE school_stats (
    school_id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    student_count BIGINT NOT NULL DEFAULT 0,
    active_student_count BIGINT NOT NULL DEFAULT 0,
    staff_count BIGINT NOT NULL DEFAULT 0,
    active_staff_count BIGINT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_school_stats_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_school_stats_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE platform_settings (
    id VARCHAR(40) PRIMARY KEY,
    platform_name VARCHAR(160) NOT NULL,
    support_email VARCHAR(320) NOT NULL,
    default_timezone VARCHAR(80) NOT NULL,
    maintenance_mode BOOLEAN NOT NULL,
    updated_by_user_id VARCHAR(36),
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_platform_settings_updated_by FOREIGN KEY (updated_by_user_id) REFERENCES user_accounts(id)
);

INSERT INTO school_stats (
    school_id,
    tenant_id,
    student_count,
    active_student_count,
    staff_count,
    active_staff_count,
    last_activity_at,
    updated_at
)
SELECT
    s.id,
    s.tenant_id,
    (SELECT COUNT(*) FROM students st WHERE st.school_id = s.id),
    (SELECT COUNT(*) FROM students st WHERE st.school_id = s.id AND st.active = TRUE),
    (SELECT COUNT(*) FROM staff_profiles sp WHERE sp.school_id = s.id),
    (SELECT COUNT(*) FROM staff_profiles sp WHERE sp.school_id = s.id AND sp.active = TRUE),
    (SELECT MAX(al.created_at) FROM audit_logs al WHERE al.school_id = s.id),
    CURRENT_TIMESTAMP
FROM schools s;

INSERT INTO tenant_stats (
    tenant_id,
    school_count,
    active_school_count,
    student_count,
    active_student_count,
    staff_count,
    active_staff_count,
    user_count,
    active_user_count,
    updated_at
)
SELECT
    t.id,
    (SELECT COUNT(*) FROM schools s WHERE s.tenant_id = t.id),
    (SELECT COUNT(*) FROM schools s WHERE s.tenant_id = t.id AND s.active = TRUE),
    (SELECT COUNT(*) FROM students st WHERE st.tenant_id = t.id),
    (SELECT COUNT(*) FROM students st WHERE st.tenant_id = t.id AND st.active = TRUE),
    (SELECT COUNT(*) FROM staff_profiles sp WHERE sp.tenant_id = t.id),
    (SELECT COUNT(*) FROM staff_profiles sp WHERE sp.tenant_id = t.id AND sp.active = TRUE),
    (SELECT COUNT(*) FROM user_accounts ua WHERE ua.tenant_id = t.id),
    (SELECT COUNT(*) FROM user_accounts ua WHERE ua.tenant_id = t.id AND ua.status = 'ACTIVE'),
    CURRENT_TIMESTAMP
FROM tenants t;

INSERT INTO platform_stats (
    id,
    total_tenant_count,
    active_tenant_count,
    total_school_count,
    active_school_count,
    total_student_count,
    active_student_count,
    total_staff_count,
    active_staff_count,
    total_user_count,
    active_user_count,
    pending_invoice_count,
    overdue_invoice_count,
    paid_invoice_count,
    failed_notification_count,
    pending_outbox_count,
    pending_report_export_count,
    last_calculated_at
)
SELECT
    'platform',
    (SELECT COUNT(*) FROM tenants),
    (SELECT COUNT(*) FROM tenants WHERE status = 'ACTIVE'),
    (SELECT COUNT(*) FROM schools),
    (SELECT COUNT(*) FROM schools WHERE active = TRUE),
    (SELECT COUNT(*) FROM students),
    (SELECT COUNT(*) FROM students WHERE active = TRUE),
    (SELECT COUNT(*) FROM staff_profiles),
    (SELECT COUNT(*) FROM staff_profiles WHERE active = TRUE),
    (SELECT COUNT(*) FROM user_accounts),
    (SELECT COUNT(*) FROM user_accounts WHERE status = 'ACTIVE'),
    (SELECT COUNT(*) FROM tenant_invoices WHERE status IN ('ISSUED', 'PENDING')),
    (SELECT COUNT(*) FROM tenant_invoices WHERE status IN ('ISSUED', 'PENDING', 'OVERDUE') AND due_at IS NOT NULL AND due_at < CURRENT_TIMESTAMP),
    (SELECT COUNT(*) FROM tenant_invoices WHERE status = 'PAID'),
    (SELECT COUNT(*) FROM notification_deliveries WHERE status = 'FAILED'),
    (SELECT COUNT(*) FROM outbox_events WHERE status = 'PENDING'),
    (SELECT COUNT(*) FROM bulk_jobs WHERE job_type = 'REPORT_EXPORT' AND status IN ('QUEUED', 'VALIDATING', 'PROCESSING')),
    CURRENT_TIMESTAMP;

INSERT INTO platform_settings (
    id,
    platform_name,
    support_email,
    default_timezone,
    maintenance_mode,
    updated_by_user_id,
    updated_at
) VALUES (
    'platform',
    'CloudCampus',
    'support@cloudcampus.dev',
    'UTC',
    FALSE,
    NULL,
    CURRENT_TIMESTAMP
);

ALTER TABLE bulk_jobs ALTER COLUMN school_id DROP NOT NULL;
ALTER TABLE report_export_jobs ALTER COLUMN school_id DROP NOT NULL;
ALTER TABLE report_export_files ALTER COLUMN school_id DROP NOT NULL;

CREATE INDEX idx_tenant_stats_updated_at ON tenant_stats(updated_at);
CREATE INDEX idx_school_stats_tenant_id ON school_stats(tenant_id);
CREATE INDEX idx_school_stats_updated_at ON school_stats(updated_at);

CREATE INDEX idx_students_tenant_status ON students(tenant_id, active);
CREATE INDEX idx_students_school_status ON students(school_id, active);
CREATE INDEX idx_students_tenant_school_status ON students(tenant_id, school_id, active);
CREATE INDEX idx_students_created_at ON students(created_at);
CREATE INDEX idx_students_search_school_name_admission ON students(school_id, full_name, admission_number);

CREATE INDEX idx_staff_profiles_tenant_status ON staff_profiles(tenant_id, active);
CREATE INDEX idx_staff_profiles_school_status ON staff_profiles(school_id, active);
CREATE INDEX idx_staff_profiles_tenant_school_status ON staff_profiles(tenant_id, school_id, active);

CREATE INDEX idx_user_accounts_tenant_role_status ON user_accounts(tenant_id, role, status);
CREATE INDEX idx_user_accounts_email ON user_accounts(email);
CREATE INDEX idx_user_accounts_status ON user_accounts(status);
CREATE INDEX idx_user_accounts_created_at ON user_accounts(created_at);

CREATE INDEX idx_schools_tenant_status ON schools(tenant_id, active);
CREATE INDEX idx_schools_code ON schools(code);
CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_schools_created_at ON schools(created_at);

CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_name ON tenants(name);
CREATE INDEX idx_tenants_created_at ON tenants(created_at);

CREATE INDEX idx_audit_logs_created_desc ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_tenant_created_desc ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_school_created_desc ON audit_logs(school_id, created_at DESC);
CREATE INDEX idx_audit_logs_action_created_desc ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_actor_created_desc ON audit_logs(actor_type, created_at DESC);

CREATE INDEX idx_tenant_invoices_status_due ON tenant_invoices(status, due_at);
CREATE INDEX idx_tenant_invoices_tenant_issued_desc ON tenant_invoices(tenant_id, issued_at DESC);
CREATE INDEX idx_tenant_invoices_status_issued_desc ON tenant_invoices(status, issued_at DESC);

CREATE INDEX idx_notification_deliveries_status_created_desc ON notification_deliveries(status, created_at DESC);
CREATE INDEX idx_notification_deliveries_channel_created_desc ON notification_deliveries(channel, created_at DESC);
CREATE INDEX idx_notification_deliveries_tenant_created_desc ON notification_deliveries(tenant_id, created_at DESC);

CREATE INDEX idx_report_export_jobs_tenant_requested_desc ON report_export_jobs(tenant_id, requested_at DESC);
CREATE INDEX idx_report_export_jobs_requested_by_created_desc ON report_export_jobs(requested_by_user_id, requested_at DESC);
CREATE INDEX idx_report_export_jobs_type_requested_desc ON report_export_jobs(report_type, requested_at DESC);
CREATE INDEX idx_report_export_jobs_bulk_requested_desc ON report_export_jobs(bulk_job_id, requested_at DESC);
CREATE INDEX idx_bulk_jobs_report_export_status_requested ON bulk_jobs(job_type, status, requested_at);

CREATE INDEX idx_ai_request_audits_tenant_created_desc ON ai_request_audits(tenant_id, created_at DESC);
CREATE INDEX idx_ai_request_audits_status_created_desc ON ai_request_audits(status, created_at DESC);
CREATE INDEX idx_ai_request_audits_feature_created_desc ON ai_request_audits(feature, created_at DESC);
