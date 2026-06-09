<!-- Status labels: CURRENT_IMPLEMENTED, CURRENT_PARTIAL, BACKEND_EXISTS_UI_NOT_SURFACED, PLANNED_RECOMMENDED, NOT_FOUND_IN_CODEBASE. -->

# GUEST

## 1. Role summary

| Item | Detail | Status |
| --- | --- | --- |
| Human-readable name | Guest | CURRENT_IMPLEMENTED |
| Role enum value | GUEST | CURRENT_IMPLEMENTED |
| Role type | Public/auth-only role | CURRENT_IMPLEMENTED |
| Business purpose | Safe public entry points and an optional authenticated Guest dashboard shell. | CURRENT_IMPLEMENTED |
| Login allowed | Yes, when an active GUEST account exists in an active tenant. | CURRENT_IMPLEMENTED |
| MFA required | Not required by default. MFA verification remains available as a public auth flow for roles that require it. | CURRENT_IMPLEMENTED |
| Scope level | Public/auth; no tenant, school, class, student, staff, parent, finance, report, export, or AI data scope. | CURRENT_IMPLEMENTED |
| Typical users | Public visitor, demo account, pre-role invited user, applicant before a dedicated public application flow exists. | CURRENT_IMPLEMENTED |
| Risk level | Low data access, high abuse sensitivity on public auth endpoints. | CURRENT_IMPLEMENTED |
| Data sensitivity level | Public/auth metadata and self account status only. | CURRENT_IMPLEMENTED |

## 2. Allowed behavior

- CURRENT_IMPLEMENTED: Use public auth endpoints for login, MFA verification, refresh, forgot password, reset password, and invitation acceptance.
- CURRENT_IMPLEMENTED: Hydrate `GET /v1/me` only after a valid authenticated session exists.
- CURRENT_IMPLEMENTED: Render only the minimal Guest dashboard shell in the frontend.
- CURRENT_IMPLEMENTED: Public auth DTOs are validated server-side.
- CURRENT_IMPLEMENTED: Unknown or ineligible forgot-password accounts receive a generic scaffold response without creating a real reset token or audit event.
- CURRENT_IMPLEMENTED: Suspended tenant users are blocked during login, MFA verification, refresh, reset-password, and authenticated session hydration.
- CURRENT_IMPLEMENTED: Refresh tokens are validated, rotated, and scoped to the token owner.
- CURRENT_IMPLEMENTED: Reset tokens are single-use, expiring, and scoped to the intended account.
- CURRENT_IMPLEMENTED: Invitation tokens are accepted through the public invitation flow and scoped by the stored invitation, not by client-supplied role/tenant/school values.

## 3. Denied behavior

- CURRENT_IMPLEMENTED: GUEST has no default internal role permissions.
- CURRENT_IMPLEMENTED: GUEST is not granted `MANAGE_ENQUIRIES`; migration `V30__remove_guest_enquiry_management.sql` removes the accidental seed.
- CURRENT_IMPLEMENTED: GUEST cannot access Super Admin, Tenant Admin, School Admin, Principal, Teacher, Student, Parent, Finance, Office Staff management, report/export, bulk-job, attendance, homework, exam, notice, timetable, or AI endpoints.
- CURRENT_IMPLEMENTED: GUEST cannot list, manage, update, or view internal enquiry records.
- CURRENT_IMPLEMENTED: GUEST cannot view AI recommendations, search internal AI knowledge, configure AI policy, run automation, approve/reject/execute AI actions, or view AI usage/audit.
- CURRENT_IMPLEMENTED: Missing or invalid tokens return 401 on protected APIs.
- CURRENT_IMPLEMENTED: Authenticated GUEST tokens return 403 on protected role APIs.
- CURRENT_IMPLEMENTED: The frontend hides protected nav, finance/report/export UI, and AI assistant surfaces for GUEST.

## 4. Permissions

| Permission code | Category | Allowed by default | Scope | Risk | Notes |
| --- | --- | --- | --- | --- | --- |
| PUBLIC_AUTH_FLOW | AUTH | Yes | Public/auth flow | MEDIUM | Documentation label for public auth and invitation endpoints; not an internal tenant/school permission grant. |
| SESSION_SELF_MANAGE | SESSION | Limited | Valid authenticated session | LOW | `GET /v1/me` may return the current account shell after login. Internal workspace data remains denied. |
| MANAGE_ENQUIRIES | OFFICE | No | None | LOW | Removed from GUEST. Public enquiry submission is not implemented. |
| VIEW_AI_RECOMMENDATIONS | AI | No | None | MEDIUM | Denied by service guards. |
| VIEW_REPORTS / EXPORT_REPORTS | REPORTS | No | None | HIGH | Denied. |
| FINANCE permissions | FINANCE | No | None | HIGH | Denied. |
| Admin/staff/student/parent permissions | Multiple | No | None | HIGH | Denied. |

