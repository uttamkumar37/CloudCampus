CREATE TABLE permissions (
    id VARCHAR(120) PRIMARY KEY,
    code VARCHAR(120) NOT NULL,
    name VARCHAR(180) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(40) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    scope_type VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_permissions_code UNIQUE (code)
);

CREATE TABLE role_permissions (
    id VARCHAR(180) PRIMARY KEY,
    role VARCHAR(40) NOT NULL,
    permission_code VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_code) REFERENCES permissions(code),
    CONSTRAINT uk_role_permissions_role_code UNIQUE (role, permission_code)
);

CREATE TABLE user_roles (
    id VARCHAR(80) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(40) NOT NULL,
    tenant_id VARCHAR(36),
    school_id VARCHAR(36),
    scope_type VARCHAR(30) NOT NULL,
    scope_id VARCHAR(36),
    active BOOLEAN NOT NULL,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    reason VARCHAR(500),
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES user_accounts(id),
    CONSTRAINT fk_user_roles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_user_roles_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_user_roles_created_by FOREIGN KEY (created_by) REFERENCES user_accounts(id),
    CONSTRAINT fk_user_roles_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(id)
);

CREATE TABLE user_permission_overrides (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    permission_code VARCHAR(120) NOT NULL,
    allowed BOOLEAN NOT NULL,
    tenant_id VARCHAR(36),
    school_id VARCHAR(36),
    scope_type VARCHAR(30) NOT NULL,
    scope_id VARCHAR(36),
    reason VARCHAR(500),
    active BOOLEAN NOT NULL,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_permission_overrides_user FOREIGN KEY (user_id) REFERENCES user_accounts(id),
    CONSTRAINT fk_permission_overrides_permission FOREIGN KEY (permission_code) REFERENCES permissions(code),
    CONSTRAINT fk_permission_overrides_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_permission_overrides_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_permission_overrides_created_by FOREIGN KEY (created_by) REFERENCES user_accounts(id),
    CONSTRAINT fk_permission_overrides_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(id)
);

ALTER TABLE teacher_assignments ADD COLUMN academic_year_id VARCHAR(36);
ALTER TABLE teacher_assignments ADD COLUMN class_id VARCHAR(36);
ALTER TABLE teacher_assignments ADD COLUMN section_id VARCHAR(36);
ALTER TABLE teacher_assignments ADD COLUMN subject_id VARCHAR(36);
ALTER TABLE teacher_assignments ADD COLUMN role_type VARCHAR(40);
ALTER TABLE teacher_assignments ADD COLUMN updated_at TIMESTAMP;
ALTER TABLE teacher_assignments ADD COLUMN updated_by VARCHAR(36);

UPDATE teacher_assignments
SET class_id = (
    SELECT class_level_id FROM class_subject_assignments
    WHERE class_subject_assignments.id = teacher_assignments.class_subject_assignment_id
);

UPDATE teacher_assignments
SET subject_id = (
    SELECT subject_id FROM class_subject_assignments
    WHERE class_subject_assignments.id = teacher_assignments.class_subject_assignment_id
);

UPDATE teacher_assignments SET role_type = 'SUBJECT_TEACHER' WHERE role_type IS NULL;
UPDATE teacher_assignments SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE teacher_assignments ADD CONSTRAINT fk_teacher_assignments_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id);
ALTER TABLE teacher_assignments ADD CONSTRAINT fk_teacher_assignments_class_level FOREIGN KEY (class_id) REFERENCES class_levels(id);
ALTER TABLE teacher_assignments ADD CONSTRAINT fk_teacher_assignments_section FOREIGN KEY (section_id) REFERENCES sections(id);
ALTER TABLE teacher_assignments ADD CONSTRAINT fk_teacher_assignments_subject FOREIGN KEY (subject_id) REFERENCES subjects(id);
ALTER TABLE teacher_assignments ADD CONSTRAINT fk_teacher_assignments_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(id);

CREATE TABLE student_guardians (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    guardian_user_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    relation VARCHAR(80) NOT NULL,
    contact_email VARCHAR(320),
    contact_mobile VARCHAR(40),
    primary_contact BOOLEAN NOT NULL,
    can_pickup BOOLEAN NOT NULL,
    emergency_contact BOOLEAN NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(36),
    CONSTRAINT fk_student_guardians_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_student_guardians_guardian FOREIGN KEY (guardian_user_id) REFERENCES user_accounts(id),
    CONSTRAINT fk_student_guardians_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_student_guardians_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_student_guardians_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(id),
    CONSTRAINT uk_student_guardians_guardian_student UNIQUE (guardian_user_id, student_id)
);

CREATE TABLE student_user_links (
    id VARCHAR(80) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(36),
    CONSTRAINT fk_student_user_links_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_student_user_links_user FOREIGN KEY (user_id) REFERENCES user_accounts(id),
    CONSTRAINT fk_student_user_links_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_student_user_links_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_student_user_links_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(id),
    CONSTRAINT uk_student_user_links_student_user UNIQUE (student_id, user_id)
);

