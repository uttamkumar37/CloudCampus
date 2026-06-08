# CloudCampus Super Admin Portal - Full Details

This document describes how the current Super Admin portal works in this codebase. It covers the visible UI, backend APIs, data calculations, auth behavior, side effects, and current implementation gaps.

Last updated after the access-control and AI-governance pass. The portal now includes stat-table-backed metrics, paginated/searchable/filterable Super Admin screens, persistent platform settings, real backend global search, real notification popover data, visible asynchronous platform report export jobs, scoped user role/permission administration, and AI recommendation/automation governance.

## Source Files Covered

- Frontend shell and dashboards: `frontend/src/app/App.tsx`
- Super Admin module UI: `frontend/src/features/super-admin/pages/SuperAdminPlatformPage.tsx`
- Tenant onboarding UI: `frontend/src/features/super-admin/pages/TenantOnboardingPage.tsx`
- Super Admin frontend APIs: `frontend/src/features/super-admin/api/platformApi.ts`
- Dashboard summary frontend API: `frontend/src/features/portal/api/dashboardApi.ts`
- Login UI/API: `frontend/src/features/auth/pages/LoginPage.tsx`, `frontend/src/features/auth/api/authApi.ts`
- Auth state/session handling: `frontend/src/features/auth/hooks/authState.tsx`
- Platform control backend: `backend/src/main/java/com/cloudcampus/platform/superadmin/control`
- Platform stats backend: `backend/src/main/java/com/cloudcampus/platform/superadmin/stats`
- Access-control backend: `backend/src/main/java/com/cloudcampus/identity/accesscontrol`, `backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAccessControlController.java`
- Tenant onboarding backend: `backend/src/main/java/com/cloudcampus/platform/superadmin/onboarding`
- Subscription backend: `backend/src/main/java/com/cloudcampus/platform/subscription`
- AI governance backend: `backend/src/main/java/com/cloudcampus/intelligence/ai`, `backend/src/main/java/com/cloudcampus/platform/superadmin/control/SuperAdminAiGovernanceController.java`
- Dashboard summary backend: `backend/src/main/java/com/cloudcampus/portal/dashboard`
- Local Super Admin bootstrap: `backend/src/main/java/com/cloudcampus/platform/superadmin/bootstrap/SuperAdminBootstrap.java`
- Scale migration: `backend/src/main/resources/db/migration/V28__super_admin_scale_foundation.sql`
- Access-control and AI-governance migration: `backend/src/main/resources/db/migration/V29__access_control_ai_governance.sql`
- Scale validation runbook: `docs/super-admin-scale/SUPER_ADMIN_SCALE_VALIDATION.md`
- Performance seed/load scripts: `tests/performance/super-admin-scale-seed-sql.mjs`, `tests/performance/super-admin-platform-smoke.k6.js`

## Portal Purpose

The Super Admin portal is the platform-level control center for CloudCampus. It is designed for CloudCampus operators, not customer schools. A Super Admin can view and manage organizations, schools, users, scoped roles, permissions, subscription plans, revenue, AI usage, AI recommendations, AI automation rules, reports, audit logs, platform health, notification delivery, and safe platform settings.

Super Admin works at platform scope. It does not require an active school. In the UI this appears as `Platform-wide access`, and backend dashboard summary returns `Platform scope = Global`.

## Access And Login Flow

### Public Entry

Before authentication, the app renders the public marketing home. The Sign In action opens the login panel.

### Login Form

The login form collects:

| Field | Behavior |
| --- | --- |
| Email | Required, browser `email` input, sent as `email` |
| Password | Required, sent as `password` |
| Submit button | Shows `Signing in...` while request is in progress |

The frontend calls:

```text
POST /v1/auth/login
```

Payload:

```json
{
  "email": "superadmin@cloudcampus.dev",
  "password": "SuperAdmin123!"
}
```

### Local Development Login Hint

The login page shows a local development hint when running in Vite development mode or on loopback hosts (`localhost`, `127.0.0.1`, `::1`):

```text
Dev Super Admin:
Email: superadmin@cloudcampus.dev
Password: SuperAdmin123!
```

This hint is UI-only. The backend user exists only when the Super Admin bootstrap is enabled.

### Super Admin Bootstrap

The backend can create a local Super Admin account using these properties:

| Property | Meaning |
| --- | --- |
| `cloudcampus.bootstrap.super-admin.enabled` | Enables local bootstrap |
| `cloudcampus.bootstrap.super-admin.email` | Super Admin email |
| `cloudcampus.bootstrap.super-admin.password` | Password, must be at least 12 characters |
| `cloudcampus.bootstrap.super-admin.display-name` | Display name, default `CloudCampus Super Admin` |
| `cloudcampus.bootstrap.super-admin.tenant-code` | Platform tenant code, default `CLOUDCAMPUS` |

Bootstrap behavior:

- Refuses to run in `prod` or `production` profiles.
- Requires nonblank email.
- Requires password length of at least 12 characters.
- Creates or reuses a platform tenant named `CloudCampus Platform`.
- Creates an active `SUPER_ADMIN` user under that platform tenant.
- Skips creation if an active Super Admin with the same email already exists.
- Throws if the bootstrap email is already used by a non-Super Admin user.

### MFA Flow

The backend requires MFA for these roles:

- `SUPER_ADMIN`
- `TENANT_ADMIN`
- `SCHOOL_ADMIN`
- `PRINCIPAL`
- `FINANCE_STAFF`

`SYSTEM` and `AI_AGENT` are service identities. They are valid backend roles for automation/audit attribution, but the auth session service blocks them from interactive login, token refresh, forgot-password, and reset-password flows.

For Super Admin login:

1. `/v1/auth/login` validates email, status, password, and rate-limit checks.
2. If credentials are valid, it creates a 6-digit MFA challenge.
3. The challenge expires in 5 minutes.
4. The response has no access token yet. It includes:
   - `mfaRequired = true`
   - `mfaChallengeId`
   - `mfaCode` in this scaffold implementation
   - `mfaExpiresAt`
5. The UI shows an MFA form.
6. In local hint mode, the UI also shows `Local verification code: {mfaCode}`.
7. The UI submits:

```text
POST /v1/auth/mfa/verify
```

Payload:

```json
{
  "challengeId": "challenge-id",
  "code": "123456"
}
```

After successful MFA:

- The challenge is marked verified.
- The backend records `MFA_CHALLENGE_VERIFIED`.
- The backend returns a Bearer access token, refresh token, expiry, and current user.

### Session Storage

The frontend stores tokens in `sessionStorage`:

| Key | Value |
| --- | --- |
| `cloudcampus.auth.accessToken` | Bearer access token |
| `cloudcampus.auth.refreshToken` | Refresh token |

`AuthStateProvider` hydrates the current user by calling:

```text
GET /v1/me
GET /v1/me/schools
```

For Super Admin, `allowedSchools` is usually empty and `activeSchool` is `null`.

### Logout

The profile menu `Log out` action calls:

```text
POST /v1/me/logout
```

The frontend then clears both session storage keys and returns to unauthenticated state. Backend logout revokes the current access token and revokes the supplied refresh token when present.

### Expired Session Behavior

The shared API layer emits a session-expired event on unauthorized session failure. `AuthStateProvider` listens for that event, clears local tokens, sets status to unauthenticated, and shows:

```text
Session expired. Sign in again.
```

## Portal Shell

After authentication, `AuthenticatedExperience` renders one enterprise shell for all roles. For Super Admin it uses `roleTitle(SUPER_ADMIN) = Super Admin`.

### Layout

The authenticated shell contains:

- Left sidebar
- Top bar
- Main content grid
- Dashboard-only full portal dashboard region
- Compact session banner on non-dashboard Super Admin pages
- Role workspace region
- Mobile sidebar scrim when menu is open
- Floating `AI` button

Important detail: Super Admin no longer renders the full general `PortalDashboard` above every module. The full dashboard appears on the `Dashboard` nav item. Other Super Admin modules show a compact session banner so operational screens such as Tenants, Schools, Revenue, Audit Logs, and Settings are not visually cluttered.

### Theme

The shell has local theme state:

- Default: `light`
- Toggle button switches between `light` and `dark`
- The theme value is placed on `data-theme`
- Theme is not persisted in storage in the current implementation

### Mobile Navigation

The top bar has an `Open navigation` icon button on mobile. It opens the sidebar and a full-screen scrim. Selecting a navigation item closes the mobile menu.

### Sidebar Brand

The sidebar shows:

- Compact brand mark `C`
- `CloudCampus`
- Current role title: `Super Admin`

### Super Admin Sidebar Navigation

All Super Admin navigation entries are marked `CONNECTED_REAL_API`.

| Group | Items |
| --- | --- |
| Platform | Dashboard, Tenants, Schools |
| Business | Subscription Plans, Revenue, Reports |
| Operations | Platform Health, Notifications, Audit Logs |
| Settings | Access Control, AI Governance, Settings |

Full item list:

| Nav ID | Label | Status |
| --- | --- | --- |
| `dashboard` | Dashboard | `CONNECTED_REAL_API` |
| `tenants` | Tenants | `CONNECTED_REAL_API` |
| `schools` | Schools | `CONNECTED_REAL_API` |
| `access-control` | Access Control | `CONNECTED_REAL_API` |
| `subscriptions` | Subscription Plans | `CONNECTED_REAL_API` |
| `revenue` | Revenue | `CONNECTED_REAL_API` |
| `ai-usage` | AI Governance | `CONNECTED_REAL_API` |
| `reports` | Reports | `CONNECTED_REAL_API` |
| `audit` | Audit Logs | `CONNECTED_REAL_API` |
| `health` | Platform Health | `CONNECTED_REAL_API` |
| `notifications` | Notifications | `CONNECTED_REAL_API` |
| `settings` | Settings | `CONNECTED_REAL_API` |

