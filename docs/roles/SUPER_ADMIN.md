<!-- Generated from CloudCampus source inventory. Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# SUPER_ADMIN

## 1. Role summary
| Item | Detail | Status |
| --- | --- | --- |
| Human-readable name | Super Admin | CURRENT_IMPLEMENTED |
| Role enum value | SUPER_ADMIN | CURRENT_IMPLEMENTED |
| Role type | human | CURRENT_IMPLEMENTED |
| Login allowed | yes for authenticated roles; GUEST is public/auth only | CURRENT_IMPLEMENTED |
| MFA required | yes | CURRENT_IMPLEMENTED |
| Scope level | platform | CURRENT_IMPLEMENTED |
| Typical users | CloudCampus platform owner/operator, support leadership, compliance operator | CURRENT_IMPLEMENTED |
| Business purpose | Operate tenants, schools, subscriptions, revenue, AI governance, reports, audit, health, settings, and access control. | CURRENT_IMPLEMENTED |
| Risk level | critical | CURRENT_IMPLEMENTED |
| Data sensitivity level | platform-wide identity, finance, audit, school, tenant, and AI policy data | CURRENT_IMPLEMENTED |

## 2. Role responsibilities
- CURRENT_IMPLEMENTED: Use visible screens: Dashboard, Tenants, Schools, Access Control, Subscription Plans, Revenue, AI Governance, Reports, Audit Logs, Platform Health, Notifications, Settings.
- CURRENT_IMPLEMENTED: Call 90 backend endpoint(s) inferred for this role/scope.
- CURRENT_IMPLEMENTED: Quick actions: Create tenant - Create trust, first school and admin; Create plan - Prepare subscription package; System health - Check platform readiness.
- CURRENT_IMPLEMENTED: Platform-wide tenant, school, subscription, revenue, AI, report, audit, health, notification, setting, and access-control ownership.
- CURRENT_IMPLEMENTED: Operate only inside documented scope.

## 3. Role restrictions
- CURRENT_IMPLEMENTED: Must not access resources outside platform scope.
- CURRENT_IMPLEMENTED: Must not spoof tenant/school headers or use another user session.
- CURRENT_IMPLEMENTED: Must not bypass MFA/audit expectations for platform changes.
- CURRENT_PARTIAL: Fine-grained denials are module-specific.
- CURRENT_PARTIAL: Parent-child restrictions apply where guardian endpoints are used.
- PLANNED_RECOMMENDED: Add endpoint-level MFA freshness for high-risk exports, finance, access-control, and AI execution.

## 4. Tenant/school/class/student scope rules
- tenant_id rules: CURRENT_IMPLEMENTED platform-wide; no active school required.
- school_id rules: CURRENT_IMPLEMENTED broad school visibility by role.
- class/section/subject rules: CURRENT_PARTIAL module-specific.
- own-student record rules: CURRENT_PARTIAL applies to student self APIs.
- parent-child linked access rules: CURRENT_PARTIAL applies when guardian endpoints are used.
- platform-wide rules: CURRENT_IMPLEMENTED under /v1/super-admin.