CREATE TABLE ai_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36),
    target_type VARCHAR(80) NOT NULL,
    target_id VARCHAR(36),
    recommendation_type VARCHAR(80) NOT NULL,
    title VARCHAR(220) NOT NULL,
    summary VARCHAR(1000) NOT NULL,
    rationale VARCHAR(2000),
    confidence_score DECIMAL(5, 4),
    risk_level VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_by_actor_type VARCHAR(40) NOT NULL,
    created_by_actor_id VARCHAR(36),
    assigned_to_user_id VARCHAR(36),
    approval_required BOOLEAN NOT NULL,
    approved_by VARCHAR(36),
    approved_at TIMESTAMP,
    rejected_by VARCHAR(36),
    rejected_at TIMESTAMP,
    rejection_reason VARCHAR(500),
    executed_by_actor_type VARCHAR(40),
    executed_by_actor_id VARCHAR(36),
    executed_at TIMESTAMP,
    failure_reason VARCHAR(500),
    expires_at TIMESTAMP,
    source_usage_audit_id VARCHAR(36),
    metadata_json TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_ai_recommendations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_ai_recommendations_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_ai_recommendations_assigned_to FOREIGN KEY (assigned_to_user_id) REFERENCES user_accounts(id),
    CONSTRAINT fk_ai_recommendations_approved_by FOREIGN KEY (approved_by) REFERENCES user_accounts(id),
    CONSTRAINT fk_ai_recommendations_rejected_by FOREIGN KEY (rejected_by) REFERENCES user_accounts(id),
    CONSTRAINT fk_ai_recommendations_usage_audit FOREIGN KEY (source_usage_audit_id) REFERENCES ai_request_audits(id)
);

CREATE TABLE automation_rules (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36),
    school_id VARCHAR(36),
    code VARCHAR(120) NOT NULL,
    name VARCHAR(180) NOT NULL,
    description VARCHAR(500),
    trigger_type VARCHAR(80) NOT NULL,
    trigger_config_json TEXT NOT NULL,
    action_type VARCHAR(80) NOT NULL,
    action_config_json TEXT NOT NULL,
    enabled BOOLEAN NOT NULL,
    requires_approval BOOLEAN NOT NULL,
    approval_role VARCHAR(40),
    risk_level VARCHAR(20) NOT NULL,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_automation_rules_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_automation_rules_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_automation_rules_created_by FOREIGN KEY (created_by) REFERENCES user_accounts(id),
    CONSTRAINT fk_automation_rules_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(id),
    CONSTRAINT uk_automation_rules_code_scope UNIQUE (code, tenant_id, school_id)
);

CREATE TABLE automation_runs (
    id VARCHAR(36) PRIMARY KEY,
    automation_rule_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36),
    school_id VARCHAR(36),
    status VARCHAR(30) NOT NULL,
    triggered_by_actor_type VARCHAR(40) NOT NULL,
    triggered_by_actor_id VARCHAR(36),
    input_summary_json TEXT NOT NULL,
    output_summary_json TEXT NOT NULL,
    error_message VARCHAR(500),
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_automation_runs_rule FOREIGN KEY (automation_rule_id) REFERENCES automation_rules(id),
    CONSTRAINT fk_automation_runs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_automation_runs_school FOREIGN KEY (school_id) REFERENCES schools(id)
);

CREATE TABLE ai_policies (
    id VARCHAR(80) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36),
    enabled BOOLEAN NOT NULL,
    allowed_features_json TEXT NOT NULL,
    monthly_budget_units BIGINT NOT NULL,
    human_approval_required_default BOOLEAN NOT NULL,
    allow_low_risk_auto_publish BOOLEAN NOT NULL,
    allow_fee_reminder_auto_send BOOLEAN NOT NULL,
    allow_parent_message_auto_send BOOLEAN NOT NULL,
    retention_days INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(36),
    CONSTRAINT fk_ai_policies_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_ai_policies_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_ai_policies_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(id),
    CONSTRAINT uk_ai_policies_scope UNIQUE (tenant_id, school_id)
);