### Sidebar AI Card

The sidebar includes an `AI assistant` card. For Super Admin, the text is:

```text
AI assistant
Insights ready
```

For Super Admin, this card is a connected button. Clicking it routes to the `AI Governance` module, which is the operator-facing AI governance view.

### Floating AI Button

The shell renders a floating button with label `AI` and aria-label `Open CloudCampus AI assistant`. For Super Admin, clicking it routes to the `AI Governance` module. It does not fake chat responses; it sends the operator to the real AI entitlement, recommendation, automation, and usage governance screen.

## Top Bar Details

The top bar is shared by all roles and adapts text for Super Admin.

### Breadcrumbs

The breadcrumb structure is:

```text
CloudCampus > Super Admin > {Current Module}
```

Examples:

- `CloudCampus > Super Admin > Dashboard`
- `CloudCampus > Super Admin > Tenants`
- `CloudCampus > Super Admin > Platform Health`

### Page Title

If active nav is `dashboard`, the title is:

```text
Super Admin Dashboard
```

Otherwise the title is the module title, for example:

- `Tenants`
- `Schools`
- `Access Control`
- `Subscription Plans`
- `Revenue`
- `AI Governance`
- `Reports`
- `Audit Logs`
- `Platform Health`
- `Notifications`
- `Settings`

### Live Date And Time

The top bar runs a one-second timer and displays:

- Localized weekday, day, month, and year
- Localized hour and minute

### Global Search

The global search field placeholder is:

```text
Search students, invoices, reports...
```

Current behavior:

- Focusing the input opens the command palette.
- The `Command K` button opens the command palette.
- Typed search text filters all local Super Admin nav items.
- When the signed-in user is `SUPER_ADMIN` and the query has at least 2 characters, the command palette calls the backend global search endpoint after debounce.
- Backend results are safe platform entities only: tenants, schools, invoices, and audit actions/summaries.
- Results include a type label and an `Open` action that navigates to the related module.

### Actions Button

The `Actions` button opens the same command palette.

### School Switcher Chip

For Super Admin, the chip shows:

```text
Platform-wide access
```

Clicking it opens the command palette. It does not open a school switcher for Super Admin because Super Admin does not require school context.

### Notifications Button

The bell button opens a real notification popover for Super Admin. It calls:

```text
GET /v1/super-admin/notifications/summary
```

The popover shows:

- Total delivery count
- Failed delivery count
- Recent delivery rows from backend data
- Masked recipients only
- Status/channel/template context

For non-Super Admin roles, the shared shell still shows a simpler workspace message.

### Profile Menu

The profile area shows:

- Avatar using first letter of email
- Display name or email
- Role text with underscore replaced

The profile popover shows:

- Display name or email
- Email
- `Super Admin - Platform-wide access`
- `Last login: Current session`
- Buttons: `Profile`, `Preferences`, `Log out`

Only `Log out` has a connected behavior in the current implementation.

## Command Palette

The command palette opens as a modal dialog.

It contains:

- Search input with placeholder `Search Super Admin workspace...`
- `Esc` keyboard hint
- All matching Super Admin nav items
- Backend global search results for query length 2+
- Each result has icon/type context, label, detail, and `Open`

Current Super Admin command palette nav result order:

1. Dashboard
2. Tenants
3. Schools
4. Access Control
5. Subscription Plans
6. Revenue
7. AI Governance
8. Reports
9. Audit Logs
10. Platform Health
11. Notifications
12. Settings

Backend search call:

```text
GET /v1/super-admin/search?q={query}&page=0&size=10
```

Search result groups currently include:

| Type | Safe fields shown | Target nav |
| --- | --- | --- |
| `tenant` | Tenant name, code, status | `tenants` |
| `school` | School name, code, tenant name | `schools` |
| `invoice` | Invoice number, tenant, status | `revenue` |
| `audit` | Action and sanitized summary | `audit` |

Sensitive user/student data, raw prompt text, tokens, passwords, and MFA codes are not exposed through global search.

## General Portal Dashboard Region

The full portal dashboard region is visible on the Super Admin `Dashboard` nav item. On all other Super Admin pages, the shell uses a compact session banner with identity, role, platform-wide access, and active session status.

### Header

For Super Admin it renders:

```text
CloudCampus Platform
Welcome back, CloudCampus Super Admin
Platform-wide access
```

### Session Summary Panel

The panel title is:

```text
Account Session
```

It displays:

| Field | Super Admin value |
| --- | --- |
| Status chip | `Session active` |
| Summary line | `Platform-wide access` |
| Signed in as | Display name or `CloudCampus Super Admin` |
| Role | `Super Admin` |
| Access level | `Platform-wide` |
| Last login | `Current session` |
| Status | `Active` |

### Role Info Cards

The Super Admin dashboard renders four role information cards:

| Card | Value | Detail |
| --- | --- | --- |
| Platform access | Super Admin | Full CloudCampus control center |
| Organization | CloudCampus Platform | Platform-wide administration |
| Current school | Platform-wide access | Super Admin manages all organizations |
| School access | Not required | Super Admin works at platform level |

### Dashboard Summary API

The frontend calls:

```text
GET /v1/super-admin/dashboard/summary
```

The backend requires authenticated role `SUPER_ADMIN`.

Current backend metrics:

| Metric | Value source | Detail |
| --- | --- | --- |
| Total tenants | `tenantRepository.count()` | All platform tenants |
| Active schools | `schoolRepository.countByActiveTrue()` | Platform schools currently active |
| Total users | `userAccountRepository.count()` | All platform user accounts |
| Platform scope | Static `Global` | Super Admin does not require active school |

The response type supports `metrics`, `alerts`, and `activity`. Super Admin summary now includes useful alert/activity rows derived from platform health, notifications, invoices, outbox/report-export job state, onboarding, subscription, platform settings, and AI entitlement audit activity where records exist.

### Dashboard Summary Loading And Error States

State behavior:

- While loading: skeleton with three bars.
- Missing token: `Dashboard summary is getting ready`, with developer detail `Login is required to load dashboard summary.`
- Request failure: `Dashboard summary is getting ready`, with developer details in local development.
- Empty metric list: title `No activity yet` and message `Platform activity will appear after organizations, invoices or alerts are created.`

### Quick Actions

Super Admin quick actions:

| Action | Detail | Target nav |
| --- | --- | --- |
| Create tenant | Create trust, first school and admin | `tenants` |
| Create plan | Prepare subscription package | `subscriptions` |
| System health | Check platform readiness | `health` |

Clicking an action changes the active nav.

### Available Tools Panel

The panel title is:

```text
Available tools
```

It lists all Super Admin nav items with status label:

```text
Connected real API
```

## Super Admin Role Workspace

The role workspace wrapper uses:

```text
Platform control center
```

Then it renders `SuperAdminModule`.

### Module Routing

| Active nav | Rendered module |
| --- | --- |
| `dashboard` | `SuperAdminDashboard` |
| `tenants` | `TenantOnboardingPage` plus `TenantManagement` |
| `schools` | `SchoolDirectory` |
| `access-control` | `AccessControlPanel` |
| `subscriptions` | `SubscriptionPlans` |
| `revenue` | `RevenuePanel` |
| `ai-usage` | `AiUsagePanel` for AI Governance |
| `reports` | `ReportsPanel` |
| `audit` | `AuditLogsPanel` |
| `health` | `PlatformHealthPanel` |
| `notifications` | `NotificationsPanel` |
| `settings` | `SettingsPanel` |
| Unknown | `Unknown section` state |

If no access token exists, every Super Admin section renders:

```text
Super Admin login required
Sign in as SUPER_ADMIN to use the platform control center.
```

## Module: Super Admin Dashboard

This is the role workspace dashboard under `Platform control center`, not the general portal dashboard.

### APIs Loaded

On load and refresh, it calls:

```text
GET /v1/super-admin/platform-metrics
GET /v1/super-admin/tenants?page=0&size=5
GET /v1/super-admin/revenue/summary
GET /v1/super-admin/platform-health
GET /v1/super-admin/notifications/summary
```

The dashboard no longer derives platform totals from only the first tenant or school page. Totals come from `platform-metrics`, backed by aggregate queries and the stats freshness timestamp. The small tenant request is used only for the recent-onboardings card.

### Header

```text
CloudCampus Platform
Welcome back, CloudCampus Super Admin
Platform-wide access
```

There is a `Refresh` button. It increments a local refresh key and reloads all dashboard APIs.

### Loading And Error

- While any dashboard API is loading, it shows `PanelSkeleton`.
- If any API fails, it shows `Dashboard could not load` with the failed request message.
- If all APIs load, it renders metrics and cards.

### Metrics

| Metric | Calculation | Detail |
| --- | --- | --- |
| Platform access | Static `Super Admin` | Full CloudCampus control center |
| Organizations | `platformMetrics.totalTenantCount` | Customer/account count at platform scale |
| Schools | `platformMetrics.totalSchoolCount` | Schools currently onboarded |
| Users | `platformMetrics.totalUserCount` | Total platform users |
| Health | `Healthy` if readiness is `READY`, else readiness value | Core services are online |
| Security | Static `Protected` | MFA and role-based access enabled |