## 5. Permissions
| Permission code | Category | Allowed by default | Scope | Risk | Notes |
| --- | --- | --- | --- | --- | --- |
| APPROVE_AI_RECOMMENDATIONS | AI | Yes | TENANT | HIGH | Approve scoped AI recommendations. |
| APPROVE_MARKS | ACADEMIC | Yes | SCHOOL | HIGH | Approve marks/results. |
| APPROVE_RESULTS | ACADEMIC | Yes | SCHOOL | HIGH | Approve final result publication. |
| CONFIGURE_AI_BUDGET | AI | Yes | TENANT | HIGH | Configure AI budget. |
| CORRECT_ATTENDANCE | ACADEMIC | Yes | SCHOOL | HIGH | Correct submitted attendance. |
| CREATE_AI_RECOMMENDATIONS | AI | Yes | TENANT | MEDIUM | Create AI recommendations and drafts. |
| DOWNLOAD_REPORT_EXPORTS | REPORTS | Yes | TENANT | HIGH | Download completed exports. |
| EDIT_MARKS | ACADEMIC | Yes | SCHOOL | HIGH | Edit recorded marks. |
| ENTER_ATTENDANCE | ACADEMIC | Yes | CLASS | MEDIUM | Enter attendance for assigned class/section. |
| ENTER_MARKS | ACADEMIC | Yes | CLASS | HIGH | Enter marks for assigned subject/class. |
| EXECUTE_APPROVED_AI_ACTION | AI | Yes | TENANT | HIGH | Execute safe approved AI actions. |
| EXPORT_FINANCE_REPORTS | FINANCE | Yes | SCHOOL | HIGH | Export finance reports. |
| EXPORT_PLATFORM_REPORTS | PLATFORM | Yes | PLATFORM | HIGH | Export platform-wide report data. |
| EXPORT_REPORTS | REPORTS | Yes | TENANT | HIGH | Export scoped reports. |
| EXPORT_TENANT_REPORTS | TENANT | Yes | TENANT | HIGH | Export tenant-level reports. |
| ISSUE_CERTIFICATES | OFFICE | Yes | SCHOOL | HIGH | Issue school certificates. |
| ISSUE_INVOICES | FINANCE | Yes | SCHOOL | HIGH | Issue fee invoices/demands. |
| MANAGE_ADMISSIONS | OFFICE | Yes | SCHOOL | MEDIUM | Manage admission applications. |
| MANAGE_AI_ENTITLEMENTS | AI | Yes | PLATFORM | CRITICAL | Manage platform AI entitlements. |
| MANAGE_AI_POLICY | AI | Yes | TENANT | HIGH | Manage AI policies. |
| MANAGE_ASSIGNMENTS | ACADEMIC | Yes | CLASS | MEDIUM | Create and manage assignments. |
| MANAGE_ATTENDANCE | ACADEMIC | Yes | SCHOOL | HIGH | Manage attendance sessions and corrections. |
| MANAGE_CLASSES | SCHOOL | Yes | SCHOOL | MEDIUM | Create and update classes. |
| MANAGE_DISCIPLINE | ACADEMIC | Yes | SCHOOL | HIGH | Manage discipline cases. |
| MANAGE_DISCOUNTS | FINANCE | Yes | SCHOOL | HIGH | Manage discounts/concessions. |
| MANAGE_ENQUIRIES | OFFICE | Yes | SCHOOL | LOW | Manage admission enquiries. |
| MANAGE_EXAMS | ACADEMIC | Yes | SCHOOL | HIGH | Create and manage exams. |
| MANAGE_FEE_STRUCTURE | FINANCE | Yes | SCHOOL | HIGH | Create and update fee structures. |
| MANAGE_HOMEWORK | ACADEMIC | Yes | CLASS | MEDIUM | Create and manage homework. |
| MANAGE_ID_CARDS | OFFICE | Yes | SCHOOL | MEDIUM | Manage student ID cards. |
| MANAGE_NOTIFICATION_TEMPLATES | COMMUNICATION | Yes | TENANT | HIGH | Manage notification templates. |
| MANAGE_PLATFORM | PLATFORM | Yes | PLATFORM | CRITICAL | Manage platform control-plane resources. |
| MANAGE_PLATFORM_NOTIFICATIONS | PLATFORM | Yes | PLATFORM | HIGH | View and manage platform notification delivery. |
| MANAGE_PLATFORM_REPORTS | PLATFORM | Yes | PLATFORM | HIGH | Request and manage platform reports. |
| MANAGE_PLATFORM_SETTINGS | PLATFORM | Yes | PLATFORM | CRITICAL | Update safe platform settings. |
| MANAGE_PROMOTIONS | ACADEMIC | Yes | SCHOOL | HIGH | Manage student promotions. |
| MANAGE_REFUNDS | FINANCE | Yes | SCHOOL | CRITICAL | Manage or approve refunds. |
| MANAGE_SCHOOL | SCHOOL | Yes | SCHOOL | HIGH | Manage school operations. |
| MANAGE_SCHOOLS_PLATFORM | PLATFORM | Yes | PLATFORM | HIGH | View and administer schools across tenants. |
| MANAGE_SCHOOL_SETTINGS | SCHOOL | Yes | SCHOOL | HIGH | Update school settings. |
| MANAGE_SCHOOL_USERS | SCHOOL | Yes | SCHOOL | HIGH | Manage users assigned to a school. |
| MANAGE_SECTIONS | SCHOOL | Yes | SCHOOL | MEDIUM | Create and update sections. |
| MANAGE_STUDENT_DOCUMENTS | OFFICE | Yes | SCHOOL | HIGH | Manage student documents. |
| MANAGE_SUBJECTS | SCHOOL | Yes | SCHOOL | MEDIUM | Create and update subjects. |
| MANAGE_SUBSCRIPTION_PLANS | PLATFORM | Yes | PLATFORM | HIGH | Create and update subscription plan catalog. |
| MANAGE_TENANT | TENANT | Yes | TENANT | HIGH | Manage tenant-level business data. |
| MANAGE_TENANTS | PLATFORM | Yes | PLATFORM | CRITICAL | Create and administer tenant organizations. |
| MANAGE_TENANT_AI_POLICY | TENANT | Yes | TENANT | HIGH | Configure tenant AI policy when allowed. |
| MANAGE_TENANT_SCHOOLS | TENANT | Yes | TENANT | HIGH | Create and manage schools under tenant. |
| MANAGE_TENANT_SETTINGS | TENANT | Yes | TENANT | HIGH | Update tenant settings. |
| MANAGE_TENANT_SUBSCRIPTIONS | PLATFORM | Yes | PLATFORM | HIGH | Assign and update tenant subscriptions. |
| MANAGE_TENANT_USERS | TENANT | Yes | TENANT | HIGH | Manage tenant users and admin assignments. |
| MANAGE_TIMETABLE | SCHOOL | Yes | SCHOOL | MEDIUM | Create and update timetables. |
| MANAGE_TRANSFER_CERTIFICATES | OFFICE | Yes | SCHOOL | HIGH | Manage transfer certificates. |
| MANAGE_VISITORS | OFFICE | Yes | SCHOOL | MEDIUM | Manage visitor records. |
| RECORD_PAYMENTS | FINANCE | Yes | SCHOOL | HIGH | Record payments and receipts. |
| REJECT_AI_RECOMMENDATIONS | AI | Yes | TENANT | HIGH | Reject scoped AI recommendations. |
| REQUEST_REPORT_EXPORTS | REPORTS | Yes | TENANT | HIGH | Request async exports. |
| RETRY_NOTIFICATIONS | COMMUNICATION | Yes | TENANT | HIGH | Retry failed notifications. |
| RUN_AI_AUTOMATION | AI | Yes | TENANT | HIGH | Run AI automation rules. |
| SEND_FEE_REMINDERS | FINANCE | Yes | SCHOOL | HIGH | Send fee reminders. |
| SEND_MESSAGES | COMMUNICATION | Yes | SCHOOL | MEDIUM | Send scoped messages. |
| SEND_NOTICES | COMMUNICATION | Yes | SCHOOL | MEDIUM | Send notices. |
| SEND_PARENT_MESSAGE | STUDENT_PARENT | Yes | STUDENT | MEDIUM | Send parent-school messages. |
| SEND_SCHOOL_NOTICES | SCHOOL | Yes | SCHOOL | MEDIUM | Publish notices for a school. |
| VIEW_ACADEMIC_DATA | ACADEMIC | Yes | SCHOOL | LOW | View scoped academic data. |
| VIEW_AI_AUDIT | AI | Yes | TENANT | HIGH | View AI audit rows. |
| VIEW_AI_RECOMMENDATIONS | AI | Yes | TENANT | MEDIUM | View scoped AI recommendations. |
| VIEW_AI_USAGE | AI | Yes | TENANT | MEDIUM | View AI usage and budget. |
| VIEW_AUDIT_LOGS | AUDIT | Yes | TENANT | HIGH | View audit logs. |
| VIEW_CHILD_ATTENDANCE | STUDENT_PARENT | Yes | STUDENT | LOW | View linked child attendance. |
| VIEW_CHILD_FEES | STUDENT_PARENT | Yes | STUDENT | MEDIUM | View linked child fee dues/history. |
| VIEW_CHILD_HOMEWORK | STUDENT_PARENT | Yes | STUDENT | LOW | View linked child homework. |
| VIEW_CHILD_PROFILE | STUDENT_PARENT | Yes | STUDENT | LOW | View linked child profile. |
| VIEW_CHILD_RESULTS | STUDENT_PARENT | Yes | STUDENT | LOW | View linked child results. |
| VIEW_EXPORT_JOBS | REPORTS | Yes | TENANT | MEDIUM | View report export jobs. |
| VIEW_FINANCE_DASHBOARD | FINANCE | Yes | SCHOOL | MEDIUM | View finance dashboard. |
| VIEW_FINANCE_REPORTS | FINANCE | Yes | SCHOOL | HIGH | View finance reports. |
| VIEW_NOTIFICATIONS | COMMUNICATION | Yes | TENANT | LOW | View notifications. |
| VIEW_OWN_ATTENDANCE | STUDENT_PARENT | Yes | SELF | LOW | View own attendance. |
| VIEW_OWN_HOMEWORK | STUDENT_PARENT | Yes | SELF | LOW | View own homework. |
| VIEW_OWN_PROFILE | STUDENT_PARENT | Yes | SELF | LOW | View own student/user profile. |
| VIEW_OWN_RESULTS | STUDENT_PARENT | Yes | SELF | LOW | View own results. |
| VIEW_PLATFORM_AUDIT | PLATFORM | Yes | PLATFORM | HIGH | View platform audit logs. |
| VIEW_PLATFORM_HEALTH | PLATFORM | Yes | PLATFORM | MEDIUM | View system readiness and background work status. |
| VIEW_PLATFORM_REVENUE | PLATFORM | Yes | PLATFORM | HIGH | View revenue and invoice summaries. |
| VIEW_REPORTS | REPORTS | Yes | TENANT | MEDIUM | View scoped reports. |
| VIEW_SCHOOL_DASHBOARD | SCHOOL | Yes | SCHOOL | LOW | View assigned school dashboard. |
| VIEW_SECURITY_EVENTS | AUDIT | Yes | TENANT | HIGH | View security and auth events. |
| VIEW_STUDENT_PERFORMANCE | ACADEMIC | Yes | STUDENT | MEDIUM | View scoped student academic performance. |
| VIEW_TENANT_AUDIT | TENANT | Yes | TENANT | HIGH | View tenant audit events. |
| VIEW_TENANT_DASHBOARD | TENANT | Yes | TENANT | LOW | View tenant dashboard and rollups. |
| VIEW_TENANT_REPORTS | TENANT | Yes | TENANT | MEDIUM | View tenant-level reports. |

## 6. Navigation and screens
| Screen | Route/nav id | Visible? | Required permission | API used | Current status |
| --- | --- | --- | --- | --- | --- |
| Dashboard | dashboard | Yes | SESSION_SELF_MANAGE | /v1/super-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| Tenants | tenants | Yes | SCREEN_TENANTS | /v1/super-admin/ai/tenants/{tenantId}/entitlement | CURRENT_IMPLEMENTED |
| Schools | schools | Yes | SCREEN_SCHOOLS | /v1/me/schools/{schoolId}/activate | CURRENT_IMPLEMENTED |
| Access Control | access-control | Yes | SCREEN_ACCESS_CONTROL | /v1/super-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| Subscription Plans | subscriptions | Yes | SCREEN_SUBSCRIPTIONS | /v1/super-admin/subscriptions/plans/{planId} | CURRENT_IMPLEMENTED |
| Revenue | revenue | Yes | SCREEN_REVENUE | /v1/super-admin/revenue/invoices | CURRENT_IMPLEMENTED |
| AI Governance | ai-usage | Yes | SCREEN_AI_USAGE | /v1/super-admin/dashboard/summary | CURRENT_IMPLEMENTED |
| Reports | reports | Yes | SCREEN_REPORTS | /v1/super-admin/reports/exports/{jobId} | CURRENT_IMPLEMENTED |
| Audit Logs | audit | Yes | SCREEN_AUDIT | /v1/ai/usage/audit | CURRENT_IMPLEMENTED |
| Platform Health | health | Yes | SCREEN_HEALTH | /v1/super-admin/platform-health | CURRENT_IMPLEMENTED |
| Notifications | notifications | Yes | SCREEN_NOTIFICATIONS | /v1/super-admin/notifications/deliveries/{deliveryId} | CURRENT_IMPLEMENTED |
| Settings | settings | Yes | SCREEN_SETTINGS | /v1/super-admin/settings | CURRENT_IMPLEMENTED |

## 7. Dashboard details
- dashboard title: Welcome back, CloudCampus Super Admin
- widgets/cards: Create tenant, Create plan, System health
- metrics: CURRENT_IMPLEMENTED from role dashboard summary endpoint.
- API source: /v1/super-admin/dashboard/summary
- loading state: CURRENT_IMPLEMENTED shell and page loading states.
- empty state: CURRENT_IMPLEMENTED generic empty states; module-specific quality CURRENT_PARTIAL.
- error state: CURRENT_IMPLEMENTED API/form error panels.
- refresh behavior: CURRENT_PARTIAL manual navigation/refetch; no uniform live refresh found.

