<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Data Model

Status: CURRENT_IMPLEMENTED

| Table | Migration | Status |
| --- | --- | --- |
| outbox_events | backend/src/main/resources/db/migration/V10__transactional_outbox.sql | CURRENT_IMPLEMENTED |
| bulk_jobs | backend/src/main/resources/db/migration/V11__bulk_jobs.sql | CURRENT_IMPLEMENTED |
| student_import_jobs | backend/src/main/resources/db/migration/V12__student_import_jobs.sql | CURRENT_IMPLEMENTED |
| fee_demands | backend/src/main/resources/db/migration/V14__fee_payment_receipts.sql | CURRENT_IMPLEMENTED |
| fee_payments | backend/src/main/resources/db/migration/V14__fee_payment_receipts.sql | CURRENT_IMPLEMENTED |
| attendance_sessions | backend/src/main/resources/db/migration/V15__attendance_foundation.sql | CURRENT_IMPLEMENTED |
| attendance_records | backend/src/main/resources/db/migration/V15__attendance_foundation.sql | CURRENT_IMPLEMENTED |
| homework_assignments | backend/src/main/resources/db/migration/V16__homework_foundation.sql | CURRENT_IMPLEMENTED |
| homework_submissions | backend/src/main/resources/db/migration/V16__homework_foundation.sql | CURRENT_IMPLEMENTED |
| exams | backend/src/main/resources/db/migration/V17__exam_result_foundation.sql | CURRENT_IMPLEMENTED |
| exam_results | backend/src/main/resources/db/migration/V17__exam_result_foundation.sql | CURRENT_IMPLEMENTED |
| notices | backend/src/main/resources/db/migration/V18__notice_foundation.sql | CURRENT_IMPLEMENTED |
| report_export_jobs | backend/src/main/resources/db/migration/V19__report_export_foundation.sql | CURRENT_IMPLEMENTED |
| report_export_files | backend/src/main/resources/db/migration/V19__report_export_foundation.sql | CURRENT_IMPLEMENTED |
| tenants | backend/src/main/resources/db/migration/V1__baseline_onboarding.sql | CURRENT_IMPLEMENTED |
| schools | backend/src/main/resources/db/migration/V1__baseline_onboarding.sql | CURRENT_IMPLEMENTED |
| user_accounts | backend/src/main/resources/db/migration/V1__baseline_onboarding.sql | CURRENT_IMPLEMENTED |
| invitations | backend/src/main/resources/db/migration/V1__baseline_onboarding.sql | CURRENT_IMPLEMENTED |
| user_school_access | backend/src/main/resources/db/migration/V1__baseline_onboarding.sql | CURRENT_IMPLEMENTED |
| tenant_school_limits | backend/src/main/resources/db/migration/V20__tenant_school_limits.sql | CURRENT_IMPLEMENTED |
| tenant_settings | backend/src/main/resources/db/migration/V21__tenant_settings.sql | CURRENT_IMPLEMENTED |
| notification_deliveries | backend/src/main/resources/db/migration/V22__notification_delivery.sql | CURRENT_IMPLEMENTED |
| subscription_plans | backend/src/main/resources/db/migration/V23__subscription_plan_catalog.sql | CURRENT_IMPLEMENTED |
| tenant_subscriptions | backend/src/main/resources/db/migration/V23__subscription_plan_catalog.sql | CURRENT_IMPLEMENTED |
| tenant_invoices | backend/src/main/resources/db/migration/V23__subscription_plan_catalog.sql | CURRENT_IMPLEMENTED |
| parent_leave_requests | backend/src/main/resources/db/migration/V24__parent_leave_requests.sql | CURRENT_IMPLEMENTED |
| ai_tenant_entitlements | backend/src/main/resources/db/migration/V25__ai_entitlement_audit_foundation.sql | CURRENT_IMPLEMENTED |
| ai_request_audits | backend/src/main/resources/db/migration/V25__ai_entitlement_audit_foundation.sql | CURRENT_IMPLEMENTED |
| ai_knowledge_documents | backend/src/main/resources/db/migration/V26__ai_scoped_knowledge_retrieval.sql | CURRENT_IMPLEMENTED |
| ai_retrieval_audits | backend/src/main/resources/db/migration/V26__ai_scoped_knowledge_retrieval.sql | CURRENT_IMPLEMENTED |
| timetable_entries | backend/src/main/resources/db/migration/V27__timetable_document_website_foundation.sql | CURRENT_IMPLEMENTED |
| school_documents | backend/src/main/resources/db/migration/V27__timetable_document_website_foundation.sql | CURRENT_IMPLEMENTED |
| website_pages | backend/src/main/resources/db/migration/V27__timetable_document_website_foundation.sql | CURRENT_IMPLEMENTED |
| platform_stats | backend/src/main/resources/db/migration/V28__super_admin_scale_foundation.sql | CURRENT_IMPLEMENTED |
| tenant_stats | backend/src/main/resources/db/migration/V28__super_admin_scale_foundation.sql | CURRENT_IMPLEMENTED |
| school_stats | backend/src/main/resources/db/migration/V28__super_admin_scale_foundation.sql | CURRENT_IMPLEMENTED |
| platform_settings | backend/src/main/resources/db/migration/V28__super_admin_scale_foundation.sql | CURRENT_IMPLEMENTED |
| permissions | backend/src/main/resources/db/migration/V29__access_control_ai_governance.sql | CURRENT_IMPLEMENTED |
| role_permissions | backend/src/main/resources/db/migration/V29__access_control_ai_governance.sql | CURRENT_IMPLEMENTED |
| user_roles | backend/src/main/resources/db/migration/V29__access_control_ai_governance.sql | CURRENT_IMPLEMENTED |
| user_permission_overrides | backend/src/main/resources/db/migration/V29__access_control_ai_governance.sql | CURRENT_IMPLEMENTED |
| student_guardians | backend/src/main/resources/db/migration/V29__access_control_ai_governance.sql | CURRENT_IMPLEMENTED |
| student_user_links | backend/src/main/resources/db/migration/V29__access_control_ai_governance.sql | CURRENT_IMPLEMENTED |
| ai_recommendations | backend/src/main/resources/db/migration/V29__access_control_ai_governance.sql | CURRENT_IMPLEMENTED |
| automation_rules | backend/src/main/resources/db/migration/V29__access_control_ai_governance.sql | CURRENT_IMPLEMENTED |
| automation_runs | backend/src/main/resources/db/migration/V29__access_control_ai_governance.sql | CURRENT_IMPLEMENTED |
| ai_policies | backend/src/main/resources/db/migration/V29__access_control_ai_governance.sql | CURRENT_IMPLEMENTED |
| audit_logs | backend/src/main/resources/db/migration/V2__audit_logs.sql | CURRENT_IMPLEMENTED |
| refresh_tokens | backend/src/main/resources/db/migration/V3__auth_session_lifecycle.sql | CURRENT_IMPLEMENTED |
| revoked_access_tokens | backend/src/main/resources/db/migration/V3__auth_session_lifecycle.sql | CURRENT_IMPLEMENTED |
| password_reset_tokens | backend/src/main/resources/db/migration/V3__auth_session_lifecycle.sql | CURRENT_IMPLEMENTED |
| mfa_challenges | backend/src/main/resources/db/migration/V4__mfa_challenges.sql | CURRENT_IMPLEMENTED |
| students | backend/src/main/resources/db/migration/V5__parent_child_linking.sql | CURRENT_IMPLEMENTED |
| parent_student_links | backend/src/main/resources/db/migration/V5__parent_child_linking.sql | CURRENT_IMPLEMENTED |
| academic_years | backend/src/main/resources/db/migration/V6__academic_lifecycle.sql | CURRENT_IMPLEMENTED |
| class_levels | backend/src/main/resources/db/migration/V6__academic_lifecycle.sql | CURRENT_IMPLEMENTED |
| sections | backend/src/main/resources/db/migration/V6__academic_lifecycle.sql | CURRENT_IMPLEMENTED |
| subjects | backend/src/main/resources/db/migration/V8__academic_assignment_foundation.sql | CURRENT_IMPLEMENTED |
| class_subject_assignments | backend/src/main/resources/db/migration/V8__academic_assignment_foundation.sql | CURRENT_IMPLEMENTED |
| teacher_assignments | backend/src/main/resources/db/migration/V8__academic_assignment_foundation.sql | CURRENT_IMPLEMENTED |
| staff_profiles | backend/src/main/resources/db/migration/V9__staff_teacher_provisioning.sql | CURRENT_IMPLEMENTED |

## Key Domains

| Domain | Tables/patterns | Status |
| --- | --- | --- |
| Identity/auth | user_accounts, refresh/revoked/password/MFA tokens, access-control tables. | CURRENT_IMPLEMENTED |
| Tenancy/schools | tenants, schools, settings, stats. | CURRENT_IMPLEMENTED |
| Academics | academic_years, classes, sections, subjects, assignments. | CURRENT_IMPLEMENTED |
| Students/parents | students, links, guardians, leave requests. | CURRENT_IMPLEMENTED |
| Finance | fee demands/payments, tenant invoices/subscriptions. | CURRENT_IMPLEMENTED |
| Reports/jobs | bulk jobs, imports, report export jobs/files. | CURRENT_IMPLEMENTED |
| AI | entitlements, audits, knowledge docs, recommendations, automation, policies. | CURRENT_IMPLEMENTED |
| Audit/notifications/outbox | audit_logs, notification_deliveries, outbox_events. | CURRENT_IMPLEMENTED |