### Growth And Revenue Card

Uses `revenue.monthlyTrend`.

Rendering details:

- Card title: `Growth and revenue`
- Values are formatted as USD with no decimals.
- Bars use the largest point as 100%.
- Every nonzero or zero bar has at least 4% visual height.
- X-axis label uses `point.label.slice(5)`, so `2026-06` displays as `06`.
- Empty trend message: `Revenue data will appear after subscription invoices are created.`

### Recent Onboardings Card

Uses first 5 tenant rows.

Each row:

- Title: tenant name
- Detail: `{activeSchoolCount}/{schoolCount} active schools`
- Meta: tenant status

Empty message:

```text
No organizations yet. Create your first tenant to begin onboarding a school.
```

### Subscription Activity Card

Always builds two rows:

| Row | Detail | Meta |
| --- | --- | --- |
| Pending invoices | `{pendingInvoiceCount} invoice(s) awaiting action` | MRR formatted as money |
| Notification delivery | `{failedDeliveries} failed deliveries` | `Healthy` if zero, else `Needs review` |

### Audit Alerts Card

Uses `platform-health.alerts`.

Each row:

- Title: alert title
- Detail: alert detail
- Meta: alert severity

Empty message:

```text
No audit alerts need attention.
```

## Module: Tenants

The Tenants screen is a two-part workspace grid:

1. Tenant onboarding form
2. Organization management table

### Tenant Onboarding Form

Title:

```text
Create organization with first school
```

Fields:

| Field | Form name | Required | Placeholder |
| --- | --- | --- | --- |
| Organization code | `tenantCode` | Yes | `SUNRISE_TRUST` |
| Organization name | `tenantName` | Yes | `Sunrise Education Trust` |
| First school code | `schoolCode` | Yes | `SUNRISE_PRIMARY` |
| First school name | `schoolName` | Yes | `Sunrise Public School` |
| Primary admin name | `adminName` | Yes | `Asha Mehta` |
| Primary admin email | `adminEmail` | Yes | `admin@school.edu` |

Submit button:

- Default: `Create and invite admin`
- While submitting: `Creating...`

Frontend validation:

- If first school code normalizes to `MAIN`, it blocks submit and shows:

```text
MAIN is reserved. Enter the real first school code.
```

- If no access token is in session storage, it shows:

```text
Super Admin login is required.
```

API:

```text
POST /v1/super-admin/tenants/onboard
```

Payload:

```json
{
  "tenant": {
    "code": "SUNRISE_TRUST",
    "name": "Sunrise Education Trust"
  },
  "firstSchool": {
    "code": "SUNRISE_PRIMARY",
    "name": "Sunrise Public School"
  },
  "primaryAdmin": {
    "fullName": "Asha Mehta",
    "email": "admin@school.edu"
  }
}
```

Success UI:

- Shows created school name.
- Shows `Invitation ready for {email}`.

Failure UI:

```text
Organization onboarding failed.
```

### Tenant Onboarding Backend Behavior

Backend controller:

```text
POST /v1/super-admin/tenants/onboard
```

Authorization:

- Requires role `SUPER_ADMIN`.
- Non-Super Admin receives forbidden error: `Only SUPER_ADMIN can onboard tenants.`

Validation:

- Tenant code required, max 40, pattern `[A-Za-z0-9][A-Za-z0-9_-]*`
- Tenant name required, max 160
- First school code required, max 40, same code pattern
- First school name required, max 180
- Primary admin full name required, max 160
- Primary admin email required, valid email, max 320
- `MAIN` first school code is rejected by backend too because it is reserved for internal migration.

Normalization:

- Tenant code is trimmed and uppercased.
- First school code is trimmed and uppercased.
- Primary admin email is trimmed and lowercased.

Creation side effects:

1. Creates `Tenant`.
2. Creates first `School` as primary school.
3. Creates `UserAccount` with role `SCHOOL_ADMIN`.
4. Creates `UserSchoolAccess` for the new School Admin, primary access true.
5. Creates invitation with raw token.
6. Invitation expires after 7 days.
7. Queues invitation email delivery with acceptance URL:

```text
/invitations/accept?token={rawToken}
```

8. Records audit events:
   - `TENANT_CREATED`
   - `SCHOOL_CREATED`
   - `SCHOOL_ADMIN_INVITED`
   - `SCHOOL_ACCESS_GRANTED`

Response:

| Object | Fields |
| --- | --- |
| `tenant` | id, code, name, status |
| `school` | id, code, name, primarySchool |
| `schoolAdminInvitation` | invitationId, userId, email, role, expiresAt, token, acceptanceUrl |
| `schoolAccess` | userId, schoolId, role, primaryAccess |

### Organization Management Table

Title:

```text
Organization management
```

API:

```text
GET /v1/super-admin/tenants?page={page}&size={size}&search={search}&status={status}
```

Visible controls:

- Search by organization name/code
- Status filter
- Page size selector
- Previous/next pagination
- Total row count from backend

Table columns:

| Column | Data |
| --- | --- |
| Organization | Tenant name and code |
| Status | Status badge |
| Schools | `activeSchoolCount/schoolCount` |
| Users | `userCount` |
| Plan | `planName` |
| Action | `Suspend` or `Activate` |

Empty state:

```text
No tenants found. Use the onboarding wizard to create the first tenant.
```

### Tenant Status Change

Button behavior:

- If tenant status is `ACTIVE`, action is `Suspend`.
- Otherwise action is `Activate`.
- Browser confirmation text:

```text
Change {tenant.name} to {nextStatus}?
```

API:

```text
PATCH /v1/super-admin/tenants/{tenantId}/status
```

Payload:

```json
{
  "status": "SUSPENDED"
}
```

or:

```json
{
  "status": "ACTIVE"
}
```

After success:

- Shows toast: `{tenant.name} is now {nextStatus}.`
- Refreshes tenant list.
- Records backend audit action `TENANT_STATUS_UPDATED`.

## Module: Schools

Title:

```text
All schools
```

API:

```text
GET /v1/super-admin/schools?page={page}&size={size}&search={search}&tenantId={tenantId}&status={status}
```

Visible controls:

- Search by school name/code or tenant name
- Tenant ID filter
- Status filter
- Page size selector
- Previous/next pagination
- Total row count from backend

Table columns:

| Column | Data |
| --- | --- |
| School | School name, school code, and `Primary` marker when `primarySchool = true` |
| Organization | Tenant name |
| Status | Status badge |
| Students | Active student count |
| Staff | Active staff count |
| Activity | Last activity date or `No activity yet` |

Empty state:

```text
No schools yet. Schools will appear after organization onboarding is complete.
```

Backend details:

- Status is mapped to `ACTIVE` or `INACTIVE`.
- Student count uses `school_stats.active_student_count` when available, with a single grouped fallback query for the current page.
- Staff count uses `school_stats.active_staff_count` when available, with a single grouped fallback query for the current page.
- Last activity uses `school_stats.last_activity_at` when available, with a single grouped fallback query for the current page.
- The UI exposes the backend filters listed above.

## Module: Access Control

Title:

```text
Users and roles
```

Primary API:

```text
GET /v1/super-admin/users?page={page}&size={size}&search={search}&tenantId={tenantId}&schoolId={schoolId}&role={role}&status={status}
```

Visible controls:

- Search by user display name or email
- Tenant ID filter
- School ID filter
- Role filter
- Status filter
- Page size selector
- Previous/next pagination
- Total row count from backend

User table columns:

| Column | Data |
| --- | --- |
| User | Display name and email |
| Role | Primary backend role on `user_accounts.role` |
| Tenant | Tenant ID for non-platform users |
| Status | Account status badge |
| Created | Account creation date |

Selecting a user loads:

```text
GET /v1/super-admin/users/{userId}
GET /v1/super-admin/permissions
```

The detail panel shows:

- User identity: display name, email, user ID, tenant ID, account status, created date
- Active and historical role assignments from `user_roles`
- School access rows derived from `user_school_access`
- Permission overrides from `user_permission_overrides`
- Tenant/school scope attached to each assignment or override
- Active, start, expiry, creation, and update timestamps

### Assigning Roles

The role assignment form captures:

| Field | Behavior |
| --- | --- |
| Role | Required role code from the backend enum |
| Tenant ID | Optional tenant scope |
| School ID | Optional school scope |
| Primary role | Optional checkbox to update the user's primary role |
| Reason | Optional audit reason |

The frontend calls:

```text
POST /v1/super-admin/users/{userId}/roles
```

Backend behavior:

- Requires authenticated `SUPER_ADMIN`.
- Rejects legacy `STAFF` for new assignments; use `OFFICE_STAFF`.
- Stores the assignment in `user_roles`.
- Infers platform, tenant, school, or custom scope from role and supplied IDs.
- Optionally updates `user_accounts.role` when `primaryRole = true`.
- For school-scoped human roles, creates matching `user_school_access` when missing.
- Records `USER_ROLE_ASSIGNED`.

The UI can deactivate an assignment:

```text
PATCH /v1/super-admin/users/{userId}/roles/{roleAssignmentId}
DELETE /v1/super-admin/users/{userId}/roles/{roleAssignmentId}
```

Deactivation marks the assignment inactive, stores update metadata, refreshes the detail panel, and records `USER_ROLE_REMOVED`.

### Permission Catalog

