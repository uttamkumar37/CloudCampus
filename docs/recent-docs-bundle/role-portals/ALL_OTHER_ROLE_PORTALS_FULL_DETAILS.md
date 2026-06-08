# CloudCampus Role Portals - Full Functional Details

Generated on: 2026-06-08

This document covers every portal role other than Super Admin:

- Tenant Admin
- School Admin
- Teacher
- Finance Staff
- Staff
- Parent
- Student

The purpose of this document is to describe exactly how the UI works, what each dashboard and module can do, which APIs are called, what backend rules protect those APIs, and which current UX gaps or implementation caveats exist.

## 1. Source Areas Reviewed

The role portal behavior is implemented across shared shell code, role-specific frontend modules, API clients, backend controllers, and backend services.

Primary frontend areas:

- `frontend/src/app/App.tsx`
- `frontend/src/features/auth/components/SchoolSelector.tsx`
- `frontend/src/features/auth/AuthStateProvider.tsx`
- `frontend/src/features/auth/api/authApi.ts`
- `frontend/src/features/dashboard/api/dashboardApi.ts`
- `frontend/src/features/tenant-admin/*`
- `frontend/src/features/school-admin/*`
- `frontend/src/features/teacher/*`
- `frontend/src/features/finance/*`
- `frontend/src/features/parent/*`

Primary backend areas:

- `backend/src/main/java/com/cloudcampus/auth/*`
- `backend/src/main/java/com/cloudcampus/dashboard/*`
- `backend/src/main/java/com/cloudcampus/tenant/*`
- `backend/src/main/java/com/cloudcampus/school/*`
- `backend/src/main/java/com/cloudcampus/academic/*`
- `backend/src/main/java/com/cloudcampus/student/*`
- `backend/src/main/java/com/cloudcampus/staff/*`
- `backend/src/main/java/com/cloudcampus/parent/*`
- `backend/src/main/java/com/cloudcampus/attendance/*`
- `backend/src/main/java/com/cloudcampus/homework/*`
- `backend/src/main/java/com/cloudcampus/exam/*`
- `backend/src/main/java/com/cloudcampus/fee/*`
- `backend/src/main/java/com/cloudcampus/notice/*`
- `backend/src/main/java/com/cloudcampus/timetable/*`
- `backend/src/main/java/com/cloudcampus/document/*`
- `backend/src/main/java/com/cloudcampus/website/*`
- `backend/src/main/java/com/cloudcampus/report/*`
- `backend/src/main/java/com/cloudcampus/bulk/*`

## 2. Shared Portal Shell

All non-Super-Admin roles use the same authenticated shell after login.

### 2.1 Authenticated Experience

The shared authenticated UI is rendered by `AuthenticatedExperience`.

Default shell state:

- `activeNav` starts as `dashboard`.
- Mobile sidebar is closed by default.
- Theme starts as `light`.
- The portal always renders the general dashboard area plus the role workspace area.
- The currently signed-in user comes from auth state.
- The active school comes from auth state and can be changed with `/v1/me/schools/{schoolId}/activate`.

The shell is role-aware. It chooses:

- Role title
- Sidebar nav items
- Sidebar grouped navigation
- Dashboard metrics endpoint
- Quick actions
- Role information cards
- Role workspace component

### 2.2 Sidebar

The sidebar contains:

- CloudCampus brand label.
- Current role title.
- Role-specific navigation items.
- A contextual AI status card.
- Collapse behavior on mobile.

If a role does not define custom navigation groups, all nav items are displayed under one group named `Workspace`.

The AI status card text is role-aware:

- Student sees `Study coach ready`.
- Other roles see `Insights ready`.

The AI card is currently presentational. It does not launch a full AI workflow from the inspected shell code.

### 2.3 Topbar

The topbar includes:

- Mobile menu button.
- Active school context.
- Global search button.
- Actions button.
- Notifications button.
- Theme toggle.
- Profile menu.

School context label:

- Shows active school name when selected.
- Shows `No current school` when no school is active.

Global search:

- Opens a command palette.
- Search is currently a frontend navigation filter.
- It does not call a backend search API.

Actions:

- Opens the same command palette.

Notifications:

- Opens a notification popover.
- Current notification entries are static shell content.
- The inspected UI does not load notification records from a backend endpoint.

Theme toggle:

- Toggles light and dark shell theme.
- Theme is local UI state in the shell.
- It is not saved through a backend user setting endpoint in the inspected code.

Profile menu:

- Shows signed-in user identity.
- Includes logout.
- Logout clears auth state and calls the auth logout flow.

### 2.4 Command Palette

The command palette is opened by global search or the Actions button.

Behavior:

- Displays role-specific navigation options.
- Shows only the first 8 nav items.
- Selecting an item sets `activeNav`.
- Search filters visible commands.
- It is not a cross-entity search.
- It does not search students, staff, fees, notices, or backend records.

### 2.5 Workspace Header

Each role workspace uses a shared workspace header.

Header content:

- Eyebrow is the active navigation key with hyphens replaced by spaces.
- Title is role-specific.
- Action buttons include `Import` and `Create`.

Important detail:

- The global `Import` and `Create` buttons are shell-level buttons.
- They do not have role-specific handlers in the inspected shell code.
- Real create/import functionality lives inside specific pages such as Student Import, Staff Provisioning, Fee Lifecycle, Academic Setup, and Resource Panels.

### 2.6 Generic Endpoint List Panel

Several role modules use a shared generic list panel named `EndpointListPanel`.

Behavior:

- Calls a configured endpoint with `httpClient.get`.
- Supports either a raw array response or an object with an `items` array.
- Shows the first 12 records.
- Shows loading skeletons while fetching.
- Shows an error state if the API fails.
- Shows `No records yet` when the API succeeds with an empty list.

Title detection for list rows uses this priority:

- `fullName`
- `studentName`
- `title`
- `name`
- `className`
- `subjectName`
- `description`
- `email`
- Fallback: `Record N`

Detail detection for list rows uses this priority:

- `status`
- `role`
- `subjectCode`
- `code`
- `admissionNumber`
- `attendanceDate`
- `weekday`
- `dueDate`
- `createdAt`
- Fallback: `Ready`

In local development only, the panel can expose extra developer context:

- Endpoint path
- Record ID

### 2.7 Shared Dashboard

Every authenticated role sees the general dashboard region before the role workspace.

Dashboard header:

- Eyebrow is the role title.
- Title format is `{Role} Overview`.
- Context pill shows active school name or `No current school`.

Dashboard summary panel:

- Calls a role-specific summary endpoint.
- Uses the current access token.
- Shows loading, error, empty, and metric states.

Summary endpoints:

| Role | Endpoint |
| --- | --- |
| Tenant Admin | `/v1/tenant-admin/dashboard/summary` |
| School Admin | `/v1/school-admin/dashboard/summary` |
| Teacher | `/v1/teacher/dashboard/summary` |
| Finance Staff | `/v1/finance/dashboard/summary` |
| Staff | `/v1/staff/dashboard/summary` |
| Parent | `/v1/parent/dashboard/summary` |
| Student | `/v1/student/dashboard/summary` |

Empty dashboard copy is role-aware:

| Role | Empty Message |
| --- | --- |
| Tenant Admin | Organization activity will appear after schools and users are added. |
| Parent | Child activity will appear after your account is linked by the school. |
| Student | Class activity will appear after your school publishes updates. |
| Other roles | Workspace activity will appear as your team starts using this module. |

### 2.8 Session Summary Panel

The session panel displays:

- Signed in as
- Role
- Access level
- Last login as `Current session`
- Status as `Active`

Context line:

- Shows active school when selected.
- Shows `Choose a school to open your workspace` when there is no active school.

### 2.9 Quick Actions Panel

Quick actions are role-specific.

Important behavior:

- Quick actions are filtered by available nav IDs.
- If a quick action references a nav ID that the role does not actually have, it will not appear.

This matters for Staff:

- Staff quick actions are configured for `tasks` and `notices`.
- Staff navigation only contains `dashboard`.
- Therefore Staff currently sees no quick actions.

### 2.10 API Coverage Panel

The shell can show API coverage for the active role.

Status label:

- `Ready` is shown for nav items marked as connected to real API coverage.

This panel is descriptive. It does not itself test the endpoint at render time.

### 2.11 Floating AI Button

The shell renders a floating `AI` button.

Current behavior:

- The button is presentational in the inspected code.
- No full AI assistant workflow was found wired from this button.

## 3. Shared School Context

### 3.1 School Selector Component

School Admin and Finance Staff workspaces render the `SchoolSelector`.

The selector uses:

- `currentUser`
- `allowedSchools`
- `activeSchool`
- Auth token
- Auth state school activation handler

Visible content:

- Eyebrow: `School context`
- Title: `Current school`
- Current school name or `No active school selected`
- Assigned school count
- School select dropdown
- `Activate school` button

If the user has exactly one assigned school and no active school:

- The component auto-activates that school once.
- It shows `Activating your assigned school.` while doing this.

If activation fails:

- It shows `School activation was denied.`

If the user has no allowed schools:

- The component is not rendered.

### 3.2 Activation API

Endpoint:

```text
POST /v1/me/schools/{schoolId}/activate
```

Effect:

- Validates that the user can access the school.
- Updates active school context.
- Returns refreshed user/session context.
- Frontend stores the new auth context.

### 3.3 Active School Requirements

Several roles require an active school for most real operations.

| Role | Active School Requirement |
| --- | --- |
| Tenant Admin | Not required for tenant-level school management and reporting. |
| School Admin | Required for school-scoped modules. |
| Teacher | Required or inferred through assigned school/class context for teacher modules. |
| Finance Staff | Required for finance modules. |
| Staff | Required for staff dashboard summary. |
| Parent | Child-linked APIs are based on linked students; active school can still affect shell context. |
| Student | Student profile and class APIs are based on linked student profile and school context. |

## 4. Role Security Summary

### 4.1 MFA Expectations

MFA is required for these roles in the inspected auth configuration:

- Super Admin
- Tenant Admin
- School Admin
- Finance Staff

These roles are not configured as MFA-required by default:

- Teacher
- Parent
- Student
- Staff

### 4.2 School Access Rules

Backend services enforce role and school scope.

Common patterns:

- School Admin operations require active School Admin access to the active school.
- Finance operations require either School Admin or Finance Staff finance access.
- Teacher operations require teacher assignment to the class and subject.
- Parent operations require a parent-child link.
- Student operations require the signed-in student user to be linked to the student profile.
- Tenant Admin operations require tenant-level admin access.

### 4.3 Invitation-Based Login Flow

Several roles are invited by admins:

- Tenant Admin invites School Admin.
- School Admin provisions Teacher, Finance Staff, and Staff.
- School Admin links Parent accounts.
- School Admin invites Student login accounts.

Invitation behavior:

- New users are created in invited state unless already active.
- Invitations normally expire after 7 days.
- Invitation emails are queued through backend email/outbox services.
- Audit events are written for invitation and access grants.

## 5. Tenant Admin Portal

### 5.1 Purpose

Tenant Admin manages the organization-level space below Super Admin and above individual schools.