## 8. API access matrix
| Method | Endpoint | Allowed? | Required permission | Required scope | Request params/body | Response DTO | Audit event | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PATCH | /v1/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AUTOMATION_RULE_UPDATED | CURRENT_IMPLEMENTED |
| GET | /v1/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | role AI policy scope | query params | AiRecommendationPortal response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | role AI policy scope | query params | AiRecommendationPortal response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/ai/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | role AI policy scope | query params | AiUsage response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/ai/knowledge/search | Yes | MANAGE_AI_POLICY | role AI policy scope | path params / JSON body | AiRetrieval response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| POST | /v1/ai/recommendations/{id}/accept | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_CREATED | CURRENT_IMPLEMENTED |
| POST | /v1/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_APPROVED | CURRENT_IMPLEMENTED |
| POST | /v1/ai/recommendations/{id}/dismiss | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_DISMISSED | CURRENT_IMPLEMENTED |
| POST | /v1/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_EXECUTED | CURRENT_IMPLEMENTED |
| POST | /v1/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | role AI policy scope | path params / JSON body | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_REJECTED | CURRENT_IMPLEMENTED |
| GET | /v1/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | query params | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL. | CURRENT_IMPLEMENTED |
| GET | /v1/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | role AI policy scope | query params | AiRecommendationPortal response/DTO | AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL. | CURRENT_IMPLEMENTED |
| POST | /v1/ai/usage/audit | Yes | MANAGE_AI_POLICY | role AI policy scope | path params / JSON body | AiUsage response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| POST | /v1/me/change-password | Yes | SESSION_SELF_MANAGE | current user/session | path params / JSON body | CurrentUser response/DTO | PASSWORD_CHANGED | CURRENT_IMPLEMENTED |
| POST | /v1/me/logout | Yes | SESSION_SELF_MANAGE | current user/session | path params / JSON body | CurrentUser response/DTO | USER_LOGGED_OUT | CURRENT_IMPLEMENTED |
| POST | /v1/me/schools/{schoolId}/activate | Yes | SESSION_SELF_MANAGE | current user/session | path params / JSON body | CurrentUser response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/me/schools | Yes | SESSION_SELF_MANAGE | current user/session | query params | CurrentUser response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/me | Yes | SESSION_SELF_MANAGE | current user/session | query params | CurrentUser response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/ai/automation-rules/{id} | Yes | MANAGE_AI_AUTOMATION | platform | path params / JSON body | SuperAdminAiGovernance response/DTO | AUTOMATION_RULE_UPDATED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/automation-rules | Yes | VIEW_AI_AUTOMATION | platform | query params | SuperAdminAiGovernance response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/ai/automation-rules | Yes | MANAGE_AI_AUTOMATION | platform | path params / JSON body | SuperAdminAiGovernance response/DTO | AUTOMATION_RULE_CREATED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/automation-runs | Yes | VIEW_AI_AUTOMATION | platform | query params | SuperAdminAiGovernance response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/entitlements | Yes | VIEW_AI_USAGE_OR_POLICY | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/policies/{tenantId} | Yes | VIEW_AI_USAGE_OR_POLICY | platform | query params | SuperAdminAiGovernance response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| PUT | /v1/super-admin/ai/policies/{tenantId} | Yes | MANAGE_AI_POLICY | platform | path params / JSON body | SuperAdminAiGovernance response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/policies | Yes | VIEW_AI_USAGE_OR_POLICY | platform | query params | SuperAdminAiGovernance response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/ai/recommendations/{id}/approve | Yes | AI_RECOMMENDATION_ACTION | platform | path params / JSON body | SuperAdminAiGovernance response/DTO | AI_RECOMMENDATION_APPROVED | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/ai/recommendations/{id}/execute | Yes | AI_RECOMMENDATION_ACTION | platform | path params / JSON body | SuperAdminAiGovernance response/DTO | AI_RECOMMENDATION_EXECUTED | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/ai/recommendations/{id}/reject | Yes | AI_RECOMMENDATION_ACTION | platform | path params / JSON body | SuperAdminAiGovernance response/DTO | AI_RECOMMENDATION_REJECTED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/recommendations/{id} | Yes | VIEW_AI_RECOMMENDATIONS | platform | query params | SuperAdminAiGovernance response/DTO | AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/recommendations | Yes | VIEW_AI_RECOMMENDATIONS | platform | query params | SuperAdminAiGovernance response/DTO | AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL. | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/ai/recommendations | Yes | CREATE_AI_RECOMMENDATIONS | platform | path params / JSON body | SuperAdminAiGovernance response/DTO | AI_RECOMMENDATION_CREATED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/tenants/{tenantId}/entitlement | Yes | VIEW_AI_USAGE_OR_POLICY | platform | query params | SuperAdminAiEntitlement response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| PUT | /v1/super-admin/ai/tenants/{tenantId}/entitlement | Yes | MANAGE_AI_POLICY | platform | path params / JSON body | SuperAdminAiEntitlement response/DTO | AI_ENTITLEMENT_UPDATED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/usage/summary | Yes | VIEW_AI_USAGE_OR_POLICY | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/ai/usage/tenants | Yes | VIEW_AI_USAGE_OR_POLICY | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/audit-logs | Yes | VIEW_AUDIT | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/dashboard/summary | Yes | SUPER_ADMIN_VIEW | platform | query params | DashboardSummary response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/notifications/deliveries/{deliveryId} | Yes | VIEW_NOTIFICATIONS | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/notifications/deliveries | Yes | VIEW_NOTIFICATIONS | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/notifications/summary | Yes | VIEW_NOTIFICATIONS | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/permissions | Yes | PERMISSION_VIEW_OR_MANAGE | platform | query params | SuperAdminAccessControl response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/platform-health | Yes | SUPER_ADMIN_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/platform-metrics | Yes | SUPER_ADMIN_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/reports/exports/{jobId} | Yes | VIEW_REPORTS | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/reports/exports | Yes | VIEW_REPORTS | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/reports/exports | Yes | EXPORT_REPORTS | platform | path params / JSON body | SuperAdminPlatform response/DTO | REPORT_EXPORT_REQUESTED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/reports/schools | Yes | VIEW_REPORTS | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/reports/summary | Yes | VIEW_REPORTS | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/reports/tenants | Yes | VIEW_REPORTS | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/revenue/invoices | Yes | FINANCE_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/revenue/summary | Yes | FINANCE_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/revenue/tenants | Yes | FINANCE_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/revenue/trends | Yes | FINANCE_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/roles/{role}/permissions | Yes | PERMISSION_VIEW_OR_MANAGE | platform | query params | SuperAdminAccessControl response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/schools/{schoolId} | Yes | SCHOOL_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/schools | Yes | SCHOOL_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/search | Yes | SUPER_ADMIN_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/settings | Yes | SETTINGS_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/settings | Yes | SETTINGS_MANAGE | platform | path params / JSON body | SuperAdminPlatform response/DTO | PLATFORM_SETTINGS_UPDATED | CURRENT_IMPLEMENTED |
| DELETE | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | Yes | STUDENT_GUARDIAN_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | STUDENT_GUARDIAN_DEACTIVATED | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/students/{studentId}/guardians/{guardianLinkId} | Yes | STUDENT_GUARDIAN_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | STUDENT_GUARDIAN_UPDATED or STUDENT_GUARDIAN_DEACTIVATED | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/students/{studentId}/guardians | Yes | STUDENT_GUARDIAN_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | STUDENT_GUARDIAN_LINKED | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/subscriptions/plans/{planId} | Yes | SUBSCRIPTION_MANAGE | platform | path params / JSON body | SuperAdminSubscription response/DTO | SUBSCRIPTION_PLAN_UPDATED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/subscriptions/plans | Yes | SUBSCRIPTION_VIEW | platform | query params | SuperAdminSubscription response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/subscriptions/plans | Yes | SUBSCRIPTION_MANAGE | platform | path params / JSON body | SuperAdminSubscription response/DTO | SUBSCRIPTION_PLAN_CREATED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/subscriptions/tenants/{tenantId}/invoices | Yes | FINANCE_VIEW | platform | query params | SuperAdminSubscription response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/subscriptions/tenants/{tenantId} | Yes | TENANT_VIEW | platform | query params | SuperAdminSubscription response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| PUT | /v1/super-admin/subscriptions/tenants/{tenantId} | Yes | TENANT_MANAGE | platform | path params / JSON body | SuperAdminSubscription response/DTO | TENANT_SUBSCRIPTION_ASSIGNED | CURRENT_IMPLEMENTED |
| DELETE | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | Yes | TEACHER_ASSIGNMENT_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | TEACHER_ASSIGNMENT_DEACTIVATED | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId} | Yes | TEACHER_ASSIGNMENT_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | TEACHER_ASSIGNMENT_UPDATED or TEACHER_ASSIGNMENT_DEACTIVATED | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/teachers/{teacherUserId}/assignments | Yes | TEACHER_ASSIGNMENT_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | TEACHER_ASSIGNMENT_CREATED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/tenants/{tenantId}/audit | Yes | VIEW_AUDIT | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/tenants/{tenantId}/schools | Yes | SCHOOL_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/tenants/{tenantId}/settings | Yes | SETTINGS_MANAGE | platform | path params / JSON body | SuperAdminPlatform response/DTO | TENANT_SETTINGS_UPDATED | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/tenants/{tenantId}/status | Yes | TENANT_MANAGE | platform | path params / JSON body | SuperAdminPlatform response/DTO | TENANT_STATUS_UPDATED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/tenants/{tenantId}/users | Yes | TENANT_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/tenants/{tenantId} | Yes | TENANT_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/tenants/onboard | Yes | TENANT_MANAGE | platform | path params / JSON body | TenantOnboarding response/DTO | TENANT_CREATED, SCHOOL_CREATED, SCHOOL_ADMIN_INVITED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/tenants | Yes | TENANT_VIEW | platform | query params | SuperAdminPlatform response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| DELETE | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | Yes | PERMISSION_OVERRIDE_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | PERMISSION_OVERRIDE_REVOKED | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/users/{userId}/permission-overrides/{overrideId} | Yes | PERMISSION_OVERRIDE_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | Audit action inferred from module; verify service for exact enum. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/users/{userId}/permission-overrides | Yes | PERMISSION_OVERRIDE_MANAGE | platform | query params | SuperAdminAccessControl response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/users/{userId}/permission-overrides | Yes | PERMISSION_OVERRIDE_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | PERMISSION_OVERRIDE_GRANTED or PERMISSION_OVERRIDE_DENIED | CURRENT_IMPLEMENTED |
| DELETE | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | Yes | ROLE_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | ROLE_DEACTIVATED | CURRENT_IMPLEMENTED |
| PATCH | /v1/super-admin/users/{userId}/roles/{roleAssignmentId} | Yes | ROLE_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | ROLE_UPDATED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/users/{userId}/roles | Yes | ROLE_MANAGE | platform | query params | SuperAdminAccessControl response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| POST | /v1/super-admin/users/{userId}/roles | Yes | ROLE_MANAGE | platform | path params / JSON body | SuperAdminAccessControl response/DTO | ROLE_ASSIGNED | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/users/{userId} | Yes | SUPER_ADMIN_VIEW | platform | query params | SuperAdminAccessControl response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |
| GET | /v1/super-admin/users | Yes | SUPER_ADMIN_VIEW | platform | query params | SuperAdminAccessControl response/DTO | Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access. | CURRENT_IMPLEMENTED |