The permission catalog is seeded by Flyway V29 into `permissions`. Each permission has:

- Code
- Name
- Description
- Category
- Risk level: `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`
- Scope type: `PLATFORM`, `TENANT`, `SCHOOL`, `CLASS`, `STUDENT`, or `SELF`
- Active flag

Permission categories currently include:

- Platform administration
- Tenant administration
- School administration
- Academic operations
- Student and parent self-service
- Finance operations
- Office operations
- Communication
- AI governance
- Reports
- Audit/security

Role-to-permission grants live in `role_permissions`. Important mappings:

- `SUPER_ADMIN`: all platform, AI, audit, reports, and communication permissions.
- `TENANT_ADMIN`: tenant dashboard/settings/users/schools/reports/audit plus tenant AI policy and recommendation approval.
- `SCHOOL_ADMIN`: school settings/users/classes/sections/subjects/timetable/notices/reports plus school AI recommendation approval.
- `PRINCIPAL`: school dashboard, academic visibility, exams, marks/result approvals, promotions, discipline, and AI recommendation approval.
- `TEACHER`: school dashboard, academic data, assigned attendance, homework, assignments, marks, student performance, and AI recommendation creation.
- `STUDENT`: own profile, attendance, homework, results, and scoped AI recommendations.
- `PARENT`: linked-child profile, attendance, homework, results, fees, messages, and scoped AI recommendations.
- `FINANCE_STAFF`: finance dashboard, fee structure, invoices, payments, discounts, finance reports, fee reminders, and AI recommendation approval.
- `OFFICE_STAFF`: admissions, enquiries, student documents, certificates, ID cards, transfer certificates, visitors, and scoped AI recommendations.
- `GUEST`: enquiry management only.
- `SYSTEM`: automation and report export worker permissions.
- `AI_AGENT`: AI recommendation creation.
- `STAFF`: retained only as a legacy enum alias; new assignments should use `OFFICE_STAFF`.

### Permission Overrides

The override form captures:

| Field | Behavior |
| --- | --- |
| Permission | Required permission code |
| Decision | `Grant` or `Deny` |
| Tenant ID | Optional tenant scope |
| School ID | Optional school scope |
| Reason | Required audit reason |

The frontend calls:

```text
POST /v1/super-admin/users/{userId}/permission-overrides
```

Override behavior:

- Stored in `user_permission_overrides`.
- Can be tenant-scoped, school-scoped, or platform-scoped.
- Active deny overrides win over role grants.
- Active allow overrides add access even when the role does not grant the permission.
- Expired overrides are ignored.
- Every create/update/deactivate is audited with `USER_PERMISSION_OVERRIDE_CREATED`, `USER_PERMISSION_OVERRIDE_UPDATED`, or `USER_PERMISSION_OVERRIDE_REMOVED`.

### Authorization Rules Behind The Portal

`AuthorizationService` is the central backend helper for the new model. It checks:

- Role membership from active `user_roles`, current `user_accounts.role`, and school access where applicable
- Tenant access
- School access
- Student access through `student_user_links` and active `student_guardians`
- Class/section access through active `teacher_assignments`
- Finance permission access
- AI approval permission access
- AI automation execution permission access

Important precedence:

- `SUPER_ADMIN` is treated as platform-wide.
- A deny override blocks a permission even if the role grants it.
- Active allow overrides can grant a scoped permission.
- Expired role assignments and overrides are ignored.
- Parent access requires an active guardian link.
- Student access requires an active student-user link.
- Teacher academic access requires an active teacher assignment matching the relevant class, section, or subject scope.

### Guardian And Student Links

V29 adds two canonical link tables:

- `student_guardians`
- `student_user_links`

The migration backfills:

- `student_guardians` from existing `parent_student_links`
- `student_user_links` from existing `students.user_id`

Super Admin backend APIs can create, update, or deactivate guardian links:

```text
POST /v1/super-admin/students/{studentId}/guardians
PATCH /v1/super-admin/students/{studentId}/guardians/{guardianLinkId}
DELETE /v1/super-admin/students/{studentId}/guardians/{guardianLinkId}
```

These APIs are backend-ready for operator tooling and audit `STUDENT_GUARDIAN_LINKED`, `STUDENT_GUARDIAN_UPDATED`, and `STUDENT_GUARDIAN_UNLINKED`. The current Access Control UI lists user role/access data; a dedicated guardian-link editor is not yet surfaced in the panel.

### Teacher Assignment Governance

V29 extends `teacher_assignments` with:

- Academic year scope
- Class scope
- Section scope
- Subject scope
- Role type
- Update timestamp
- Updated-by actor

It also backfills the new fields from existing class-subject assignments. Super Admin backend APIs can create, update, or deactivate these assignments:

```text
POST /v1/super-admin/teachers/{teacherUserId}/assignments
PATCH /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId}
DELETE /v1/super-admin/teachers/{teacherUserId}/assignments/{assignmentId}
```

These actions audit `TEACHER_ASSIGNMENT_CREATED`, `TEACHER_ASSIGNMENT_UPDATED`, and `TEACHER_ASSIGNMENT_REMOVED`. The current UI does not yet expose a dedicated teacher-assignment editor.

## Module: Subscription Plans

Title:

```text
Subscription plans
```

API for list:

```text
GET /v1/super-admin/subscriptions/plans
```

### Plan Cards

Each plan card shows:

- Status badge
- Plan name
- Description or `No description provided.`
- Schools limit
- Students limit
- Staff limit
- Monthly price formatted as USD

### Create Plan Form

Form title:

```text
Create plan
```

Fields:

| Field | Form name | Validation |
| --- | --- | --- |
| Plan code | `code` | Required |
| Plan name | `name` | Required |
| Description | `description` | Optional |
| Schools | `maxSchools` | Required, min 1 |
| Students | `maxStudents` | Required, min 0 |
| Staff | `maxStaff` | Required, min 0 |
| Monthly price cents | `monthlyPriceCents` | Required, min 0 |
| Annual price cents | `annualPriceCents` | Required, min 0 |

Submit API:

```text
POST /v1/super-admin/subscriptions/plans
```

The frontend sets:

```json
{
  "status": "ACTIVE",
  "currency": "USD"
}
```

After success:

- Toast: `Subscription plan created.`
- Form resets.
- Plan list refreshes.

Backend behavior:

- Requires `SUPER_ADMIN`.
- Normalizes plan code to uppercase.
- Normalizes currency to uppercase.
- Rejects duplicate plan code.
- Rejects negative limits/prices and `maxSchools < 1`.
- Records `SUBSCRIPTION_PLAN_CREATED`.

### Additional Subscription APIs Not Directly Surfaced In Current UI

The backend also supports:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `PATCH` | `/v1/super-admin/subscriptions/plans/{planId}` | Update a plan |
| `GET` | `/v1/super-admin/subscriptions/tenants/{tenantId}` | View tenant subscription |
| `PUT` | `/v1/super-admin/subscriptions/tenants/{tenantId}` | Assign plan/billing cycle to tenant |
| `GET` | `/v1/super-admin/subscriptions/tenants/{tenantId}/invoices` | View tenant invoices |

Assignment behavior:

- Rejects archived plans.
- Rejects assignment if tenant already uses more schools than the plan allows.
- Defaults billing cycle to monthly if missing.
- Can issue an invoice when `issueInvoice` is true.
- Invoice number format is `INV-{TENANT_CODE}-{0001 sequence}`.
- Updates tenant school limit.
- Records `TENANT_SUBSCRIPTION_ASSIGNED`.
- Records `TENANT_INVOICE_ISSUED` when an invoice is created.

## Module: Revenue

Title:

```text
Platform revenue
```

APIs:

```text
GET /v1/super-admin/revenue/summary
GET /v1/super-admin/revenue/invoices?page={page}&size={size}&status={status}
```

Visible controls:

- Invoice status filter
- Page size selector
- Previous/next pagination
- Total row count from backend

### Revenue Metrics

| Metric | Source | Detail |
| --- | --- | --- |
| MRR | `monthlyRecurringRevenueCents` | Assigned active subscriptions |
| ARR estimate | `annualRecurringRevenueEstimateCents` | MRR x 12 |
| Total invoiced | `totalInvoicedCents` | `{issuedInvoiceCount} invoices` |
| Paid | `paidInvoiceCount` | Invoices with status `PAID` |
| Pending | `pendingInvoiceCount` | `ISSUED` or `PENDING` invoices not past due |
| Overdue | `overdueInvoiceCount` | `OVERDUE` or past-due issued/pending invoices |

### Monthly Invoice Trend

Uses `monthlyTrend` from revenue summary. Money values are formatted as USD with no decimals.

### Invoice Table

Columns:

| Column | Data |
| --- | --- |
| Invoice | Invoice number and issued date |
| Tenant | Tenant name |
| Plan | Plan code |
| Amount | USD money |
| Status | Status badge |
| Due | Due date or `No due date` |

Empty state:

```text
No invoices issued yet.
```

### Backend Revenue Calculations

- MRR is calculated from active tenant subscriptions.
- Monthly subscriptions use monthly price.
- Annual subscriptions are divided by 12 and rounded.
- ARR estimate is MRR multiplied by 12.
- Total invoiced is the sum of tenant invoice amounts.
- Pending invoice count is invoices with status `ISSUED` or `PENDING` that are not overdue.
- Overdue count includes explicit `OVERDUE` invoices and issued/pending invoices with `dueAt` before now.
- Paid invoice count counts actual `PAID` invoices.
- Monthly trend covers the last 6 UTC months.
- Tenant and plan breakdowns are sorted by amount descending.

