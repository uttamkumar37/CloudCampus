<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# Audit Event Catalog

Status: CURRENT_IMPLEMENTED

Source: backend/src/main/java/com/cloudcampus/audit/AuditAction.java

| Audit action | Typical trigger | Status |
| --- | --- | --- |
| TENANT_CREATED | tenant created | CURRENT_IMPLEMENTED enum value |
| TENANT_STATUS_UPDATED | tenant status updated | CURRENT_IMPLEMENTED enum value |
| TENANT_SETTINGS_UPDATED | tenant settings updated | CURRENT_IMPLEMENTED enum value |
| PLATFORM_SETTINGS_UPDATED | platform settings updated | CURRENT_IMPLEMENTED enum value |
| SUBSCRIPTION_PLAN_CREATED | subscription plan created | CURRENT_IMPLEMENTED enum value |
| SUBSCRIPTION_PLAN_UPDATED | subscription plan updated | CURRENT_IMPLEMENTED enum value |
| TENANT_SUBSCRIPTION_ASSIGNED | tenant subscription assigned | CURRENT_IMPLEMENTED enum value |
| TENANT_INVOICE_ISSUED | tenant invoice issued | CURRENT_IMPLEMENTED enum value |
| AI_ENTITLEMENT_UPDATED | ai entitlement updated | CURRENT_IMPLEMENTED enum value |
| AI_USAGE_AUDITED | ai usage audited | CURRENT_IMPLEMENTED enum value |
| AI_USAGE_DENIED | ai usage denied | CURRENT_IMPLEMENTED enum value |
| AI_KNOWLEDGE_DOCUMENT_CREATED | ai knowledge document created | CURRENT_IMPLEMENTED enum value |
| AI_RETRIEVAL_AUDITED | ai retrieval audited | CURRENT_IMPLEMENTED enum value |
| AI_RETRIEVAL_DENIED | ai retrieval denied | CURRENT_IMPLEMENTED enum value |
| SCHOOL_CREATED | school created | CURRENT_IMPLEMENTED enum value |
| SCHOOL_UPDATED | school updated | CURRENT_IMPLEMENTED enum value |
| SCHOOL_DEACTIVATED | school deactivated | CURRENT_IMPLEMENTED enum value |
| SCHOOL_ADMIN_INVITED | school admin invited | CURRENT_IMPLEMENTED enum value |
| SCHOOL_ADMIN_INVITATION_RESENT | school admin invitation resent | CURRENT_IMPLEMENTED enum value |
| SCHOOL_ACCESS_GRANTED | school access granted | CURRENT_IMPLEMENTED enum value |
| SCHOOL_ACCESS_REVOKED | school access revoked | CURRENT_IMPLEMENTED enum value |
| PARENT_INVITED | parent invited | CURRENT_IMPLEMENTED enum value |
| PARENT_LINKED | parent linked | CURRENT_IMPLEMENTED enum value |
| PARENT_LEAVE_REQUESTED | parent leave requested | CURRENT_IMPLEMENTED enum value |
| PARENT_LEAVE_DECIDED | parent leave decided | CURRENT_IMPLEMENTED enum value |
| ACADEMIC_YEAR_CREATED | academic year created | CURRENT_IMPLEMENTED enum value |
| ACADEMIC_YEAR_ACTIVATED | academic year activated | CURRENT_IMPLEMENTED enum value |
| CLASS_LEVEL_CREATED | class level created | CURRENT_IMPLEMENTED enum value |
| SECTION_CREATED | section created | CURRENT_IMPLEMENTED enum value |
| STUDENT_IMPORTED | student imported | CURRENT_IMPLEMENTED enum value |
| STUDENT_LOGIN_ENABLED | student login enabled | CURRENT_IMPLEMENTED enum value |
| STUDENT_LOGIN_INVITED | student login invited | CURRENT_IMPLEMENTED enum value |
| SUBJECT_CREATED | subject created | CURRENT_IMPLEMENTED enum value |
| CLASS_SUBJECT_ASSIGNED | class subject assigned | CURRENT_IMPLEMENTED enum value |
| TEACHER_ASSIGNED | teacher assigned | CURRENT_IMPLEMENTED enum value |
| STAFF_INVITED | staff invited | CURRENT_IMPLEMENTED enum value |
| STAFF_PROFILE_CREATED | staff profile created | CURRENT_IMPLEMENTED enum value |
| INVITATION_ACCEPTED | invitation accepted | CURRENT_IMPLEMENTED enum value |
| MFA_CHALLENGE_CREATED | mfa challenge created | CURRENT_IMPLEMENTED enum value |
| MFA_CHALLENGE_VERIFIED | mfa challenge verified | CURRENT_IMPLEMENTED enum value |
| REFRESH_TOKEN_ROTATED | refresh token rotated | CURRENT_IMPLEMENTED enum value |
| USER_LOGGED_OUT | user logged out | CURRENT_IMPLEMENTED enum value |
| PASSWORD_RESET_REQUESTED | password reset requested | CURRENT_IMPLEMENTED enum value |
| PASSWORD_RESET_COMPLETED | password reset completed | CURRENT_IMPLEMENTED enum value |
| PASSWORD_CHANGED | password changed | CURRENT_IMPLEMENTED enum value |
| SCHOOL_CONTEXT_ACTIVATED | school context activated | CURRENT_IMPLEMENTED enum value |
| BULK_JOB_CREATED | bulk job created | CURRENT_IMPLEMENTED enum value |
| BULK_JOB_CANCELLED | bulk job cancelled | CURRENT_IMPLEMENTED enum value |
| STUDENT_IMPORT_JOB_QUEUED | student import job queued | CURRENT_IMPLEMENTED enum value |
| FEE_DEMAND_CREATED | fee demand created | CURRENT_IMPLEMENTED enum value |
| FEE_PAYMENT_RECORDED | fee payment recorded | CURRENT_IMPLEMENTED enum value |
| RECEIPT_ISSUED | receipt issued | CURRENT_IMPLEMENTED enum value |
| ATTENDANCE_SUBMITTED | attendance submitted | CURRENT_IMPLEMENTED enum value |
| HOMEWORK_PUBLISHED | homework published | CURRENT_IMPLEMENTED enum value |
| HOMEWORK_SUBMITTED | homework submitted | CURRENT_IMPLEMENTED enum value |
| EXAM_CREATED | exam created | CURRENT_IMPLEMENTED enum value |
| EXAM_MARKS_RECORDED | exam marks recorded | CURRENT_IMPLEMENTED enum value |
| EXAM_RESULTS_PUBLISHED | exam results published | CURRENT_IMPLEMENTED enum value |
| NOTICE_CREATED | notice created | CURRENT_IMPLEMENTED enum value |
| NOTICE_PUBLISHED | notice published | CURRENT_IMPLEMENTED enum value |
| TIMETABLE_ENTRY_CREATED | timetable entry created | CURRENT_IMPLEMENTED enum value |
| DOCUMENT_CREATED | document created | CURRENT_IMPLEMENTED enum value |
| WEBSITE_PAGE_CREATED | website page created | CURRENT_IMPLEMENTED enum value |
| WEBSITE_PAGE_PUBLISHED | website page published | CURRENT_IMPLEMENTED enum value |
| REPORT_EXPORT_REQUESTED | report export requested | CURRENT_IMPLEMENTED enum value |
| REPORT_EXPORT_STARTED | report export started | CURRENT_IMPLEMENTED enum value |
| REPORT_EXPORT_COMPLETED | report export completed | CURRENT_IMPLEMENTED enum value |
| REPORT_EXPORT_FAILED | report export failed | CURRENT_IMPLEMENTED enum value |
| ROLE_ASSIGNED | role assigned | CURRENT_IMPLEMENTED enum value |
| ROLE_UPDATED | role updated | CURRENT_IMPLEMENTED enum value |
| ROLE_DEACTIVATED | role deactivated | CURRENT_IMPLEMENTED enum value |
| PERMISSION_OVERRIDE_GRANTED | permission override granted | CURRENT_IMPLEMENTED enum value |
| PERMISSION_OVERRIDE_DENIED | permission override denied | CURRENT_IMPLEMENTED enum value |
| PERMISSION_OVERRIDE_REVOKED | permission override revoked | CURRENT_IMPLEMENTED enum value |
| ROLE_PERMISSION_UPDATED | role permission updated | CURRENT_IMPLEMENTED enum value |
| TEACHER_ASSIGNMENT_CREATED | teacher assignment created | CURRENT_IMPLEMENTED enum value |
| TEACHER_ASSIGNMENT_UPDATED | teacher assignment updated | CURRENT_IMPLEMENTED enum value |
| TEACHER_ASSIGNMENT_DEACTIVATED | teacher assignment deactivated | CURRENT_IMPLEMENTED enum value |
| STUDENT_GUARDIAN_LINKED | student guardian linked | CURRENT_IMPLEMENTED enum value |
| STUDENT_GUARDIAN_UPDATED | student guardian updated | CURRENT_IMPLEMENTED enum value |
| STUDENT_GUARDIAN_DEACTIVATED | student guardian deactivated | CURRENT_IMPLEMENTED enum value |
| AI_RECOMMENDATION_CREATED | ai recommendation created | CURRENT_IMPLEMENTED enum value |
| AI_RECOMMENDATION_VIEWED | ai recommendation viewed | CURRENT_IMPLEMENTED enum value |
| AI_RECOMMENDATION_APPROVED | ai recommendation approved | CURRENT_IMPLEMENTED enum value |
| AI_RECOMMENDATION_REJECTED | ai recommendation rejected | CURRENT_IMPLEMENTED enum value |
| AI_RECOMMENDATION_EXECUTED | ai recommendation executed | CURRENT_IMPLEMENTED enum value |
| AI_RECOMMENDATION_FAILED | ai recommendation failed | CURRENT_IMPLEMENTED enum value |
| AI_RECOMMENDATION_DISMISSED | ai recommendation dismissed | CURRENT_IMPLEMENTED enum value |
| AI_RECOMMENDATION_EXPIRED | ai recommendation expired | CURRENT_IMPLEMENTED enum value |
| AUTOMATION_RULE_CREATED | automation rule created | CURRENT_IMPLEMENTED enum value |
| AUTOMATION_RULE_UPDATED | automation rule updated | CURRENT_IMPLEMENTED enum value |
| AUTOMATION_RULE_ENABLED | automation rule enabled | CURRENT_IMPLEMENTED enum value |
| AUTOMATION_RULE_DISABLED | automation rule disabled | CURRENT_IMPLEMENTED enum value |
| AUTOMATION_RUN_STARTED | automation run started | CURRENT_IMPLEMENTED enum value |
| AUTOMATION_RUN_WAITING_APPROVAL | automation run waiting approval | CURRENT_IMPLEMENTED enum value |
| AUTOMATION_RUN_APPROVED | automation run approved | CURRENT_IMPLEMENTED enum value |
| AUTOMATION_RUN_REJECTED | automation run rejected | CURRENT_IMPLEMENTED enum value |
| AUTOMATION_RUN_COMPLETED | automation run completed | CURRENT_IMPLEMENTED enum value |
| AUTOMATION_RUN_FAILED | automation run failed | CURRENT_IMPLEMENTED enum value |
| AI_POLICY_UPDATED | ai policy updated | CURRENT_IMPLEMENTED enum value |
| AI_BUDGET_UPDATED | ai budget updated | CURRENT_IMPLEMENTED enum value |
| AI_FEATURE_ENABLED | ai feature enabled | CURRENT_IMPLEMENTED enum value |
| AI_FEATURE_DISABLED | ai feature disabled | CURRENT_IMPLEMENTED enum value |

- CURRENT_IMPLEMENTED: mutation workflows emit many domain audit actions.
- CURRENT_PARTIAL: read-only endpoints are not uniformly audited.
- CURRENT_PARTIAL: metadata redaction should be reviewed for AI, finance, guardian, and export data.
- PLANNED_RECOMMENDED: assert every sensitive command emits the expected AuditAction.