## 9. Detailed API behavior
### PATCH /v1/ai/automation-rules/{id}
- Method: PATCH
- Full endpoint: /v1/ai/automation-rules/{id}
- Purpose: Read or manage automation rules/runs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: MANAGE_AI_AUTOMATION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"name":"Rule name","enabled":false,"requiresApproval":true}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AUTOMATION_RULE_UPDATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/ai/automation-rules
- Method: GET
- Full endpoint: /v1/ai/automation-rules
- Purpose: Read or manage automation rules/runs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: VIEW_AI_AUTOMATION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/ai/automation-runs
- Method: GET
- Full endpoint: /v1/ai/automation-runs
- Purpose: Read or manage automation rules/runs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: VIEW_AI_AUTOMATION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/ai/entitlement
- Method: GET
- Full endpoint: /v1/ai/entitlement
- Purpose: GET /v1/ai/entitlement in AI Recommendation / Automation.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: VIEW_AI_USAGE_OR_POLICY
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiUsageController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/knowledge/search
- Method: POST
- Full endpoint: /v1/ai/knowledge/search
- Purpose: Return navigation-oriented search results.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: MANAGE_AI_POLICY
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_IMPLEMENTED navigation search
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRetrievalController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/recommendations/{id}/accept
- Method: POST
- Full endpoint: /v1/ai/recommendations/{id}/accept
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_CREATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/config/ProductionReadinessValidatorTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, frontend/src/app/App.test.tsx, frontend/src/features/auth/pages/InvitationAcceptPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/recommendations/{id}/approve
- Method: POST
- Full endpoint: /v1/ai/recommendations/{id}/approve
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_APPROVED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/recommendations/{id}/dismiss
- Method: POST
- Full endpoint: /v1/ai/recommendations/{id}/dismiss
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_DISMISSED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/recommendations/{id}/execute
- Method: POST
- Full endpoint: /v1/ai/recommendations/{id}/execute
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_EXECUTED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/recommendations/{id}/reject
- Method: POST
- Full endpoint: /v1/ai/recommendations/{id}/reject
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_REJECTED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/config/ProductionReadinessValidatorTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/shared/api/httpClient.test.ts
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/ai/recommendations/{id}
- Method: GET
- Full endpoint: /v1/ai/recommendations/{id}
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: VIEW_AI_RECOMMENDATIONS
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/ai/recommendations
- Method: GET
- Full endpoint: /v1/ai/recommendations
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: VIEW_AI_RECOMMENDATIONS
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalController.java
- Backend service file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiRecommendationPortalService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/ai/usage/audit
- Method: POST
- Full endpoint: /v1/ai/usage/audit
- Purpose: Read audit logs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: MANAGE_AI_POLICY
- Scope checks: role AI policy scope
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/AiUsageController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/me/change-password
- Method: POST
- Full endpoint: /v1/me/change-password
- Purpose: POST /v1/me/change-password in Me / Session.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: SESSION_SELF_MANAGE
- Scope checks: current user/session
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: PASSWORD_CHANGED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/auth/api/authApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/me/logout
- Method: POST
- Full endpoint: /v1/me/logout
- Purpose: POST /v1/me/logout in Me / Session.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: SESSION_SELF_MANAGE
- Scope checks: current user/session
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"refreshToken":"refresh-token"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: USER_LOGGED_OUT
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/auth/api/authApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/me/schools/{schoolId}/activate
- Method: POST
- Full endpoint: /v1/me/schools/{schoolId}/activate
- Purpose: Create/update school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: SESSION_SELF_MANAGE
- Scope checks: current user/session
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: schoolId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/auth/api/authApi.ts, frontend/src/features/portal/api/dashboardApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/me/schools
- Method: GET
- Full endpoint: /v1/me/schools
- Purpose: Read school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: SESSION_SELF_MANAGE
- Scope checks: current user/session
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/auth/api/authApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/me
- Method: GET
- Full endpoint: /v1/me
- Purpose: Hydrate current user and active school context.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN, TENANT_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, FINANCE_STAFF, OFFICE_STAFF
- Permission required: SESSION_SELF_MANAGE
- Scope checks: current user/session
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"accessToken":"jwt-or-null","refreshToken":"refresh-or-null","tokenType":"Bearer","expiresAt":"2026-06-08T12:00:00Z","user":{"userId":"id","role":"SUPER_ADMIN"},"mfaRequired":false}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/auth/api/authApi.ts, frontend/src/features/portal/api/dashboardApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/identity/auth/session/CurrentUserController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, frontend/src/app/App.test.tsx, frontend/src/shared/api/apiBase.test.ts
- Gaps/TODOs: CURRENT_IMPLEMENTED