## Module: AI Governance

Title:

```text
AI usage
```

Primary usage API:

```text
GET /v1/super-admin/ai/usage/summary
```

Primary governance APIs:

```text
GET /v1/super-admin/ai/recommendations
GET /v1/super-admin/ai/automation-rules
GET /v1/super-admin/ai/automation-runs
GET /v1/super-admin/ai/policies
```

### AI Metrics

| Metric | Data |
| --- | --- |
| AI tenants | Enabled tenant entitlement count |
| Monthly budget | Sum of monthly unit budgets |
| Used this month | Authorized units used this month |
| Denied | Denied requests this month, with budget-related count in detail |

### Tenant AI Cards

Each tenant card shows:

- `ENABLED` or `DISABLED` badge
- Tenant name
- Progress bar of used units against monthly budget
- Remaining units
- Whether human approval is required or optional

Progress behavior:

- If budget is zero or lower, percent is 0.
- Otherwise percent is `used / budget * 100`.
- Percent is capped at 100.
- Progress bar aria-label is `{percentage} percent used`.

### Token-Safe Usage Audit

The usage audit record list shows:

- Title: `{feature} - {status}`
- Detail: `{tenantName} - {estimatedUnits} units`
- Meta: created date

Empty state:

```text
No AI usage audit rows yet.
```

### AI Recommendations

The recommendations table is backed by `ai_recommendations`.

Visible filters:

- Tenant ID
- School ID
- Recommendation type
- Status
- Risk level
- Assigned user ID
- Page size and pagination

Displayed fields:

| Field | Meaning |
| --- | --- |
| Title | Human-readable recommendation title |
| Type | Recommendation type, such as academic, finance, attendance, engagement, risk alert, message draft, report insight, automation suggestion |
| Risk | `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` |
| Status | Lifecycle status |
| Tenant/school/student/class/section | Scope fields when present |
| Assigned to | Human approver or owner |
| Expires at | Optional expiry time |
| Metadata | Sanitized metadata only |

Status flow:

- `DRAFT`: not ready for human decision.
- `PENDING_APPROVAL`: ready for review.
- `APPROVED`: approved by a human or Super Admin.
- `REJECTED`: rejected with optional reason.
- `EXECUTED`: approved recommendation has been executed.
- `CANCELLED`: dismissed or cancelled.
- `EXPIRED`: no longer actionable.

Super Admin actions:

```text
POST /v1/super-admin/ai/recommendations/{id}/approve
POST /v1/super-admin/ai/recommendations/{id}/reject
POST /v1/super-admin/ai/recommendations/{id}/execute
```

Execution rules:

- Execution requires `APPROVED`.
- Rejected, expired, draft, pending, and cancelled recommendations cannot execute.
- Approval records approver and approval timestamp.
- Reject records rejection reason and actor.
- Execute records execution actor and timestamp.
- All transitions are audited.
- Metadata returned to the UI is sanitized; raw prompts, tokens, secrets, private keys, and API keys are redacted.

### Automation Rules

Automation rules are stored in `automation_rules`.

The UI lists rules and can create a new rule with:

- Tenant ID
- Optional school ID
- Rule key
- Name
- Description
- Trigger type
- Enabled flag
- Required approval flag
- Configuration JSON

APIs:

```text
GET /v1/super-admin/ai/automation-rules?page={page}&size={size}&tenantId={tenantId}&schoolId={schoolId}&enabled={enabled}
POST /v1/super-admin/ai/automation-rules
PATCH /v1/super-admin/ai/automation-rules/{id}
```

Rules are audited with `AUTOMATION_RULE_CREATED` and `AUTOMATION_RULE_UPDATED`. Rules that require approval are intended to generate human-reviewable recommendations before action.

### Automation Runs

Automation runs are stored in `automation_runs`.

The UI lists:

- Rule ID
- Tenant ID
- School ID
- Status
- Triggered-by actor type and ID
- Started, finished, and created timestamps
- Safe summary or error text

API:

```text
GET /v1/super-admin/ai/automation-runs?page={page}&size={size}&tenantId={tenantId}&schoolId={schoolId}&status={status}
```

Run statuses:

- `QUEUED`
- `RUNNING`
- `SUCCEEDED`
- `FAILED`
- `CANCELLED`
- `WAITING_FOR_APPROVAL`

### AI Policies

AI policies are stored in `ai_policies`. V29 backfills tenant-level policies from existing `ai_tenant_entitlements`.

The UI lists policy records. Backend APIs also support reading and updating one tenant policy:

```text
GET /v1/super-admin/ai/policies?page={page}&size={size}&tenantId={tenantId}
GET /v1/super-admin/ai/policies/{tenantId}
PUT /v1/super-admin/ai/policies/{tenantId}
```

Policy fields:

- Tenant ID
- Optional school ID
- Enabled flag
- Human approval requirement
- Maximum monthly units
- Maximum risk level allowed for automation
- Data retention days
- Allowed feature JSON
- Blocked feature JSON

Policy updates require `SUPER_ADMIN` and audit `AI_POLICY_UPDATED`.

### AI Entitlements And Usage Backend

Additional Super Admin AI entitlement APIs:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/v1/super-admin/ai/tenants/{tenantId}/entitlement` | Read one tenant entitlement |
| `PUT` | `/v1/super-admin/ai/tenants/{tenantId}/entitlement` | Update one tenant entitlement |

Entitlement update rules:

- Requires `SUPER_ADMIN`.
- If `enabled = true`, at least one feature must be enabled.
- Default retention is 90 days when no entitlement exists.
- Records `AI_ENTITLEMENT_UPDATED`.

AI usage audit behavior:

- Raw prompt text is never returned to Super Admin UI.
- Backend stores prompt SHA-256 hash and prompt length.
- Authorized requests record `AI_USAGE_AUDITED`.
- Denied requests record `AI_USAGE_DENIED`.
- Denial happens when AI is disabled, feature is disabled, or monthly budget would be exceeded.
- Monthly usage starts at the first day of the current UTC month.

### Scoped AI Portal APIs

Non-Super-Admin roles use scoped AI endpoints under `/v1/ai`. These endpoints apply `AuthorizationService` checks for tenant, school, student, teacher-assignment, parent-guardian, finance, and AI permission scope.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/v1/ai/recommendations` | List recommendations visible to the signed-in role |
| `GET` | `/v1/ai/recommendations/{id}` | Read one visible recommendation |
| `POST` | `/v1/ai/recommendations/{id}/approve` | Approve when role has scoped approval permission |
| `POST` | `/v1/ai/recommendations/{id}/reject` | Reject when role has scoped rejection permission |
| `POST` | `/v1/ai/recommendations/{id}/accept` | Accept a personal/scoped recommendation |
| `POST` | `/v1/ai/recommendations/{id}/execute` | Execute only when approved and permitted |
| `POST` | `/v1/ai/recommendations/{id}/dismiss` | Dismiss/cancel a visible recommendation |
| `GET` | `/v1/ai/automation-rules` | List automation rules visible to the role |
| `PATCH` | `/v1/ai/automation-rules/{id}` | Currently returns 405; scoped rule mutation is not opened from role portals yet |
| `GET` | `/v1/ai/automation-runs` | List automation runs visible to the role |

## Module: Reports

Title:

```text
Platform reports
```

APIs:

```text
GET /v1/super-admin/reports/summary
GET /v1/super-admin/reports/exports?page={page}&size={size}&status={status}&reportType={reportType}
POST /v1/super-admin/reports/exports
GET /v1/super-admin/reports/exports/{jobId}
```

Visible controls:

- Export status filter
- Report type filter
- Page size selector
- Previous/next pagination
- Total job count from backend

### Report Metrics

The UI renders all metrics returned by `reports.summary.metrics`.

Current backend metric categories include:

- Tenant growth reports
- School growth reports
- Subscription reports
- Invoice reports
- AI usage reports
- Notification reports

### Export Jobs

Record list title:

```text
Export jobs
```

Each row:

- Title: `{reportType} - {format}`
- Detail: `{tenantName} / {schoolName}`
- Meta: export status

Empty state:

```text
No export jobs yet.
```

### Request Export Button

The button text is:

```text
Request export
```

Frontend sends:

```json
{
  "reportType": "PLATFORM_SUMMARY",
  "format": "CSV"
}
```

After success:

```text
Export request accepted. Existing export jobs are shown below.
```

Backend behavior:

- Creates a platform `BulkJob` with job type `REPORT_EXPORT`.
- Creates a `ReportExportJob` row.
- Returns `202 Accepted`.
- Initial status is `QUEUED`.
- The job is visible immediately in the export job list.
- `SuperAdminReportExportWorker` picks queued platform jobs on a configurable schedule.
- `SuperAdminReportExportProcessor` marks jobs `PROCESSING`, generates safe CSV output for supported platform report types, writes a `ReportExportFile`, marks the bulk job `COMPLETED`, sets `completedAt`, and records audit.
- Failures are marked `FAILED` with a safe error message.

Supported platform CSV report types:

- `PLATFORM_SUMMARY`
- `TENANT_DIRECTORY`
- `SCHOOL_DIRECTORY`
- `INVOICE_SUMMARY`

School-scoped report types such as `STUDENT_DIRECTORY` and `FEE_DEMANDS` continue to be handled by the school report service.

