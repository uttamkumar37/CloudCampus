# Backend Full Repo Audit Report

Generated on: 2026-06-09  
Scope: `backend`, root config, docs, tests, deployment files, API docs, role and permission docs, frontend API callers for alignment checks.  
Status labels used: IMPLEMENTED, PARTIAL, BACKEND_ONLY, FRONTEND_ONLY, NOT_FOUND, BROKEN, RISKY, NEEDS_TESTS, NEEDS_DOCS, NEEDS_MANUAL_VERIFICATION.

## 1. Executive Summary

| Area | Finding |
| --- | --- |
| Backend framework detected | Spring Boot 3.5.14, Spring Web, Spring Data JPA, Bean Validation, Actuator, Mail, Flyway |
| Build tool detected | Maven, `backend/pom.xml` |
| Java version | Java 21, `backend/pom.xml` property `java.version` |
| Main backend folder | `backend/src/main/java/com/cloudcampus` |
| Major modules found | 31 functional packages: academic, audit, common, config, demo, events/outbox, identity/accesscontrol, identity/auth/session, invitation, intelligence/ai, notification, operations/attendance, bulk, document, exam, finance, homework, notice, report, timetable, website, people/parent, people/staff, people/student, platform/subscription, superadmin, tenant, tenantadmin/report, tenantadmin/school, tenantadmin/settings, portal/dashboard, school |
| Overall backend health | IMPLEMENTED for the core ERP foundation and green test suite; PARTIAL for production-grade auth hardening, rate limits beyond login, fresh-auth/MFA enforcement on high-risk actions, office/admission/certificate modules, file/object storage, payment gateway, report download hardening, and full frontend parity |
| Biggest risks | Mixed role model (`OFFICE_STAFF` plus legacy `STAFF`), public/auth endpoints not consistently abuse-limited, no Spring Security filter chain found, controller guards are mostly service/resolver based, finance/report/export actions do not show fresh-auth/MFA enforcement, many UI nav entries point to generic or placeholder panels |
| Highest-priority fixes | Centralize authorization, add rate limits for password reset/MFA/invitations/AI/export, enforce MFA/fresh-auth for finance/export/admin mutations, split `STAFF` alias from `OFFICE_STAFF`, finish missing office/admission/certificate APIs or hide UI |
| Backend aligned with frontend | PARTIAL. Most school-admin, finance, parent, student, tenant-admin, super-admin API clients match real endpoints. Multiple backend endpoints are BACKEND_ONLY, and multiple frontend role screens are generic shell surfaces rather than dedicated backend-backed modules |
| Backend aligned with role inventories | PARTIAL. GUEST internal permission removal is present in migration `V30__remove_guest_enquiry_management.sql`; PARENT linked-child scope is implemented for parent portal APIs; FINANCE_STAFF has finance APIs but MFA/fresh-auth behavior is not enforced at finance endpoint level; OFFICE_STAFF exists but is mixed with legacy `STAFF` and has only document/student/dashboard coverage, not full admissions/enquiries/certificates |

## 2. Repository Backend Structure

| Category | Paths |
| --- | --- |
| Backend root | `backend` |
| Package root | `backend/src/main/java/com/cloudcampus` |
| Controllers | `**/*Controller.java` across `academic`, `identity/auth/session`, `identity/auth/invitation`, `intelligence/ai`, `operations/*`, `people/*`, `platform/*`, `portal/dashboard`, `school` |
| Services | `**/*Service.java`, plus workers/processors in `platform/superadmin/control` |
| DTOs | Request/Response records colocated with modules, for example `LoginRequest`, `DashboardSummaryResponse`, `FeeDemandRequest`, `ReportExportResponse` |
| Repositories | `**/*Repository.java`, 61 JPA repositories detected during test boot |
| Entities/models | JPA classes such as `Tenant`, `School`, `UserAccount`, `FeeDemand`, `AiRecommendation`, `AuditLog`, `OutboxEvent` |
| Security/auth/session | `backend/src/main/java/com/cloudcampus/identity/auth/session`, `identity/accesscontrol`, `common/tenant/ClientTenantContextSpoofingFilter.java` |
| Migrations | `backend/src/main/resources/db/migration/V1__...` through `V30__remove_guest_enquiry_management.sql` |
| Config | `backend/src/main/resources/application.yml`, `application-local.yml`, `config/CorsConfig.java`, `PasswordConfig.java`, production readiness validators |
| Tests | `backend/src/test/java/com/cloudcampus`, 40 test source files compiled, 169 tests passed |
| Docs | `docs/API_INDEX.md`, `docs/api/*.md`, `docs/audit/*.md`, `docs/ROLE_PERMISSION_MATRIX.md`, `docs/ROLE_SCREEN_MATRIX.md`, `docs/testing/*.md` |

## 3. Build and Runtime Configuration