### PATCH /v1/super-admin/ai/automation-rules/{id}
- Method: PATCH
- Full endpoint: /v1/super-admin/ai/automation-rules/{id}
- Purpose: Read or manage automation rules/runs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: MANAGE_AI_AUTOMATION
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"name":"Rule name","enabled":false,"requiresApproval":true}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AUTOMATION_RULE_UPDATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/ai/automation-rules
- Method: GET
- Full endpoint: /v1/super-admin/ai/automation-rules
- Purpose: Read or manage automation rules/runs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AI_AUTOMATION
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/super-admin/ai/automation-rules
- Method: POST
- Full endpoint: /v1/super-admin/ai/automation-rules
- Purpose: Read or manage automation rules/runs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: MANAGE_AI_AUTOMATION
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"name":"Rule name","enabled":false,"requiresApproval":true}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AUTOMATION_RULE_CREATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/ai/automation-runs
- Method: GET
- Full endpoint: /v1/super-admin/ai/automation-runs
- Purpose: Read or manage automation rules/runs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AI_AUTOMATION
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/ai/entitlements
- Method: GET
- Full endpoint: /v1/super-admin/ai/entitlements
- Purpose: GET /v1/super-admin/ai/entitlements in AI Recommendation / Automation.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AI_USAGE_OR_POLICY
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/ai/policies/{tenantId}
- Method: GET
- Full endpoint: /v1/super-admin/ai/policies/{tenantId}
- Purpose: GET /v1/super-admin/ai/policies/{tenantId} in AI Recommendation / Automation.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AI_USAGE_OR_POLICY
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### PUT /v1/super-admin/ai/policies/{tenantId}
- Method: PUT
- Full endpoint: /v1/super-admin/ai/policies/{tenantId}
- Purpose: PUT /v1/super-admin/ai/policies/{tenantId} in AI Recommendation / Automation.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: MANAGE_AI_POLICY
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/ai/policies
- Method: GET
- Full endpoint: /v1/super-admin/ai/policies
- Purpose: GET /v1/super-admin/ai/policies in AI Recommendation / Automation.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AI_USAGE_OR_POLICY
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/super-admin/ai/recommendations/{id}/approve
- Method: POST
- Full endpoint: /v1/super-admin/ai/recommendations/{id}/approve
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_APPROVED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/super-admin/ai/recommendations/{id}/execute
- Method: POST
- Full endpoint: /v1/super-admin/ai/recommendations/{id}/execute
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_EXECUTED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/super-admin/ai/recommendations/{id}/reject
- Method: POST
- Full endpoint: /v1/super-admin/ai/recommendations/{id}/reject
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: AI_RECOMMENDATION_ACTION
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_REJECTED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/ai/recommendations/{id}
- Method: GET
- Full endpoint: /v1/super-admin/ai/recommendations/{id}
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AI_RECOMMENDATIONS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: id
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/ai/recommendations
- Method: GET
- Full endpoint: /v1/super-admin/ai/recommendations
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AI_RECOMMENDATIONS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_VIEWED where service records views; otherwise read audit is CURRENT_PARTIAL.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/super-admin/ai/recommendations
- Method: POST
- Full endpoint: /v1/super-admin/ai/recommendations
- Purpose: Read or act on AI recommendations.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: CREATE_AI_RECOMMENDATIONS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"type":"GENERAL","title":"Recommendation title","riskLevel":"LOW","metadataJson":"{}"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_RECOMMENDATION_CREATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/ai/tenants/{tenantId}/entitlement
- Method: GET
- Full endpoint: /v1/super-admin/ai/tenants/{tenantId}/entitlement
- Purpose: Read tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AI_USAGE_OR_POLICY
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/SuperAdminAiEntitlementController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### PUT /v1/super-admin/ai/tenants/{tenantId}/entitlement
- Method: PUT
- Full endpoint: /v1/super-admin/ai/tenants/{tenantId}/entitlement
- Purpose: Update tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: MANAGE_AI_POLICY
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: AI_ENTITLEMENT_UPDATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/intelligence/ai/SuperAdminAiEntitlementController.java
- Backend service file: CURRENT_PARTIAL service may be differently named
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/ai/usage/summary
- Method: GET
- Full endpoint: /v1/super-admin/ai/usage/summary
- Purpose: GET /v1/super-admin/ai/usage/summary in AI Recommendation / Automation.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AI_USAGE_OR_POLICY
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/ai/usage/tenants
- Method: GET
- Full endpoint: /v1/super-admin/ai/usage/tenants
- Purpose: Read tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AI_USAGE_OR_POLICY
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/audit-logs
- Method: GET
- Full endpoint: /v1/super-admin/audit-logs
- Purpose: Read audit logs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AUDIT
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/dashboard/summary
- Method: GET
- Full endpoint: /v1/super-admin/dashboard/summary
- Purpose: Return role dashboard metrics, alerts, and activity.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SUPER_ADMIN_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"metrics":[],"alerts":[],"activity":[]}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/portal/api/dashboardApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/portal/dashboard/DashboardSummaryController.java
- Backend service file: backend/src/main/java/com/cloudcampus/portal/dashboard/DashboardSummaryService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/notifications/deliveries/{deliveryId}
- Method: GET
- Full endpoint: /v1/super-admin/notifications/deliveries/{deliveryId}
- Purpose: Read notification delivery summary/list/detail.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_NOTIFICATIONS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: deliveryId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/notifications/deliveries
- Method: GET
- Full endpoint: /v1/super-admin/notifications/deliveries
- Purpose: Read notification delivery summary/list/detail.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_NOTIFICATIONS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/notifications/summary
- Method: GET
- Full endpoint: /v1/super-admin/notifications/summary
- Purpose: Read notification delivery summary/list/detail.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_NOTIFICATIONS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/permissions
- Method: GET
- Full endpoint: /v1/super-admin/permissions
- Purpose: Manage roles, permissions, or overrides.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: PERMISSION_VIEW_OR_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/platform-health
- Method: GET
- Full endpoint: /v1/super-admin/platform-health
- Purpose: GET /v1/super-admin/platform-health in Super Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SUPER_ADMIN_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/platform-metrics
- Method: GET
- Full endpoint: /v1/super-admin/platform-metrics
- Purpose: GET /v1/super-admin/platform-metrics in Super Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SUPER_ADMIN_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/reports/exports/{jobId}
- Method: GET
- Full endpoint: /v1/super-admin/reports/exports/{jobId}
- Purpose: List, inspect, or download report export data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_REPORTS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: jobId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/reports/exports
- Method: GET
- Full endpoint: /v1/super-admin/reports/exports
- Purpose: List, inspect, or download report export data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_REPORTS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/super-admin/api/platformApi.test.ts, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/super-admin/reports/exports
- Method: POST
- Full endpoint: /v1/super-admin/reports/exports
- Purpose: Create an asynchronous report export job.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: EXPORT_REPORTS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"reportType":"STUDENT_DIRECTORY","format":"CSV","tenantId":"tenant-id","schoolId":"school-id"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: REPORT_EXPORT_REQUESTED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/super-admin/api/platformApi.test.ts, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/reports/schools
- Method: GET
- Full endpoint: /v1/super-admin/reports/schools
- Purpose: Read school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_REPORTS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/reports/summary
- Method: GET
- Full endpoint: /v1/super-admin/reports/summary
- Purpose: GET /v1/super-admin/reports/summary in Report / Export.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_REPORTS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/reports/tenants
- Method: GET
- Full endpoint: /v1/super-admin/reports/tenants
- Purpose: Read tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_REPORTS
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/revenue/invoices
- Method: GET
- Full endpoint: /v1/super-admin/revenue/invoices
- Purpose: GET /v1/super-admin/revenue/invoices in Super Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: FINANCE_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/revenue/summary
- Method: GET
- Full endpoint: /v1/super-admin/revenue/summary
- Purpose: GET /v1/super-admin/revenue/summary in Super Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: FINANCE_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/revenue/tenants
- Method: GET
- Full endpoint: /v1/super-admin/revenue/tenants
- Purpose: Read tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: FINANCE_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/revenue/trends
- Method: GET
- Full endpoint: /v1/super-admin/revenue/trends
- Purpose: GET /v1/super-admin/revenue/trends in Super Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: FINANCE_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/roles/{role}/permissions
- Method: GET
- Full endpoint: /v1/super-admin/roles/{role}/permissions
- Purpose: Manage roles, permissions, or overrides.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: PERMISSION_VIEW_OR_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: role
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/schools/{schoolId}
- Method: GET
- Full endpoint: /v1/super-admin/schools/{schoolId}
- Purpose: Read school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SCHOOL_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: schoolId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/auth/pages/InvitationAcceptPage.test.tsx, frontend/src/features/auth/pages/LoginPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/schools
- Method: GET
- Full endpoint: /v1/super-admin/schools
- Purpose: Read school data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SCHOOL_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/search
- Method: GET
- Full endpoint: /v1/super-admin/search
- Purpose: Return navigation-oriented search results.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SUPER_ADMIN_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_IMPLEMENTED navigation search
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, tests/performance/super-admin-platform-smoke.k6.js
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/settings
- Method: GET
- Full endpoint: /v1/super-admin/settings
- Purpose: Read settings.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SETTINGS_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### PATCH /v1/super-admin/settings
- Method: PATCH
- Full endpoint: /v1/super-admin/settings
- Purpose: Update settings.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SETTINGS_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"key":"value"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: PLATFORM_SETTINGS_UPDATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### DELETE /v1/super-admin/students/{studentId}/guardians/{guardianLinkId}
- Method: DELETE
- Full endpoint: /v1/super-admin/students/{studentId}/guardians/{guardianLinkId}
- Purpose: Manage student guardian relationships.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: STUDENT_GUARDIAN_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: studentId, guardianLinkId
- Query params: none by default
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"message":"Deleted or deactivated"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: STUDENT_GUARDIAN_DEACTIVATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### PATCH /v1/super-admin/students/{studentId}/guardians/{guardianLinkId}
- Method: PATCH
- Full endpoint: /v1/super-admin/students/{studentId}/guardians/{guardianLinkId}
- Purpose: Manage student guardian relationships.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: STUDENT_GUARDIAN_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: studentId, guardianLinkId
- Query params: none by default
- Request body: {"guardianUserId":"guardian-user-id","relation":"PARENT","primaryContact":true,"active":true}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: STUDENT_GUARDIAN_UPDATED or STUDENT_GUARDIAN_DEACTIVATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/super-admin/students/{studentId}/guardians
- Method: POST
- Full endpoint: /v1/super-admin/students/{studentId}/guardians
- Purpose: Manage student guardian relationships.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: STUDENT_GUARDIAN_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: studentId
- Query params: none by default
- Request body: {"guardianUserId":"guardian-user-id","relation":"PARENT","primaryContact":true,"active":true}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: STUDENT_GUARDIAN_LINKED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### PATCH /v1/super-admin/subscriptions/plans/{planId}
- Method: PATCH
- Full endpoint: /v1/super-admin/subscriptions/plans/{planId}
- Purpose: Create/update subscription data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SUBSCRIPTION_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: planId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: SUBSCRIPTION_PLAN_UPDATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/subscriptions/plans
- Method: GET
- Full endpoint: /v1/super-admin/subscriptions/plans
- Purpose: Read subscription data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SUBSCRIPTION_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, frontend/src/app/App.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/super-admin/subscriptions/plans
- Method: POST
- Full endpoint: /v1/super-admin/subscriptions/plans
- Purpose: Create/update subscription data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SUBSCRIPTION_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: SUBSCRIPTION_PLAN_CREATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, frontend/src/app/App.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/subscriptions/tenants/{tenantId}/invoices
- Method: GET
- Full endpoint: /v1/super-admin/subscriptions/tenants/{tenantId}/invoices
- Purpose: Read tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: FINANCE_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/subscriptions/tenants/{tenantId}
- Method: GET
- Full endpoint: /v1/super-admin/subscriptions/tenants/{tenantId}
- Purpose: Read tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: TENANT_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### PUT /v1/super-admin/subscriptions/tenants/{tenantId}
- Method: PUT
- Full endpoint: /v1/super-admin/subscriptions/tenants/{tenantId}
- Purpose: Update tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: TENANT_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: TENANT_SUBSCRIPTION_ASSIGNED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### DELETE /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId}
- Method: DELETE
- Full endpoint: /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId}
- Purpose: Manage teacher assignment/class-subject links.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: TEACHER_ASSIGNMENT_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: teacherUserId, assignmentId
- Query params: none by default
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"message":"Deleted or deactivated"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: TEACHER_ASSIGNMENT_DEACTIVATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### PATCH /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId}
- Method: PATCH
- Full endpoint: /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId}
- Purpose: Manage teacher assignment/class-subject links.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: TEACHER_ASSIGNMENT_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: teacherUserId, assignmentId
- Query params: none by default
- Request body: {"schoolId":"school-id","classSubjectAssignmentId":"assignment-id","roleType":"SUBJECT_TEACHER","active":true}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: TEACHER_ASSIGNMENT_UPDATED or TEACHER_ASSIGNMENT_DEACTIVATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### POST /v1/super-admin/teachers/{teacherUserId}/assignments
- Method: POST
- Full endpoint: /v1/super-admin/teachers/{teacherUserId}/assignments
- Purpose: Manage teacher assignment/class-subject links.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: TEACHER_ASSIGNMENT_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: teacherUserId
- Query params: none by default
- Request body: {"schoolId":"school-id","classSubjectAssignmentId":"assignment-id","roleType":"SUBJECT_TEACHER","active":true}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: TEACHER_ASSIGNMENT_CREATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: NOT_FOUND_IN_CODEBASE
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: BACKEND_EXISTS_UI_NOT_SURFACED