Tenant Admin can:

- Create branch schools under the tenant.
- View schools in the tenant.
- Rename schools.
- Deactivate non-primary schools.
- Invite School Admin users.
- List School Admins for a school.
- Resend School Admin invitations.
- Revoke School Admin access when at least one admin remains.
- View organization reports.
- View subscription usage.
- Update tenant settings.

Tenant Admin cannot:

- Manage schools outside the tenant.
- Deactivate the primary school.
- Create schools beyond the tenant plan limit.
- Revoke the final School Admin from a school.
- Act as School Admin inside a school unless a separate school-scoped role/access exists.

### 5.2 Tenant Admin Navigation

| Nav ID | Label | Meaning |
| --- | --- | --- |
| `dashboard` | Dashboard | Organization overview dashboard. |
| `schools` | Schools | Create, list, update, deactivate schools, and invite School Admins. |
| `admins` | School Admins | School Admin management helper view. |
| `reports` | Reports | Tenant-wide and per-school reporting. |
| `usage` | Subscription Usage | Plan and usage counters. |
| `settings` | Settings | Organization display and contact settings. |

All Tenant Admin nav items are marked as connected to real APIs.

### 5.3 Tenant Admin Quick Actions

| Action | Destination | Detail |
| --- | --- | --- |
| Add school | `schools` | Add a new campus safely. |
| Invite School Admin | `admins` | Grant school access. |
| View reports | `reports` | Compare school performance. |
| Subscription usage | `usage` | Review plan limits. |

### 5.4 Tenant Admin Role Info Cards

| Card | Value | Detail |
| --- | --- | --- |
| Your role | Tenant Admin | Organization administration. |
| Organization | Your organization | Securely managed by CloudCampus. |
| Assigned schools | Count of allowed schools | Schools assigned to your account. |
| Plan | Current subscription | Usage and limits are available in Settings. |

### 5.5 Tenant Admin Dashboard Metrics

Backend dashboard summary can include:

- Active schools
- Total schools
- Students
- Staff profiles
- School admins

Endpoint:

```text
GET /v1/tenant-admin/dashboard/summary
```

### 5.6 Tenant Admin Dashboard Workspace

When `dashboard` is active:

- The shared dashboard summary is shown.
- The role workspace also renders a production workspace panel.
- It calls `/v1/tenant-admin/dashboard/summary`.
- It displays a simple endpoint-backed list if records are returned.
- It also shows an empty-state card: `Production workspace`.

### 5.7 Schools Page

The `schools` workspace renders two panels:

- School creation and School Admin invitation panel.
- School management panel.

#### 5.7.1 Create School Form

Fields:

| Field | UI Label | Placeholder | Required |
| --- | --- | --- | --- |
| `code` | School code | `BRANCH-EAST` | Yes |
| `name` | School name | `Branch East` | Yes |

Button:

- `Create school`

API:

```text
POST /v1/tenant-admin/schools
```

Request:

```json
{
  "code": "BRANCH-EAST",
  "name": "Branch East"
}
```

Success message:

```text
{schoolName} created ({schoolsUsed}/{maxSchools})
```

Error messages:

- `Tenant Admin login is required.`
- `School creation failed.`

Backend rules:

- User must be Tenant Admin.
- School code is normalized to uppercase.
- `MAIN` is reserved.
- Duplicate code inside tenant is rejected.
- School limit is enforced.
- New schools are branch schools with `primarySchool=false`.
- Creation writes audit event `SCHOOL_CREATED`.

#### 5.7.2 Invite School Admin Form

Fields:

| Field | UI Label | Placeholder | Required |
| --- | --- | --- | --- |
| `schoolId` | School | `Select a school from School Management` | Yes |
| `fullName` | Admin full name | `Branch Principal` | Yes |
| `email` | Admin email | `principal@example.com` | Yes |

Button:

- `Invite School Admin`

API:

```text
POST /v1/tenant-admin/schools/{schoolId}/admins/invite
```

Request:

```json
{
  "fullName": "Branch Principal",
  "email": "principal@example.com"
}
```

Success message:

```text
{email} invited as School Admin
```

Error message:

```text
School Admin invitation failed.
```

Backend rules:

- User must be Tenant Admin for the tenant.
- School must belong to the tenant.
- Existing user with the email must have role `SCHOOL_ADMIN`.
- Disabled users cannot be invited.
- School access is granted if missing.
- If user is not active, a 7-day invitation is created.
- Invitation email is queued.
- Invitation accept URL uses `/invitations/accept?token=...`.
- Audit events include `SCHOOL_ADMIN_INVITED` and `SCHOOL_ACCESS_GRANTED`.

### 5.8 School Management Panel

The school management panel is intentionally manual and ID-based.

#### 5.8.1 Load Schools

Button:

- `Load schools`

API:

```text
GET /v1/tenant-admin/schools
```

Response rows display:

- School name
- School code
- Active or inactive status
- Primary school or branch school

Backend sorting:

- Schools are returned sorted by name.

#### 5.8.2 Update School Name

Fields:

| Field | Meaning |
| --- | --- |
| `schoolId` | Raw school ID copied from loaded school records. |
| `name` | New school name. |

Button:

- `Update school`

API:

```text
PATCH /v1/tenant-admin/schools/{schoolId}
```

Request:

```json
{
  "name": "Updated School Name"
}
```

Success message:

```text
{name} updated
```

Error message:

```text
School update failed.
```

Backend rules:

- User must be Tenant Admin.
- School must belong to the tenant.
- New name must be valid.
- Audit event `SCHOOL_UPDATED` is written.

#### 5.8.3 Deactivate School

Fields:

| Field | Meaning |
| --- | --- |
| `schoolId` | Raw school ID. |

Button:

- `Deactivate school`

API:

```text
POST /v1/tenant-admin/schools/{schoolId}/deactivate
```

Success message:

```text
{name} deactivated
```

Error message:

```text
School deactivation failed.
```

Backend rules:

- Primary school cannot be deactivated.
- Already inactive school is rejected.
- School must belong to the tenant.
- Audit event `SCHOOL_DEACTIVATED` is written.

#### 5.8.4 Load School Admins

Fields:

| Field | Meaning |
| --- | --- |
| `schoolId` | Raw school ID. |

API:

```text
GET /v1/tenant-admin/schools/{schoolId}/admins
```

Displayed for each admin:

- Full name
- Email
- User status
- Latest invitation status, or `No invitation`

Backend behavior:

- Reads school access grants.
- Joins latest invitation status where available.
- Only returns admins for schools inside the tenant.

#### 5.8.5 Resend School Admin Invitation

Fields:

| Field | Meaning |
| --- | --- |
| `schoolId` | Raw school ID. |
| `userId` | Raw School Admin user ID. |

API:

```text
POST /v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend
```

Success:

```text
{email} invitation resent
```

Error:

```text
Invitation resend failed.
```

Backend rules:

- Active users do not need a resent invitation and are rejected.
- Disabled users are rejected.
- A new invitation is queued.
- Audit event `SCHOOL_ADMIN_INVITATION_RESENT` is written.

#### 5.8.6 Revoke School Admin Access

Fields:

| Field | Meaning |
| --- | --- |
| `schoolId` | Raw school ID. |
| `userId` | Raw School Admin user ID. |

API:

```text
DELETE /v1/tenant-admin/schools/{schoolId}/admins/{userId}
```

Success:

```text
School Admin access revoked ({remaining} remain)
```

Error:

```text
Access revoke failed.
```

Backend rules:

- Cannot revoke the last School Admin for a school.
- Access grant is deleted when allowed.
- Audit event `SCHOOL_ACCESS_REVOKED` is written.

### 5.9 School Admins Nav

The `admins` nav does not render a fully separate directory page.

It renders:

- School management panel.
- Empty-state helper explaining that School Admins are school-scoped.

The actual list, resend, and revoke operations are inside the School Management panel and require entering a raw school ID.

### 5.10 Reports Page

Tenant Admin reports page supports:

- Organization summary.
- Per-school summary.
- Drill into a selected school summary.

APIs:

```text
GET /v1/tenant-admin/reports/summary
GET /v1/tenant-admin/reports/schools/{schoolId}/summary
```

Metrics can include:

- Total students
- Active students
- Total fee demands
- Amount due
- Amount paid
- Outstanding amount
- Active schools
- Total schools

UI behavior:

- Button `Load organization summary`.
- Summary displays tenant name or school name.
- School list displays school name, code, total students, and outstanding amount.
- Each school row has a `View details` action.

Error:

```text
Organization reports could not be loaded.
```

Backend rules:

- User must be Tenant Admin.
- Tenant Admin cannot request reports for a school outside the tenant.
- Fee numbers are aggregated from school fee demand data.

### 5.11 Settings and Subscription Usage Page

The `settings` and `usage` nav items render the same Tenant Settings page.

APIs:

```text
GET /v1/tenant-admin/settings
PATCH /v1/tenant-admin/settings
GET /v1/tenant-admin/subscription/usage
```

Page title:

```text
Organization settings and usage
```

Load button:

```text
Load organization settings
```

Settings fields:

| Field | Meaning |
| --- | --- |
| `tenantId` | Tenant identifier. |
| `code` | Tenant code. |
| `name` | Legal or base tenant name. |
| `displayName` | Organization display name. |
| `billingEmail` | Billing contact email. |
| `supportEmail` | Support contact email. |
| `timezone` | Tenant timezone. |
| `locale` | Tenant locale. |
| `updatedAt` | Last settings update timestamp. |

Usage fields:

| Field | Meaning |
| --- | --- |
| `planCode` | Current plan code. |
| `maxSchools` | Maximum schools allowed by plan. |
| `schoolsUsed` | Number of schools currently used. |
| `activeSchools` | Active school count. |
| `remainingSchools` | Available school slots. |
| `schoolAdmins` | School Admin user count. |
| `teachers` | Teacher count. |
| `staff` | Staff count. |
| `students` | Student count. |
| `schoolLimitReached` | Whether the tenant reached school limit. |

Update form fields:

- Display name
- Billing email
- Support email
- Timezone, default `UTC`
- Locale, default `en-US`

Button:

- `Update organization settings`

Success messages:

- `{displayName} settings loaded`
- `{displayName} settings updated`

Error messages:

- `Organization settings could not be loaded.`
- `Organization settings could not be updated.`

Backend rules:

- User must be Tenant Admin.
- Settings are persisted in the tenant settings table.
- Email values are masked in audit metadata.
- Audit event `TENANT_SETTINGS_UPDATED` is written when settings are updated.

### 5.12 Tenant Admin API Map