### Additional Report APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/v1/super-admin/reports/tenants` | Tenant report page using tenant list |
| `GET` | `/v1/super-admin/reports/schools` | School report page using school list |
| `GET` | `/v1/super-admin/reports/exports` | Paginated export jobs |

The current UI uses only summary and request export.

## Module: Audit Logs

Title:

```text
Audit logs
```

API:

```text
GET /v1/super-admin/audit-logs?page={page}&size={size}&tenantId={tenantId}&role={role}&action={action}
```

Visible controls:

- Tenant ID filter
- Actor role/type filter
- Action filter
- Page size selector
- Previous/next pagination

Table columns:

| Column | Data |
| --- | --- |
| Action | Audit action and summary |
| Actor | Actor type |
| Organization | Tenant name or `CloudCampus Platform` |
| Area | Entity type |
| When | Created date |

Empty state:

```text
No audit logs yet.
```

Backend filters exposed in UI:

- `tenantId`
- `role`
- `action`
- `page`
- `size`

Security detail:

- Audit metadata is sanitized before Super Admin response.
- Keys like `token`, `password`, and `mfaCode` are redacted from metadata JSON.

## Module: Platform Health

Title:

```text
Platform health
```

API:

```text
GET /v1/super-admin/platform-health
```

There is a `Refresh` button that reloads the API.

### Metrics

| Metric | Data |
| --- | --- |
| Backend | `backendHealth` |
| Readiness | `readiness` |
| Database | `databaseStatus` |
| Outbox pending | `pendingOutboxCount` |
| Report jobs | `pendingReportExportCount` |
| Notifications | `notificationMode` |

### Alerts

Record list title:

```text
Alerts
```

Each row:

- Title
- Detail
- Severity

Empty state:

```text
No active platform alerts.
```

### Backend Health Response

Current backend response behavior:

- `backendHealth = UP`
- `readiness = READY`
- `databaseStatus = CONNECTED`
- `migrationStatus = FLYWAY_ENABLED`
- `appVersion = 0.1.0-SNAPSHOT`
- Pending outbox count checks up to top 100 pending outbox events.
- Pending report jobs counts queued or processing report export bulk jobs.
- AI enabled tenant count comes from enabled AI entitlements.
- Adds warning alert if pending outbox exists.
- Adds info alert when notification mode is `log`.

## Module: Notifications

Title:

```text
Notification delivery
```

API:

```text
GET /v1/super-admin/notifications/summary
GET /v1/super-admin/notifications/deliveries?page={page}&size={size}&status={status}&channel={channel}&tenantId={tenantId}
```

### Notification Metrics

| Metric | Data |
| --- | --- |
| Total | Total delivery events |
| Sent | Delivered notifications |
| Logged | Recorded notifications |
| Failed | Failed notifications needing attention |

### Recent Deliveries

Summary record list title:

```text
Recent deliveries
```

Each row:

- Title: `{template} - {status}`
- Detail: `{tenantName or Tenant} - {maskedRecipient}`
- Meta: channel

Empty state:

```text
No delivery events yet. Invitation and notification activity will appear here.
```

Additional backend notification APIs:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/v1/super-admin/notifications/deliveries` | Paginated delivery records |
| `GET` | `/v1/super-admin/notifications/deliveries/{deliveryId}` | One delivery |

The delivery list supports backend filters:

- `status`
- `channel`
- `tenantId`
- `page`
- `size`

The current UI uses both the summary endpoint and the paginated delivery list. Visible delivery list controls include:

- Delivery status filter
- Channel filter
- Tenant ID filter
- Page size selector
- Previous/next pagination

Recipient values are masked. Raw recipient secrets, tokens, passwords, and provider credentials are not displayed.

## Module: Settings

Title:

```text
Platform settings
```

APIs:

```text
GET /v1/super-admin/settings
PATCH /v1/super-admin/settings
```

### Settings Form

Fields:

| Field | Form name | Type |
| --- | --- | --- |
| Platform name | `platformName` | Text |
| Support email | `supportEmail` | Email |
| Default timezone | `defaultTimezone` | Text |
| Maintenance mode | `maintenanceMode` | Checkbox |

Submit button:

```text
Save settings
```

PATCH payload:

```json
{
  "platformName": "CloudCampus",
  "supportEmail": "support@cloudcampus.dev",
  "defaultTimezone": "UTC",
  "maintenanceMode": false
}
```

After success:

```text
Settings updated and audited.
```

### Settings Cards

The UI shows:

| Card | Data |
| --- | --- |
| Support portal | `publicFrontendUrl` |
| Notification delivery | `Activity logging` if mode is `log`, otherwise raw mode |
| AI policy | `aiDefaultPolicy` |
| Maintenance | `Enabled` or `Disabled` |

### Developer Details

Only in Vite local development, settings also show:

- Allowed CORS origins
- Runtime values

Runtime values intentionally hide secrets:

```text
jwtSecret = configured/hidden
database = configured/hidden
smtpSecret = configured/hidden
```

### Backend Settings Behavior

GET returns persisted safe settings from `platform_settings`, falling back to safe defaults if the row is absent:

| Field | Default/current source |
| --- | --- |
| `platformName` | `CloudCampus` |
| `supportEmail` | `support@cloudcampus.dev` |
| `defaultTimezone` | `UTC` |
| `publicFrontendUrl` | backend configured frontend URL |
| `corsAllowedOrigins` | backend configured origins split from CSV |
| `notificationMode` | backend configured notification mode |
| `aiDefaultPolicy` | `Tenant entitlement controls enabled; raw prompts are never exposed.` |
| `maintenanceMode` | `false` |
| `runtime` | safe hidden status map |

PATCH behavior:

- Requires `SUPER_ADMIN`.
- Blank platform name is rejected clearly.
- Support email must be valid.
- Timezone must be valid.
- Records `PLATFORM_SETTINGS_UPDATED`.
- Persists `platformName`, `supportEmail`, `defaultTimezone`, and `maintenanceMode`.
- Returns the updated response.
- A refresh from GET returns the saved values.
- Runtime secrets are never persisted or exposed through this endpoint.

## Backend Platform Control APIs

All endpoints below are under:

```text
/v1/super-admin
```

All require authenticated `SUPER_ADMIN`.

### Platform Metrics And Search APIs

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/dashboard/summary` | Yes | General Super Admin dashboard metrics, alerts, activity |
| `GET` | `/platform-metrics` | Yes | Accurate platform totals for dashboard cards |
| `GET` | `/search` | Yes | Safe backend global search for command palette |

Platform metrics response fields:

- `totalTenantCount`
- `activeTenantCount`
- `totalSchoolCount`
- `activeSchoolCount`
- `totalStudentCount`
- `activeStudentCount`
- `totalStaffCount`
- `activeStaffCount`
- `totalUserCount`
- `activeUserCount`
- `pendingInvoiceCount`
- `overdueInvoiceCount`
- `paidInvoiceCount`
- `failedNotificationCount`
- `pendingOutboxCount`
- `pendingReportExportCount`
- `lastCalculatedAt`

Global search query params:

- `q`, required
- `types`, optional comma-separated list
- `page`, default 0
- `size`, default 25 and capped like other Super Admin list endpoints

Search intentionally excludes raw student/user private details, raw AI prompt text, secrets, passwords, tokens, and MFA codes.

### Tenant APIs

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/tenants` | Yes | Paginated tenant list |
| `GET` | `/tenants/{tenantId}` | No | Tenant detail |
| `PATCH` | `/tenants/{tenantId}/status` | Yes | Activate/suspend tenant |
| `PATCH` | `/tenants/{tenantId}/settings` | No | Rename tenant |
| `GET` | `/tenants/{tenantId}/schools` | No | Schools for tenant |
| `GET` | `/tenants/{tenantId}/users` | No | Users for tenant |
| `GET` | `/tenants/{tenantId}/audit` | No | Audit logs for tenant |

Tenant list query params:

- `page`, default 0
- `size`, default 25, capped at 100
- `search`
- `status`

Tenant response fields:

- `tenantId`
- `code`
- `name`
- `status`
- `schoolCount`
- `activeSchoolCount`
- `userCount`
- `planCode`
- `planName`
- `createdAt`

When no subscription is assigned, tenant response uses:

- `planCode = SCAFFOLD`
- `planName = Scaffold default`

### School APIs

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/schools` | Yes | Paginated school list |
| `GET` | `/schools/{schoolId}` | No | School detail |

School list query params:

- `page`
- `size`
- `search`
- `tenantId`
- `status`

School response fields:

- `schoolId`
- `schoolCode`
- `schoolName`
- `tenantId`
- `tenantCode`
- `tenantName`
- `status`
- `primarySchool`
- `studentCount`
- `staffCount`
- `createdAt`
- `lastActivityAt`