| Item | Evidence | Status | Notes |
| --- | --- | --- | --- |
| Spring Boot | `backend/pom.xml` parent `spring-boot-starter-parent` 3.5.14 | IMPLEMENTED | Modern Spring Boot baseline |
| Java | `java.version` 21 | IMPLEMENTED | Test run used Java 21.0.11 |
| Persistence | JPA/Hibernate, Flyway, H2 runtime, PostgreSQL runtime | IMPLEMENTED | `ddl-auto: validate`, Flyway migrations validated in test boot |
| Database config | `CLOUDCAMPUS_JDBC_URL`, driver, username, password in `application.yml` | IMPLEMENTED | Defaults to H2 in-memory; production uses env vars |
| CORS | `config/CorsConfig.java`, `cloudcampus.cors.allowed-origins` | PARTIAL | Env-configured; requires production origin verification |
| JWT | `cloudcampus.auth.jwt-secret`, access TTL | RISKY | Dev default secret exists in `application.yml`; production validator should block weak prod config |
| SMTP | `spring.mail.*`, `cloudcampus.notifications.email.*` | PARTIAL | Log-mode default; production email requires env hardening |
| Docker | `backend/Dockerfile`, root compose files | IMPLEMENTED | Local/staging/prod compose files present |
| CI | `.github/workflows` referenced in README, not present in `find -maxdepth 4` output | NEEDS_MANUAL_VERIFICATION | Hidden by maxdepth or missing; verify CI path |
| Startup | `mvn spring-boot:run` or Docker entrypoint | IMPLEMENTED | Inferred from Maven/Spring Boot |
| Test command | `mvn test` | IMPLEMENTED | Passed: 169 tests, 0 failures, 0 errors |

## 4. Backend Module Inventory