| Function | Method | Endpoint |
| --- | --- | --- |
| Dashboard summary | GET | `/v1/tenant-admin/dashboard/summary` |
| Create school | POST | `/v1/tenant-admin/schools` |
| List schools | GET | `/v1/tenant-admin/schools` |
| Update school | PATCH | `/v1/tenant-admin/schools/{schoolId}` |
| Deactivate school | POST | `/v1/tenant-admin/schools/{schoolId}/deactivate` |
| Invite School Admin | POST | `/v1/tenant-admin/schools/{schoolId}/admins/invite` |
| List School Admins | GET | `/v1/tenant-admin/schools/{schoolId}/admins` |
| Resend invitation | POST | `/v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend` |
| Revoke access | DELETE | `/v1/tenant-admin/schools/{schoolId}/admins/{userId}` |
| Settings | GET | `/v1/tenant-admin/settings` |
| Update settings | PATCH | `/v1/tenant-admin/settings` |
| Usage | GET | `/v1/tenant-admin/subscription/usage` |
| Organization report | GET | `/v1/tenant-admin/reports/summary` |
| School report | GET | `/v1/tenant-admin/reports/schools/{schoolId}/summary` |

### 5.13 Tenant Admin Current Caveats

- Many management actions use raw school IDs and user IDs.
- The `admins` nav is a helper around School Management rather than a polished dedicated admin directory.
- School Admin invite form asks for a school ID instead of selecting from a loaded school dropdown.
- Global shell `Import` and `Create` buttons are not wired to Tenant Admin actions.
- Search is a command palette, not tenant-wide entity search.

## 6. School Admin Portal

### 6.1 Purpose

School Admin manages a single active school workspace.

School Admin can:

- Select active school.
- View school dashboard summary.
- Manage student import and student login invitations.
- List students.
- List parents.
- Link parent accounts to students.
- Review and decide parent leave requests.
- List teachers and staff.
- Provision Teacher, Finance Staff, and Staff users.
- Configure academic years, classes, and sections.
- Configure subjects, class-subjects, and teacher assignments.
- List and create attendance sessions.
- List and create homework.
- List, create, publish, and manage exam results.
- Create fee demands and record payments.
- Manage timetable entries.
- Create and publish notices.
- Create documents.
- Create and publish school website pages.
- Request and download report exports.
- Create, list, and cancel bulk jobs.
- Update school settings.

School Admin cannot:

- Manage another tenant's school.
- Use school modules without an active school.
- Provision arbitrary roles outside Teacher, Finance Staff, and Staff.
- Record teacher marks unless using teacher-specific assigned workflows.
- Delete many school records from the current UI; most modules create, list, publish, or update status only.

### 6.2 School Admin Navigation

| Nav ID | Label | Meaning |
| --- | --- | --- |
| `dashboard` | Dashboard | School summary workspace. |
| `students` | Students | Student list and student import. |
| `parents` | Parents | Parent list, parent linking, leave decisions. |
| `teachers` | Teachers | Teacher directory and provisioning. |
| `staff` | Staff | Staff directory and provisioning. |
| `academic` | Academic Setup | Years, classes, sections, subjects, teacher assignments. |
| `attendance` | Attendance | Attendance sessions. |
| `homework` | Homework | Homework records. |
| `exams` | Exams & Results | Exams and publishing. |
| `fees` | Fees | Fee demands and payments. |
| `timetable` | Timetable | Timetable entries. |
| `notices` | Notices | School notices. |
| `reports` | Reports | Report exports. |
| `documents` | Documents | School documents. |
| `website` | Website Builder | Public page content. |
| `settings` | Settings | School settings and bulk jobs. |

### 6.3 School Admin Quick Actions

| Action | Destination |
| --- | --- |
| Add student | `students` |
| Add teacher | `teachers` |
| Take attendance | `attendance` |
| Create notice | `notices` |
| Create exam | `exams` |

### 6.4 School Admin Role Info Cards

| Card | Value | Detail |
| --- | --- | --- |
| Your role | School Admin | School Administrator. |
| Current school | Active school name or no current school | Your active workspace. |
| Academic year | Current academic year | Configured by school setup. |
| Assigned schools | Count of allowed schools | Assigned schools. |

### 6.5 School Admin Dashboard Metrics

Backend dashboard summary can include:

- Students
- Teachers
- Staff
- Attendance sessions
- Homework
- Upcoming exams
- Fee due
- Notices
- Reports

Endpoint:

```text
GET /v1/school-admin/dashboard/summary
```

### 6.6 Active School Requirement

The School Admin workspace always renders `SchoolSelector`.

If no active school is selected:

- The workspace shows empty state `Select active school`.
- Detail says: `Choose an assigned school to open the School Admin tools.`

All real school modules require active school context.

### 6.7 School Admin Dashboard Workspace

When `dashboard` is active and a school is selected:

- The workspace shows the student resource panel.
- It also shows an empty-state helper named `School Admin workspace`.
- Detail encourages using connected modules to manage ERP workflows.

This means the dashboard workspace gives immediate visibility into students, not only metrics.

### 6.8 Generic School Admin Resource Panel

Several modules use `SchoolAdminResourcePanel`.

Common behavior:

- Auto-loads records when the resource changes.
- Requires a School Admin auth token.
- Shows first 10 visible records.
- Provides a `Refresh` button.
- Shows loading and error states.
- In local Vite development only, exposes JSON create and publish forms when supported.

Missing token error:

```text
School Admin login is required.
```

Empty state:

```text
No records yet
New {resource label} activity will appear here when it is available.
```

Developer create form:

- Only appears when running local development mode.
- Uses a JSON textarea.
- Requires valid JSON.
- On invalid JSON, shows `Payload must be valid JSON.`
- On success, shows `{label} saved through the backend API.`

Developer publish form:

- Only appears when running local development mode.
- Requires a record ID.
- Empty ID error: `Enter the record ID to publish.`
- On success, shows `{label} record published.`

Resource panel endpoints:

| Resource | List Endpoint | Create Endpoint | Publish Endpoint |
| --- | --- | --- | --- |
| Students | `/v1/school-admin/students` | Not generic | None |
| Parents | `/v1/school-admin/parents?size=50` | Not generic | None |
| Teachers | `/v1/school-admin/teachers?size=50` | Not generic | None |
| Staff | `/v1/school-admin/staff?size=50` | Not generic | None |
| Attendance | `/v1/school-admin/attendance/sessions` | `/v1/school-admin/attendance/sessions` | None |
| Homework | `/v1/school-admin/homework` | `/v1/school-admin/homework` | None |
| Exams | `/v1/school-admin/exams` | `/v1/school-admin/exams` | `/v1/school-admin/exams/{id}/publish` |
| Fees | `/v1/school-admin/fees/demands` | Fee Lifecycle page | None |
| Notices | `/v1/school-admin/notices` | `/v1/school-admin/notices` | `/v1/school-admin/notices/{id}/publish` |
| Timetable | `/v1/school-admin/timetable` | `/v1/school-admin/timetable` | None |
| Documents | `/v1/school-admin/documents` | `/v1/school-admin/documents` | None |
| Website | `/v1/school-admin/website/pages` | `/v1/school-admin/website/pages` | `/v1/school-admin/website/pages/{id}/publish` |

Sample create payloads are embedded in the UI for development mode:

Attendance:

```json
{
  "classLevelId": "class-id",
  "sectionId": "section-id",
  "subjectId": "subject-id",
  "attendanceDate": "2026-05-27",
  "records": [
    {
      "studentId": "student-id",
      "status": "PRESENT"
    }
  ]
}
```

Homework:

```json
{
  "classLevelId": "class-id",
  "sectionId": "section-id",
  "subjectId": "subject-id",
  "title": "Chapter 1",
  "instructions": "Read pages 1-5",
  "dueDate": "2026-05-30"
}
```

Exam:

```json
{
  "classLevelId": "class-id",
  "sectionId": "section-id",
  "subjectId": "subject-id",
  "title": "Unit Test",
  "examDate": "2026-06-10",
  "maxMarks": 50
}
```

Notice:

```json
{
  "title": "Holiday",
  "body": "School closed tomorrow",
  "audience": "ALL"
}
```

Timetable:

```json
{
  "classLevelId": "class-id",
  "sectionId": "section-id",
  "subjectId": "subject-id",
  "weekday": "MONDAY",
  "startTime": "09:00",
  "endTime": "09:45",
  "title": "Math"
}
```

Document:

```json
{
  "classLevelId": "class-id",
  "studentId": "student-id",
  "title": "Transfer certificate",
  "fileName": "tc.pdf",
  "storageKey": "documents/tc.pdf"
}
```

Website page:

```json
{
  "slug": "about",
  "title": "About our school",
  "body": "Welcome to our school"
}
```

### 6.9 Students Module

The Students workspace renders:

- Student list through `SchoolAdminResourcePanel`.
- Student import page.

#### 6.9.1 Student List

Endpoint:

```text
GET /v1/school-admin/students
```

The list displays records using generic row heuristics:

- Student full name or name.
- Admission number if present.
- Status if present.

#### 6.9.2 Student Import Page

The Student Import page supports:

- Loading academic years.
- Selecting academic year.
- Selecting class.
- Selecting section.
- Adding draft rows manually.
- Importing rows from a CSV file.
- Validating rows before import.
- Importing students.
- Queueing an import job.
- Inviting student login for an imported student.

Academic scope flow:

1. Load academic years.
2. Select academic year.
3. Load classes for selected year.
4. Select class.
5. Load sections for selected class.
6. Select section.
7. Validate/import rows against selected class and section.

Draft row fields:

| Field | Meaning |
| --- | --- |
| `admissionNumber` | School admission number. |
| `firstName` | Student first name. |
| `lastName` | Student last name. |
| `dateOfBirth` | Date in ISO format. |
| `gender` | Student gender. |
| `rollNumber` | Optional roll number. |
| `guardianEmail` | Guardian email. |
| `guardianMobile` | Guardian mobile number. |

CSV expected headers:

```text
admissionNumber,firstName,lastName,dateOfBirth,gender,rollNumber,guardianEmail,guardianMobile
```

Important CSV behavior:

- Parser is quote-aware.
- It is still a simple local parser, not a full external CSV library.

Local validation requires:

- Academic year selected.
- Class selected.
- Section selected.
- Admission number on every row.
- First name on every row.
- Last name on every row.
- Date of birth on every row.

Prepared backend row maps:

- `firstName` and `lastName` are combined into `fullName`.
- Selected `classLevelId` is added.
- Selected `sectionId` is added.
- `rollNumber`, `dateOfBirth`, `gender`, `guardianEmail`, and `guardianMobile` are passed when present.

Important detail:

- Backend row type supports `guardianName`.
- Current frontend draft rows do not include a `guardianName` field.

Buttons:

- `Validate rows`
- `Import students`
- `Queue import job`
- `Invite student login`

Student import APIs:

```text
GET /v1/school-admin/academic-years
GET /v1/school-admin/classes?academicYearId={id}
GET /v1/school-admin/sections?classLevelId={id}
POST /v1/school-admin/students/import/validate
POST /v1/school-admin/students/import
POST /v1/school-admin/students/import/jobs
POST /v1/school-admin/students/{studentId}/login-invitation
```

Backend import rules:

- User must be School Admin with active school.
- Maximum 500 rows.
- Required backend fields are admission number, full name, class ID, and section ID.
- Class must belong to active school.
- Section must belong to class.
- Duplicate admission numbers inside the import are rejected.
- Duplicate admission numbers already existing in school are rejected.
- Guardian email must match expected email format.
- Date must use ISO `yyyy-MM-dd`.
- Import saves student records.
- Queue creates a bulk job with type `STUDENT_IMPORT`.
- Import audit event: `STUDENT_IMPORTED`.
- Queue audit event: `STUDENT_IMPORT_JOB_QUEUED`.

