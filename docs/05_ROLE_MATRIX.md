# CloudCampus — Role Matrix


> Version: 1.0 | Last Updated: 2026-04-28

---

## Roles

| Role | Scope | Description |
|---|---|---|
| `SUPER_ADMIN` | Platform (public schema) | Platform owner. Manages tenants, plans, payments, and global users. |
| `SCHOOL_ADMIN` | Tenant schema | School administrator. Manages all data within their tenant. |
| `TEACHER` | Tenant schema | Can manage own classes, homework, timetable, marks, attendance. |
| `STUDENT` | Tenant schema | Read-only access to own data (marks, timetable, homework). |
| `PARENT` | Tenant schema | Read-only access to own children's data. |

## Permission Matrix

| Feature / Endpoint | SUPER_ADMIN | SCHOOL_ADMIN | TEACHER | STUDENT | PARENT |
|---|---|---|---|---|---|
| **Tenant Management** | ✅ Full CRUD | ❌ | ❌ | ❌ | ❌ |
| **Subscription Plans** | ✅ Create / View | ✅ View only | ✅ View only | ❌ | ❌ |
| **Assign Plan to Tenant** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Record Payment** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **User Management** | ✅ Create users for any tenant | ✅ Create TEACHER / STUDENT / PARENT | ❌ | ❌ | ❌ |
| **Students — Create** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Students — Read** | ✅ | ✅ | ✅ View | ❌ | ❌ |
| **Teachers** | ❌ | ✅ Full CRUD | ✅ View | ❌ | ❌ |
| **Academic Classes / Subjects** | ❌ | ✅ Full CRUD | ✅ View | ❌ | ❌ |
| **Attendance — Mark** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Attendance — Read** | ❌ | ✅ | ✅ | ✅ Own | ✅ Children |
| **Fees — Assign / Record Payment** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Fees — Read Assignments** | ❌ | ✅ | ❌ | ✅ Own | ✅ Children |
| **Exams — Create / Enter Results** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Exams — Read / View Results** | ❌ | ✅ | ✅ | ✅ Own | ✅ Children |
| **Homework — Create** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Homework — Read** | ❌ | ✅ | ✅ | ✅ View | ✅ Children |
| **Timetable — Create** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Timetable — Read** | ❌ | ✅ | ✅ | ✅ View | ✅ View |
| **Parent Portal (my children)** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Bulk Upload** | ❌ | ✅ (PRO+ plan required) | ❌ | ❌ | ❌ |
| **Dashboard** | ✅ Super Admin summary | ✅ Tenant summary | ✅ Tenant summary | ✅ Own view | ✅ Own view |

## Spring Security Role Enforcement

Roles map to Spring Security authorities as `ROLE_<ROLE_NAME>`:

```java
// Super Admin only
@PreAuthorize("hasRole('SUPER_ADMIN')")

// School Admin or above (within tenant)
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")

// Authenticated users with any tenant role
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')")
```

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

- `role` (singular) is the primary role string without the `ROLE_` prefix — used by the frontend for routing and UI gating.
- `roles` (array) contains Spring Security authority strings (`ROLE_*`) — used internally.
- `tenant` / `tenant_schema` is set as `X-Tenant-Slug` header in every frontend API request.
- Backend `TenantFilter` reads this header and sets `TenantContext` for schema routing.
- `SUPER_ADMIN` does not have a `tenantId` — requests routed to `public` schema.

## Frontend Route Guards

```tsx
<PrivateRoute allowedRoles={['SUPER_ADMIN']}>
  <SubscriptionPlansPage />
</PrivateRoute>

<PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
  <StudentsPage />
</PrivateRoute>
```

Unauthenticated users are redirected to the appropriate login page.
