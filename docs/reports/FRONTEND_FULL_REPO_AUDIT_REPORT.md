# Frontend Full Repo Audit Report

Generated on: 2026-06-09  
Scope: `frontend`, root/package config, docs, backend controllers/API docs for contract alignment, frontend tests.  
Status labels used: IMPLEMENTED, PARTIAL, BACKEND_ONLY, FRONTEND_ONLY, NOT_FOUND, BROKEN, RISKY, NEEDS_TESTS, NEEDS_DOCS, NEEDS_MANUAL_VERIFICATION.

## 1. Executive Summary

| Area | Finding |
| --- | --- |
| Frontend framework detected | React 19.2.0 with TypeScript |
| Build tool detected | Vite 7.2.4, `frontend/package.json` |
| Main frontend folder | `frontend/src` |
| Overall frontend health | IMPLEMENTED for a single React app shell, auth, role-based navigation, API client foundation, many admin/academic/finance/parent/student/super-admin pages, and green tests. PARTIAL for route isolation, dedicated router files, permission guards, office/admission/enquiry/certificate screens, AI surfaces, and exact backend contract typing |
| Biggest UI/API risks | Role routes are state-driven inside `App.tsx` rather than actual URL route inventory; nav exposes several screens whose backend modules are missing or generic; permission guards are role/nav based, not backend permission-code based; token storage uses browser storage; no dedicated 401 refresh retry flow found in shared client |
| Highest-priority fixes | Add real router/route guards, align OFFICE_STAFF screens with actual APIs, add permission-code hiding, finish parent/finance/office AI screens, tighten auth storage/refresh/403 behavior, type all API responses |
| Frontend aligned with backend | PARTIAL. API client paths mostly match backend for existing clients, but many backend endpoints are not surfaced and several role nav items render generic panels instead of dedicated screens |
| Frontend aligned with role inventories | PARTIAL. PARENT and FINANCE_STAFF expected nav exists; OFFICE_STAFF expected nav exists but many screens are frontend-only/generic; GUEST is mostly public/auth plus dashboard shell, but guest dashboard must remain non-protected/public-only |

## 2. Repository Frontend Structure

| Category | Paths/files |
| --- | --- |
| Frontend root | `frontend` |
| App entry | `frontend/src/main.tsx`, `frontend/src/app/App.tsx` |
| Router files | `frontend/src/app/routes/.gitkeep`; no `createBrowserRouter` or route config file found |
| Layout files | `frontend/src/app/layouts/.gitkeep`, app shell implemented directly in `App.tsx` |
| Navigation/sidebar | `NAV_BY_ROLE`, `NAV_GROUPS_BY_ROLE`, quick actions, and rendering in `App.tsx` |
| Auth files | `features/auth/api/authApi.ts`, `invitationsApi.ts`, `hooks/authState.tsx`, pages/components for login, invitation, school selector |
| Shared API | `shared/api/apiBase.ts`, `httpClient.ts`, `authHeaders.ts`, `apiError.ts` |
| Feature folders | academic, attendance, auth, exams, finance, homework, notices, operations, parent, portal, principal, reports, school-admin, staff, student, super-admin, teacher, tenant-admin |
| Empty/planned feature folders | AI, notifications, public-site, website-builder route/page/component folders are `.gitkeep` only |
| Page folders | `frontend/src/features/**/pages` |
| Test folders | colocated `*.test.tsx`/`*.test.ts`; 27 test files passed |
| Docs | root docs and `docs/api`, no frontend-only route documentation found |

## 3. Build and Runtime Configuration