Student login invitation rules:

- User must be School Admin.
- Student must belong to active school.
- Existing user must have role `STUDENT`.
- Disabled users are rejected.
- Student cannot be linked to another user/email.
- School access is granted if needed.
- Invitation is created for non-active users.
- Invitation expiration is normally 7 days.
- Audit events can include `STUDENT_LOGIN_INVITED`, `STUDENT_LOGIN_ENABLED`, and `SCHOOL_ACCESS_GRANTED`.

### 6.10 Parents Module

The Parents workspace renders:

- Parent directory list.
- Parent link page.
- Parent leave request decision page.

#### 6.10.1 Parent Directory

Endpoint:

```text
GET /v1/school-admin/parents?size=50
```

Records display using generic row heuristics:

- Parent full name.
- Email.
- Status or relationship when available.

Backend behavior:

- Lists parent links for the active school.
- Requires School Admin access.

#### 6.10.2 Parent Link Page

Purpose:

- Link a parent account to a student.
- Create or invite parent user when needed.

Fields:

| Field | Meaning |
| --- | --- |
| `studentId` | Raw student ID. |
| `parentFullName` | Parent full name. |
| `parentEmail` | Parent email. |
| `parentMobile` | Parent mobile. |
| `relationship` | Relationship label. |
| `primaryContact` | Whether the parent is primary contact. |

API:

```text
POST /v1/school-admin/parent-links
```

Success displays:

- Student name.
- Whether invitation is ready or the parent is already linked.

Backend rules:

- School Admin must have access to the student's school.
- Existing user with the email must be role `PARENT`.
- Duplicate parent-child link is rejected.
- Invitation is created if parent is not active.
- Audit events include `PARENT_INVITED` and `PARENT_LINKED`.

#### 6.10.3 Parent Leave Request Decisions

Purpose:

- School Admin reviews and decides parent leave requests.

APIs:

```text
GET /v1/school-admin/parent-leave-requests
PATCH /v1/school-admin/parent-leave-requests/{id}
```

UI behavior:

- `Load requests` button fetches current leave requests.
- Form asks for raw leave request ID.
- Status select supports approved or rejected decision values.
- Admin note is optional.

Decision fields:

| Field | Meaning |
| --- | --- |
| `leaveRequestId` | Raw leave request ID. |
| `status` | `APPROVED` or `REJECTED`. |
| `adminNote` | Optional decision note. |

Success message displays:

```text
{status} leave request for {parentEmail}
```

List rows display:

- Student name.
- Status.
- Start date and end date.
- Reason.

Backend rules:

- School Admin must have active school access.
- Decision status cannot be `PENDING`.
- Already decided requests cannot be decided again.
- Audit event `PARENT_LEAVE_DECIDED` is written.

### 6.11 Teachers Module

The Teachers workspace renders:

- Teacher directory through `SchoolAdminResourcePanel`.
- Staff provisioning form.

Teacher directory endpoint:

```text
GET /v1/school-admin/teachers?size=50
```

Staff provisioning endpoint:

```text
POST /v1/school-admin/staff/provision
```

### 6.12 Staff Module

The Staff workspace renders:

- Staff directory through `SchoolAdminResourcePanel`.
- Staff provisioning form.

Staff directory endpoint:

```text
GET /v1/school-admin/staff?size=50
```

### 6.13 Staff Provisioning

The same provisioning page is used in Teachers and Staff nav sections.

Purpose:

- Create or invite school staff accounts.
- Grant school access.
- Create staff profile.

Fields:

| Field | Meaning |
| --- | --- |
| `fullName` | Staff member full name. |
| `email` | Login email. |
| `role` | `TEACHER`, `FINANCE_STAFF`, or `STAFF`. |
| `employeeNumber` | Employee number. |
| `department` | Department name. |
| `designation` | Designation or title. |

The frontend always sends:

```json
{
  "portalLoginRequired": true
}
```

Success message:

```text
{fullName} {roleLabel} invited
```

Error message:

```text
Staff provisioning failed.
```

Backend rules:

- User must be active School Admin.
- `portalLoginRequired` must be true.
- Role must be one of `TEACHER`, `FINANCE_STAFF`, or `STAFF`.
- Duplicate employee number in the school is rejected.
- Existing user email must have matching role.
- Disabled existing users are rejected.
- Duplicate staff profile is rejected.
- School access is granted when needed.
- A 7-day invitation is created when user is not active.
- Audit events include `STAFF_INVITED`, `STAFF_PROFILE_CREATED`, and `SCHOOL_ACCESS_GRANTED`.

### 6.14 Academic Setup Module

The Academic Setup nav renders:

- Academic Setup page.
- Academic Assignments page.

### 6.15 Academic Years

Academic year APIs:

```text
GET /v1/school-admin/academic-years
POST /v1/school-admin/academic-years
POST /v1/school-admin/academic-years/{id}/activate
```

The frontend page loads years on mount.

Selection behavior:

- Prefers active/current academic year.
- Falls back to first year.

Year form fields:

| Field | Placeholder / Behavior |
| --- | --- |
| Name | `2026-2027` |
| Start date | Required. |
| End date | Required. |
| Set as current year | Checkbox. |

Button:

- `Save year`

Success:

```text
{name} is {status}.
```

Backend rules:

- End date must be after start date.
- Duplicate academic year name is rejected.
- Creating with active/current status can activate it.
- Activating a year closes other active years.
- Audit events include `ACADEMIC_YEAR_CREATED` and `ACADEMIC_YEAR_ACTIVATED`.

### 6.16 Classes

Class APIs:

```text
GET /v1/school-admin/classes?academicYearId={id}
POST /v1/school-admin/classes
```

Class form fields:

| Field | Behavior |
| --- | --- |
| Academic year | Select. |
| Class name | Placeholder `Class 1`. |
| Display order | Number, minimum 0. |

Button:

- `Save class`

Button disabled:

- When no academic year is selected.

Success:

```text
{className} class created for {academicYearName}.
```

Backend rules:

- Academic year must belong to active school.
- Duplicate class name within academic year is rejected.
- Audit event `CLASS_LEVEL_CREATED` is written.

### 6.17 Sections

Section APIs:

```text
GET /v1/school-admin/sections?classLevelId={id}
POST /v1/school-admin/sections
```

Section form fields:

| Field | Behavior |
| --- | --- |
| Class | Select. |
| Section name | Placeholder `A`. |
| Capacity | Number, optional, minimum 1. |

Button:

- `Save section`

Button disabled:

- When no class is selected.

Success:

```text
{sectionName} section created for {className}.
```

Backend rules:

- Class must belong to active school.
- Duplicate section name within class is rejected.
- Audit event `SECTION_CREATED` is written.

### 6.18 Academic Assignments

Academic Assignments handles:

- Subjects.
- Class-subject assignments.
- Teacher assignments.

APIs:

```text
GET /v1/school-admin/subjects
POST /v1/school-admin/subjects
GET /v1/school-admin/class-subjects?classLevelId={id}
POST /v1/school-admin/class-subjects
GET /v1/school-admin/teacher-assignments?classLevelId={id}
POST /v1/school-admin/teacher-assignments
GET /v1/school-admin/teachers?size=100
```

Page behavior:

- Loads academic years, subjects, and teachers in parallel.
- Selects active or first academic year.
- Selects first subject when available.
- Selects first teacher when available.
- Teacher search filters by full name, email, and employee number.

#### 6.18.1 Subject Form

Fields:

| Field | Meaning |
| --- | --- |
| Subject code | Required. |
| Subject name | Required. |

Success:

```text
{subjectName} subject created.
```

Backend rules:

- Subject code is normalized to uppercase.
- Duplicate subject code in school is rejected.
- Audit is written for subject creation.

#### 6.18.2 Assign Subject to Class

Fields:

| Field | Meaning |
| --- | --- |
| Year | Academic year. |
| Class | Class level. |
| Subject | Subject. |

Success:

```text
{subjectName} assigned to {className}.
```

Backend rules:

- Class and subject must belong to the active school.
- Duplicate class-subject assignment is rejected.
- Audit is written.

#### 6.18.3 Assign Teacher

Fields:

| Field | Meaning |
| --- | --- |
| Teacher search | Filters teacher list. |
| Teacher | Selected teacher. |
| Class subject | Selected class-subject assignment. |

Success:

```text
{teacherName} assigned to {subjectName}.
```

Backend rules:

- Teacher user must have role `TEACHER`.
- Teacher must belong to same tenant.
- Assignment must belong to active school.
- Duplicate teacher assignment is rejected.
- Teacher APIs depend on these assignments.

### 6.19 Attendance Module

Endpoint:

```text
GET /v1/school-admin/attendance/sessions
POST /v1/school-admin/attendance/sessions
```

UI:

- Uses `SchoolAdminResourcePanel`.
- Lists attendance sessions.
- Create form is visible only in local development mode.

Backend rules:

- School Admin can create, list, and read attendance sessions.
- Duplicate class, section, subject, and date combination is rejected.
- Records must reference active students in scope.
- Each student can appear only once in a session.
- Supported statuses include `PRESENT`, `ABSENT`, `LATE`, and `EXCUSED`.
- Audit event `ATTENDANCE_SUBMITTED` records present and absent counts.

### 6.20 Homework Module

Endpoint:

```text
GET /v1/school-admin/homework
POST /v1/school-admin/homework
```

UI:

- Uses `SchoolAdminResourcePanel`.
- Lists homework records.
- Create form is visible only in local development mode.

Backend rules:

- School Admin can create, list, and read homework.
- Homework is scoped by class, section, and subject.
- Published homework becomes visible to Parent and Student views.
- Student submission endpoint exists on backend, but is not wired in the current Student UI.
- Audit event `HOMEWORK_PUBLISHED` is written when homework is created or published according to service flow.

### 6.21 Exams and Results Module

Endpoints:

```text
GET /v1/school-admin/exams
POST /v1/school-admin/exams
POST /v1/school-admin/exams/{id}/publish
```

UI:

- Uses `SchoolAdminResourcePanel`.
- Lists exams.
- Create and publish forms are visible only in local development mode.

Backend rules:

- School Admin can create, list, and read exams.
- School Admin can record marks.
- School Admin can publish results.
- `maxMarks` defines mark validation limit.
- Published results become visible to Parent and Student views.
- Audit events include `EXAM_CREATED`, `EXAM_MARKS_RECORDED`, and `EXAM_RESULTS_PUBLISHED`.

### 6.22 Fees Module

The Fees workspace renders:

- Fee demand list through resource panel.
- Fee Lifecycle page.

Fee list endpoint:

```text
GET /v1/school-admin/fees/demands
```

#### 6.22.1 Create Fee Demand

Default form state:

- Description: `Term 1 fee`
- Amount: `1`
- Due date: `2026-06-30`

Fields:

| Field | Meaning |
| --- | --- |
| Student ID | Raw student ID. |
| Description | Fee description. |
| Amount | Minimum 0.01. |
| Due date | Due date. |