## 5. Navigation and screens

| Screen | Route/nav id | Visible? | API used | Current status |
| --- | --- | --- | --- | --- |
| Dashboard | dashboard | Yes | `GET /v1/me` after a valid token exists | CURRENT_IMPLEMENTED |
| AI assistant/card/FAB | ai-* | No | None | CURRENT_IMPLEMENTED |
| Reports/exports | reports/exports | No | None | CURRENT_IMPLEMENTED |
| Finance | finance/fees/payments | No | None | CURRENT_IMPLEMENTED |
| Admin/staff/student/parent/teacher workspaces | multiple | No | None | CURRENT_IMPLEMENTED |

## 6. API access matrix

| Method | Endpoint | Allowed? | Auth required | Scope | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/v1/auth/login` | Yes | No access token | Public/auth flow | Generic failures; inactive and suspended tenant users are blocked. |
| POST | `/v1/auth/mfa/verify` | Yes | No access token | Public/auth flow | Challenge must belong to the stored login challenge and be unused/unexpired. |
| POST | `/v1/auth/refresh` | Yes | Refresh token | Public/auth flow | Refresh token is owner-scoped, unexpired, unrevoked, and rotated. |
| POST | `/v1/auth/forgot-password` | Yes | No access token | Public/auth flow | Generic response for unknown or ineligible accounts; eligible accounts receive a real reset token. |
| POST | `/v1/auth/reset-password` | Yes | Reset token | Public/auth flow | Token is single-use, expiring, and owner-scoped. |
| POST | `/v1/invitations/accept` | Yes | Invitation token | Public/auth flow | Stored invitation defines tenant, school, role, and target email. |
| GET | `/v1/me` | Yes | Valid access token | Current account only | Guest dashboard shell/account status only. |
| `/v1/ai/**` | Any | No | Valid token required for other roles | None | 401 without token; 403 for authenticated GUEST. |
| `/v1/super-admin/**` | Any | No | Valid token required for SUPER_ADMIN | None | 401 without token; 403 for authenticated GUEST. |
| `/v1/tenant-admin/**` | Any | No | Valid token required for tenant roles | None | 401 without token; 403 for authenticated GUEST. |
| `/v1/school-admin/**` and principal APIs | Any | No | Valid token required for school roles | None | 401 without token; 403 for authenticated GUEST. |
| `/v1/finance/**` | Any | No | Valid token required for finance roles | None | 401 without token; 403 for authenticated GUEST. |
| Report/export APIs | Any | No | Valid token required for report roles | None | 401 without token; 403 for authenticated GUEST. |

## 7. Public enquiry/application flow

| Area | Status | Notes |
| --- | --- | --- |
| Public enquiry submission endpoint | NOT_FOUND_IN_CODEBASE | No safe public enquiry submission controller was found. |
| Enquiry management for GUEST | CURRENT_IMPLEMENTED denied | GUEST must not list, view, update, assign, follow up, or manage enquiries. |
| Future implementation | PLANNED_RECOMMENDED | Add a dedicated public submission endpoint with DTO validation, rate limiting, spam controls, and no internal list/read/update access. |

## 8. Security controls and tests

- CURRENT_IMPLEMENTED: `AuthSessionFlowTest` covers GUEST removal from `MANAGE_ENQUIRIES`, protected API 401/403 behavior, AI denial, suspended tenant denial, and safe forgot-password behavior.
- CURRENT_IMPLEMENTED: `App.test.tsx` covers the minimal Guest dashboard shell, protected nav hiding, AI UI hiding, and `/v1/me` hydration only with a token.
- CURRENT_PARTIAL: Public auth rate limiting exists for login; broader forgot-password/reset/MFA/invitation attempt limiting should be expanded where infrastructure supports it.
- CURRENT_PARTIAL: Endpoint-level MFA freshness for high-risk exports, finance, access control, and AI execution remains planned for privileged roles.