| Item | Evidence | Status | Notes |
| --- | --- | --- | --- |
| React/Vite | `package.json` dependencies React 19.2.0, Vite 7.2.4 | IMPLEMENTED | Modern frontend stack |
| Package manager | `frontend/package-lock.json` | IMPLEMENTED | npm detected |
| Scripts | `dev`, `build`, `lint`, `preview`, `test`, `typecheck` | IMPLEMENTED | Build includes `tsc --noEmit && vite build` |
| API base | `VITE_API_BASE_URL` in `shared/api/apiBase.ts` and `httpClient.ts` | IMPLEMENTED | Fetch rewrite configured in `main.tsx` |
| Token handling | `httpClient.ts`, `authState.tsx` | PARTIAL | Browser storage risk; refresh retry behavior not found in shared client |
| Env docs | `.env.example`, frontend package | PARTIAL | API base documented indirectly |
| Tests | `npm test` | IMPLEMENTED | 27 files, 114 tests passed |
| Typecheck | `npm run typecheck` | IMPLEMENTED | Passed |

## 4. Route Inventory

The app does not define a browser router route table. Runtime screen selection is role/nav state inside `App.tsx`. The following inventory lists effective role nav routes/screens.

| Route/nav path | Nav id | Component | Layout | Auth required | Roles allowed | Permission required | API calls made | Loading/empty/error | Tests | Status | Notes/gaps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` public | public landing/auth selector | Public home/Login | `App.tsx` | No | GUEST/public | None | none/login when submitted | page states in auth | `App.test.tsx`, login tests | IMPLEMENTED | Marketing/public shell present |
| auth login | login | `LoginPage.tsx` | Public | No | Public/GUEST | None | `/v1/auth/login`, `/mfa/verify` | error/status | yes | IMPLEMENTED | MFA embedded |
| invitation accept | invitation | `InvitationAcceptPage.tsx` | Public | No | Public/GUEST | None | `/v1/invitations/accept` | yes | yes | IMPLEMENTED | Route mechanism is app state/browser path driven |
| role dashboard | dashboard | `RoleDashboard`/role pages | Enterprise shell | Yes | all authenticated roles | role only | `/v1/{role}/dashboard/summary` except GUEST/SYSTEM/AI_AGENT maps | yes | `App.test.tsx` | PARTIAL | GUEST/SYSTEM/AI_AGENT dashboard backend mismatch |
| super-admin | tenants/schools/access/subscriptions/revenue/reports/health/notifications/audit/ai/settings/search | `SuperAdminPlatformPage.tsx`, `TenantOnboardingPage.tsx` | Enterprise shell | Yes | SUPER_ADMIN | role only | many `/v1/super-admin/**` | extensive | yes | IMPLEMENTED | Permission-code UI guard not visible |
| tenant-admin | dashboard/schools/admins/reports/usage/settings | tenant admin pages | Enterprise shell | Yes | TENANT_ADMIN | role only | `/v1/tenant-admin/**` | yes | yes | IMPLEMENTED | Dashboard test coverage lighter |
| school-admin | dashboard/students/parents/teachers/staff/academic/attendance/homework/exams/fees/timetable/notices/reports/documents/website/settings | school admin resource panels/pages | Enterprise shell | Yes | SCHOOL_ADMIN | role only | `/v1/school-admin/**`, finance/report APIs | mixed | yes | PARTIAL | Some screens generic resource panel; website/doc upload partial |
| principal | dashboard/teachers/students/attendance/exams/results/ai-suggestions/reports | `PrincipalPortalPage.tsx` | Enterprise shell | Yes | PRINCIPAL | role only | `/v1/school-admin/*`, `/v1/ai/*`, reports | yes | yes | IMPLEMENTED | Uses school-admin APIs |
| teacher | dashboard/classes/attendance/homework/exams/marks/notices/timetable/ai-suggestions | `TeacherPortalPage.tsx` | Enterprise shell | Yes | TEACHER | role only | teacher portal API and shared AI | yes | yes | PARTIAL | Some workflows are portal foundation |
| finance-staff | dashboard/fees/payments/receipts/reports/ai-suggestions | `FeeLifecyclePage.tsx`, `FinanceReportsPage.tsx`, `ReportExportsPage.tsx`, dashboard/generic AI panel | Enterprise shell | Yes | FINANCE_STAFF | role only | `/v1/finance/**`, `/v1/ai/recommendations` | yes | finance/report tests | PARTIAL | No MFA/fresh-auth UI; AI fee suggestions generic |
| office-staff | dashboard/admissions/enquiries/students/documents/certificates/ai-suggestions | dashboard/generic resource panels | Enterprise shell | Yes | OFFICE_STAFF | role only | staff dashboard, generic school-admin resources, AI list | mixed | App-level | PARTIAL | Admissions/enquiries/certificates backend not found |
| parent | dashboard/children/attendance/homework/results/fees/notices/timetable/leave/ai-suggestions | parent panels, `ParentLeaveRequestsPage.tsx` | Enterprise shell | Yes | PARENT | role only | `/v1/parent/**`, `/v1/ai/recommendations` | child selector states | parent leave tests | PARTIAL | Child detail endpoint expected but not used; AI recommendations generic |
| student | dashboard/homework/results/fees/notices/attendance/timetable/ai-suggestions | `StudentPortalPage.tsx` | Enterprise shell | Yes | STUDENT | role only | `/v1/student/**`, `/v1/ai/*` | yes | yes | IMPLEMENTED | Good own-portal coverage |
| staff legacy | dashboard | dashboard only | Enterprise shell | Yes | STAFF | role only | `/v1/staff/dashboard/summary` | basic | App tests | PARTIAL | Legacy alias should be retired or clearly scoped |

## 5. Navigation and Sidebar Audit

Navigation is centralized in `NAV_BY_ROLE` in `frontend/src/app/App.tsx`.

| Role | Nav items found | Correctness | Broken/missing target risks |
| --- | --- | --- | --- |
| GUEST | Dashboard | PARTIAL | Must remain public/minimal. No AI/reports/finance nav found for GUEST |
| PARENT | Dashboard, My Children, Attendance, Homework, Results, Fees, Notices, Timetable, Leave Requests, AI Recommendations | PARTIAL | Expected nav exists; many screens use shared child panel/generic API rendering rather than dedicated pages |
| OFFICE_STAFF | Dashboard, Admissions, Enquiries, Student Records, Documents, Certificates, AI Follow-ups | PARTIAL | Admissions/enquiries/certificates backend not found; documents/student records partial |
| FINANCE_STAFF | Dashboard, Fee Demands, Payments, Receipts, Reports, AI Fee Suggestions | PARTIAL | Expected nav exists; no MFA/fresh-auth UI; AI surface generic |
| SCHOOL_ADMIN | broad ERP nav | PARTIAL | Some backend-only modules, generic panels |
| PRINCIPAL | dashboard/review/AI/report nav | IMPLEMENTED | Uses school-admin APIs; name mismatch |
| SUPER_ADMIN/TENANT_ADMIN | platform/tenant nav | IMPLEMENTED | Broad and tested |
| SYSTEM/AI_AGENT | dashboard placeholders | PARTIAL | Must not expose human/internal APIs unless explicitly intended |

No duplicate path table exists because there are no real route path definitions. Unauthorized nav exposure is primarily role-state based; permission-code hiding is NOT_FOUND.

## 6. Frontend API Client Inventory

| API client file | Functions/endpoints | Backend exists? | Used by | Error handling | Status | Notes/gaps |
| --- | --- | --- | --- | --- | --- | --- |
| `shared/api/httpClient.ts` | `get/post/patch/put/delete` | N/A | all clients | throws `ApiError` | IMPLEMENTED | No automatic refresh retry found |
| `features/auth/api/authApi.ts` | login, MFA verify, refresh, logout, forgot/reset, current user | Yes | auth state/login | typed errors | IMPLEMENTED | token storage needs review |
| `features/auth/api/invitationsApi.ts` | accept invitation | Yes | invitation page | page error | IMPLEMENTED | none major |
| `features/portal/api/dashboardApi.ts` | role endpoint map | Mostly yes | app dashboard | shared | PARTIAL | GUEST/SYSTEM/AI_AGENT map to `/v1/me` or placeholder, not dashboard backend |
| `features/academic/api/academicApi.ts` | academic setup | Yes | academic pages/resource panel | page errors | IMPLEMENTED | some responses typed loosely |
| `features/academic/api/academicAssignmentsApi.ts` | class/section/subject/teacher assignments | Yes | assignment page | page errors | IMPLEMENTED | none major |
| `features/attendance/api/attendanceApi.ts` | `/v1/school-admin/attendance/sessions` | Yes | resource panel | generic | PARTIAL | `unknown[]` response |
| `features/homework/api/homeworkApi.ts` | school-admin homework | Yes | resource panel | generic | PARTIAL | `unknown[]` response |
| `features/exams/api/examsApi.ts` | school-admin exams, publish | Yes | resource panel/principal | generic | PARTIAL | `unknown` response |
| `features/notices/api/noticesApi.ts` | school-admin notices | Yes | resource panel | generic | PARTIAL | typed lightly |
| `features/finance/api/feeApi.ts` | finance fee demands/payments/receipts/reports | Yes | finance pages | page errors | IMPLEMENTED | no MFA step-up |
| `features/reports/api/reportExportsApi.ts` | finance report exports/list/request/download | Yes | reports page | page errors | IMPLEMENTED | download string handling requires backend content format |
| `features/operations/api/bulkJobsApi.ts` | school-admin bulk jobs | Yes | bulk page | page errors | IMPLEMENTED | none major |
| `features/parent/api/parentPortalApi.ts` | children and child attendance/homework/results/fees/notices/timetable | Yes except expected child detail not used | app parent panels | generic | PARTIAL | many `unknown[]` responses |
| `features/parent/api/parentLeaveRequestsApi.ts` | parent leave create/list, school admin list/decision | Yes | parent/school admin leave pages | page errors | IMPLEMENTED | good coverage |
| `features/parent/api/parentLinksApi.ts` | create parent link | Yes | school admin parent link page | page errors | IMPLEMENTED | none major |
| `features/principal/api/principalApi.ts` | teachers/students/attendance/exams/AI/reports | Yes | principal page | page errors | IMPLEMENTED | uses school-admin path names |
| `features/school-admin/api/schoolAdminResourcesApi.ts` | generic resource config/list/create/publish | Mostly yes | resource panel | generic | PARTIAL | generic typing hides contract mismatches |
| `features/school-admin/api/schoolSettingsApi.ts` | school settings get/patch | Yes | settings page | page errors | IMPLEMENTED | none major |
| `features/staff/api/staffProvisioningApi.ts` | staff provision | Yes | provisioning page | page errors | IMPLEMENTED | role includes legacy `STAFF` |
| `features/student/api/studentImportApi.ts` | import, jobs, students, login invitation | Yes | student import page | page errors | IMPLEMENTED | none major |
| `features/student/api/studentPortalApi.ts` | student profile/homework/results/fees/notices/attendance/timetable/AI | Yes | student portal | page errors | IMPLEMENTED | AI mutation availability must match role guard |
| `features/super-admin/api/platformApi.ts` | broad platform APIs | Yes | super-admin page | page errors | IMPLEMENTED | huge surface; keep generated contract tests |
| `features/tenant-admin/api/*.ts` | schools/reports/settings | Yes | tenant admin pages | page errors | IMPLEMENTED | none major |
| `features/teacher/api/teacherPortalApi.ts` | teacher portal + AI | Yes | teacher portal | page errors | IMPLEMENTED | scope depends on backend assignments |

## 7. Frontend to Backend Contract Audit

| Contract area | Status | Findings |
| --- | --- | --- |
| Methods/paths | IMPLEMENTED | Existing client paths generally match backend/API index |
| Path params | IMPLEMENTED | `encodeURIComponent` used in many clients |
| Request bodies | PARTIAL | Forms build plain objects; backend DTO validation catches errors |
| Response typing | PARTIAL | Several clients use `unknown`/`unknown[]`, especially attendance/homework/exams/parent child lists |
| 204 handling | PARTIAL | `httpClient` handles empty response, but endpoint expectations are not documented per client |
| Pagination | PARTIAL | `PageResponse` handled in principal/super-admin/tenant APIs; not consistent in generic panels |
| Date/amount/enums | PARTIAL | Dates/amounts are string/form values; backend validates; frontend formatting is not universal |
| File upload/download | PARTIAL | Report download returns string; document upload/download object storage not present |
| Error handling | IMPLEMENTED | `ApiError` and page-level error panels exist |

## 8. Auth and Session UI Audit

| Flow | Files | Status | Gaps |
| --- | --- | --- | --- |
| Login | `LoginPage.tsx`, `authState.tsx` | IMPLEMENTED | local auth hints should remain non-production |
| MFA | `LoginPage.tsx` embedded verify | IMPLEMENTED | no standalone `/mfa` route; acceptable if intended |
| Forgot/reset | `LoginPage.tsx`, `authApi.ts` | IMPLEMENTED | tests cover flow; rate-limit messaging should be specific |
| Invitation accept | `InvitationAcceptPage.tsx`, `invitationsApi.ts` | IMPLEMENTED | path handling needs manual browser verification |
| Refresh token | `authApi.ts`, `authState.tsx` | PARTIAL | automatic refresh on 401 not found in `httpClient.ts` |
| Logout | auth state/client | IMPLEMENTED | confirm refresh token revocation UX |
| `/v1/me` hydration | `authState.tsx` | IMPLEMENTED | active-school restore needs manual multi-school verification |
| School activation | `SchoolSelector.tsx` | IMPLEMENTED | should test multiple school/403 cases |
| 401/403 behavior | shared API/page errors | PARTIAL | no global redirect/refresh policy found |
| Token storage | browser storage injection | RISKY | XSS-sensitive; consider httpOnly cookie/session model |

## 9. Role-Based UI Audit

| Role | Expected screens | Actual screens | Route/permission guards | API calls | Tests | Status | Gaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GUEST | login/MFA/refresh/forgot/reset/invitation/public shell only | public landing, login, invitation, dashboard nav shell | no protected nav beyond dashboard | auth/public only | App/login/invitation | PARTIAL | Ensure guest dashboard does not call protected APIs |
| PARENT | dashboard, children, attendance, homework, results, fees, notices, timetable, leave, AI | all nav entries present; leave dedicated page; child panels in app | role only | parent APIs and AI list | parent leave + App | PARTIAL | child detail/payment/AI dedicated UX partial |
| OFFICE_STAFF | dashboard, admissions, enquiries, student records, documents, certificates, AI follow-ups | nav entries present | role only | dashboard/generic/some school APIs | App-level | PARTIAL | admissions/enquiries/certificates backend not found |
| FINANCE_STAFF | dashboard, demands, payments, receipts, reports, AI fee suggestions | nav entries present; finance/report pages exist | role only | finance and report APIs | finance/report tests | PARTIAL | no MFA/fresh-auth UI; AI generic |
| SCHOOL_ADMIN | full ERP | broad nav/pages | role only | broad APIs | many tests | PARTIAL | generic resources and backend-only modules |
| PRINCIPAL | review/control | dedicated principal page | role only | school-admin + AI/report APIs | principal tests | IMPLEMENTED | endpoint naming mismatch |
| TEACHER/STUDENT | portal workflows | dedicated pages | role only | role APIs + AI | tests | IMPLEMENTED | production polish partial |
| SUPER_ADMIN/TENANT_ADMIN | platform/tenant controls | dedicated pages | role only | platform/tenant APIs | tests | IMPLEMENTED | permission-code UI guard missing |

## 10. GUEST UI Audit

Status: PARTIAL/IMPLEMENTED. GUEST has no finance, parent, student, staff, reports, exports, or AI nav entries in `NAV_BY_ROLE`. Public login, forgot/reset, MFA verify, and invitation accept UI exist. Suspicious enquiry management is not exposed in frontend nav. Needs manual verification: direct URL/path handling should not mount protected screens without an authenticated role, since the app is not using a centralized browser router.

## 11. PARENT UI Audit

| Screen | Component/path | API | Status | Gaps |
| --- | --- | --- | --- | --- |
| Dashboard | `App.tsx` role dashboard | `/v1/parent/dashboard/summary` | IMPLEMENTED | dashboard widget depth partial |
| My Children | `App.tsx` parent child panel | `/v1/parent/children` | IMPLEMENTED | no dedicated child detail route confirmed |
| Attendance/Homework/Results/Fees/Notices/Timetable | `App.tsx` child-scoped panels | `/v1/parent/children/{studentId}/...` | PARTIAL | many responses are `unknown[]`; empty/error states generic |
| Leave Requests | `ParentLeaveRequestsPage.tsx` | leave request APIs | IMPLEMENTED | good tests; multi-child edge tests present but can expand |
| AI Recommendations | `App.tsx`/shared AI panel | `/v1/ai/recommendations` | PARTIAL | no child-specific recommendation detail UX |

## 12. OFFICE_STAFF UI Audit

| Screen | Component/path | Backend endpoint | Status | Gaps |
| --- | --- | --- | --- | --- |
| Dashboard | `App.tsx` role dashboard | `/v1/staff/dashboard/summary` | IMPLEMENTED | supports `STAFF` alias too |
| Admissions | `App.tsx` generic/nav panel | NOT_FOUND | FRONTEND_ONLY | no backend module |
| Enquiries | `App.tsx` generic/nav panel | NOT_FOUND | FRONTEND_ONLY | no safe public/admin enquiry API found |
| Student Records | generic school-admin resource/student API | `/v1/school-admin/students` | PARTIAL | prefix and permissions need doc |
| Documents | generic resource/API if wired | `/v1/school-admin/documents` | PARTIAL | no upload/download storage UX |
| Certificates | generic/nav panel | NOT_FOUND | FRONTEND_ONLY | no backend module |
| AI Follow-ups | shared AI recommendations | `/v1/ai/recommendations` | PARTIAL | admission follow-up scoping must be manually verified |

## 13. FINANCE_STAFF UI Audit

| Screen | Component/path | API | Status | Gaps |
| --- | --- | --- | --- | --- |
| Dashboard | role dashboard | `/v1/finance/dashboard/summary` | IMPLEMENTED | none major |
| Fee Demands/Payments | `FeeLifecyclePage.tsx` | `/v1/finance/fees/demands`, payment endpoints | IMPLEMENTED | no MFA/fresh-auth UI |
| Receipts | `FeeLifecyclePage.tsx`/finance API | `/v1/finance/receipts` | IMPLEMENTED | receipt detail/print partial |
| Reports | `FinanceReportsPage.tsx`, `ReportExportsPage.tsx` | `/v1/finance/reports/*`, exports | IMPLEMENTED | data masking/download hardening depends backend |
| AI Fee Suggestions | shared AI panel | `/v1/ai/recommendations` | PARTIAL | dedicated fee suggestion workflow not found |

## 14. Dashboard UI Audit

All authenticated dashboards call `getDashboardSummary(role)`, mapping roles to backend endpoints in `dashboardApi.ts`. Loading/error states exist in the app shell. Finance, parent, office, teacher, student, principal, school-admin, tenant-admin, and super-admin dashboards are implemented. Guest Overview is FRONTEND_ONLY/minimal. Office Staff title should be manually verified against expected "Office Staff Overview"; backend service title source should match UI.

## 15. Form and Validation Audit

| Form/page | Submit API | Status | Gaps |
| --- | --- | --- | --- |
| Login/MFA/forgot/reset | auth API | IMPLEMENTED | global 429 UX needed |
| Invitation accept | invitation API | IMPLEMENTED | token expiry messaging should be verified |
| Academic setup/assignments | academic APIs | IMPLEMENTED | date/enum validation mostly backend-driven |
| Staff provisioning | `/v1/school-admin/staff/provision` | IMPLEMENTED | role options include `STAFF`; align with OFFICE_STAFF strategy |
| Student import | student import APIs | IMPLEMENTED | file upload not used; rows JSON import |
| Parent link/leave decisions | parent APIs | IMPLEMENTED | good tests |
| Parent leave request | parent leave API | IMPLEMENTED | multi-child/zero-child tested partially |
| Fee demand/payment | finance APIs | IMPLEMENTED | no duplicate submit/fresh-auth enforcement beyond local loading |
| Report export request | report API | IMPLEMENTED | file download UX depends backend string response |
| Tenant/school/settings/super-admin forms | tenant/super-admin APIs | IMPLEMENTED | high-risk forms need fresh-auth UX |

## 16. AI UI Audit

AI folders under `frontend/src/features/ai` are placeholders only. AI UI is embedded in role pages/app panels and super-admin platform page. Super-admin governance is the most complete. Principal/student/teacher APIs include recommendation actions. Parent/office/finance nav exposes AI suggestions/recommendations, but dedicated scoped UX is PARTIAL. Guest has no AI nav. Tests for AI-specific non-admin denial/hiding are incomplete.

## 17. Reports and Exports UI Audit

`ReportExportsPage.tsx` and `reportExportsApi.ts` implement finance exports with list/request/download flows and tests. Super-admin report export APIs are used in `SuperAdminPlatformPage.tsx`. Finance-only visibility exists through `NAV_BY_ROLE`. Guest has no reports/exports nav. Gaps: no fresh-auth prompt, download format/content verification is minimal, and school-admin/principal report UX is partial compared with backend breadth.

## 18. Loading, Empty, Error, and Toast State Audit

Page-level loading/error/status states are common across implemented pages. There are no shared loading/empty/error components in `frontend/src/shared/components` beyond `.gitkeep`; states are implemented locally. 401/403/404/409/429/500 are represented through `ApiError`, but global handling and refresh/redirect behavior are PARTIAL. Mutation success messages exist in several pages; a shared toast system is NOT_FOUND.

## 19. Accessibility and UX Audit

Strengths: tests use role queries, many forms have labels, dialogs use `role="dialog"`/`aria-modal`, tables have region labels in tenant/admin pages.

Risks: the very large `App.tsx` shell increases regression risk; generic panels may have incomplete empty/error copy; mobile/sidebar behavior needs manual Playwright verification; token/storage and route-state behavior need browser verification; some buttons should be checked for explicit `type`; table overflow is handled in some admin pages but not proven globally.

## 20. Frontend Test Coverage Audit

| Test file group | Components/pages covered | Roles/API mocks covered | Status | Missing tests |
| --- | --- | --- | --- | --- |
| `App.test.tsx` | app shell/nav/auth routing/dashboard | many roles | IMPLEMENTED | direct URL guard, guest protected route denial |
| auth tests | login, invitation, auth API | auth/MFA | IMPLEMENTED | 429/expired token copy |
| school/admin/academic/student/staff tests | resource pages/forms | school admin/principal | IMPLEMENTED | generic resource contract mismatches |
| finance/report tests | fee lifecycle, exports | finance | IMPLEMENTED | MFA/fresh-auth, role denial |
| parent tests | leave, parent link/admin leave | parent/school admin | IMPLEMENTED | AI/fees/payment, zero child broader |
| principal/student/teacher tests | portal pages | role portals | IMPLEMENTED | AI denial/approval edge cases |
| super-admin/tenant-admin tests | platform/tenant pages/APIs | admin roles | IMPLEMENTED | high-risk fresh-auth, permission-code hiding |
| shared API tests | API base/http client | token/error | IMPLEMENTED | refresh retry/global 401 |

Full command result: `npm test` passed 27 test files and 114 tests.

## 21. Frontend Documentation Audit

README documents React/Vite frontend and role portal status. API docs and role/screen matrix exist under `docs`. Missing: frontend route inventory doc, component ownership doc, permission-code-to-nav mapping doc, exact env docs for `VITE_API_BASE_URL`, and explicit status docs for placeholder feature folders (`features/ai`, `notifications`, `public-site`, `website-builder`).

## 22. Frontend Build/Test/Run Commands

| Command | Run? | Result |
| --- | --- | --- |
| `npm install` | No | lockfile present; dependencies already installed |
| `npm run dev` | No | not needed for report |
| `npm run build` | No | typecheck covered; full build not required for report |
| `npm test` | Yes | 27 files, 114 tests passed |
| `npm run typecheck` | Yes | passed |
| `npm run lint` | No | not run; recommend before release |

## 23. Frontend Issues List

| ID | Severity | Area | File path | Description | Evidence | Impact | Recommended fix | Tests needed | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FE-001 | High | Routing/security | `frontend/src/app/App.tsx` | No real route config/guard files; route behavior is app-state driven | `app/routes/.gitkeep`, nav constants in `App.tsx` | Harder to prevent direct-route unauthorized access | Add React Router route table with auth/role/permission guards | direct URL and role denial tests | PARTIAL |
| FE-002 | High | Permissions | `App.tsx`, feature pages | UI guards are role/nav based, not permission-code based | no permission guard files found | User permission overrides may not hide UI correctly | Hydrate permissions from `/v1/me`/role permissions and gate nav/actions | override hiding tests | NOT_FOUND |
| FE-003 | High | Finance security UX | finance/report pages | No MFA/fresh-auth prompt for high-risk actions | finance pages call APIs directly | Weak step-up UX for payments/exports | Add backend-supported step-up flow and UI | payment/export step-up tests | RISKY |
| FE-004 | Medium | Office staff | `App.tsx`, office nav | Admissions/enquiries/certificates nav has no backend module | backend scan found no controllers | Users see incomplete/broken expectations | Hide until backend exists or build APIs/screens | OFFICE_STAFF nav/API tests | FRONTEND_ONLY |
| FE-005 | Medium | API contracts | multiple `api/*.ts` | Several clients use `unknown` responses | attendance/homework/exams/parent portal APIs | Runtime shape bugs can slip through | Add shared DTO types from backend/OpenAPI | compile-time contract tests | PARTIAL |
| FE-006 | Medium | Auth/session | `shared/api/httpClient.ts`, `authState.tsx` | No automatic refresh/global 401 flow found | http client throws errors only | Expired sessions can degrade into page errors | Add refresh/redirect policy | 401 refresh tests | PARTIAL |
| FE-007 | Medium | Token storage | auth state/storage | Browser storage used for tokens | storage injection in tests/code | XSS token exposure risk | Prefer httpOnly cookie or hardened storage strategy | auth security tests/manual review | RISKY |
| FE-008 | Low | Shared UX primitives | `shared/components/.gitkeep` | Loading/empty/error/toast states are page-local | no shared components found | Inconsistent UX | Add minimal shared primitives | visual/unit tests | PARTIAL |

## 24. Frontend Final Recommendations

Must fix now: add route and permission guards, align OFFICE_STAFF nav with actual backend availability, add finance/export/AI step-up UX once backend supports it, and replace `unknown` API responses for core role screens.

Should fix soon: global 401/refresh handling, shared loading/error/toast primitives, frontend route documentation, mobile/sidebar visual verification, and CI checks for route-to-backend contract drift.

Can improve later: split the large `App.tsx` into shell/router/nav modules, generate TypeScript API clients from OpenAPI, add dedicated AI feature pages, and build full document/website/public-site experiences when backend support is complete.