API:

```text
POST /v1/school-admin/fees/demands
```

Success:

```text
Fee demand created
```

The created demand ID is saved into the payment form automatically.

#### 6.22.2 Record Payment

Default form state:

- Payment amount: `1`
- Method: `cash`

Fields:

| Field | Meaning |
| --- | --- |
| Demand ID | Raw fee demand ID. |
| Payment amount | Amount being paid. |
| Method | Payment method. |
| Reference | Optional payment reference. |

API:

```text
POST /v1/school-admin/fees/demands/{demandId}/payments
```

Success:

```text
Receipt issued
```

Backend rules:

- School Admin can create fee demands and record payments.
- Student must belong to active school.
- Payment amount cannot exceed outstanding amount.
- Payment cannot be recorded after demand is fully paid.
- Amounts are scaled to 2 decimals.
- Payment method is normalized to uppercase with spaces converted to underscores.
- Receipt number format starts with `RCPT-{schoolCode}-`.
- Audit events include `FEE_DEMAND_CREATED`, `FEE_PAYMENT_RECORDED`, and `RECEIPT_ISSUED`.

### 6.23 Timetable Module

Endpoints:

```text
GET /v1/school-admin/timetable
POST /v1/school-admin/timetable
```

UI:

- Uses `SchoolAdminResourcePanel`.
- Lists timetable entries.
- Create form is visible only in local development mode.

Backend rules:

- End time must be after start time.
- Class must belong to active school.
- Section is optional but must belong to class if provided.
- Subject is optional but must belong to active school if provided.
- Audit event `TIMETABLE_ENTRY_CREATED` is written.

### 6.24 Notices Module

Endpoints:

```text
GET /v1/school-admin/notices
POST /v1/school-admin/notices
POST /v1/school-admin/notices/{id}/publish
```

UI:

- Uses `SchoolAdminResourcePanel`.
- Lists notices.
- Create and publish forms are visible only in local development mode.

Backend rules:

- School Admin can create, list, read, and publish notices.
- Audience controls visibility.
- Class and section can scope a notice.
- Section requires class.
- Published notices become visible to Teacher, Parent, and Student where audience and scope match.
- Audit events include `NOTICE_CREATED` and `NOTICE_PUBLISHED`.

### 6.25 Documents Module

Endpoints:

```text
GET /v1/school-admin/documents
POST /v1/school-admin/documents
```

UI:

- Uses `SchoolAdminResourcePanel`.
- Lists document metadata.
- Create form is visible only in local development mode.

Backend rules:

- School Admin can create, list, and read document records.
- Document can be class-scoped.
- Document can be student-scoped.
- Student and class references must belong to active school.
- Student-class relationship is validated when both are present.
- Audit event `DOCUMENT_CREATED` is written.

### 6.26 Website Builder Module

Endpoints:

```text
GET /v1/school-admin/website/pages
POST /v1/school-admin/website/pages
POST /v1/school-admin/website/pages/{id}/publish
```

UI:

- Uses `SchoolAdminResourcePanel`.
- Lists website pages.
- Create and publish forms are visible only in local development mode.

Backend rules:

- Slug is lowercased and trimmed.
- Slug must be unique per school.
- School Admin can create, list, read, and publish pages.
- Audit events include `WEBSITE_PAGE_CREATED` and `WEBSITE_PAGE_PUBLISHED`.

### 6.27 Reports Module

The Reports workspace renders `ReportExportsPage`.

APIs:

```text
POST /v1/school-admin/reports/exports
GET /v1/school-admin/reports/exports
GET /v1/school-admin/reports/exports/{id}/download
```

Supported report types in UI:

- `STUDENT_DIRECTORY`
- `FEE_DEMANDS`

Supported format in UI:

- `CSV`

Actions:

- Request export.
- List exports.
- Download completed export.

Success messages:

- `{reportTypeLabel} export queued`
- `{n} report exports loaded`
- `Downloaded {contentLength} characters`

Download behavior:

- Download button is shown only for `COMPLETED` exports.

Backend rules:

- Request creates a bulk job of type `REPORT_EXPORT`.
- CSV file content is generated during processing.
- Download requires completed export.
- Audit events include `REPORT_EXPORT_REQUESTED` and `REPORT_EXPORT_COMPLETED`.

### 6.28 Settings Module

The Settings workspace renders:

- School Settings page.
- Bulk Jobs page.

#### 6.28.1 School Settings

APIs:

```text
GET /v1/school-admin/settings
PATCH /v1/school-admin/settings
```

Displayed settings:

- Tenant ID
- School ID
- School code
- School name
- Primary school
- Active status
- Created at

Editable field:

- School name

Button:

- `Save settings`

Local validation:

- Name cannot be blank.

Backend rules:

- School Admin must have active school.
- Empty name is rejected.
- Audit event `SCHOOL_UPDATED` is written only when the name changes.

#### 6.28.2 Bulk Jobs

APIs:

```text
POST /v1/school-admin/bulk-jobs
GET /v1/school-admin/bulk-jobs
POST /v1/school-admin/bulk-jobs/{id}/cancel
```

Create fields:

| Field | Default | Meaning |
| --- | --- | --- |
| `jobType` | `STUDENT_IMPORT` | Bulk job type. |
| `totalRecords` | `0` | Expected record count. |
| `inputFileReference` | Empty | Input file or storage reference. |

Success messages:

- `{jobType} queued`
- `{n} bulk jobs loaded`
- `{jobType} cancelled`

Cancel button hidden for terminal statuses:

- `COMPLETED`
- `PARTIALLY_COMPLETED`
- `FAILED`
- `CANCELLED`

Backend rules:

- Job type is normalized to uppercase with spaces converted to underscores.
- Job type must match pattern `^[A-Z0-9_:-]{3,80}$`.
- Total records must be nonnegative.
- Audit event `BULK_JOB_CREATED` is written on create.
- Outbox event `BulkJobCreated` is queued.
- Cancelling writes audit and outbox events.

### 6.29 School Admin API Map

| Function | Method | Endpoint |
| --- | --- | --- |
| Dashboard summary | GET | `/v1/school-admin/dashboard/summary` |
| Settings | GET | `/v1/school-admin/settings` |
| Update settings | PATCH | `/v1/school-admin/settings` |
| Academic years | GET | `/v1/school-admin/academic-years` |
| Create academic year | POST | `/v1/school-admin/academic-years` |
| Activate academic year | POST | `/v1/school-admin/academic-years/{id}/activate` |
| Classes | GET | `/v1/school-admin/classes?academicYearId={id}` |
| Create class | POST | `/v1/school-admin/classes` |
| Sections | GET | `/v1/school-admin/sections?classLevelId={id}` |
| Create section | POST | `/v1/school-admin/sections` |
| Subjects | GET | `/v1/school-admin/subjects` |
| Create subject | POST | `/v1/school-admin/subjects` |
| Class subjects | GET | `/v1/school-admin/class-subjects?classLevelId={id}` |
| Assign subject | POST | `/v1/school-admin/class-subjects` |
| Teacher assignments | GET | `/v1/school-admin/teacher-assignments?classLevelId={id}` |
| Assign teacher | POST | `/v1/school-admin/teacher-assignments` |
| Students | GET | `/v1/school-admin/students` |
| Validate import | POST | `/v1/school-admin/students/import/validate` |
| Import students | POST | `/v1/school-admin/students/import` |
| Queue student import | POST | `/v1/school-admin/students/import/jobs` |
| Invite student login | POST | `/v1/school-admin/students/{studentId}/login-invitation` |
| Parents | GET | `/v1/school-admin/parents?size=50` |
| Link parent | POST | `/v1/school-admin/parent-links` |
| Leave requests | GET | `/v1/school-admin/parent-leave-requests` |
| Decide leave request | PATCH | `/v1/school-admin/parent-leave-requests/{id}` |
| Teachers | GET | `/v1/school-admin/teachers?size=50` |
| Staff | GET | `/v1/school-admin/staff?size=50` |
| Provision staff | POST | `/v1/school-admin/staff/provision` |
| Attendance sessions | GET | `/v1/school-admin/attendance/sessions` |
| Create attendance | POST | `/v1/school-admin/attendance/sessions` |
| Homework | GET | `/v1/school-admin/homework` |
| Create homework | POST | `/v1/school-admin/homework` |
| Exams | GET | `/v1/school-admin/exams` |
| Create exam | POST | `/v1/school-admin/exams` |
| Publish exam | POST | `/v1/school-admin/exams/{id}/publish` |
| Fee demands | GET | `/v1/school-admin/fees/demands` |
| Create fee demand | POST | `/v1/school-admin/fees/demands` |
| Record fee payment | POST | `/v1/school-admin/fees/demands/{demandId}/payments` |
| Notices | GET | `/v1/school-admin/notices` |
| Create notice | POST | `/v1/school-admin/notices` |
| Publish notice | POST | `/v1/school-admin/notices/{id}/publish` |
| Timetable | GET | `/v1/school-admin/timetable` |
| Create timetable entry | POST | `/v1/school-admin/timetable` |
| Documents | GET | `/v1/school-admin/documents` |
| Create document | POST | `/v1/school-admin/documents` |
| Website pages | GET | `/v1/school-admin/website/pages` |
| Create website page | POST | `/v1/school-admin/website/pages` |
| Publish website page | POST | `/v1/school-admin/website/pages/{id}/publish` |
| Report exports | GET | `/v1/school-admin/reports/exports` |
| Request report export | POST | `/v1/school-admin/reports/exports` |
| Download report export | GET | `/v1/school-admin/reports/exports/{id}/download` |
| Bulk jobs | GET | `/v1/school-admin/bulk-jobs` |
| Create bulk job | POST | `/v1/school-admin/bulk-jobs` |
| Cancel bulk job | POST | `/v1/school-admin/bulk-jobs/{id}/cancel` |

### 6.30 School Admin Current Caveats

- Many forms require raw IDs instead of friendly dropdown selection.
- Resource panel create and publish controls are development-only.
- In production, some modules are list-only unless a dedicated page exists.
- Global shell `Import` and `Create` buttons are not wired.
- Student Import does not collect guardian name even though backend supports it.
- Parent leave decision uses raw leave request ID.
- Fee demand and payment forms use raw student and demand IDs.
- Report export download behavior depends on backend export completion.

## 7. Teacher Portal

### 7.1 Purpose

Teacher portal is a class and subject assignment workspace.

Teacher can:

- View dashboard summary.
- View assigned classes.
- View attendance sessions for assigned class-subjects.
- View homework for assigned class-subjects.
- View exams for assigned class-subjects.
- Enter numeric marks for assigned exams.
- View timetable.

Backend also supports teacher-created attendance and homework in service logic, but the inspected Teacher UI mainly exposes listing and marks entry workflows.

### 7.2 Teacher Navigation

| Nav ID | Label | Meaning |
| --- | --- | --- |
| `dashboard` | Dashboard | Teacher dashboard summary. |
| `classes` | My Classes | Assigned class-subjects. |
| `attendance` | Attendance | Attendance sessions for selected assignment. |
| `homework` | Homework | Homework for selected assignment. |
| `exams` | Exams | Exams for selected assignment. |
| `marks` | Marks Entry | Mark entry table for exam roster. |
| `notices` | Notices | Intended teacher notices route. |
| `timetable` | Timetable | Teacher timetable. |