INSERT INTO permissions (id, code, name, description, category, risk_level, scope_type, active, created_at, updated_at) VALUES
('MANAGE_PLATFORM','MANAGE_PLATFORM','Manage platform','Manage platform control-plane resources.','PLATFORM','CRITICAL','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_TENANTS','MANAGE_TENANTS','Manage tenants','Create and administer tenant organizations.','PLATFORM','CRITICAL','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_SCHOOLS_PLATFORM','MANAGE_SCHOOLS_PLATFORM','Manage platform schools','View and administer schools across tenants.','PLATFORM','HIGH','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_SUBSCRIPTION_PLANS','MANAGE_SUBSCRIPTION_PLANS','Manage subscription plans','Create and update subscription plan catalog.','PLATFORM','HIGH','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_TENANT_SUBSCRIPTIONS','MANAGE_TENANT_SUBSCRIPTIONS','Manage tenant subscriptions','Assign and update tenant subscriptions.','PLATFORM','HIGH','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_PLATFORM_REVENUE','VIEW_PLATFORM_REVENUE','View platform revenue','View revenue and invoice summaries.','PLATFORM','HIGH','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_PLATFORM_AUDIT','VIEW_PLATFORM_AUDIT','View platform audit','View platform audit logs.','PLATFORM','HIGH','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_PLATFORM_HEALTH','VIEW_PLATFORM_HEALTH','View platform health','View system readiness and background work status.','PLATFORM','MEDIUM','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_PLATFORM_SETTINGS','MANAGE_PLATFORM_SETTINGS','Manage platform settings','Update safe platform settings.','PLATFORM','CRITICAL','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_PLATFORM_NOTIFICATIONS','MANAGE_PLATFORM_NOTIFICATIONS','Manage platform notifications','View and manage platform notification delivery.','PLATFORM','HIGH','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_PLATFORM_REPORTS','MANAGE_PLATFORM_REPORTS','Manage platform reports','Request and manage platform reports.','PLATFORM','HIGH','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('EXPORT_PLATFORM_REPORTS','EXPORT_PLATFORM_REPORTS','Export platform reports','Export platform-wide report data.','PLATFORM','HIGH','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_TENANT_DASHBOARD','VIEW_TENANT_DASHBOARD','View tenant dashboard','View tenant dashboard and rollups.','TENANT','LOW','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_TENANT','MANAGE_TENANT','Manage tenant','Manage tenant-level business data.','TENANT','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_TENANT_SETTINGS','MANAGE_TENANT_SETTINGS','Manage tenant settings','Update tenant settings.','TENANT','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_TENANT_USERS','MANAGE_TENANT_USERS','Manage tenant users','Manage tenant users and admin assignments.','TENANT','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_TENANT_SCHOOLS','MANAGE_TENANT_SCHOOLS','Manage tenant schools','Create and manage schools under tenant.','TENANT','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_TENANT_REPORTS','VIEW_TENANT_REPORTS','View tenant reports','View tenant-level reports.','TENANT','MEDIUM','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('EXPORT_TENANT_REPORTS','EXPORT_TENANT_REPORTS','Export tenant reports','Export tenant-level reports.','TENANT','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_TENANT_AUDIT','VIEW_TENANT_AUDIT','View tenant audit','View tenant audit events.','TENANT','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_TENANT_AI_POLICY','MANAGE_TENANT_AI_POLICY','Manage tenant AI policy','Configure tenant AI policy when allowed.','TENANT','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_SCHOOL_DASHBOARD','VIEW_SCHOOL_DASHBOARD','View school dashboard','View assigned school dashboard.','SCHOOL','LOW','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_SCHOOL','MANAGE_SCHOOL','Manage school','Manage school operations.','SCHOOL','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_SCHOOL_SETTINGS','MANAGE_SCHOOL_SETTINGS','Manage school settings','Update school settings.','SCHOOL','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_SCHOOL_USERS','MANAGE_SCHOOL_USERS','Manage school users','Manage users assigned to a school.','SCHOOL','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_CLASSES','MANAGE_CLASSES','Manage classes','Create and update classes.','SCHOOL','MEDIUM','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_SECTIONS','MANAGE_SECTIONS','Manage sections','Create and update sections.','SCHOOL','MEDIUM','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_SUBJECTS','MANAGE_SUBJECTS','Manage subjects','Create and update subjects.','SCHOOL','MEDIUM','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_TIMETABLE','MANAGE_TIMETABLE','Manage timetable','Create and update timetables.','SCHOOL','MEDIUM','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('SEND_SCHOOL_NOTICES','SEND_SCHOOL_NOTICES','Send school notices','Publish notices for a school.','SCHOOL','MEDIUM','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_ACADEMIC_DATA','VIEW_ACADEMIC_DATA','View academic data','View scoped academic data.','ACADEMIC','LOW','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_ATTENDANCE','MANAGE_ATTENDANCE','Manage attendance','Manage attendance sessions and corrections.','ACADEMIC','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('ENTER_ATTENDANCE','ENTER_ATTENDANCE','Enter attendance','Enter attendance for assigned class/section.','ACADEMIC','MEDIUM','CLASS',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('CORRECT_ATTENDANCE','CORRECT_ATTENDANCE','Correct attendance','Correct submitted attendance.','ACADEMIC','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_HOMEWORK','MANAGE_HOMEWORK','Manage homework','Create and manage homework.','ACADEMIC','MEDIUM','CLASS',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_ASSIGNMENTS','MANAGE_ASSIGNMENTS','Manage assignments','Create and manage assignments.','ACADEMIC','MEDIUM','CLASS',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('ENTER_MARKS','ENTER_MARKS','Enter marks','Enter marks for assigned subject/class.','ACADEMIC','HIGH','CLASS',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('EDIT_MARKS','EDIT_MARKS','Edit marks','Edit recorded marks.','ACADEMIC','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('APPROVE_MARKS','APPROVE_MARKS','Approve marks','Approve marks/results.','ACADEMIC','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_EXAMS','MANAGE_EXAMS','Manage exams','Create and manage exams.','ACADEMIC','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('APPROVE_RESULTS','APPROVE_RESULTS','Approve results','Approve final result publication.','ACADEMIC','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_STUDENT_PERFORMANCE','VIEW_STUDENT_PERFORMANCE','View student performance','View scoped student academic performance.','ACADEMIC','MEDIUM','STUDENT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_PROMOTIONS','MANAGE_PROMOTIONS','Manage promotions','Manage student promotions.','ACADEMIC','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_DISCIPLINE','MANAGE_DISCIPLINE','Manage discipline','Manage discipline cases.','ACADEMIC','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_OWN_PROFILE','VIEW_OWN_PROFILE','View own profile','View own student/user profile.','STUDENT_PARENT','LOW','SELF',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_OWN_ATTENDANCE','VIEW_OWN_ATTENDANCE','View own attendance','View own attendance.','STUDENT_PARENT','LOW','SELF',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_OWN_HOMEWORK','VIEW_OWN_HOMEWORK','View own homework','View own homework.','STUDENT_PARENT','LOW','SELF',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_OWN_RESULTS','VIEW_OWN_RESULTS','View own results','View own results.','STUDENT_PARENT','LOW','SELF',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_CHILD_PROFILE','VIEW_CHILD_PROFILE','View child profile','View linked child profile.','STUDENT_PARENT','LOW','STUDENT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_CHILD_ATTENDANCE','VIEW_CHILD_ATTENDANCE','View child attendance','View linked child attendance.','STUDENT_PARENT','LOW','STUDENT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_CHILD_HOMEWORK','VIEW_CHILD_HOMEWORK','View child homework','View linked child homework.','STUDENT_PARENT','LOW','STUDENT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_CHILD_RESULTS','VIEW_CHILD_RESULTS','View child results','View linked child results.','STUDENT_PARENT','LOW','STUDENT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_CHILD_FEES','VIEW_CHILD_FEES','View child fees','View linked child fee dues/history.','STUDENT_PARENT','MEDIUM','STUDENT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('SEND_PARENT_MESSAGE','SEND_PARENT_MESSAGE','Send parent message','Send parent-school messages.','STUDENT_PARENT','MEDIUM','STUDENT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_FINANCE_DASHBOARD','VIEW_FINANCE_DASHBOARD','View finance dashboard','View finance dashboard.','FINANCE','MEDIUM','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_FEE_STRUCTURE','MANAGE_FEE_STRUCTURE','Manage fee structure','Create and update fee structures.','FINANCE','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('ISSUE_INVOICES','ISSUE_INVOICES','Issue invoices','Issue fee invoices/demands.','FINANCE','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('RECORD_PAYMENTS','RECORD_PAYMENTS','Record payments','Record payments and receipts.','FINANCE','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_DISCOUNTS','MANAGE_DISCOUNTS','Manage discounts','Manage discounts/concessions.','FINANCE','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_REFUNDS','MANAGE_REFUNDS','Manage refunds','Manage or approve refunds.','FINANCE','CRITICAL','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_FINANCE_REPORTS','VIEW_FINANCE_REPORTS','View finance reports','View finance reports.','FINANCE','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('EXPORT_FINANCE_REPORTS','EXPORT_FINANCE_REPORTS','Export finance reports','Export finance reports.','FINANCE','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('SEND_FEE_REMINDERS','SEND_FEE_REMINDERS','Send fee reminders','Send fee reminders.','FINANCE','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_ADMISSIONS','MANAGE_ADMISSIONS','Manage admissions','Manage admission applications.','OFFICE','MEDIUM','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_ENQUIRIES','MANAGE_ENQUIRIES','Manage enquiries','Manage admission enquiries.','OFFICE','LOW','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_STUDENT_DOCUMENTS','MANAGE_STUDENT_DOCUMENTS','Manage student documents','Manage student documents.','OFFICE','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('ISSUE_CERTIFICATES','ISSUE_CERTIFICATES','Issue certificates','Issue school certificates.','OFFICE','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_ID_CARDS','MANAGE_ID_CARDS','Manage ID cards','Manage student ID cards.','OFFICE','MEDIUM','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_TRANSFER_CERTIFICATES','MANAGE_TRANSFER_CERTIFICATES','Manage transfer certificates','Manage transfer certificates.','OFFICE','HIGH','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_VISITORS','MANAGE_VISITORS','Manage visitors','Manage visitor records.','OFFICE','MEDIUM','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('SEND_NOTICES','SEND_NOTICES','Send notices','Send notices.','COMMUNICATION','MEDIUM','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('SEND_MESSAGES','SEND_MESSAGES','Send messages','Send scoped messages.','COMMUNICATION','MEDIUM','SCHOOL',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_NOTIFICATIONS','VIEW_NOTIFICATIONS','View notifications','View notifications.','COMMUNICATION','LOW','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_NOTIFICATION_TEMPLATES','MANAGE_NOTIFICATION_TEMPLATES','Manage notification templates','Manage notification templates.','COMMUNICATION','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('RETRY_NOTIFICATIONS','RETRY_NOTIFICATIONS','Retry notifications','Retry failed notifications.','COMMUNICATION','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_AI_RECOMMENDATIONS','VIEW_AI_RECOMMENDATIONS','View AI recommendations','View scoped AI recommendations.','AI','MEDIUM','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('CREATE_AI_RECOMMENDATIONS','CREATE_AI_RECOMMENDATIONS','Create AI recommendations','Create AI recommendations and drafts.','AI','MEDIUM','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('APPROVE_AI_RECOMMENDATIONS','APPROVE_AI_RECOMMENDATIONS','Approve AI recommendations','Approve scoped AI recommendations.','AI','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('REJECT_AI_RECOMMENDATIONS','REJECT_AI_RECOMMENDATIONS','Reject AI recommendations','Reject scoped AI recommendations.','AI','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('EXECUTE_APPROVED_AI_ACTION','EXECUTE_APPROVED_AI_ACTION','Execute approved AI action','Execute safe approved AI actions.','AI','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_AI_ENTITLEMENTS','MANAGE_AI_ENTITLEMENTS','Manage AI entitlements','Manage platform AI entitlements.','AI','CRITICAL','PLATFORM',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('MANAGE_AI_POLICY','MANAGE_AI_POLICY','Manage AI policy','Manage AI policies.','AI','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('RUN_AI_AUTOMATION','RUN_AI_AUTOMATION','Run AI automation','Run AI automation rules.','AI','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_AI_AUDIT','VIEW_AI_AUDIT','View AI audit','View AI audit rows.','AI','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_AI_USAGE','VIEW_AI_USAGE','View AI usage','View AI usage and budget.','AI','MEDIUM','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('CONFIGURE_AI_BUDGET','CONFIGURE_AI_BUDGET','Configure AI budget','Configure AI budget.','AI','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_REPORTS','VIEW_REPORTS','View reports','View scoped reports.','REPORTS','MEDIUM','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('EXPORT_REPORTS','EXPORT_REPORTS','Export reports','Export scoped reports.','REPORTS','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('REQUEST_REPORT_EXPORTS','REQUEST_REPORT_EXPORTS','Request report exports','Request async exports.','REPORTS','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('DOWNLOAD_REPORT_EXPORTS','DOWNLOAD_REPORT_EXPORTS','Download report exports','Download completed exports.','REPORTS','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_EXPORT_JOBS','VIEW_EXPORT_JOBS','View export jobs','View report export jobs.','REPORTS','MEDIUM','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_AUDIT_LOGS','VIEW_AUDIT_LOGS','View audit logs','View audit logs.','AUDIT','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('VIEW_SECURITY_EVENTS','VIEW_SECURITY_EVENTS','View security events','View security and auth events.','AUDIT','HIGH','TENANT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO role_permissions (id, role, permission_code, created_at)
SELECT 'SUPER_ADMIN:' || code, 'SUPER_ADMIN', code, CURRENT_TIMESTAMP FROM permissions
WHERE category IN ('PLATFORM','AI','AUDIT','REPORTS','COMMUNICATION');

INSERT INTO role_permissions (id, role, permission_code, created_at) VALUES
('TENANT_ADMIN:VIEW_TENANT_DASHBOARD','TENANT_ADMIN','VIEW_TENANT_DASHBOARD',CURRENT_TIMESTAMP),
('TENANT_ADMIN:MANAGE_TENANT','TENANT_ADMIN','MANAGE_TENANT',CURRENT_TIMESTAMP),
('TENANT_ADMIN:MANAGE_TENANT_SETTINGS','TENANT_ADMIN','MANAGE_TENANT_SETTINGS',CURRENT_TIMESTAMP),
('TENANT_ADMIN:MANAGE_TENANT_USERS','TENANT_ADMIN','MANAGE_TENANT_USERS',CURRENT_TIMESTAMP),
('TENANT_ADMIN:MANAGE_TENANT_SCHOOLS','TENANT_ADMIN','MANAGE_TENANT_SCHOOLS',CURRENT_TIMESTAMP),
('TENANT_ADMIN:VIEW_TENANT_REPORTS','TENANT_ADMIN','VIEW_TENANT_REPORTS',CURRENT_TIMESTAMP),
('TENANT_ADMIN:EXPORT_TENANT_REPORTS','TENANT_ADMIN','EXPORT_TENANT_REPORTS',CURRENT_TIMESTAMP),
('TENANT_ADMIN:VIEW_TENANT_AUDIT','TENANT_ADMIN','VIEW_TENANT_AUDIT',CURRENT_TIMESTAMP),
('TENANT_ADMIN:MANAGE_TENANT_AI_POLICY','TENANT_ADMIN','MANAGE_TENANT_AI_POLICY',CURRENT_TIMESTAMP),
('TENANT_ADMIN:VIEW_AI_RECOMMENDATIONS','TENANT_ADMIN','VIEW_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('TENANT_ADMIN:APPROVE_AI_RECOMMENDATIONS','TENANT_ADMIN','APPROVE_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('TENANT_ADMIN:REJECT_AI_RECOMMENDATIONS','TENANT_ADMIN','REJECT_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('TENANT_ADMIN:MANAGE_AI_POLICY','TENANT_ADMIN','MANAGE_AI_POLICY',CURRENT_TIMESTAMP),
('TENANT_ADMIN:VIEW_AI_USAGE','TENANT_ADMIN','VIEW_AI_USAGE',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:VIEW_SCHOOL_DASHBOARD','SCHOOL_ADMIN','VIEW_SCHOOL_DASHBOARD',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:MANAGE_SCHOOL','SCHOOL_ADMIN','MANAGE_SCHOOL',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:MANAGE_SCHOOL_SETTINGS','SCHOOL_ADMIN','MANAGE_SCHOOL_SETTINGS',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:MANAGE_SCHOOL_USERS','SCHOOL_ADMIN','MANAGE_SCHOOL_USERS',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:MANAGE_CLASSES','SCHOOL_ADMIN','MANAGE_CLASSES',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:MANAGE_SECTIONS','SCHOOL_ADMIN','MANAGE_SECTIONS',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:MANAGE_SUBJECTS','SCHOOL_ADMIN','MANAGE_SUBJECTS',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:MANAGE_TIMETABLE','SCHOOL_ADMIN','MANAGE_TIMETABLE',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:SEND_SCHOOL_NOTICES','SCHOOL_ADMIN','SEND_SCHOOL_NOTICES',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:VIEW_REPORTS','SCHOOL_ADMIN','VIEW_REPORTS',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:EXPORT_REPORTS','SCHOOL_ADMIN','EXPORT_REPORTS',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:VIEW_AI_RECOMMENDATIONS','SCHOOL_ADMIN','VIEW_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:APPROVE_AI_RECOMMENDATIONS','SCHOOL_ADMIN','APPROVE_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:REJECT_AI_RECOMMENDATIONS','SCHOOL_ADMIN','REJECT_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('SCHOOL_ADMIN:MANAGE_AI_POLICY','SCHOOL_ADMIN','MANAGE_AI_POLICY',CURRENT_TIMESTAMP),
('PRINCIPAL:VIEW_SCHOOL_DASHBOARD','PRINCIPAL','VIEW_SCHOOL_DASHBOARD',CURRENT_TIMESTAMP),
('PRINCIPAL:VIEW_ACADEMIC_DATA','PRINCIPAL','VIEW_ACADEMIC_DATA',CURRENT_TIMESTAMP),
('PRINCIPAL:MANAGE_TIMETABLE','PRINCIPAL','MANAGE_TIMETABLE',CURRENT_TIMESTAMP),
('PRINCIPAL:MANAGE_EXAMS','PRINCIPAL','MANAGE_EXAMS',CURRENT_TIMESTAMP),
('PRINCIPAL:APPROVE_MARKS','PRINCIPAL','APPROVE_MARKS',CURRENT_TIMESTAMP),
('PRINCIPAL:APPROVE_RESULTS','PRINCIPAL','APPROVE_RESULTS',CURRENT_TIMESTAMP),
('PRINCIPAL:VIEW_STUDENT_PERFORMANCE','PRINCIPAL','VIEW_STUDENT_PERFORMANCE',CURRENT_TIMESTAMP),
('PRINCIPAL:MANAGE_PROMOTIONS','PRINCIPAL','MANAGE_PROMOTIONS',CURRENT_TIMESTAMP),
('PRINCIPAL:MANAGE_DISCIPLINE','PRINCIPAL','MANAGE_DISCIPLINE',CURRENT_TIMESTAMP),
('PRINCIPAL:VIEW_AI_RECOMMENDATIONS','PRINCIPAL','VIEW_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('PRINCIPAL:APPROVE_AI_RECOMMENDATIONS','PRINCIPAL','APPROVE_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('PRINCIPAL:REJECT_AI_RECOMMENDATIONS','PRINCIPAL','REJECT_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('TEACHER:VIEW_SCHOOL_DASHBOARD','TEACHER','VIEW_SCHOOL_DASHBOARD',CURRENT_TIMESTAMP),
('TEACHER:VIEW_ACADEMIC_DATA','TEACHER','VIEW_ACADEMIC_DATA',CURRENT_TIMESTAMP),
('TEACHER:ENTER_ATTENDANCE','TEACHER','ENTER_ATTENDANCE',CURRENT_TIMESTAMP),
('TEACHER:MANAGE_HOMEWORK','TEACHER','MANAGE_HOMEWORK',CURRENT_TIMESTAMP),
('TEACHER:MANAGE_ASSIGNMENTS','TEACHER','MANAGE_ASSIGNMENTS',CURRENT_TIMESTAMP),
('TEACHER:ENTER_MARKS','TEACHER','ENTER_MARKS',CURRENT_TIMESTAMP),
('TEACHER:VIEW_STUDENT_PERFORMANCE','TEACHER','VIEW_STUDENT_PERFORMANCE',CURRENT_TIMESTAMP),
('TEACHER:VIEW_AI_RECOMMENDATIONS','TEACHER','VIEW_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('TEACHER:CREATE_AI_RECOMMENDATIONS','TEACHER','CREATE_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('STUDENT:VIEW_OWN_PROFILE','STUDENT','VIEW_OWN_PROFILE',CURRENT_TIMESTAMP),
('STUDENT:VIEW_OWN_ATTENDANCE','STUDENT','VIEW_OWN_ATTENDANCE',CURRENT_TIMESTAMP),
('STUDENT:VIEW_OWN_HOMEWORK','STUDENT','VIEW_OWN_HOMEWORK',CURRENT_TIMESTAMP),
('STUDENT:VIEW_OWN_RESULTS','STUDENT','VIEW_OWN_RESULTS',CURRENT_TIMESTAMP),
('STUDENT:VIEW_AI_RECOMMENDATIONS','STUDENT','VIEW_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('PARENT:VIEW_CHILD_PROFILE','PARENT','VIEW_CHILD_PROFILE',CURRENT_TIMESTAMP),
('PARENT:VIEW_CHILD_ATTENDANCE','PARENT','VIEW_CHILD_ATTENDANCE',CURRENT_TIMESTAMP),
('PARENT:VIEW_CHILD_HOMEWORK','PARENT','VIEW_CHILD_HOMEWORK',CURRENT_TIMESTAMP),
('PARENT:VIEW_CHILD_RESULTS','PARENT','VIEW_CHILD_RESULTS',CURRENT_TIMESTAMP),
('PARENT:VIEW_CHILD_FEES','PARENT','VIEW_CHILD_FEES',CURRENT_TIMESTAMP),
('PARENT:SEND_PARENT_MESSAGE','PARENT','SEND_PARENT_MESSAGE',CURRENT_TIMESTAMP),
('PARENT:VIEW_AI_RECOMMENDATIONS','PARENT','VIEW_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('FINANCE_STAFF:VIEW_FINANCE_DASHBOARD','FINANCE_STAFF','VIEW_FINANCE_DASHBOARD',CURRENT_TIMESTAMP),
('FINANCE_STAFF:MANAGE_FEE_STRUCTURE','FINANCE_STAFF','MANAGE_FEE_STRUCTURE',CURRENT_TIMESTAMP),
('FINANCE_STAFF:ISSUE_INVOICES','FINANCE_STAFF','ISSUE_INVOICES',CURRENT_TIMESTAMP),
('FINANCE_STAFF:RECORD_PAYMENTS','FINANCE_STAFF','RECORD_PAYMENTS',CURRENT_TIMESTAMP),
('FINANCE_STAFF:MANAGE_DISCOUNTS','FINANCE_STAFF','MANAGE_DISCOUNTS',CURRENT_TIMESTAMP),
('FINANCE_STAFF:VIEW_FINANCE_REPORTS','FINANCE_STAFF','VIEW_FINANCE_REPORTS',CURRENT_TIMESTAMP),
('FINANCE_STAFF:EXPORT_FINANCE_REPORTS','FINANCE_STAFF','EXPORT_FINANCE_REPORTS',CURRENT_TIMESTAMP),
('FINANCE_STAFF:SEND_FEE_REMINDERS','FINANCE_STAFF','SEND_FEE_REMINDERS',CURRENT_TIMESTAMP),
('FINANCE_STAFF:VIEW_AI_RECOMMENDATIONS','FINANCE_STAFF','VIEW_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('FINANCE_STAFF:APPROVE_AI_RECOMMENDATIONS','FINANCE_STAFF','APPROVE_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('OFFICE_STAFF:VIEW_SCHOOL_DASHBOARD','OFFICE_STAFF','VIEW_SCHOOL_DASHBOARD',CURRENT_TIMESTAMP),
('OFFICE_STAFF:MANAGE_ADMISSIONS','OFFICE_STAFF','MANAGE_ADMISSIONS',CURRENT_TIMESTAMP),
('OFFICE_STAFF:MANAGE_ENQUIRIES','OFFICE_STAFF','MANAGE_ENQUIRIES',CURRENT_TIMESTAMP),
('OFFICE_STAFF:MANAGE_STUDENT_DOCUMENTS','OFFICE_STAFF','MANAGE_STUDENT_DOCUMENTS',CURRENT_TIMESTAMP),
('OFFICE_STAFF:ISSUE_CERTIFICATES','OFFICE_STAFF','ISSUE_CERTIFICATES',CURRENT_TIMESTAMP),
('OFFICE_STAFF:MANAGE_ID_CARDS','OFFICE_STAFF','MANAGE_ID_CARDS',CURRENT_TIMESTAMP),
('OFFICE_STAFF:MANAGE_TRANSFER_CERTIFICATES','OFFICE_STAFF','MANAGE_TRANSFER_CERTIFICATES',CURRENT_TIMESTAMP),
('OFFICE_STAFF:MANAGE_VISITORS','OFFICE_STAFF','MANAGE_VISITORS',CURRENT_TIMESTAMP),
('OFFICE_STAFF:VIEW_AI_RECOMMENDATIONS','OFFICE_STAFF','VIEW_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP),
('GUEST:MANAGE_ENQUIRIES','GUEST','MANAGE_ENQUIRIES',CURRENT_TIMESTAMP),
('SYSTEM:RUN_AI_AUTOMATION','SYSTEM','RUN_AI_AUTOMATION',CURRENT_TIMESTAMP),
('SYSTEM:REQUEST_REPORT_EXPORTS','SYSTEM','REQUEST_REPORT_EXPORTS',CURRENT_TIMESTAMP),
('AI_AGENT:CREATE_AI_RECOMMENDATIONS','AI_AGENT','CREATE_AI_RECOMMENDATIONS',CURRENT_TIMESTAMP);

INSERT INTO user_roles (
    id, user_id, role, tenant_id, school_id, scope_type, scope_id, active,
    starts_at, expires_at, reason, created_by, updated_by, created_at, updated_at
)
SELECT
    user_accounts.id || '-primary-role',
    user_accounts.id,
    user_accounts.role,
    CASE WHEN user_accounts.role = 'SUPER_ADMIN' THEN NULL ELSE user_accounts.tenant_id END,
    NULL,
    CASE
        WHEN user_accounts.role = 'SUPER_ADMIN' THEN 'PLATFORM'
        WHEN user_accounts.role = 'TENANT_ADMIN' THEN 'TENANT'
        ELSE 'TENANT'
    END,
    CASE WHEN user_accounts.role = 'SUPER_ADMIN' THEN NULL ELSE user_accounts.tenant_id END,
    TRUE,
    NULL,
    NULL,
    'Backfilled from user_accounts.role',
    NULL,
    NULL,
    user_accounts.created_at,
    CURRENT_TIMESTAMP
FROM user_accounts;

INSERT INTO user_roles (
    id, user_id, role, tenant_id, school_id, scope_type, scope_id, active,
    starts_at, expires_at, reason, created_by, updated_by, created_at, updated_at
)
SELECT
    user_school_access.id || '-school-role',
    user_school_access.user_id,
    CASE WHEN user_school_access.role = 'STAFF' THEN 'OFFICE_STAFF' ELSE user_school_access.role END,
    user_school_access.tenant_id,
    user_school_access.school_id,
    'SCHOOL',
    user_school_access.school_id,
    TRUE,
    NULL,
    NULL,
    'Backfilled from user_school_access',
    NULL,
    NULL,
    user_school_access.granted_at,
    CURRENT_TIMESTAMP
FROM user_school_access;

INSERT INTO student_guardians (
    id, student_id, guardian_user_id, tenant_id, school_id, relation, contact_email, contact_mobile,
    primary_contact, can_pickup, emergency_contact, active, created_at, updated_at, updated_by
)
SELECT
    parent_student_links.id,
    parent_student_links.student_id,
    parent_student_links.parent_user_id,
    parent_student_links.tenant_id,
    parent_student_links.school_id,
    parent_student_links.relationship,
    parent_student_links.contact_email,
    parent_student_links.contact_mobile,
    parent_student_links.primary_contact,
    parent_student_links.primary_contact,
    parent_student_links.primary_contact,
    TRUE,
    parent_student_links.created_at,
    CURRENT_TIMESTAMP,
    NULL
FROM parent_student_links;

INSERT INTO student_user_links (
    id, student_id, user_id, tenant_id, school_id, active, created_at, updated_at, updated_by
)
SELECT
    students.id || '-user-link',
    students.id,
    students.user_id,
    students.tenant_id,
    students.school_id,
    TRUE,
    students.created_at,
    CURRENT_TIMESTAMP,
    NULL
FROM students
WHERE students.user_id IS NOT NULL;

INSERT INTO ai_policies (
    id, tenant_id, school_id, enabled, allowed_features_json, monthly_budget_units,
    human_approval_required_default, allow_low_risk_auto_publish, allow_fee_reminder_auto_send,
    allow_parent_message_auto_send, retention_days, created_at, updated_at, updated_by
)
SELECT
    ai_tenant_entitlements.tenant_id || '-policy',
    ai_tenant_entitlements.tenant_id,
    NULL,
    ai_tenant_entitlements.enabled,
    ai_tenant_entitlements.enabled_features,
    ai_tenant_entitlements.monthly_unit_budget,
    ai_tenant_entitlements.human_approval_required,
    FALSE,
    FALSE,
    FALSE,
    ai_tenant_entitlements.retention_days,
    ai_tenant_entitlements.created_at,
    ai_tenant_entitlements.updated_at,
    NULL
FROM ai_tenant_entitlements;

CREATE INDEX idx_user_roles_user_active ON user_roles(user_id, active);
CREATE INDEX idx_user_roles_role_active ON user_roles(role, active);
CREATE INDEX idx_user_roles_tenant_role_active ON user_roles(tenant_id, role, active);
CREATE INDEX idx_user_roles_school_role_active ON user_roles(school_id, role, active);
CREATE INDEX idx_user_roles_user_role_scope ON user_roles(user_id, role, tenant_id, school_id);
CREATE INDEX idx_permissions_code ON permissions(code);
CREATE INDEX idx_role_permissions_role_code ON role_permissions(role, permission_code);
CREATE INDEX idx_permission_overrides_user_code_active ON user_permission_overrides(user_id, permission_code, active);
CREATE INDEX idx_permission_overrides_scope_code ON user_permission_overrides(tenant_id, school_id, permission_code);

CREATE INDEX idx_teacher_assignments_teacher_active ON teacher_assignments(teacher_user_id, active);
CREATE INDEX idx_teacher_assignments_school_class_section_subject ON teacher_assignments(school_id, class_id, section_id, subject_id, active);
CREATE INDEX idx_teacher_assignments_tenant_school_active ON teacher_assignments(tenant_id, school_id, active);
CREATE INDEX idx_student_guardians_student_active ON student_guardians(student_id, active);
CREATE INDEX idx_student_guardians_guardian_active ON student_guardians(guardian_user_id, active);
CREATE INDEX idx_student_guardians_school_active ON student_guardians(school_id, active);
CREATE INDEX idx_student_user_links_student_active ON student_user_links(student_id, active);
CREATE INDEX idx_student_user_links_user_active ON student_user_links(user_id, active);

CREATE INDEX idx_ai_recommendations_tenant_created ON ai_recommendations(tenant_id, created_at);
CREATE INDEX idx_ai_recommendations_school_created ON ai_recommendations(school_id, created_at);
CREATE INDEX idx_ai_recommendations_status_created ON ai_recommendations(status, created_at);
CREATE INDEX idx_ai_recommendations_type_created ON ai_recommendations(recommendation_type, created_at);
CREATE INDEX idx_ai_recommendations_risk_created ON ai_recommendations(risk_level, created_at);
CREATE INDEX idx_ai_recommendations_assigned_status_created ON ai_recommendations(assigned_to_user_id, status, created_at);
CREATE INDEX idx_ai_recommendations_target ON ai_recommendations(target_type, target_id);
CREATE INDEX idx_automation_rules_scope_enabled ON automation_rules(tenant_id, school_id, enabled);
CREATE INDEX idx_automation_rules_code ON automation_rules(code);
CREATE INDEX idx_automation_runs_rule_created ON automation_runs(automation_rule_id, created_at);
CREATE INDEX idx_automation_runs_status_created ON automation_runs(status, created_at);
CREATE INDEX idx_automation_runs_scope_created ON automation_runs(tenant_id, school_id, created_at);
CREATE INDEX idx_ai_policies_scope ON ai_policies(tenant_id, school_id);

CREATE INDEX idx_users_tenant_role_status_email ON user_accounts(tenant_id, role, status, email);
CREATE INDEX idx_schools_tenant_active_code ON schools(tenant_id, active, code);
CREATE INDEX idx_tenants_status_code ON tenants(status, code);
CREATE INDEX idx_audit_logs_tenant_school_action_actor_created ON audit_logs(tenant_id, school_id, action, actor_type, created_at);
CREATE INDEX idx_ai_request_audits_tenant_status_feature_created ON ai_request_audits(tenant_id, status, feature, created_at);