### GET /v1/super-admin/tenants/{tenantId}/audit
- Method: GET
- Full endpoint: /v1/super-admin/tenants/{tenantId}/audit
- Purpose: Read audit logs.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: VIEW_AUDIT
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/shared/api/httpClient.test.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/tenants/{tenantId}/schools
- Method: GET
- Full endpoint: /v1/super-admin/tenants/{tenantId}/schools
- Purpose: Read tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SCHOOL_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/shared/api/httpClient.test.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### PATCH /v1/super-admin/tenants/{tenantId}/settings
- Method: PATCH
- Full endpoint: /v1/super-admin/tenants/{tenantId}/settings
- Purpose: Update settings.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SETTINGS_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: none by default
- Request body: {"key":"value"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: TENANT_SETTINGS_UPDATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/shared/api/httpClient.test.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### PATCH /v1/super-admin/tenants/{tenantId}/status
- Method: PATCH
- Full endpoint: /v1/super-admin/tenants/{tenantId}/status
- Purpose: Update tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: TENANT_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: TENANT_STATUS_UPDATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts, frontend/src/shared/api/httpClient.test.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/tenants/{tenantId}/users
- Method: GET
- Full endpoint: /v1/super-admin/tenants/{tenantId}/users
- Purpose: Read tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: TENANT_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/shared/api/httpClient.test.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/tenants/{tenantId}
- Method: GET
- Full endpoint: /v1/super-admin/tenants/{tenantId}
- Purpose: Read tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: TENANT_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: tenantId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/onboardingApi.ts, frontend/src/features/super-admin/api/platformApi.ts, frontend/src/shared/api/httpClient.test.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/academic/pages/AcademicSetupPage.test.tsx, frontend/src/features/auth/pages/InvitationAcceptPage.test.tsx, frontend/src/features/auth/pages/LoginPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/parent/pages/ParentLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminLeaveRequestsPage.test.tsx, frontend/src/features/parent/pages/SchoolAdminParentLinkPage.test.tsx, frontend/src/features/reports/pages/ReportExportsPage.test.tsx, frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantReportsPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSettingsPage.test.tsx, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/super-admin/tenants/onboard
- Method: POST
- Full endpoint: /v1/super-admin/tenants/onboard
- Purpose: Onboard tenant, school, and admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: TENANT_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: none by default
- Request body: {"example":"See backend request DTO for this endpoint."}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: TENANT_CREATED, SCHOOL_CREATED, SCHOOL_ADMIN_INVITED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/onboardingApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/HardCodedMainSchoolResolutionTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, frontend/src/app/App.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/tenants
- Method: GET
- Full endpoint: /v1/super-admin/tenants
- Purpose: Read tenant data.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: TENANT_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/shared/api/httpClient.test.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, frontend/src/app/App.test.tsx, frontend/src/features/super-admin/api/platformApi.test.ts, frontend/src/shared/api/httpClient.test.ts, tests/performance/super-admin-platform-smoke.k6.js, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### DELETE /v1/super-admin/users/{userId}/permission-overrides/{overrideId}
- Method: DELETE
- Full endpoint: /v1/super-admin/users/{userId}/permission-overrides/{overrideId}
- Purpose: DELETE /v1/super-admin/users/{userId}/permission-overrides/{overrideId} in Super Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: PERMISSION_OVERRIDE_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: userId, overrideId
- Query params: none by default
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"message":"Deleted or deactivated"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: PERMISSION_OVERRIDE_REVOKED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### PATCH /v1/super-admin/users/{userId}/permission-overrides/{overrideId}
- Method: PATCH
- Full endpoint: /v1/super-admin/users/{userId}/permission-overrides/{overrideId}
- Purpose: PATCH /v1/super-admin/users/{userId}/permission-overrides/{overrideId} in Super Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: PERMISSION_OVERRIDE_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: userId, overrideId
- Query params: none by default
- Request body: {"permissionCode":"STUDENT_VIEW","allowed":true,"reason":"Temporary access"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Audit action inferred from module; verify service for exact enum.
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/users/{userId}/permission-overrides
- Method: GET
- Full endpoint: /v1/super-admin/users/{userId}/permission-overrides
- Purpose: GET /v1/super-admin/users/{userId}/permission-overrides in Super Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: PERMISSION_OVERRIDE_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: userId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/student/pages/StudentImportPage.test.tsx
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/super-admin/users/{userId}/permission-overrides
- Method: POST
- Full endpoint: /v1/super-admin/users/{userId}/permission-overrides
- Purpose: POST /v1/super-admin/users/{userId}/permission-overrides in Super Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: PERMISSION_OVERRIDE_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: userId
- Query params: none by default
- Request body: {"permissionCode":"STUDENT_VIEW","allowed":true,"reason":"Temporary access"}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: PERMISSION_OVERRIDE_GRANTED or PERMISSION_OVERRIDE_DENIED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### DELETE /v1/super-admin/users/{userId}/roles/{roleAssignmentId}
- Method: DELETE
- Full endpoint: /v1/super-admin/users/{userId}/roles/{roleAssignmentId}
- Purpose: Manage roles, permissions, or overrides.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: ROLE_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: userId, roleAssignmentId
- Query params: none by default
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"message":"Deleted or deactivated"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: ROLE_DEACTIVATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### PATCH /v1/super-admin/users/{userId}/roles/{roleAssignmentId}
- Method: PATCH
- Full endpoint: /v1/super-admin/users/{userId}/roles/{roleAssignmentId}
- Purpose: Manage roles, permissions, or overrides.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: ROLE_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: userId, roleAssignmentId
- Query params: none by default
- Request body: {"role":"TEACHER","scopeType":"SCHOOL","tenantId":"tenant-id","schoolId":"school-id","active":true}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: ROLE_UPDATED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/users/{userId}/roles
- Method: GET
- Full endpoint: /v1/super-admin/users/{userId}/roles
- Purpose: Manage roles, permissions, or overrides.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: ROLE_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: userId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### POST /v1/super-admin/users/{userId}/roles
- Method: POST
- Full endpoint: /v1/super-admin/users/{userId}/roles
- Purpose: Manage roles, permissions, or overrides.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: ROLE_MANAGE
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: userId
- Query params: none by default
- Request body: {"role":"TEACHER","scopeType":"SCHOOL","tenantId":"tenant-id","schoolId":"school-id","active":true}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK / 201 Created / 204 No Content depending command
- Success response body: {"id":"resource-id","status":"OK"}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: ROLE_ASSIGNED
- Side effects: state/audit/job/outbox changes possible
- Pagination: n/a
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/users/{userId}
- Method: GET
- Full endpoint: /v1/super-admin/users/{userId}
- Purpose: GET /v1/super-admin/users/{userId} in Super Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SUPER_ADMIN_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: userId
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/academic/AcademicAssignmentFlowTest.java, backend/src/test/java/com/cloudcampus/academic/AcademicLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/config/ProductionReadinessValidatorTest.java, backend/src/test/java/com/cloudcampus/events/outbox/TransactionalOutboxFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiGovernanceFlowTest.java, backend/src/test/java/com/cloudcampus/intelligence/ai/AiScopedRetrievalFlowTest.java, backend/src/test/java/com/cloudcampus/notification/InvitationEmailDeliveryFlowTest.java, backend/src/test/java/com/cloudcampus/operations/attendance/AttendanceFlowTest.java, backend/src/test/java/com/cloudcampus/operations/bulk/BulkJobFlowTest.java, backend/src/test/java/com/cloudcampus/operations/exam/ExamFlowTest.java, backend/src/test/java/com/cloudcampus/operations/finance/FeeLifecycleFlowTest.java, backend/src/test/java/com/cloudcampus/operations/homework/HomeworkFlowTest.java, backend/src/test/java/com/cloudcampus/operations/notice/NoticeFlowTest.java, backend/src/test/java/com/cloudcampus/operations/report/ReportExportFlowTest.java, backend/src/test/java/com/cloudcampus/operations/timetable/TimetablePortalFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentChildLinkingFlowTest.java, backend/src/test/java/com/cloudcampus/people/parent/ParentLeaveRequestFlowTest.java, backend/src/test/java/com/cloudcampus/people/staff/StaffProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentImportJobFlowTest.java, backend/src/test/java/com/cloudcampus/people/student/StudentLoginProvisioningFlowTest.java, backend/src/test/java/com/cloudcampus/platform/subscription/SuperAdminSubscriptionFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrapTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/control/SuperAdminPlatformControlFlowTest.java, backend/src/test/java/com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/report/TenantAdminReportSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolManagementFlowTest.java, backend/src/test/java/com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/portal/dashboard/DashboardSummaryFlowTest.java, backend/src/test/java/com/cloudcampus/school/SchoolSettingsFlowTest.java, backend/src/test/java/com/cloudcampus/security/AuthSessionFlowTest.java, backend/src/test/java/com/cloudcampus/security/SchoolAccessIsolationTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedMissingModulesFlowTest.java, backend/src/test/java/com/cloudcampus/security/TenantContextSpoofingTest.java, backend/src/test/java/com/cloudcampus/testsupport/AuthTestSupport.java, frontend/src/app/App.test.tsx, frontend/src/features/academic/pages/AcademicAssignmentsPage.test.tsx, frontend/src/features/auth/api/authApi.test.ts, frontend/src/features/auth/pages/InvitationAcceptPage.test.tsx, frontend/src/features/auth/pages/LoginPage.test.tsx, frontend/src/features/finance/pages/FeeLifecyclePage.test.tsx, frontend/src/features/operations/pages/BulkJobsPage.test.tsx, frontend/src/features/staff/pages/StaffProvisioningPage.test.tsx, frontend/src/features/student/pages/StudentImportPage.test.tsx, frontend/src/features/super-admin/pages/TenantOnboardingPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolCreationPage.test.tsx, frontend/src/features/tenant-admin/pages/TenantSchoolManagementPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

### GET /v1/super-admin/users
- Method: GET
- Full endpoint: /v1/super-admin/users
- Purpose: GET /v1/super-admin/users in Super Admin.
- Current implementation status: CURRENT_IMPLEMENTED
- Auth required: Yes
- Role required: SUPER_ADMIN
- Permission required: SUPER_ADMIN_VIEW
- Scope checks: platform
- Request headers: Authorization except public auth; Content-Type for JSON writes.
- Path params: none
- Query params: page, size, search/q, status/filter where supported
- Request body: {}
- Field validation: CURRENT_PARTIAL module DTO/service validation.
- Example request: see docs/API_INDEX.md and the API module doc.
- Success status code: 200 OK
- Success response body: {"items":[],"page":0,"size":50,"totalItems":0,"totalPages":0}
- Response field descriptions: see API doc card.
- Error status codes: 400, 401, 403, 404, 409, 429 for login, 500.
- Error response examples: standard ApiErrorResponse.
- Audit events: Read-only endpoint; explicit audit is CURRENT_PARTIAL unless service records read access.
- Side effects: read-only unless view audit
- Pagination: CURRENT_PARTIAL/CURRENT_IMPLEMENTED by endpoint
- Sorting: CURRENT_PARTIAL endpoint-specific.
- Filtering: CURRENT_PARTIAL endpoint-specific.
- Search behavior: CURRENT_PARTIAL/NOT_FOUND_IN_CODEBASE by endpoint
- Rate limits if found: login only; general endpoint limits PLANNED_RECOMMENDED.
- Security notes: enforce role/scope and no tenant/school spoofing.
- Privacy notes: mask sensitive fields by role.
- Performance notes: broad lists must be paginated/indexed.
- Frontend caller file: frontend/src/features/super-admin/api/platformApi.ts
- Backend controller file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java
- Backend service file: backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlService.java
- Repository/query source: CURRENT_PARTIAL module-specific repository.
- Tests that cover it: backend/src/test/java/com/cloudcampus/audit/AuditCoverageMatrixTest.java, backend/src/test/java/com/cloudcampus/security/SchoolScopedControllerGuardCoverageTest.java, frontend/src/features/student/pages/StudentImportPage.test.tsx, tests/performance/super-admin-scale-seed-sql.mjs
- Gaps/TODOs: CURRENT_IMPLEMENTED

## 10. Workflows
| Flow | Actor | Preconditions | Trigger | State changes | Audit events | Recovery behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Tenant onboarding | SUPER_ADMIN | MFA session | Submit tenant onboarding form | Tenant/school/admin/subscription created | TENANT_CREATED/SCHOOL_CREATED/SCHOOL_ADMIN_INVITED | Rollback transaction on validation/conflict |
| Access-control change | SUPER_ADMIN | Target user exists | Create/update role or override | Role/permission state updated | ROLE_* / PERMISSION_OVERRIDE_* | SYSTEM/AI_AGENT primary login role blocked |
| AI governance | SUPER_ADMIN | Recommendation/rule/policy exists | Approve/reject/execute or edit policy | AI state changes or automation may run | AI_RECOMMENDATION_* / AUTOMATION_* / AI_POLICY_UPDATED | High risk should require approval |

### Workflow detail notes
- UI screen: CURRENT_IMPLEMENTED screens are listed in section 6.
- API sequence: login/MFA if needed, /v1/me hydration, screen-specific reads, command write, refetch/state update.
- Request/response examples: see section 9 and docs/api/*.md.
- Notifications created: CURRENT_PARTIAL module-specific.
- Background jobs created: CURRENT_IMPLEMENTED for report exports/bulk jobs where endpoints exist.
- Failure cases: 400/401/403/404/409/429/500 depending validation/auth/scope/conflict/rate limit.
- Recovery behavior: retry safe reads; commands should use service transaction rollback or explicit job failure state.

## 11. AI recommendation and automation behavior
| Capability | Status | Notes |
| --- | --- | --- |
| Can view AI recommendations? | CURRENT_IMPLEMENTED | Role AI panels/API endpoints where permitted. |
| Can create AI recommendations? | CURRENT_IMPLEMENTED | Super Admin governance can create; AI_AGENT should be internal/non-login. |
| Can approve AI recommendations? | CURRENT_IMPLEMENTED | High impact should require human approval. |
| Can reject AI recommendations? | CURRENT_IMPLEMENTED | Reject/dismiss APIs exist by flow. |
| Can execute approved AI action? | CURRENT_IMPLEMENTED | Execution must remain policy-controlled. |
| Can configure AI policy? | CURRENT_IMPLEMENTED | Platform policy endpoints are Super Admin in current backend. |
| Can run automation? | CURRENT_IMPLEMENTED | Automation rules/runs exist. |
| Can approve automation? | CURRENT_IMPLEMENTED | Approval matrix in docs/ai/AI_APPROVAL_MATRIX.md. |
| Allowed risk levels | LOW/MEDIUM/HIGH where policy allows | CURRENT_PARTIAL enforcement by service. |
| Recommendation types allowed | Role-specific AI types for academic, finance, office, parent/student study help. | CURRENT_PARTIAL |
| What AI must never do | Direct sensitive mutation without approval, cross-tenant access, hidden finance/marks/subscription/user changes. | PLANNED_RECOMMENDED |
| Human approval rules | High-risk and sensitive actions require human approval. | CURRENT_PARTIAL |

## 12. Notification behavior
| Behavior | Status | Details |
| --- | --- | --- |
| Notifications this role can receive | CURRENT_PARTIAL | Delivery records exist; role inbox UI varies. |
| Notifications this role can send | CURRENT_PARTIAL | Notice/notification sending depends on module endpoints. |
| Message approval requirement | CURRENT_PARTIAL | AI-drafted messages should require human approval. |
| Recipient masking rules | CURRENT_IMPLEMENTED | Notification delivery DTO exposes maskedRecipient. |
| Delivery audit | CURRENT_PARTIAL | Delivery rows track status/failure; explicit audit varies. |
| Retry behavior | CURRENT_PARTIAL | Outbox/retry infrastructure exists; scheduler policy should be verified. |

## 13. Reports and exports
| Report/export item | Status | Notes |
| --- | --- | --- |
| Reports visible | CURRENT_IMPLEMENTED | Reports nav/screen visibility from App.tsx. |
| Export permissions | CURRENT_IMPLEMENTED | Export endpoints documented in Report API. |
| Async export behavior | CURRENT_IMPLEMENTED | Report export jobs/files and worker classes exist. |
| Sensitive field masking | CURRENT_PARTIAL | Must be reviewed per report/export DTO. |
| Download permission | PLANNED_RECOMMENDED | School export download exists; platform download varies. |
| Audit requirement | CURRENT_IMPLEMENTED | REPORT_EXPORT_* enum values exist. |
| MFA-fresh requirement | CURRENT_PARTIAL | Login MFA exists for privileged roles; endpoint freshness not uniform. |

## 14. Security risks and controls
- vertical privilege escalation risks: CURRENT_IMPLEMENTED Super Admin service guards; PLANNED_RECOMMENDED full role-matrix tests.
- horizontal tenant/school access risks: CURRENT_IMPLEMENTED scope patterns and spoofing filter; CURRENT_PARTIAL per-module tests.
- sensitive data exposure risks: CURRENT_PARTIAL field masking review needed.
- AI risks: CURRENT_PARTIAL governance exists; central risk approval policy recommended.
- payment/finance risks: CURRENT_IMPLEMENTED finance audit/API foundations; PLANNED_RECOMMENDED MFA freshness/refund approvals.
- mitigation in current code: JWT auth, MFA roles, non-login system actors, audit logging, role/scope services, constraints/indexes.
- missing controls if any: OpenAPI, endpoint rate limits, field-level privacy tests, comprehensive role-permission tests.

## 15. Test cases
| Test case | Type | Preconditions | Steps | Expected result | Current coverage |
| --- | --- | --- | --- | --- | --- |
| SUPER_ADMIN login/session | Integration/UI | Login allowed or public flow | Login/MFA/hydrate /v1/me | Correct role/token/scope | CURRENT_PARTIAL |
| SUPER_ADMIN forbidden cross-role API | Security | Authenticated session | Call unauthorized endpoint | 403/401 | CURRENT_PARTIAL |
| SUPER_ADMIN scope isolation | Security | Two tenants/schools/children/classes | Access outside scope | 403/404 | CURRENT_PARTIAL |
| SUPER_ADMIN dashboard load | UI/API | Authenticated session | Open dashboard | Metrics or empty state | CURRENT_PARTIAL |
| SUPER_ADMIN AI guard | Security/API | AI policy states | View/approve/execute | Only allowed action proceeds | CURRENT_PARTIAL |
| SUPER_ADMIN report/export privacy | Security/API | Sensitive data exists | Request report/export | Scoped masked data only | PLANNED_RECOMMENDED |

## 16. Edge cases
- missing token: CURRENT_IMPLEMENTED protected APIs return 401.
- expired session: CURRENT_IMPLEMENTED JWT/session services reject expired tokens; refresh flow exists.
- inactive user: CURRENT_IMPLEMENTED auth blocks inactive users.
- suspended tenant: CURRENT_PARTIAL tenant status modeled; every endpoint should verify behavior.
- inactive school: CURRENT_PARTIAL school active checks are module-specific.
- no active school context: CURRENT_IMPLEMENTED/CURRENT_PARTIAL school APIs require active/allowed school.
- user with multiple roles: CURRENT_IMPLEMENTED role assignment model exists.
- user with conflicting permission override: CURRENT_IMPLEMENTED override model exists; test edge behavior.
- user linked to multiple schools: CURRENT_IMPLEMENTED allowed school list and activation endpoint exist.
- parent with multiple children: CURRENT_IMPLEMENTED guardian/child models exist; UI behavior CURRENT_PARTIAL.
- teacher with multiple class assignments: CURRENT_IMPLEMENTED teacher assignment model exists.
- zero records: CURRENT_IMPLEMENTED/CURRENT_PARTIAL empty states.
- large data pagination: CURRENT_IMPLEMENTED indexes/page responses; UI often uses fixed size.
- invalid filters: CURRENT_PARTIAL endpoint-specific validation.
- deleted/inactive linked records: CURRENT_PARTIAL deactivation/read visibility must be verified.

## 17. Open gaps
| Gap type | Status | Detail |
| --- | --- | --- |
| missing API | CURRENT_PARTIAL | See docs/gaps/CURRENT_GAPS_AND_TODOS.md. |
| missing UI | BACKEND_EXISTS_UI_NOT_SURFACED | Backend endpoints without frontend callers are listed in docs/API_INDEX.md. |
| missing tests | CURRENT_PARTIAL | Direct endpoint tests are not present for every controller. |
| missing validation | CURRENT_PARTIAL | DTO validation not uniform. |
| missing audit | CURRENT_PARTIAL | Read APIs and some settings/list interactions may not audit. |
| performance risk | CURRENT_PARTIAL | Broad lists need page max and explain plans. |
| security risk | CURRENT_PARTIAL | MFA freshness and field privacy checks recommended. |
| documentation uncertainty | CURRENT_PARTIAL | Generated from static code scan; runtime contract tests should verify. |

## 18. Final checklist
| Item | Status | Notes |
| --- | --- | --- |
| Role enum documented | CURRENT_IMPLEMENTED | SUPER_ADMIN |
| Login/MFA behavior documented | CURRENT_IMPLEMENTED | login / MFA |
| Scope documented | CURRENT_IMPLEMENTED | platform |
| Permissions documented | CURRENT_IMPLEMENTED | 93 rows |
| Navigation documented | CURRENT_IMPLEMENTED | 12 screens |
| APIs documented | CURRENT_IMPLEMENTED | 90 endpoints |
| AI behavior documented | CURRENT_IMPLEMENTED | Section 11 |
| Notification behavior documented | CURRENT_IMPLEMENTED | Section 12 |
| Reports/exports documented | CURRENT_IMPLEMENTED | Section 13 |
| Security controls documented | CURRENT_IMPLEMENTED | Section 14 |
| Tests and gaps documented | CURRENT_IMPLEMENTED | Sections 15 and 17 |
