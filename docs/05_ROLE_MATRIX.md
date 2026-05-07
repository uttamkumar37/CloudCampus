# CloudCampus — Role Matrix


> Version: 1.1 | Last Updated: 2026-05-07

---

## Roles

| Role | Scope | Description |
|---|---|---|
| `SUPER_ADMIN` | Platform (public schema) | Platform owner. Manages tenants, plans, payments, and global users. Not bound to any school. |
| `SCHOOL_ADMIN` | Tenant schema | School administrator. Manages all data and settings within their school, including the public website. |
| `TEACHER` | Tenant schema | Manages own classes, homework, timetable, marks, and attendance within their assigned school. |
| `STUDENT` | Tenant schema | Read-only access to own academic data (marks, timetable, homework, fees, attendance). |
| `PARENT` | Tenant schema | Read-only access to linked children's data. |

---

## Permission Matrix

| Feature / Endpoint | SUPER_ADMIN | SCHOOL_ADMIN | TEACHER | STUDENT | PARENT |
|---|---|---|---|---|---|
| **Tenant Management** | ✅ Full CRUD + status | ❌ | ❌ | ❌ | ❌ |
| **Subscription Plans** | ✅ Create / View | ✅ View only | ✅ View only | ❌ | ❌ |
| **Assign Plan to Tenant** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Record SaaS Payment** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **User Management** | ✅ Create users for any tenant | ✅ Create TEACHER / STUDENT / PARENT | ❌ | ❌ | ❌ |
| **Students — Create / Delete** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Students — Read** | ✅ | ✅ | ✅ View | ❌ | ❌ |
| **Teachers — Create / Delete** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Teachers — Read** | ✅ | ✅ | ✅ View | ❌ | ❌ |
| **Academic Classes / Subjects / Sections** | ❌ | ✅ Full CRUD | ✅ View | ❌ | ❌ |
| **Attendance — Mark** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Attendance — Read** | ❌ | ✅ | ✅ | ✅ Own | ✅ Children |
| **Fees — Assign / Record Payment** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Fees — Read Assignments** | ❌ | ✅ | ❌ | ✅ Own | ✅ Children |
| **Exams — Create / Enter Results** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Exams — Read / View Results** | ❌ | ✅ | ✅ | ✅ Own | ✅ Children |
| **Homework — Create** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Homework — Read** | ❌ | ✅ | ✅ | ✅ View | ✅ Children |
| **Timetable — Create / Update** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Timetable — Read** | ❌ | ✅ | ✅ | ✅ View | ✅ View |
| **Parent Links — Manage** | ❌ | ✅ (link/unlink) | ❌ | ❌ | ❌ |
| **Parent Portal — My Children** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Bulk Upload / Operations** | ❌ | ✅ (PRO+ plan) | ❌ | ❌ | ❌ |
| **Dashboard** | ✅ Super Admin summary | ✅ Tenant summary | ✅ Teacher view | ✅ Student view | ✅ Parent view |
| **Website Builder (admin)** | ❌ | ✅ Own school website | ❌ | ❌ | ❌ |
| **Public School Website** | ✅ View | ✅ View | ✅ View | ✅ View | ✅ View |
| **Admission Leads — View / Update** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **OTP Credential Update** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Spring Security Role Enforcement

Roles map to Spring Security authorities as `ROLE_<ROLE_NAME>`:

```java
// Super Admin only
@PreAuthorize("hasRole('SUPER_ADMIN')")

// School Admin or above
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")

// School Admin or Teacher
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'TEACHER')")

// Any authenticated tenant user
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')")

// Ownership-aware (owns the resource OR is admin)
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN') or @ownershipChecker.owns(#id, authentication)")
```

---

## Token Claims

JWT access tokens include:

```json
{
  "sub": "username",
  "role": "SCHOOL_ADMIN",
  "roles": ["ROLE_SCHOOL_ADMIN"],
  "tenant": "greenwood",
  "tenant_schema": "greenwood",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

- `role` (singular) — primary role string without `ROLE_` prefix; used by the frontend for routing and UI gating.
- `roles` (array) — Spring Security authority strings (`ROLE_*`); used internally for `@PreAuthorize`.
- `tenant` / `tenant_schema` — set as `X-Tenant-Slug` header in every frontend API request.
- `SUPER_ADMIN` has no `tenantId` — requests routed to `public` schema.

---

## Frontend Route Guards

```tsx
// Super Admin only
<PrivateRoute allowedRoles={['SUPER_ADMIN']}>
  <SubscriptionPlansPage />
</PrivateRoute>

// School Admin + Teacher
<PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
  <StudentsPage />
</PrivateRoute>

// School Admin only
<PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
  <WebsiteBuilderPage />
  <BulkUploadPage />
  <ParentLinksAdminPage />
</PrivateRoute>

// All authenticated users
<PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
  <ProfilePage />
</PrivateRoute>
```

Unauthenticated users are redirected to the appropriate login page (`/login` for school roles, `/super-admin/login` for SUPER_ADMIN).

---

## Frontend Sidebar Navigation by Role

| Nav Item | SCHOOL_ADMIN | TEACHER | STUDENT | PARENT |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| My Learning | ❌ | ❌ | ✅ | ❌ |
| Family Learning | ❌ | ❌ | ❌ | ✅ |
| Students | ✅ | ✅ | ❌ | ❌ |
| Teachers | ✅ | ✅ | ❌ | ❌ |
| Academic | ✅ | ✅ | ❌ | ❌ |
| Bulk Operations | ✅ | ❌ | ❌ | ❌ |
| Homework | ✅ | ✅ | ❌ | ❌ |
| Timetable | ✅ | ✅ | ❌ | ❌ |
| Attendance | ✅ | ✅ | ❌ | ❌ |
| Fees | ✅ | ✅ | ✅ | ✅ |
| Marks | ✅ | ✅ | ❌ | ❌ |
| Parent Links | ✅ | ❌ | ❌ | ❌ |
| Website Builder | ✅ | ❌ | ❌ | ❌ |
| My Children | ❌ | ❌ | ❌ | ✅ |
| Profile | ✅ | ✅ | ✅ | ✅ |