### Access Control APIs

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/users` | Yes | Paginated user list with tenant/school/role/status filters |
| `GET` | `/users/{userId}` | Yes | User detail with roles, school access, and permission overrides |
| `GET` | `/users/{userId}/roles` | No | Role assignments for one user |
| `POST` | `/users/{userId}/roles` | Yes | Assign scoped role |
| `PATCH` | `/users/{userId}/roles/{roleAssignmentId}` | Yes | Update/deactivate role assignment |
| `DELETE` | `/users/{userId}/roles/{roleAssignmentId}` | No | Deactivate role assignment |
| `GET` | `/permissions` | Yes | Permission catalog |
| `GET` | `/roles/{role}/permissions` | No | Permission catalog for one role |
| `GET` | `/users/{userId}/permission-overrides` | No | Permission overrides for one user |
| `POST` | `/users/{userId}/permission-overrides` | Yes | Grant or deny one permission override |
| `PATCH` | `/users/{userId}/permission-overrides/{overrideId}` | Yes | Update/deactivate override |
| `DELETE` | `/users/{userId}/permission-overrides/{overrideId}` | No | Deactivate override |
| `POST` | `/students/{studentId}/guardians` | No | Link parent/guardian to student |
| `PATCH` | `/students/{studentId}/guardians/{guardianLinkId}` | No | Update guardian link |
| `DELETE` | `/students/{studentId}/guardians/{guardianLinkId}` | No | Deactivate guardian link |
| `POST` | `/teachers/{teacherUserId}/assignments` | No | Create teacher class/section/subject assignment |
| `PATCH` | `/teachers/{teacherUserId}/assignments/{assignmentId}` | No | Update teacher assignment |
| `DELETE` | `/teachers/{teacherUserId}/assignments/{assignmentId}` | No | Deactivate teacher assignment |

User list query params:

- `page`
- `size`
- `search`
- `tenantId`
- `schoolId`
- `role`
- `status`

All routes require authenticated `SUPER_ADMIN`. Role, permission override, guardian link, and teacher assignment mutations are audited.

### Revenue APIs

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/revenue/summary` | Yes | Revenue dashboard data |
| `GET` | `/revenue/invoices` | Yes | Paginated invoices |
| `GET` | `/revenue/trends` | No | Alias of summary |
| `GET` | `/revenue/tenants` | No | Alias of summary |

Invoice list query params:

- `page`
- `size`
- `status`

### AI APIs In Platform Controller

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/ai/usage/summary` | Yes | AI dashboard summary |
| `GET` | `/ai/usage/tenants` | No | Tenant AI usage list |
| `GET` | `/ai/entitlements` | No | Tenant entitlement-style usage list |

### AI Governance APIs

These routes use the `/v1/super-admin/ai` prefix.

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/recommendations` | Yes | Paginated recommendation list |
| `POST` | `/recommendations` | No | Create recommendation, usually for tests/admin seeding |
| `GET` | `/recommendations/{id}` | No | Read one recommendation |
| `POST` | `/recommendations/{id}/approve` | Yes | Approve recommendation |
| `POST` | `/recommendations/{id}/reject` | Yes | Reject recommendation |
| `POST` | `/recommendations/{id}/execute` | Yes | Execute approved recommendation |
| `GET` | `/automation-rules` | Yes | Paginated automation rule list |
| `POST` | `/automation-rules` | Yes | Create automation rule |
| `PATCH` | `/automation-rules/{id}` | No | Update automation rule |
| `GET` | `/automation-runs` | Yes | Paginated automation run list |
| `GET` | `/policies` | Yes | Paginated tenant AI policy list |
| `GET` | `/policies/{tenantId}` | No | Read one tenant AI policy |
| `PUT` | `/policies/{tenantId}` | No | Update one tenant AI policy |

Recommendation list query params:

- `page`
- `size`
- `tenantId`
- `schoolId`
- `type`
- `status`
- `riskLevel`
- `assignedTo`

Automation rule list query params:

- `page`
- `size`
- `tenantId`
- `schoolId`
- `enabled`

Automation run list query params:

- `page`
- `size`
- `tenantId`
- `schoolId`
- `status`

Separate AI entitlement controller exposes:

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/v1/super-admin/ai/tenants/{tenantId}/entitlement` | No | Tenant entitlement detail |
| `PUT` | `/v1/super-admin/ai/tenants/{tenantId}/entitlement` | No | Update tenant entitlement |

### Report APIs

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/reports/summary` | Yes | Report metrics and exports |
| `GET` | `/reports/tenants` | No | Tenant report data |
| `GET` | `/reports/schools` | No | School report data |
| `GET` | `/reports/exports` | Yes | Paginated report exports |
| `POST` | `/reports/exports` | Yes | Queue real platform export job |
| `GET` | `/reports/exports/{jobId}` | Yes | Read one export job |

Report export list query params:

- `page`
- `size`
- `status`
- `reportType`

### Audit APIs

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/audit-logs` | Yes | Paginated audit logs |

Query params:

- `page`
- `size`
- `tenantId`
- `role`
- `action`

### Health APIs

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/platform-health` | Yes | Platform readiness and alerts |

### Notification APIs

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/notifications/summary` | Yes | Delivery summary |
| `GET` | `/notifications/deliveries` | Yes | Paginated delivery list |
| `GET` | `/notifications/deliveries/{deliveryId}` | No | Delivery detail |

### Settings APIs

| Method | Endpoint | UI used | Purpose |
| --- | --- | --- | --- |
| `GET` | `/settings` | Yes | Safe platform settings |
| `PATCH` | `/settings` | Yes | Update/audit safe settings |

## Scale Foundation And Data Access

The Super Admin portal is now designed to remain usable when the platform has 1000+ schools and 1,000,000+ students.

### Stats Tables

Migration `V28__super_admin_scale_foundation.sql` creates:

| Table | Purpose |
| --- | --- |
| `platform_stats` | Platform-wide aggregate counts and freshness timestamp |
| `tenant_stats` | Per-tenant school/student/staff/user counts |
| `school_stats` | Per-school student/staff counts and last activity |
| `platform_settings` | Persistent safe settings edited from Super Admin UI |

`school_stats` stores:

- `school_id`
- `tenant_id`
- `student_count`
- `active_student_count`
- `staff_count`
- `active_staff_count`
- `last_activity_at`
- `updated_at`

`tenant_stats` stores:

- `tenant_id`
- `school_count`
- `active_school_count`
- `student_count`
- `active_student_count`
- `staff_count`
- `active_staff_count`
- `user_count`
- `active_user_count`
- `updated_at`

`platform_stats` stores the platform totals listed in the platform metrics response.

### Backfill And Reconciliation

The migration backfills all stats from current tables. Runtime reconciliation is handled by:

```text
PlatformStatsReconciliationService
```

Default schedule:

```text
cloudcampus.platform.stats.reconcile-cron=0 */10 * * * *
```

Behavior:

- Rebuilds school stats with grouped current counts.
- Rebuilds tenant stats with grouped current counts.
- Rebuilds platform stats with aggregate repository counts.
- Uses idempotent save/update behavior.
- Keeps exact correctness by scheduled reconciliation.
- Audit log creation immediately touches `school_stats.last_activity_at` when a school ID is available.

### N+1 Removal

The tenant list no longer loops through tenants and counts schools/users one by one. It reads `tenant_stats` for the current page and falls back to grouped aggregate queries only for missing stats.

The school list no longer performs per-school live student/staff counts or one latest-audit query per school. It reads `school_stats` for the current page and falls back to grouped aggregate queries only for missing stats.

Audit and notification list responses batch tenant/school display names for the current page.

### Indexes Added

The scale migration adds indexes for:

- Student tenant/school/active access and student search columns
- Staff tenant/school/active access
- User tenant/role/status/email/created access
- Tenant status/name/created access
- School tenant/status/code/name/created access
- Audit log created, tenant-created, school-created, action-created, actor-created access
- Tenant invoice status/due, tenant-issued, status-issued access
- Notification status/channel/tenant-created access
- Report export tenant/requested, requested-by/requested, report-type/requested, bulk/requested access
- Bulk report export job type/status/requested access
- AI request audit tenant/status/feature-created access
- Stats updated timestamps

### Async Platform Exports

Super Admin platform exports use these classes:

- `SuperAdminReportExportProcessor`
- `SuperAdminReportExportWorker`
- `BulkJobService.createPlatformJob`

Default worker schedule:

```text
cloudcampus.platform.report-export.worker-delay-ms=30000
cloudcampus.platform.report-export.worker-initial-delay-ms=10000
```

Lifecycle:

1. `POST /v1/super-admin/reports/exports` creates a platform `BulkJob`.
2. It creates a `ReportExportJob`.
3. API returns `202 Accepted` with status `QUEUED`.
4. Worker finds queued platform jobs.
5. Processor marks bulk job `PROCESSING`.
6. Processor records `REPORT_EXPORT_STARTED`.
7. Processor generates safe CSV for supported platform report type.
8. Processor writes `ReportExportFile`.
9. Processor updates progress and marks job `COMPLETED`.
10. Processor sets `completedAt`.
11. Processor records `REPORT_EXPORT_COMPLETED`.
12. If generation fails, processor marks job `FAILED` and records `REPORT_EXPORT_FAILED`.

Important storage note: generated report content currently uses the existing database `TEXT` storage pattern. For true customer production with very large files, object storage should replace DB content storage.

### Load And Performance Validation

Scale runbook:

```text
docs/super-admin-scale/SUPER_ADMIN_SCALE_VALIDATION.md
```

Seed generator:

```text
node tests/performance/super-admin-scale-seed-sql.mjs \
  --tenants=1000 \
  --schools=1000 \
  --students=1000000 \
  --staff=50000 \
  --audit-logs=5000000 \
  --notifications=1000000 \
  --invoices=100000 \
  > /tmp/cloudcampus-scale-full.sql
```

k6 smoke:

```text
SUPER_ADMIN_TOKEN={token} BASE_URL=http://127.0.0.1:18080 \
  k6 run tests/performance/super-admin-platform-smoke.k6.js