### 7.3 Teacher Quick Actions

| Action | Destination |
| --- | --- |
| Mark attendance | `attendance` |
| Create homework | `homework` |
| Enter marks | `marks` |

Important detail:

- Quick action labels are action-oriented.
- Current UI for attendance and homework is mostly list-oriented through the teacher scoped panel.
- Marks entry is the most complete teacher action form.

### 7.4 Teacher Role Info Cards

| Card | Value | Detail |
| --- | --- | --- |
| Your role | Teacher | Classroom workspace. |
| School | Active school or no current school | Current context. |
| Assigned classes | View classes | Open My Classes for your assignments. |
| Today's classes | Timetable | See schedule. |

### 7.5 Teacher Dashboard Metrics

Backend summary can include:

- Assigned classes
- Homework created
- Upcoming exams
- Recent notices

Endpoint:

```text
GET /v1/teacher/dashboard/summary
```

### 7.6 Teacher Dashboard Workspace

When `dashboard` is active:

- Shared dashboard summary is shown.
- Role workspace uses `DashboardWorkspacePanel`.
- It calls `/v1/teacher/dashboard/summary`.
- It displays `Production workspace` empty-state helper.

### 7.7 My Classes

The Teacher Scoped Portal Panel loads assignments:

```text
GET /v1/teacher/assignments
```

Each assignment can include:

- Class level ID
- Class name
- Section
- Subject ID
- Subject name
- Subject code

UI behavior:

- `classes` displays assignments directly.
- If no assignments exist, it shows a no assigned classes empty state.
- Teacher assignment data is the foundation for attendance, homework, exams, and marks entry.

Backend rules:

- Teacher must have role `TEACHER`.
- Assignments come from School Admin academic assignment setup.
- Teacher can only act on class-subjects assigned to the teacher.

### 7.8 Attendance

Teacher attendance view uses selected assignment context.

Flow:

1. Load assignments.
2. Teacher selects class-subject assignment.
3. UI calls teacher attendance endpoint for that class and subject.
4. Records are listed.

Endpoint pattern:

```text
GET /v1/teacher/attendance?classLevelId={classLevelId}&subjectId={subjectId}
```

Backend behavior:

- Teacher can list and read attendance for assigned class-subject.
- Teacher service can create attendance for assigned class-subjects.
- Duplicate class, section, subject, and date sessions are rejected.
- Student records must be in class/section scope.

Current UI caveat:

- The inspected Teacher UI does not provide a polished attendance taking form.
- It lists assignment-scoped attendance records.

### 7.9 Homework

Teacher homework view uses selected assignment context.

Endpoint pattern:

```text
GET /v1/teacher/homework?classLevelId={classLevelId}&subjectId={subjectId}
```

Backend behavior:

- Teacher can list and read homework for assigned class-subject.
- Teacher service supports creating homework for assigned class-subject.
- Homework becomes visible to students and parents by class/section.

Current UI caveat:

- The quick action says `Create homework`.
- The inspected Teacher UI does not expose a complete homework creation form.
- It lists assignment-scoped homework records.

### 7.10 Exams

Teacher exams view uses selected assignment context.

Endpoint pattern:

```text
GET /v1/teacher/exams?classLevelId={classLevelId}&subjectId={subjectId}
```

Backend behavior:

- Teacher can list and read exams for assigned class-subject.
- Teacher can record marks through the exam result API.
- Teacher cannot access exams outside assigned class-subjects.

### 7.11 Marks Entry

Marks Entry is the most complete Teacher workflow.

APIs:

```text
GET /v1/teacher/assignments
GET /v1/teacher/exams?classLevelId={classLevelId}&subjectId={subjectId}
GET /v1/teacher/exams/{examId}/roster
POST /v1/teacher/exams/{examId}/results
```

Selection flow:

1. Load assignments.
2. Build unique class options.
3. Select class.
4. Select subject for the class.
5. Load exams for class and subject.
6. Select exam.
7. Load exam roster.
8. Enter marks in roster table.
9. Submit only changed numeric marks.

Selectors:

- Class
- Subject, displayed as `{subjectName} ({subjectCode})`
- Exam, displayed as `{title} - Section X` or all sections

Context shown:

- Class name
- Subject name
- Max marks
- Exam status

Unsaved change protections:

- Browser `beforeunload` prompt is registered when marks are dirty.
- Changing class asks for confirmation if marks are unsaved.
- Changing subject asks for confirmation if marks are unsaved.
- Changing exam asks for confirmation if marks are unsaved.
- Confirmation text is `You have unsaved marks. Discard changes?`

Validation:

- Blank marks are ignored.
- Nonblank marks must be finite numbers.
- Marks must be at least 0.
- Marks must be less than or equal to exam max marks.
- If no changed nonblank marks exist, message is `Enter or change marks before submitting.`

Submission:

- Each changed mark is sent separately.
- Payload contains student ID and marks obtained.
- After saving, roster is refreshed.

Success message:

```text
{n} mark entry saved.
```

or

```text
{n} mark entries saved.
```

Important UI hint:

```text
Absent marking is not enabled by the current backend exam API, so only numeric marks are submitted.
```

Backend rules:

- Teacher must be assigned to exam class-subject.
- Student must be in the exam scope.
- Marks must be 0 through max marks.
- Audit event `EXAM_MARKS_RECORDED` is written.

### 7.12 Timetable

Endpoint:

```text
GET /v1/teacher/timetable
```

UI behavior:

- Teacher timetable is loaded separately from assignment-scoped attendance/homework/exams.
- Shows timetable entries for assigned classes and subjects.

Backend behavior:

- Teacher timetable is derived from active assignments and matching class/subject timetable entries.

### 7.13 Notices

Intended endpoint:

```text
GET /v1/teacher/notices
```

Backend behavior:

- Teacher notices require role `TEACHER`.
- Only published notices are visible.
- Audience and class scope control visibility.
- Notices visible to teachers include all-teacher or all-audience notices that match scope.

Current UI caveat:

- Teacher navigation includes `notices`.
- The generic role endpoint map contains `/v1/teacher/notices`.
- However, current `LearnerStaffModule` routes Teacher pages through `TeacherScopedPortalPanel`.
- Inside that panel, the `notices` case currently falls through to the exams loader instead of calling `/v1/teacher/notices`.
- Result: Teacher notices nav may show exam-like data rather than real notices until routing is fixed.

### 7.14 Teacher API Map

| Function | Method | Endpoint |
| --- | --- | --- |
| Dashboard summary | GET | `/v1/teacher/dashboard/summary` |
| Assignments | GET | `/v1/teacher/assignments` |
| Attendance | GET | `/v1/teacher/attendance?classLevelId={id}&subjectId={id}` |
| Homework | GET | `/v1/teacher/homework?classLevelId={id}&subjectId={id}` |
| Exams | GET | `/v1/teacher/exams?classLevelId={id}&subjectId={id}` |
| Exam roster | GET | `/v1/teacher/exams/{examId}/roster` |
| Save marks | POST | `/v1/teacher/exams/{examId}/results` |
| Notices | GET | `/v1/teacher/notices` |
| Timetable | GET | `/v1/teacher/timetable` |

### 7.15 Teacher Current Caveats

- Attendance taking is not exposed as a complete teacher form.
- Homework creation is not exposed as a complete teacher form.
- Teacher notices route appears incorrectly wired in the current frontend.
- Teacher workflows depend on School Admin assigning subjects and teachers first.
- Marks entry supports numeric marks only, not absent flags.

## 8. Finance Staff Portal

### 8.1 Purpose

Finance Staff manages school fee operations for an active school.

Finance Staff can:

- Select active school.
- View finance dashboard summary.
- View fee demands.
- Create fee demands.
- Record payments.
- View receipts.
- View finance reports.

Finance Staff cannot:

- Use finance modules without active school context.
- Manage non-finance academic modules.
- Manage schools outside assigned access.

### 8.2 Finance Staff Navigation

| Nav ID | Label | Meaning |
| --- | --- | --- |
| `dashboard` | Dashboard | Finance dashboard summary. |
| `fees` | Fee Demands | Fee demand list and creation. |
| `payments` | Payments | Record payments through fee lifecycle. |
| `receipts` | Receipts | Receipt list. |
| `reports` | Reports | Finance reports. |

### 8.3 Finance Staff Quick Actions

| Action | Destination |
| --- | --- |
| Record payment | `payments` |
| Generate receipt | `receipts` |
| Export report | `reports` |

### 8.4 Finance Staff Role Info Cards

| Card | Value | Detail |
| --- | --- | --- |
| Your role | Finance Staff | Finance Staff. |
| School | Active school or no current school | Current context. |
| Finance access | Enabled | Finance access. |
| Assigned schools | Count of allowed schools | Assigned schools. |

### 8.5 Finance Staff Dashboard Metrics

Backend summary can include:

- Fee demands
- Collected
- Outstanding
- Receipts

Endpoint:

```text
GET /v1/finance/dashboard/summary
```

### 8.6 Active School Requirement

Finance workspace always renders `SchoolSelector`.

If no active school is selected:

- Empty state title: `Select active school`.
- Detail: choose an assigned school to open finance tools.

### 8.7 Finance Dashboard Workspace

When `dashboard` is active:

- Shared dashboard summary is shown.
- Role workspace uses `DashboardWorkspacePanel`.
- It calls `/v1/finance/dashboard/summary`.

### 8.8 Fee Demands

For `fees` nav:

- The workspace shows a generic endpoint list panel for fee demands.
- It also shows the Fee Lifecycle form configured for Finance APIs.

List endpoint:

```text
GET /v1/finance/fees/demands
```

Create demand endpoint:

```text
POST /v1/finance/fees/demands
```

Form behavior is the same as School Admin Fee Lifecycle:

- Raw student ID.
- Description.
- Amount.
- Due date.
- Success: `Fee demand created`.

Backend rules:

- Role must have finance access.
- Student must belong to active school.
- Amount must be valid.
- Audit event `FEE_DEMAND_CREATED` is written.

### 8.9 Payments

For `payments` nav:

- The workspace shows fee demand list.
- It also shows payment form through Fee Lifecycle.

Payment endpoint:

```text
POST /v1/finance/fees/demands/{demandId}/payments
```

Fields:

- Raw demand ID.
- Payment amount.
- Method.
- Reference.

Success:

```text
Receipt issued
```

Backend rules:

- Demand must belong to active school.
- Payment amount cannot exceed outstanding amount.
- Fully paid demand cannot accept further payments.
- Receipt is issued.
- Audit events include `FEE_PAYMENT_RECORDED` and `RECEIPT_ISSUED`.

### 8.10 Receipts

For `receipts` nav:

- The workspace shows fee demand list.
- It also shows a second endpoint list panel for receipts.

Receipt endpoint:

```text
GET /v1/finance/receipts?size=50
```

Rows can display:

- Receipt number.
- Student name.
- Amount.
- Payment method.
- Date.