| Module | Main package | Controllers | Services | Repositories/entities | Endpoints | Roles/scope | Tests | Docs | Status | Gaps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Auth/session | `identity/auth/session` | `AuthController`, `CurrentUserController` | `AuthSessionService`, token/rate-limiter services | `UserAccount`, refresh/revoked/reset/MFA repos | `/v1/auth/*`, `/v1/me`, `/v1/me/schools`, `/v1/me/schools/{schoolId}/activate` | Public auth plus authenticated current user | `AuthSessionFlowTest` | `docs/api/AUTH_API.md`, `ME_SESSION_API.md` | IMPLEMENTED | Rate limits beyond login need verification; no fresh-auth endpoint found |
| Invitation | `identity/auth/invitation` | `InvitationController` | `InvitationAcceptanceService`, `InvitationTokenService` | `Invitation` | `POST /v1/invitations/accept` | Public token flow | covered through onboarding/staff/student tests | `AUTH_API.md` | IMPLEMENTED | Invitation accept abuse-limit not found |
| MFA | `identity/auth/session` | `AuthController` | `MfaChallengeRepository`, verify logic in `AuthSessionService` | `MfaChallenge` | `POST /v1/auth/mfa/verify` | Required in auth flow for configured users/roles | `AuthSessionFlowTest` | `AUTH_API.md` | IMPLEMENTED | Finance endpoint-level MFA/fresh-auth enforcement not found |
| Password reset | `identity/auth/session` | `AuthController` | `AuthSessionService` | `PasswordResetToken` | forgot/reset | Public auth | `AuthSessionFlowTest` | `AUTH_API.md` | PARTIAL | Forgot/reset rate limit not found |
| Access control/RBAC | `identity/accesscontrol`, `platform/superadmin/control` | `SuperAdminAccessControlController` | `AuthorizationService`, `SchoolAccessService`, super-admin access service | `Permission`, `RolePermission`, overrides, assignments | `/v1/super-admin/permissions`, roles, user role/permission operations | Platform/admin permission management | `SuperAdminPlatformControlFlowTest`, security tests | `ROLE_PERMISSION_MATRIX.md` | IMPLEMENTED | No annotation-level permission model; enforcement spread across services |
| Dashboard | `portal/dashboard` | `DashboardSummaryController` | `DashboardSummaryService` | repositories from many modules | `/v1/*/dashboard/summary` | Role-specific, active school for school roles | `DashboardSummaryFlowTest` | API index | IMPLEMENTED | Guest/system/AI dashboards are placeholder/self endpoints in frontend |
| Tenant/school activation | `identity/auth/session`, `school`, `platform/tenantadmin/school` | `CurrentUserController`, `SchoolSettingsController`, tenant admin controllers | `SchoolAccessService`, school/tenant admin services | `School`, `UserSchoolAccess` | `/v1/me/schools`, school settings, tenant school management | Tenant/school-scoped | school access isolation tests | `ME_SESSION_API.md`, settings docs | IMPLEMENTED | Active-school headers/context need manual client verification |
| Parent portal | `people/parent`, operations modules | `ParentPortalController`, `ParentLeaveRequestController` | parent services | `ParentStudentLink`, `StudentGuardian`, leave requests | `/v1/parent/children`, child attendance/homework/results/fees/notices/timetable/leave | Linked child and active school | parent linking/leave tests | `STUDENT_PARENT_API.md` | IMPLEMENTED | `GET /v1/parent/children/{studentId}` expected but not confirmed in inventory |
| Attendance | `operations/attendance` | `AttendanceController` | `AttendanceService` | sessions/records | school-admin, teacher, parent child, student endpoints | School, teacher assignment, child/self | `AttendanceFlowTest` | `ACADEMIC_API.md` | IMPLEMENTED | Advanced reports/export not present |
| Homework | `operations/homework` | `HomeworkController` | `HomeworkService` | homework/submissions | school-admin, teacher, parent child, student | School, teacher, child/self | `HomeworkFlowTest` | API docs | IMPLEMENTED | Review/grade workflow partial |
| Exams/results | `operations/exam` | `ExamController` | `ExamService` | exams/results | school-admin, teacher, parent child, student | School, teacher, child/self | `ExamFlowTest` | API docs | IMPLEMENTED | Results approval UX/API partly principal-facing but not distinct |
| Finance/receipts | `operations/finance` | `FeeController` | `FeeService` | demands/payments | `/v1/finance/*`, school-admin fee endpoints, student/parent fees | School and child/self | `FeeLifecycleFlowTest` | `FINANCE_API.md` | IMPLEMENTED | Payment gateway, concessions, structures, MFA/fresh-auth not found |
| Reports/exports | `operations/report`, `platform/superadmin/control` | `ReportExportController`, super-admin reports endpoints | `ReportExportService`, super-admin worker | export jobs/files | `/v1/school-admin/reports/exports`, finance exports, super-admin exports | School/platform | `ReportExportFlowTest` | `REPORT_EXPORT_API.md` | IMPLEMENTED | Downloads are text/content-backed, object storage/data masking/fresh-auth need hardening |
| Notices | `operations/notice` | `NoticeController` | `NoticeService` | `Notice` | school-admin create/list/publish, teacher/parent/student list | School, audience, child/self | `NoticeFlowTest` | API docs | IMPLEMENTED | Rich targeting/attachments missing |
| Timetable | `operations/timetable` | `TimetableController` | `TimetableService` | `TimetableEntry` | school-admin CRUD/list, parent/student/teacher views | School, child/self/teacher | `TimetablePortalFlowTest` | API docs | IMPLEMENTED | Frontend mostly BACKEND_ONLY |
| Student records/import/login | `people/student` | `StudentImportController`, `StudentLoginController` | import/login services | `Student`, import job/errors, `StudentUserLink` | school-admin students/import/login-invitation, student profile | School/self | three student tests | `STUDENT_PARENT_API.md` | IMPLEMENTED | Full student record CRUD not present |
| Staff/teachers | `people/staff` | provisioning/directory controllers | staff directory/provisioning services | `StaffProfile` | `/v1/school-admin/staff`, `/teachers`, `/staff/provision` | School admin/principal and role filters | `StaffProvisioningFlowTest` | API index | IMPLEMENTED | Office staff role aliasing and full staff lifecycle partial |
| Admissions/enquiries/certificates/visitors | packages absent or `.gitkeep` only | NOT_FOUND | NOT_FOUND | NOT_FOUND | No dedicated APIs found | N/A | NOT_FOUND | role docs mention expectations | NOT_FOUND | UI shows nav for admissions/enquiries/certificates but backend modules are missing |
| Documents | `operations/document` | `SchoolDocumentController` | `SchoolDocumentService` | `SchoolDocument` | school-admin document endpoints | Office/staff service role guard, school scope | security missing modules test | API index | PARTIAL | Metadata only; no object storage/upload/download flow |
| Website builder | `operations/website` | `WebsiteController` | `WebsiteService` | `WebsitePage` | school-admin website pages | School admin/principal | security tests | API index | BACKEND_ONLY | No real frontend builder |
| AI recommendations/automation/usage/retrieval | `intelligence/ai`, `platform/superadmin/control` | AI portal, retrieval, usage, entitlements, knowledge, super-admin governance | AI governance/retrieval/recommendation services | AI policies, recommendations, entitlements, audits, automation | `/v1/ai/*`, `/v1/super-admin/ai/*`, school-admin knowledge docs | Complex role/scope guards | `AiGovernanceFlowTest`, `AiScopedRetrievalFlowTest` | `docs/ai/*`, `AI_RECOMMENDATION_AUTOMATION_API.md` | IMPLEMENTED | Parent/office/finance exposure is narrow but frontend AI screens are partial/generic |
| Audit/outbox | `audit`, `events/outbox` | no public audit controller except super-admin audit views | `AuditLogService`, `TransactionalOutboxService` | `AuditLog`, `OutboxEvent` | audit listing through super-admin | Tenant/school/platform | audit/outbox tests | `AUDIT_EVENT_CATALOG.md`, `AUDIT_API.md` | IMPLEMENTED | Some read-only endpoints lack audit by design; mutation coverage should stay enforced |
| Notifications | `notification`, super-admin notification views | super-admin platform controller | email delivery service | notification delivery | super-admin notification summary/delivery endpoints | Platform | `InvitationEmailDeliveryFlowTest` | `NOTIFICATION_API.md` | IMPLEMENTED | Real provider delivery/manual retry needs verification |
| Bulk jobs | `operations/bulk` | `BulkJobController` | `BulkJobService` | `BulkJob` | school-admin bulk jobs | School | `BulkJobFlowTest` | operations docs | IMPLEMENTED | Async worker depth unclear |
| Super admin | `platform/superadmin/*`, `subscription` | many controllers | platform, onboarding, subscription, access, AI services | tenant/school/stats/subscription/settings | `/v1/super-admin/**` | Platform/SUPER_ADMIN | multiple tests | `SUPER_ADMIN_API.md` | IMPLEMENTED | Some endpoint UI surfacing remains partial |
| Tenant admin | `platform/tenantadmin/*` | school/report/settings controllers | tenant admin services | tenant settings/schools | `/v1/tenant-admin/**` | Tenant | three tenant-admin tests | `TENANT_ADMIN_API.md` | IMPLEMENTED | Role/permission details not centralized in annotations |
| School admin/principal | many school-admin endpoints | module controllers | module services | school data | `/v1/school-admin/**` | Active school; often principal accepted | many flow tests | `SCHOOL_ADMIN_API.md` | IMPLEMENTED | Endpoint prefix says school-admin even when Principal has access |