```

Performance targets:

- Dashboard/platform metrics p95 under 500 ms
- Paginated lists p95 under 800 ms
- Search pages p95 under 1500 ms
- Export enqueue p95 under 300 ms

## Security And Authorization

### Backend Role Guard

The platform control service calls `requireSuperAdmin` for all Super Admin platform operations.

If the user role is not `SUPER_ADMIN`, backend throws:

```text
Only SUPER_ADMIN can access platform control APIs.
```

Other Super Admin services have similar guards:

- Onboarding: `Only SUPER_ADMIN can onboard tenants.`
- Subscription management: `Only SUPER_ADMIN can manage subscription plans.`
- AI entitlement management: `Only SUPER_ADMIN can manage AI entitlements.`

### School Context

Super Admin does not require active school context. Auth session can have `activeSchool = null`. UI labels it as `Platform-wide access`.

### Spoofing Protection

Existing backend tests verify:

- Unauthenticated Super Admin API calls return 401.
- Wrong-role users return 403.
- Spoofed tenant context headers are rejected.
- Spoofed role/user headers do not grant Super Admin access.

### Audit Coverage

Important Super Admin actions create audit records:

- Tenant onboarding
- Tenant status update
- Tenant settings update
- User role assignment/update/removal
- Permission override create/update/removal
- Student guardian link/update/unlink
- Teacher assignment create/update/removal
- Subscription plan creation/update
- Tenant subscription assignment
- Invoice issue
- AI entitlement update
- AI recommendation create/approve/reject/execute/dismiss
- Automation rule create/update
- AI policy update
- AI usage authorized/denied
- Platform settings update
- Platform report export requested/started/completed/failed
- Auth events such as MFA challenge creation/verification and logout

### Secret Handling

The Super Admin settings response never exposes actual runtime secrets. It only returns safe labels like:

```text
configured/hidden
```

Audit metadata redacts sensitive values such as:

- `token`
- `password`
- `mfaCode`
- `secret`
- `apiKey`
- `rawPrompt`
- `privateKey`
- `accessToken`
- `refreshToken`

## Shared UI States And Helpers

### Data Loader

Super Admin modules use `useLoader`.

Behavior:

- Starts each request in `loading`.
- Sets `ready` with data on success.
- Sets `error` with message on failure.
- Uses an `active` flag to avoid setting state after unmount.

### Remote Data Components

| Component | Behavior |
| --- | --- |
| `RemoteData` | Loading skeleton, error state, no-data state, or child render |
| `RemoteList` | Empty list state if array length is 0 |
| `RemoteTable` | Empty table state if `items.length` is 0 |

### Standard Error State

Generic load failure title:

```text
Could not load
```

Generic detail:

```text
This information could not be loaded.
```

### Status Badges

Badges use class:

```text
super-admin-status status-{lowercase status}
```

Examples:

- `status-active`
- `status-suspended`
- `status-enabled`
- `status-disabled`
- `status-issued`

### Date Formatting

Module dates use:

```text
Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
```

### Money Formatting

Money formatting:

- Currency: USD
- Maximum fraction digits: 0
- Input is cents and divided by 100

Example:

```text
money(125000) -> $1,250
```

## Current Functional Coverage Summary

### Fully Connected In Current UI

- Login with MFA
- Session hydration
- Logout
- Super Admin dashboard summary
- Super Admin platform dashboard
- Tenant onboarding
- Tenant list with search/filter/pagination controls
- Tenant activate/suspend
- School directory with search/filter/pagination controls
- Access Control user list with search/filter/pagination controls
- Access Control user detail with roles, school access, and permission overrides
- Super Admin role assignment and role deactivation from the UI
- Super Admin permission override grant/deny and override deactivation from the UI
- Subscription plan list
- Subscription plan creation
- Revenue summary
- Invoice list with status filter/pagination controls
- AI usage summary
- AI recommendation list with tenant/school/type/status/risk/assignee filters
- AI recommendation approve/reject/execute actions
- AI automation rule list and rule creation form
- AI automation run list
- AI policy record list
- Report summary
- Real platform export enqueue and visible export job list
- Async platform report export processing for supported CSV types
- Audit log list with tenant/role/action filters and pagination
- Platform health
- Notification summary
- Notification delivery list with status/channel/tenant filters and pagination
- Real Super Admin shell notification popover
- Real backend global command-palette search
- Sidebar AI card and floating AI button route to AI Governance
- Safe settings read/update/audit
- Persistent settings refresh behavior

### Backend Exists But Not Fully Surfaced In Current UI

- Tenant detail
- Tenant rename/settings
- Tenant schools tab
- Tenant users tab
- Tenant audit tab
- School detail
- Tenant subscription assignment
- Tenant invoice creation through assignment
- Plan update
- Tenant subscription detail
- Tenant invoice list from subscription controller
- AI entitlement detail/update per tenant
- AI recommendation creation endpoint
- AI automation rule update endpoint
- AI policy detail/update endpoint
- Guardian link management endpoint
- Teacher assignment governance endpoint
- Notification delivery detail
- Report tenant/school endpoints
- Report export download endpoint for platform exports is not yet surfaced

### Current Caveats

- Platform report files are still stored in the database using the existing `report_export_files.content` `TEXT` pattern. Move large customer exports to object storage before paid production.
- AI entitlement detail/update and AI policy update APIs exist, but the UI currently shows governance summary, recommendations, rules, runs, and policy rows rather than full edit drawers for every AI record.
- Guardian link and teacher assignment governance APIs exist, but the current Access Control UI focuses on user roles, school access, and permission overrides.
- Tenant detail, school detail, tenant user/audit tabs, tenant subscription assignment, plan update, AI record edit drawers, and notification delivery detail remain backend-ready areas for deeper UI expansion.
- Cursor/keyset pagination is not yet implemented; current high-volume lists use indexed page/size access capped at 100.
- Performance scripts are added, but full 1M+ row validation must be run on local/staging hardware after seeding.

## Test Coverage Observed

Relevant backend tests cover:

- Dashboard summary endpoint access for all roles.
- Super Admin dashboard summary role enforcement.
- Tenant onboarding flow and audit records.
- Super Admin platform list/read/update flows.
- Tenant status update auditing.
- Audit metadata redaction.
- Notification summary and masked recipient.
- Platform health response.
- Settings runtime secret hiding.
- Settings persistence after PATCH/GET.
- Super Admin tenant/school pagination/search/filter behavior.
- Platform metrics accuracy with records beyond one small page.
- Paid invoice count behavior.
- Real platform report export queue creation and processor transition to completed file.
- Report export started/completed audit events.
- Backend global search safe response.
- Wrong role and unauthenticated access rejection.
- Tenant context spoofing rejection.
- Subscription plan and tenant subscription flows.
- AI entitlement and governance flows.
- Access Control controller audit coverage guardrails.
- Super Admin AI governance controller audit coverage guardrails.
- Scoped AI recommendation portal audit coverage guardrails.
- Principal MFA and non-interactive `SYSTEM`/`AI_AGENT` auth blocking.
- Expanded role enum migration and auth compile coverage.
- Local Super Admin bootstrap behavior and production-blocking behavior.

Relevant frontend tests exist for:

- Login page behavior.
- Tenant onboarding page behavior.
- Super Admin platform API query parameter construction.
- Platform summary export request payload.
- Expanded backend role model parity.
- Role shell behavior and Super Admin-only workspace rendering.

## Practical Operator Flow

1. Open the CloudCampus app.
2. Click Sign In.
3. Login as Super Admin.
4. Complete MFA verification.
5. Confirm the shell shows `Super Admin` and `Platform-wide access`.
6. Use dashboard metrics to check total tenants, schools, users, health, and revenue.
7. Use `Tenants` to create a new organization, first school, and first School Admin invite.
8. Use `Access Control` to inspect users, assign scoped roles, and create audited permission grant/deny overrides.
9. Use `Subscription Plans` to define customer plan packages.
10. Use `Revenue` to monitor invoices and MRR/ARR.
11. Use `AI Governance` to review tenant-level AI budgets, recommendations, automation rules, automation runs, and policy records.
12. Use `Reports` to inspect report metrics and existing export jobs.
13. Use `Audit Logs` to investigate sensitive admin actions.
14. Use `Platform Health` to monitor service readiness and background work.
15. Use `Notifications` to inspect delivery health.
16. Use `Settings` for safe platform metadata and audited maintenance preference changes.

## Documentation Package Update

Status: CURRENT_IMPLEMENTED

This Super Admin portal detail document is cross-linked to the generated documentation package created on 2026-06-08.

| Related doc | Purpose | Status |
| --- | --- | --- |
| docs/roles/SUPER_ADMIN.md | Exact 18-section Super Admin role documentation. | CURRENT_IMPLEMENTED |
| docs/api/SUPER_ADMIN_API.md | Super Admin endpoint detail cards. | CURRENT_IMPLEMENTED |
| docs/api/AI_RECOMMENDATION_AUTOMATION_API.md | AI governance, recommendations, automation APIs. | CURRENT_IMPLEMENTED |
| docs/security/RBAC_AND_PERMISSIONS.md | Access-control and permission model. | CURRENT_IMPLEMENTED |
| docs/frontend/SCREEN_BY_SCREEN_DETAILS.md | Screen-by-screen UI details/caveats. | CURRENT_IMPLEMENTED |
| docs/gaps/CURRENT_GAPS_AND_TODOS.md | Partial/missing/planned items. | CURRENT_IMPLEMENTED |