### 8.11 Finance Reports

The Reports nav renders `FinanceReportsPage`.

APIs:

```text
GET /v1/finance/reports/summary
GET /v1/finance/receipts?size=50
GET /v1/finance/reports/collections
```

Finance report metrics:

- Demanded
- Collected
- Outstanding
- Receipts

Money formatting:

- Uses `Intl` currency formatting with USD in the inspected frontend.

Receipt records display:

- Receipt number
- Student name
- Amount
- Method
- Date

Collection records display:

- Date
- Collection amount

Backend behavior:

- Summary computes demanded, collected, outstanding, demand count, payment count, and status counts.
- Collections are grouped by UTC date.

### 8.12 Finance Staff API Map

| Function | Method | Endpoint |
| --- | --- | --- |
| Dashboard summary | GET | `/v1/finance/dashboard/summary` |
| Fee demands | GET | `/v1/finance/fees/demands` |
| Create fee demand | POST | `/v1/finance/fees/demands` |
| Record payment | POST | `/v1/finance/fees/demands/{demandId}/payments` |
| Receipts | GET | `/v1/finance/receipts?size=50` |
| Finance summary report | GET | `/v1/finance/reports/summary` |
| Collections report | GET | `/v1/finance/reports/collections` |

### 8.13 Finance Staff Current Caveats

- Fee demand and payment forms use raw IDs.
- The shared Fee Lifecycle component still says `School Admin login is required.` for missing token even when used by Finance Staff.
- Finance report money formatting is currently USD in frontend display.
- Global shell `Create` and `Import` buttons are not wired to finance actions.

## 9. Staff Portal

### 9.1 Purpose

Staff portal is currently minimal.

Staff can:

- Login.
- View shared portal shell.
- View Staff dashboard summary.

Staff currently cannot:

- Navigate to task management from the sidebar.
- Navigate to notices from the sidebar.
- Use custom staff modules beyond dashboard in the inspected UI.

### 9.2 Staff Navigation

| Nav ID | Label | Meaning |
| --- | --- | --- |
| `dashboard` | Dashboard | Staff dashboard summary. |

### 9.3 Staff Quick Actions

Configured quick actions:

- Staff tasks.
- School notices.

Actual behavior:

- Quick actions are filtered by existing nav IDs.
- Staff nav only contains `dashboard`.
- Therefore the configured `tasks` and `notices` quick actions are not shown.

### 9.4 Staff Role Info Cards

Staff uses the fallback role info card set:

| Card | Meaning |
| --- | --- |
| Your role | Displays Staff role. |
| School | Active school or no current school. |
| Available tools | Shows ready state. |
| Assigned schools | Count of allowed schools. |

### 9.5 Staff Dashboard Metrics

Backend summary can include:

- Active school selected state.
- School notices.
- Report exports.

Endpoint:

```text
GET /v1/staff/dashboard/summary
```

### 9.6 Staff Workspace

When `dashboard` is active:

- Shared dashboard summary is shown.
- Role workspace uses `DashboardWorkspacePanel`.
- It calls `/v1/staff/dashboard/summary`.
- It shows production workspace helper content.

### 9.7 Staff API Map

| Function | Method | Endpoint |
| --- | --- | --- |
| Dashboard summary | GET | `/v1/staff/dashboard/summary` |

### 9.8 Staff Current Caveats

- Staff has only one sidebar nav item.
- Configured Staff quick actions do not render because their nav destinations do not exist.
- No dedicated Staff task or notices UI was found in the inspected frontend shell.

## 10. Parent Portal

### 10.1 Purpose

Parent portal provides linked-child access.

Parent can:

- View linked children.
- View child attendance.
- View child homework.
- View published results.
- View fees.
- View published notices.
- View timetable.
- Submit leave requests.

Parent cannot:

- See children unless School Admin created parent-child links.
- See unpublished exams/results.
- See homework/results/fees for unlinked children.
- Decide leave requests.

### 10.2 Parent Navigation

| Nav ID | Label | Meaning |
| --- | --- | --- |
| `dashboard` | Dashboard | Parent dashboard summary. |
| `children` | My Children | Linked child list. |
| `attendance` | Attendance | Selected child's attendance. |
| `homework` | Homework | Selected child's homework. |
| `results` | Results | Selected child's published results. |
| `fees` | Fees | Selected child's fee demands. |
| `notices` | Notices | Selected child's visible notices. |
| `timetable` | Timetable | Selected child's timetable. |
| `leave` | Leave Requests | Submit parent leave requests. |

### 10.3 Parent Quick Actions

| Action | Destination |
| --- | --- |
| Pay fees | `fees` |
| Apply leave | `leave` |
| View results | `results` |

### 10.4 Parent Role Info Cards

| Card | Value | Detail |
| --- | --- | --- |
| Your role | Parent | Linked-child access. |
| Children linked | Open children | View children. |
| Active child | Choose child | Select child in child-scoped tools. |
| School | Active school or no current school | School context. |

### 10.5 Parent Dashboard Metrics

Backend summary can include:

- Linked children
- Fee due
- Homework
- Results
- Leave requests

Endpoint:

```text
GET /v1/parent/dashboard/summary
```

### 10.6 Parent Dashboard Workspace

When `dashboard` is active:

- Shared dashboard summary is shown.
- Role workspace uses `DashboardWorkspacePanel`.
- It calls `/v1/parent/dashboard/summary`.

### 10.7 My Children

The Parent Child Portal Panel loads linked children:

```text
GET /v1/parent/children
```

UI behavior:

- `children` nav displays linked children directly.
- Child selector is hidden on `children` and `dashboard`.
- Child selector is shown for attendance, homework, results, fees, notices, and timetable.

Backend rules:

- User must have role `PARENT`.
- Only linked children are returned.
- Tenant and school consistency are enforced.

### 10.8 Child Attendance

Endpoint pattern:

```text
GET /v1/parent/children/{studentId}/attendance
```

Behavior:

- Parent selects a linked child.
- UI lists attendance records for that child.

Backend rules:

- Parent must be linked to the student.
- Attendance records come from School Admin or Teacher submitted sessions.

### 10.9 Child Homework

Endpoint pattern:

```text
GET /v1/parent/children/{studentId}/homework
```

Behavior:

- Parent sees homework visible to selected child's class and section.

Backend rules:

- Parent must be linked.
- Homework must be visible to the child's class/section.

### 10.10 Child Results

Endpoint pattern:

```text
GET /v1/parent/children/{studentId}/results
```

Behavior:

- Parent sees published results for selected child.

Backend rules:

- Unpublished results are not visible.
- Parent must be linked to the student.

### 10.11 Child Fees

Endpoint pattern:

```text
GET /v1/parent/children/{studentId}/fees
```

Behavior:

- Parent sees selected child's fee demands and statuses.

Backend behavior:

- Parent can list child fees.
- Backend also supports parent payment recording endpoint in fee service.

Current UI caveat:

- The Parent quick action says `Pay fees`.
- The inspected Parent UI lists fees but does not expose a complete payment form.

### 10.12 Child Notices

Endpoint pattern:

```text
GET /v1/parent/children/{studentId}/notices
```

Behavior:

- Parent sees published notices matching selected child scope and parent/all audience.

Backend rules:

- Notice must be published.
- Audience and class/section scope must match.

### 10.13 Child Timetable

Endpoint pattern:

```text
GET /v1/parent/children/{studentId}/timetable
```

Behavior:

- Parent sees selected child's class and section timetable.

Backend rules:

- Timetable entries must match child class and section scope.

### 10.14 Leave Requests

The Leave Requests nav renders `ParentLeaveRequestsPage`.

APIs:

```text
GET /v1/parent/leave-requests
POST /v1/parent/leave-requests
```

Fields:

| Field | Meaning |
| --- | --- |
| Student ID | Raw student ID. |
| Start date | Leave start date. |
| End date | Leave end date. |
| Reason | Required reason. |

Success:

- Latest request is shown after submission.

Error:

```text
Leave request could not be submitted.
```

Backend rules:

- User must have role `PARENT`.
- Parent must be linked to the student.
- End date cannot be before start date.
- Reason is required.
- New request starts pending.
- Audit event `PARENT_LEAVE_REQUESTED` is written.

### 10.15 Parent API Map

| Function | Method | Endpoint |
| --- | --- | --- |
| Dashboard summary | GET | `/v1/parent/dashboard/summary` |
| Children | GET | `/v1/parent/children` |
| Child attendance | GET | `/v1/parent/children/{studentId}/attendance` |
| Child homework | GET | `/v1/parent/children/{studentId}/homework` |
| Child results | GET | `/v1/parent/children/{studentId}/results` |
| Child fees | GET | `/v1/parent/children/{studentId}/fees` |
| Child notices | GET | `/v1/parent/children/{studentId}/notices` |
| Child timetable | GET | `/v1/parent/children/{studentId}/timetable` |
| Leave requests | GET | `/v1/parent/leave-requests` |
| Create leave request | POST | `/v1/parent/leave-requests` |

### 10.16 Parent Current Caveats

- Leave request form asks for raw student ID even though the child selector exists elsewhere.
- Fee payment is not exposed as a complete Parent UI form.
- Parent access depends entirely on School Admin-created links.
- Parent can only see published/scoped academic records.

## 11. Student Portal

### 11.1 Purpose

Student portal provides learner access to school-published academic and finance data.

Student can:

- View student dashboard summary.
- View homework.
- View published results.
- View fees.
- View notices.
- View attendance.
- View timetable.

Backend supports homework submission, but the inspected Student UI does not expose a full homework submission form.

### 11.2 Student Navigation

| Nav ID | Label | Meaning |
| --- | --- | --- |
| `dashboard` | Dashboard | Student dashboard summary and profile endpoint. |
| `homework` | Homework | Homework list. |
| `results` | Results | Published result list. |
| `fees` | Fees | Fee demand list. |
| `notices` | Notices | Published notice list. |
| `attendance` | Attendance | Attendance records. |
| `timetable` | Timetable | Class timetable. |

### 11.3 Student Quick Actions

| Action | Destination |
| --- | --- |
| Submit homework | `homework` |
| View results | `results` |

Current behavior:

- `Submit homework` navigates to the homework list.
- It does not open a submission form in the inspected UI.

### 11.4 Student Role Info Cards

| Card | Value | Detail |
| --- | --- | --- |
| Your role | Student | Learning workspace. |
| Class | Your class | Class context. |
| Attendance | View attendance | Attendance module. |
| School | Active school or no current school | School context. |

### 11.5 Student Dashboard Metrics

Backend summary can include:

- Profile
- Homework
- Results
- Fee due

Note:

- The backend summary code includes homework-style counts more than once in the inspected implementation.

Endpoint:

```text
GET /v1/student/dashboard/summary
```

### 11.6 Student Workspace Behavior

Student uses generic endpoint panels for nav content.

Endpoints:

| Nav ID | Endpoint |
| --- | --- |
| `dashboard` | `/v1/student/profile` |
| `homework` | `/v1/student/homework` |
| `results` | `/v1/student/results` |
| `fees` | `/v1/student/fees` |
| `notices` | `/v1/student/notices` |
| `attendance` | `/v1/student/attendance` |
| `timetable` | `/v1/student/timetable` |