## 5. Complete Backend API Inventory

The repository already contains a generated endpoint table in `docs/API_INDEX.md`; this audit cross-checked it against controller scans. The following table groups every controller family found in source. Individual endpoint examples include exact paths from controllers and docs.

| API family | Endpoint paths found | Controller files | Auth/roles | Frontend caller found? | Tests | Docs | Status | Notes/gaps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public auth | `POST /v1/auth/login`, `/mfa/verify`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password` | `AuthController.java` | Public for login/MFA/refresh/forgot/reset; logout token-authenticated | Yes: `frontend/src/features/auth/api/authApi.ts` | `AuthSessionFlowTest` | `AUTH_API.md` | IMPLEMENTED | Login limiter exists; other abuse limits not found |
| Invitation | `POST /v1/invitations/accept` | `InvitationController.java` | Public token | Yes: `invitationsApi.ts` | onboarding/provisioning tests | `AUTH_API.md` | IMPLEMENTED | Needs rate limit |
| Current user/session | `GET /v1/me`, `GET /v1/me/schools`, `POST /v1/me/schools/{schoolId}/activate`, change password if present | `CurrentUserController.java` | Authenticated user | Yes via auth state | `AuthSessionFlowTest` | `ME_SESSION_API.md` | IMPLEMENTED | Active school scope critical |
| Dashboard | `GET /v1/super-admin/dashboard/summary`, tenant-admin, school-admin, teacher, finance, staff, parent, student summaries | `DashboardSummaryController.java` | Role-specific | Yes: `dashboardApi.ts` | `DashboardSummaryFlowTest` | `API_INDEX.md` | IMPLEMENTED | No dedicated guest dashboard backend |
| School settings | `GET/PATCH /v1/school-admin/settings` | `SchoolSettingsController.java` | School admin/principal scope | Yes | `SchoolSettingsFlowTest` | `SETTINGS_API.md` | IMPLEMENTED | Good audit event coverage |
| Academic setup | `/v1/school-admin/academic-years`, classes, sections, subjects, class-subject-assignments, teacher-assignments | `AcademicYearController`, `ClassLevelController`, `SectionController`, `SubjectController`, assignment controllers | School admin/principal | Yes | academic tests | `ACADEMIC_API.md` | IMPLEMENTED | Prefix mismatch for principal access |
| Staff/teachers | `GET /v1/school-admin/staff`, `GET /v1/school-admin/teachers`, `POST /v1/school-admin/staff/provision` | staff controllers | School admin/principal | Yes for provision/resources; teachers via principal API | staff test | API index | IMPLEMENTED | Legacy `STAFF` allowed in places |
| Students/import/login | `/v1/school-admin/students`, `/students/import/*`, `/students/{id}/login-invitation`, `/v1/student/profile` | student controllers | School admin/principal/student | Yes | student tests | `STUDENT_PARENT_API.md` | IMPLEMENTED | Full CRUD partial |
| Parent/child | `/v1/school-admin/parent-links`, `/v1/parent/children`, `/v1/parent/children/{studentId}/...` | parent controllers plus ops controllers | School admin for link, parent child-scope | Yes | parent tests | `STUDENT_PARENT_API.md` | IMPLEMENTED | `GET /children/{studentId}` expected by inventory but not confirmed in client |
| Leave requests | `/v1/parent/children/{studentId}/leave-requests`, `/v1/school-admin/parent-leave-requests`, decision patch | `ParentLeaveRequestController.java` | Parent child-scope; school admin/principal | Yes | `ParentLeaveRequestFlowTest` | API index | IMPLEMENTED | Office staff review not found |
| Attendance/homework/exams/notices/timetable | school-admin, teacher, parent child, student endpoints | operation controllers | School/teacher/child/self | Partial frontend clients | operation flow tests | API docs | IMPLEMENTED | Some frontend screens generic |
| Finance | `/v1/finance/dashboard/summary`, `/fees/demands`, payments, receipts, reports | `FeeController.java` | Finance staff school scope; some school-admin/student/parent access | Yes | `FeeLifecycleFlowTest` | `FINANCE_API.md` | IMPLEMENTED | MFA/fresh-auth and payment gateway missing |
| Reports/exports | `/v1/school-admin/reports/exports`, finance reports/exports, super-admin reports/exports | report and platform controllers | School/platform | Yes | `ReportExportFlowTest` | `REPORT_EXPORT_API.md` | IMPLEMENTED | Object storage/download auth hardening partial |
| Documents/website | `/v1/school-admin/documents`, `/v1/school-admin/website/pages` | document/website controllers | School, office/staff for document service | Mostly BACKEND_ONLY | security tests | API index | PARTIAL | Upload/download builder not complete |
| AI shared | `/v1/ai/recommendations`, `/{id}`, accept/approve/reject/dismiss/execute, automation rules/runs, entitlement, knowledge search, usage audit | AI controllers | Role-specific service guards | Partial: app/principal/student API | AI tests | AI docs | IMPLEMENTED | Must keep parent/office/finance restricted |
| AI super-admin | `/v1/super-admin/ai/**` | super-admin AI controllers | SUPER_ADMIN | Yes | AI/super-admin tests | AI docs | IMPLEMENTED | High-risk; keep MFA/fresh-auth under review |
| Tenant admin | `/v1/tenant-admin/schools`, reports, settings, usage | tenant admin controllers | TENANT_ADMIN | Yes | tenant-admin tests | `TENANT_ADMIN_API.md` | IMPLEMENTED | School admin invite scopes should remain strict |
| Super admin platform | `/v1/super-admin/**` tenants, schools, users, audit, metrics, revenue, notifications, settings, search, access control | platform controllers | SUPER_ADMIN | Yes | super-admin tests | `SUPER_ADMIN_API.md` | IMPLEMENTED | Broad surface; require strong auth controls |

## 6. Backend API Contract Details

Detailed request/response DTOs are colocated with controllers and documented in `docs/api/*.md`. Contract patterns verified:

| Pattern | Evidence | Status | Missing details |
| --- | --- | --- | --- |
| Request validation | DTOs use Jakarta validation, for example request records in auth, academic, finance, staff, parent leave | IMPLEMENTED | Some generic `unknown` frontend consumers reduce contract safety |
| Response wrappers | `PageResponse`, `PageResponses`, explicit response records | IMPLEMENTED | Pagination not uniformly surfaced in UI |
| Error format | `ApiErrorResponse` and `RestExceptionHandler` | IMPLEMENTED | Needs review for all 400/401/403/404/409/429 consistency |
| Auth required | `AuthenticatedUserResolver`, token services, service guards | IMPLEMENTED | No central Spring Security config file found in source scan |
| Tenant/school scope | `SchoolAccessService`, active-school checks, repository queries with tenant/school IDs | IMPLEMENTED | Some prefix reuse makes role intent harder to audit |
| Child/self scope | parent and student services/repositories | IMPLEMENTED | Keep ID-spoof regression tests |
| Audit behavior | `AuditLogService.record`, `AuditAction` enum, outbox writes | IMPLEMENTED | Read endpoints mostly unaudited; acceptable unless sensitive |
| MFA/fresh-auth | MFA auth challenge implemented | PARTIAL | Fresh-auth for finance/export/admin mutations not found |

## 7. Role and Permission Audit

Roles found in `UserRole.java`: `SUPER_ADMIN`, `TENANT_ADMIN`, `SCHOOL_ADMIN`, `PRINCIPAL`, `TEACHER`, `STUDENT`, `PARENT`, `FINANCE_STAFF`, `OFFICE_STAFF`, `GUEST`, `SYSTEM`, `AI_AGENT`, `STAFF`.

| Role | Backend status | Key access | Risks/gaps |
| --- | --- | --- | --- |
| GUEST | PARTIAL | Public auth and invitation endpoints | Migration `V30__remove_guest_enquiry_management.sql` indicates suspicious enquiry management was removed; no protected guest APIs should remain. Needs manual DB permission verification after migration |
| PARENT | IMPLEMENTED | Dashboard, linked children, child attendance/homework/results/fees/notices/timetable/leave, limited AI read/retrieval | Payment endpoint support not clearly exposed in frontend; keep linked-child tests |
| OFFICE_STAFF | PARTIAL | Staff dashboard, documents/student records by service guards, AI admission follow-up read scope per docs | Admissions/enquiries/certificates APIs not found; mixed with legacy `STAFF` |
| FINANCE_STAFF | PARTIAL | Finance dashboard, demands/payments/receipts/reports, scoped AI fee suggestions | MFA-required role metadata appears in super-admin access service, but finance endpoints do not show fresh-auth enforcement |
| STAFF | RISKY | Legacy alias; used in demo seed and some service guards | Can blur OFFICE_STAFF expectations; should be migrated or isolated |
| SCHOOL_ADMIN/PRINCIPAL | IMPLEMENTED | Broad school APIs; many school-admin-prefixed endpoints allow principal | Naming mismatch is audit friction |
| SUPER_ADMIN/TENANT_ADMIN | IMPLEMENTED | Platform/tenant controls | High-risk actions need strongest auth and rate limits |
| SYSTEM/AI_AGENT | PARTIAL | Role enum and frontend placeholder dashboard map | No clear protected backend workflow; ensure no human UI/internal API leakage |

Permission storage is implemented through `permissions`, `role_permissions`, and overrides. Permission code inventory is seeded in migration `V29__access_control_ai_governance.sql` and documented in `docs/ROLE_PERMISSION_MATRIX.md`; source references include AI permissions such as `VIEW_AI_RECOMMENDATIONS`, `MANAGE_AI_POLICY`, `RUN_AI_AUTOMATION`, finance/report permissions, and school/student/teacher permissions.

## 8. Scope and Security Audit

| Scope/security item | Evidence | Status | Risk |
| --- | --- | --- | --- |
| Tenant scope | Tenant IDs on entities and repositories; tenant stats; tenant admin services | IMPLEMENTED | Cross-tenant regressions need continued tests |
| School scope | `UserSchoolAccess`, active school selection, `SchoolAccessService` | IMPLEMENTED | Some service guards are manual |
| Active school handling | `/v1/me/schools/{schoolId}/activate`, active school access in services | IMPLEMENTED | Frontend must send/retain active school correctly |
| Linked-child handling | `ParentStudentLink`, `StudentGuardian`, parent services | IMPLEMENTED | ID spoofing guarded by tests |
| Client tenant spoofing | `ClientTenantContextSpoofingFilter.java`, `TenantContextSpoofingTest` | IMPLEMENTED | Good explicit coverage |
| Report/export scope | school/platform scoped export jobs | PARTIAL | Data masking/fresh-auth/object storage not complete |
| AI scope | `AiScopeType`, retrieval/recommendation guards | IMPLEMENTED | Dangerous if role guards drift; keep matrix tests |
| Server-side guards | Services throw forbidden/not found | IMPLEMENTED | No single `SecurityFilterChain`/method-security annotation layer found |

## 9. Auth, Session, MFA, Password, Invitation Audit

| Flow | Endpoints/files | Status | Gaps |
| --- | --- | --- | --- |
| Login | `POST /v1/auth/login`, `LoginRateLimiterService` | IMPLEMENTED | Rate-limit behavior should be documented with thresholds |
| MFA challenge/verify | `MfaChallenge`, `POST /v1/auth/mfa/verify` | IMPLEMENTED | No frontend standalone MFA route; embedded login flow |
| Refresh/logout | `RefreshToken`, `RevokedAccessToken`, `/refresh`, `/logout` | IMPLEMENTED | Refresh token storage/client behavior needs manual browser verification |
| `/v1/me` and schools | `CurrentUserController` | IMPLEMENTED | Active-school restore UX must be verified |
| Change password | DTO exists `ChangePasswordRequest` | PARTIAL | Endpoint path not confirmed in this report |
| Forgot/reset | `ForgotPasswordRequest`, `ResetPasswordRequest` | IMPLEMENTED | Abuse limits missing/not found |
| Invitation accept | invitation package | IMPLEMENTED | Abuse limits missing/not found |
| Token storage/server behavior | hashed refresh/reset/MFA tokens | IMPLEMENTED | JWT dev secret default risky outside local |

## 10. Dashboard Backend Audit

| Dashboard | Endpoint | Controller/service | Roles | Frontend caller | Tests | Status | Gaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Super Admin Overview | `/v1/super-admin/dashboard/summary` | `DashboardSummaryController`/`Service` | SUPER_ADMIN | `dashboardApi.ts` | yes | IMPLEMENTED | none major |
| Tenant Admin Overview | `/v1/tenant-admin/dashboard/summary` | same | TENANT_ADMIN | yes | yes | IMPLEMENTED | none major |
| School Admin/Principal Overview | `/v1/school-admin/dashboard/summary` | same | SCHOOL_ADMIN, PRINCIPAL | yes | yes | IMPLEMENTED | endpoint name hides principal |
| Teacher Overview | `/v1/teacher/dashboard/summary` | same | TEACHER | yes | yes | IMPLEMENTED | feature depth partial |
| Finance Staff Overview | `/v1/finance/dashboard/summary` | same | FINANCE_STAFF | yes | yes | IMPLEMENTED | MFA/fresh-auth not endpoint-enforced |
| Office Staff Overview | `/v1/staff/dashboard/summary` | same | OFFICE_STAFF, STAFF | yes | yes | PARTIAL | role aliasing |
| Parent Overview | `/v1/parent/dashboard/summary` | same | PARENT | yes | yes | IMPLEMENTED | linked child count/source should be checked |
| Student Overview | `/v1/student/dashboard/summary` | same | STUDENT | yes | yes | IMPLEMENTED | own-scope only |
| Guest Overview | Not found | N/A | GUEST | frontend uses local shell | no backend | FRONTEND_ONLY | Should stay public-only |

## 11. AI Backend Audit

AI backend is one of the more complete high-risk areas: shared portal controllers, super-admin governance controllers, entitlement, usage audit, knowledge retrieval, policies, automation rules/runs, recommendation status/risk/type, and retrieval/request audits are present.

| AI capability | Endpoints | Roles | Status | Risk/gap |
| --- | --- | --- | --- | --- |
| Recommendations | `/v1/ai/recommendations`, `/{id}`, accept/approve/reject/dismiss/execute | Admin/teacher/student plus scoped parent/office/finance read/action limits | IMPLEMENTED | Mutating finance actions should require stronger auth |
| Automation | `/v1/ai/automation-rules`, `/automation-runs`, super-admin AI automation | Admin/teacher/student; super-admin platform controls | IMPLEMENTED | Non-admin roles must remain denied for policy/automation |
| Entitlement | `/v1/ai/entitlement`, `/v1/super-admin/ai/tenants/{tenantId}/entitlement` | Common read for eligible roles; super-admin manage | IMPLEMENTED | Parent/office/finance denied from policy controls per docs |
| Knowledge search | `POST /v1/ai/knowledge/search`, school-admin knowledge docs | Scoped role access | IMPLEMENTED | Prompt/request data must remain redacted |
| Usage audit | `/v1/ai/usage/audit`, super-admin usage | Admin/platform | IMPLEMENTED | Rate limits not found |

## 12. Reports and Exports Backend Audit

| Capability | Files | Status | Gaps |
| --- | --- | --- | --- |
| School/finance exports | `ReportExportController.java`, `ReportExportService.java`, `ReportExportJob`, `ReportExportFile` | IMPLEMENTED | File content is DB-backed; object storage and signed downloads not present |
| Super-admin exports | `SuperAdminPlatformController.java`, `SuperAdminReportExportWorker.java` | IMPLEMENTED | Background operation/fresh-auth needs verification |
| Finance reports | `FinanceReports.java`, `FeeService`, `FeeController` | IMPLEMENTED | Advanced report catalog partial |
| Permissions/scope | report/export permissions in API index and role docs | PARTIAL | Data masking and MFA/fresh-auth missing/not found |
| Tests | `ReportExportFlowTest` | IMPLEMENTED | Add negative role/masking/rate-limit tests |

## 13. Audit Events and Outbox Audit

`AuditAction.java`, `AuditLog.java`, `AuditLogService.java`, `TransactionalOutboxService.java`, and `OutboxEvent` provide durable audit/event foundations. Tests include `AuditCoverageMatrixTest` and `TransactionalOutboxFlowTest`. Mutation services across school settings, staff provisioning, academic setup, AI governance, super-admin access control, and reports call audit/outbox helpers. Status: IMPLEMENTED. Gaps: audit matrix should remain mandatory for every new mutation, and report/finance/AI high-risk reads may need audit depending on compliance requirements.

## 14. Validation and Error Handling Audit

| Item | Files | Status | Gaps |
| --- | --- | --- | --- |
| DTO validation | request records with Jakarta validation | IMPLEMENTED | Some modules need deeper domain validation |
| Exception types | `BadRequestException`, `ConflictException`, `ForbiddenException`, `NotFoundException`, `TooManyRequestsException`, `UnauthorizedException` | IMPLEMENTED | Consistency should be tested per module |
| Error response | `ApiErrorResponse`, `RestExceptionHandler` | IMPLEMENTED | Sensitive message audit recommended |
| 429 | `TooManyRequestsException`, login limiter | PARTIAL | Missing for forgot/reset/MFA/invitation/export/AI |

## 15. Rate Limit and Abuse Protection Audit

| Flow | Status | Evidence/gap |
| --- | --- | --- |
| Login | IMPLEMENTED | `LoginRateLimiterService` |
| Forgot password | NOT_FOUND | No dedicated limiter found |
| MFA verify | PARTIAL | Attempt count exists on `MfaChallenge`; global/IP limiter not found |
| Invitation accept | NOT_FOUND | No limiter found |
| Finance/report/export | NOT_FOUND | No limiter/fresh-auth found |
| AI execution/search | NOT_FOUND | No request rate limiter found; usage audit exists but is not the same as throttling |

## 16. Backend Test Coverage Audit

| Test file | Module covered | Roles/scope covered | Status | Missing cases |
| --- | --- | --- | --- | --- |
| `security/AuthSessionFlowTest.java` | auth/session/MFA | auth roles | IMPLEMENTED | abuse-limit thresholds |
| `security/SchoolAccessIsolationTest.java` | school access | cross-school | IMPLEMENTED | expand to every new school module |
| `security/TenantContextSpoofingTest.java` | tenant spoofing | tenant isolation | IMPLEMENTED | none major |
| `security/SchoolScopedControllerGuardCoverageTest.java` | guard coverage | school controllers | IMPLEMENTED | keep current with new controllers |
| `people/parent/*FlowTest.java` | parent child/leave | parent linked-child | IMPLEMENTED | payment and multi-child edge cases |
| `operations/finance/FeeLifecycleFlowTest.java` | finance | school/finance flows | IMPLEMENTED | MFA/fresh-auth, role denial matrix |
| `intelligence/ai/*FlowTest.java` | AI governance/retrieval | AI role/scope | IMPLEMENTED | rate limits and dangerous execution |
| `operations/report/ReportExportFlowTest.java` | reports/exports | school exports | IMPLEMENTED | masking/download authorization |
| `platform/*FlowTest.java` | tenant/super admin | platform/tenant | IMPLEMENTED | fresh-auth for destructive actions |
| All backend tests | full suite | broad | IMPLEMENTED | `mvn test`: 169 tests passed |

## 17. Backend Documentation Audit

Docs found: `docs/API_INDEX.md`, `docs/api/AUTH_API.md`, `ACADEMIC_API.md`, `FINANCE_API.md`, `REPORT_EXPORT_API.md`, `SUPER_ADMIN_API.md`, `TENANT_ADMIN_API.md`, `SCHOOL_ADMIN_API.md`, `STUDENT_PARENT_API.md`, `AUDIT_API.md`, `AI_RECOMMENDATION_AUTOMATION_API.md`, `NOTIFICATION_API.md`, `SETTINGS_API.md`, `ME_SESSION_API.md`, `ERRORS_AND_STATUS_CODES.md`, `docs/ROLE_PERMISSION_MATRIX.md`, `docs/ROLE_SCREEN_MATRIX.md`, `docs/testing/*.md`, `docs/audit/*.md`.

Status: IMPLEMENTED but NEEDS_DOCS for the two-role staff model, missing admissions/enquiries/certificates/visitors backend status, rate-limit matrix, and exact MFA/fresh-auth requirements per high-risk endpoint.

## 18. Backend Build/Test/Run Commands

| Command | Run? | Result |
| --- | --- | --- |
| `mvn test` from `backend` | Yes | BUILD SUCCESS; 169 tests, 0 failures, 0 errors, 0 skipped; total time 51.064s |
| `mvn spring-boot:run` | No | Not required for report; inferred run command |
| Docker build/run | No | Not required for report |

## 19. Backend Issues List

| ID | Severity | Area | File path | Description | Evidence | Impact | Recommended fix | Tests needed | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BE-001 | High | RBAC | `UserRole.java`, staff services | `OFFICE_STAFF` and legacy `STAFF` both exist and are accepted in dashboard/document paths | enum comment says legacy alias; services use both | Overbroad office access or inconsistent UI/API behavior | Migrate data to `OFFICE_STAFF`, isolate `STAFF`, document alias behavior | role denial matrix | RISKY |
| BE-002 | High | Finance security | `operations/finance/*`, auth/session | Finance APIs exist but endpoint-level MFA/fresh-auth not found | no fresh-auth search hits for finance | High-risk money actions can be performed with bearer token alone | Require MFA/fresh-auth for payments, exports, discounts/concessions when added | finance 403/428/step-up tests | RISKY |
| BE-003 | High | Abuse protection | auth/AI/report/invitation | Only login limiter clearly found | `LoginRateLimiterService`; no equivalent for other flows | Credential/token abuse and expensive AI/export abuse | Add shared rate-limit service/filter by IP/user/tenant/action | 429 tests | NEEDS_TESTS |
| BE-004 | Medium | Office modules | `admission` package `.gitkeep`, no certificate/visitor packages | Expected office modules are absent | no controllers/services/entities found | OFFICE_STAFF role inventory not met | Add APIs or remove/hide UI nav | API and UI tests | NOT_FOUND |
| BE-005 | Medium | Central authorization | controllers/services | Guards are service-level and resolver-driven | no Spring Security config found in scan | Hard to audit every endpoint uniformly | Add central security chain/method security or generated guard matrix | guard coverage tests | PARTIAL |
| BE-006 | Medium | Reports/downloads | `operations/report/*` | Export files stored in DB content and download hardening is partial | `ReportExportFile.content` | Data leakage/storage scalability risk | Move to object storage, signed URLs, masking, audit reads | download auth/masking tests | PARTIAL |
| BE-007 | Medium | API naming | `/v1/school-admin/**` | Principal uses school-admin-prefixed APIs | docs/API_INDEX role inference | Confusing contract and guard audits | Document shared school staff API prefix or introduce `/v1/principal` aliases | contract tests | NEEDS_DOCS |
| BE-008 | Low | Config | `application.yml` | Dev JWT secret default exists | `dev-only-cloudcampus-auth-token-secret-change-me` | Unsafe if production validator disabled | Enforce prod validation and document envs | production config tests | RISKY |

## 20. Backend Final Recommendations

Must fix now: finance/export/AI rate limits and fresh-auth, staff role alias cleanup, explicit office module decision, and a generated endpoint-to-role matrix enforced in CI.

Should fix soon: object storage for documents/reports, richer 429/403 tests, exact OpenAPI generation, central method-security annotations or equivalent policy registry.

Can improve later: route-prefix cleanup for Principal, richer audit of sensitive reads, async worker observability, expanded report catalog, production-grade payment gateway integration.