UI behavior:

- Lists records using `EndpointListPanel`.
- Shows first 12 records.
- Uses generic title/detail heuristics.
- Shows loading, empty, and error states.

### 11.7 Student Profile

Endpoint:

```text
GET /v1/student/profile
```

Backend rules:

- User must have role `STUDENT`.
- User must be linked to a student profile.
- If active school exists, the linked profile must match the school context.

### 11.8 Student Homework

Endpoint:

```text
GET /v1/student/homework
```

Backend behavior:

- Returns homework visible to the student's class and section.

Backend submission support:

```text
POST /v1/student/homework/{homeworkId}/submissions
```

Current UI caveat:

- Student UI does not expose a submission form for this endpoint.
- The quick action only routes to homework list.

### 11.9 Student Results

Endpoint:

```text
GET /v1/student/results
```

Backend behavior:

- Student sees published exam results only.
- Unpublished marks are hidden.

### 11.10 Student Fees

Endpoint:

```text
GET /v1/student/fees
```

Backend behavior:

- Student sees own fee demands and payment status.
- Payment recording is handled by admin/finance and parent payment flows, not current Student UI.

### 11.11 Student Notices

Endpoint:

```text
GET /v1/student/notices
```

Backend behavior:

- Student sees published notices matching student/all audience and class/section scope.

### 11.12 Student Attendance

Endpoint:

```text
GET /v1/student/attendance
```

Backend behavior:

- Student sees own attendance records from submitted attendance sessions.

### 11.13 Student Timetable

Endpoint:

```text
GET /v1/student/timetable
```

Backend behavior:

- Student sees timetable entries matching student class and section.

### 11.14 Student API Map

| Function | Method | Endpoint |
| --- | --- | --- |
| Dashboard summary | GET | `/v1/student/dashboard/summary` |
| Profile | GET | `/v1/student/profile` |
| Homework | GET | `/v1/student/homework` |
| Submit homework | POST | `/v1/student/homework/{homeworkId}/submissions` |
| Results | GET | `/v1/student/results` |
| Fees | GET | `/v1/student/fees` |
| Notices | GET | `/v1/student/notices` |
| Attendance | GET | `/v1/student/attendance` |
| Timetable | GET | `/v1/student/timetable` |

### 11.15 Student Current Caveats

- Student UI is mostly list-oriented.
- Homework submission endpoint exists but is not wired to a form.
- Student dashboard workspace maps `dashboard` to profile data, while the shared dashboard summary also calls `/v1/student/dashboard/summary`.
- Generic list rendering may not show every field from student records.

## 12. Cross-Role Workflows

### 12.1 Tenant Setup to School Administration

Flow:

1. Tenant Admin creates branch school.
2. Tenant Admin invites School Admin for that school.
3. Backend grants School Admin school access.
4. School Admin accepts invitation and logs in.
5. School Admin selects active school.
6. School Admin configures academics and school operations.

Important rules:

- Tenant school limit applies before school creation.
- Primary school cannot be deactivated.
- Each school must keep at least one School Admin.

### 12.2 School Setup to Teacher Workspace

Flow:

1. School Admin creates academic year.
2. School Admin creates class.
3. School Admin creates section.
4. School Admin creates subject.
5. School Admin assigns subject to class.
6. School Admin provisions Teacher.
7. School Admin assigns Teacher to class-subject.
8. Teacher logs in.
9. Teacher sees assigned classes.
10. Teacher can view class-subject records and enter marks.

Important rules:

- Teacher portal depends on academic assignment data.
- Teacher cannot access unassigned class-subject records.

### 12.3 School Setup to Parent and Student Access

Flow:

1. School Admin imports or creates students.
2. School Admin links parent account to student.
3. School Admin optionally invites student login.
4. Parent logs in and sees linked children.
5. Student logs in and sees own profile.

Important rules:

- Parent access is link-based.
- Student access is profile-link-based.
- Published/scoped records control what parent and student can see.

### 12.4 Attendance Flow

Flow:

1. School Admin or Teacher creates attendance session.
2. Attendance records are saved for students.
3. Parent sees linked child's attendance.
4. Student sees own attendance.
5. Dashboard summaries can count attendance sessions.

Important rules:

- Duplicate sessions for same class, section, subject, and date are rejected.
- Student records must be in scope.

### 12.5 Homework Flow

Flow:

1. School Admin or Teacher creates homework.
2. Homework is visible to class/section students.
3. Parent sees child homework.
4. Student sees own homework.
5. Backend supports student homework submission.

Current UI note:

- Student submission is not currently exposed as a polished UI workflow.

### 12.6 Exam and Result Flow

Flow:

1. School Admin creates exam.
2. Teacher or School Admin records marks.
3. School Admin publishes results.
4. Parent sees published child results.
5. Student sees published own results.

Important rules:

- Marks must be numeric and within max marks.
- Unpublished results are hidden from Parent and Student.

### 12.7 Fee Flow

Flow:

1. School Admin or Finance Staff creates fee demand.
2. School Admin or Finance Staff records payment.
3. Receipt is issued.
4. Parent and Student can view fee status.
5. Finance reports summarize demand, collection, and outstanding amounts.

Important rules:

- Payment cannot exceed outstanding.
- Fully paid demand cannot receive more payments.
- Receipt number is generated by backend.

### 12.8 Leave Request Flow

Flow:

1. Parent submits leave request for linked child.
2. School Admin loads leave requests.
3. School Admin approves or rejects.
4. Request status updates.

Important rules:

- Parent must be linked to student.
- End date cannot be before start date.
- School Admin cannot decide an already decided request.

### 12.9 Report and Bulk Job Flow

Flow:

1. School Admin requests report export.
2. Backend creates report export record and bulk job.
3. Processing generates CSV content.
4. Completed export becomes downloadable.
5. Bulk job status can be viewed or cancelled if not terminal.

Important rules:

- Report export supports CSV in current UI.
- Completed exports only can be downloaded.
- Bulk job terminal states cannot be cancelled from UI.

## 13. Shared Auth and Account APIs

These APIs support all authenticated roles.

| Function | Method | Endpoint |
| --- | --- | --- |
| Current user | GET | `/v1/me` |
| Allowed schools | GET | `/v1/me/schools` |
| Activate school | POST | `/v1/me/schools/{schoolId}/activate` |
| Change password | POST | `/v1/me/change-password` |
| Logout | POST | `/v1/me/logout` |

Auth state behavior:

- Frontend hydrates current user and allowed schools.
- Logout clears local auth session.
- Active school activation refreshes user context and token where returned.

## 14. Current Global Gaps and Caveats

These apply across multiple roles:

- Global search is a command palette, not a backend search engine.
- Notification popover is static in the inspected shell.
- Floating AI button is presentational.
- Theme toggle is local and not persisted through backend settings.
- Workspace header `Import` and `Create` buttons are not wired to role actions.
- Many production workflows still require raw IDs.
- Generic list panels show selected fields only and may hide useful record details.
- Development-only resource forms mean some create/publish operations are not exposed in production UI.
- Staff role is currently dashboard-only.
- Teacher notices route appears incorrectly wired.
- Student homework submission exists in backend but not current UI.
- Parent fee payment is not exposed as a complete UI form.
- Finance Fee Lifecycle missing-token copy still says School Admin.

## 15. Manual Verification Checklist

Use this checklist to verify portals from the UI.

Tenant Admin:

- Login with Tenant Admin.
- Confirm dashboard metrics load.
- Create branch school.
- Load schools.
- Rename branch school.
- Invite School Admin.
- Load School Admins for school.
- Resend invite for invited admin.
- Confirm primary school cannot be deactivated.
- Confirm reports load.
- Confirm settings and usage load.
- Update organization settings.

School Admin:

- Login with School Admin.
- Activate assigned school.
- Confirm dashboard metrics load.
- Create academic year, class, and section.
- Create subject.
- Assign subject to class.
- Provision teacher.
- Assign teacher.
- Import or validate students.
- Invite student login.
- Link parent.
- Create fee demand.
- Record fee payment.
- Load report exports.
- Request report export.
- Check bulk jobs.
- Update school name.

Teacher:

- Login with Teacher.
- Confirm assignments appear in My Classes.
- Open attendance, homework, exams by assignment.
- Open Marks Entry.
- Select class, subject, exam.
- Enter valid marks.
- Confirm invalid marks are blocked.
- Confirm marks save and roster refreshes.
- Check timetable.

Finance Staff:

- Login with Finance Staff.
- Activate assigned school.
- Confirm dashboard metrics load.
- Load fee demands.
- Create fee demand.
- Record payment.
- Load receipts.
- Load finance reports.

Staff:

- Login with Staff.
- Confirm dashboard summary loads.
- Confirm sidebar only shows Dashboard.

Parent:

- Login with Parent.
- Confirm children list loads.
- Select child for attendance, homework, results, fees, notices, and timetable.
- Submit leave request with valid date range.
- Confirm invalid child access is blocked by backend.

Student:

- Login with Student.
- Confirm profile/dashboard context loads.
- Open homework, results, fees, notices, attendance, and timetable.
- Confirm only published/scoped records appear.

## 16. Role Capability Matrix

| Capability | Tenant Admin | School Admin | Teacher | Finance Staff | Staff | Parent | Student |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Organization settings | Yes | No | No | No | No | No | No |
| Create schools | Yes | No | No | No | No | No | No |
| Invite School Admin | Yes | No | No | No | No | No | No |
| Select active school | Limited context | Yes | Via context | Yes | Via context | Via context | Via context |
| Academic setup | No | Yes | No | No | No | No | No |
| Teacher assignment setup | No | Yes | No | No | No | No | No |
| Student import | No | Yes | No | No | No | No | No |
| Parent linking | No | Yes | No | No | No | No | No |
| Staff provisioning | No | Yes | No | No | No | No | No |
| Attendance admin | No | Yes | Assignment-scoped backend support | No | No | View child | View own |
| Homework admin | No | Yes | Assignment-scoped backend support | No | No | View child | View own |
| Marks entry | No | School Admin backend support | Yes in UI | No | No | View published | View published |
| Fee demand create | No | Yes | No | Yes | No | No | No |
| Fee payment record | No | Yes | No | Yes | No | Backend support for parent payment | No |
| Notices create/publish | No | Yes | No | No | No | View published | View published |
| Timetable create | No | Yes | No | No | No | View child | View own |
| Report exports | Tenant reports | School exports | No | Finance reports | Dashboard only | No | No |
| Leave requests | No | Decide | No | No | No | Create | No |

## 17. Most Important Implementation Notes

- Role dashboards are real API-backed summaries.
- School Admin has the broadest operational portal.
- Tenant Admin is tenant-level and does not replace School Admin.
- Teacher UI is assignment-driven.
- Finance Staff UI is fee-driven and school-scoped.
- Parent UI is child-link-driven.
- Student UI is profile-link-driven.
- Staff UI is currently minimal.
- Backend access checks are stronger than several UI affordances; many endpoints validate role, tenant, school, assignment, child link, or student profile before returning data.

