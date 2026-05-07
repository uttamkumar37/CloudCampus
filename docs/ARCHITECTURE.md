# Architecture

## 1. High-Level Topology

```text
React SPA (frontend)
  -> Inter font (Google Fonts), Tailwind CSS v4, cc-* design system
  -> Axios + TanStack Query
  -> HttpOnly auth cookie app_jwt + X-Tenant-Slug header
  -> Spring Boot REST API (/api/v1)

Spring Boot backend
  -> TenantRequestFilter (slug/subdomain to schema)
  -> JwtAuthenticationFilter
  -> FirstLoginEnforcementFilter (credential gate on first login)
  -> Controller -> Service -> Repository
  -> Hibernate schema-based multi-tenancy routing

PostgreSQL 16
  -> public schema: tenant registry + platform data + subscription plans
  -> tenant schemas: school domain data isolation (13+ tables per school)
```

## 2. Backend Architecture

Current backend is a modular monolith under `com.cloudcampus` with domain packages:

- `auth` — login, JWT, OTP credential update, first-login enforcement
- `tenant` — tenant CRUD, schema provisioning, status management
- `user` — user management, role assignment, auto-credential provisioning
- `student` — enrollment, soft delete, detail API
- `teacher` — teacher records, soft delete, detail API
- `academic` — classes, subjects, sections
- `attendance` — daily records, ownership checks
- `fees` — fee assignments, payment recording, auto-status transitions
- `exam` — scheduling, result entry, mark overflow guard
- `homework` — assignments per class/section
- `timetable` — weekly recurring schedule
- `parent` — parent-student links, my-children API
- `dashboard` — tenant summary, super admin summary
- `subscription` — plans, tenant subscriptions, SubscriptionGuardService
- `website` — website CMS: config, sections, content, media, admission leads
- `bulk` — bulk upload (Excel via Apache POI), guided bulk operations workflow
- `common` — API envelope, exception handling, audit
- `config` — security, OpenAPI, multi-tenant Hibernate wiring

Layering pattern:

- `controller` — transport and role guards
- `service` — business logic + tenant validation
- `repository` — persistence access
- `dto` — API contracts (Java records)
- `mapper` — DTO ↔ entity mapping

Cross-cutting packages:

- `common/api` — `ApiResponse<T>` and `PageResponse<T>` wrappers
- `common/exception` — global exception handling, `BusinessException`
- `common/audit` — JPA auditing with authenticated principal (`JwtAuditorAware`)
- `config` — Spring Security, OpenAPI, password encoder, tenant-aware Hibernate

## 3. Multi-Tenant Design

Strategy: **schema-per-tenant** (complete data isolation per school).

Tenant resolution order:

1. Request header `X-Tenant-Slug`
2. Legacy fallback header `X-Tenant-ID` (temporary compatibility)
3. Subdomain extraction when `APP_TENANT_SUBDOMAIN_ENABLED=true`
4. Default schema `public`

Tenant isolation flow:

- `TenantRequestFilter` resolves tenant slug → schema via tenant registry
- `TenantContext` stores schema in `ThreadLocal` for current request
- Hibernate multi-tenant resolver and connection provider switch schema
- `TenantContext` is always cleared after request completion

Tables provisioned automatically on `POST /tenants`:

```
users, students, teachers, classes, subjects, sections,
attendance_records, fee_assignments, fee_payments,
exams, exam_results, homework_assignments, timetable_slots,
parent_students, tenant_website_config, website_sections,
website_content, website_media, admission_leads
```

## 4. Authentication and Authorization

Auth model:

- Stateless JWT access token in `HttpOnly` cookie `app_jwt`
- JWT claims: `role`, `roles` (Spring Security authorities), `tenant`, `tenant_schema`, `user_id`
- Role guards via `@PreAuthorize` and `SecurityConfig` route rules
- `FirstLoginEnforcementFilter` — users with `firstLoginRequired=true` may only access `/auth/credentials/*` until they update credentials

Login flow (frontend):

1. User types school name → live search dropdown shows matching schools
2. User picks school from dropdown (resolves `tenantSlug`)
3. User selects role from `<select>` dropdown
4. User enters username + password
5. Backend authenticates, issues JWT cookie
6. Frontend stores non-sensitive metadata (`role`, `username`, `schoolName`)
7. Redirect to role-appropriate dashboard

OTP credential update flow:

1. `POST /auth/credentials/send-otp` — OTP generated and stored
2. `POST /auth/credentials/update` — OTP validated, new credentials set, `firstLoginRequired` cleared

## 5. Frontend Architecture

### Project structure

```
src/
  app/           — providers, routing, query keys
  api/           — Axios client, endpoint constants
  components/
    ui/           — Button, Card, DataTable, FormInput, FormSelect,
                    Input, Modal, PageHeader, Skeleton, SearchableSelect, ...
    layout/       — DashboardLayout, SuperAdminLayout, DashboardPage
  features/      — domain-driven modules
    auth/         — login pages, hooks, guards
    academic/     — classes, subjects, sections
    attendance/   — mark attendance, report view
    bulk-upload/  — guided bulk operations workflow
    dashboard/    — KPI cards, charts, teacher/student dashboards
    fees/         — fee assignment + payment
    homework/     — homework list and form
    marks/        — exams and results
    parent/       — my children, parent links admin
    profile/      — profile page (all roles)
    student/      — student directory
    super-admin/  — tenant management, subscriptions, users
    teacher/      — teacher directory
    timetable/    — weekly schedule
    website-builder/ — school website CMS (School Admin)
    public-website/  — public school website rendering
  utils/         — toast, storage, sanitize
  types/         — shared TypeScript interfaces
```

### Data and auth flow

- TanStack Query v5 — server state, cache, invalidation
- Axios interceptor — injects `X-Tenant-Slug` on every request
- 401 interceptor — clears session, redirects to role-appropriate login

### UX conventions

- No tenant UUID input in login — school selected by name search
- Role selected via `<select>` dropdown (not a multi-step flow)
- All login fields visible on one compact form

## 6. Frontend Design System

### Typography

- **Font:** Inter (Google Fonts) — weights 300/400/500/600/700/800
- Loaded via `<link>` in `index.html`; fallback: `'Segoe UI', sans-serif`

### CSS Utilities (`index.css`)

| Class | Purpose |
|-------|---------|
| `.cc-input` | Base styled input / select — border, focus ring, rounded-xl |
| `.cc-dropdown` | Floating dropdown panel — border, shadow, fade-up animation |
| `.cc-badge` | Inline status chip |
| `.cc-badge-green/red/amber/blue/slate` | Color variants for status badges |
| `.cc-nav-link` | Sidebar navigation item — hover, active (white pill + emerald icon) |
| `.cc-nav-icon` | 18×18px SVG icon inside nav link |
| `.cc-skeleton-shimmer` | Loading placeholder with shimmer animation |
| `.field-label` | Uppercase xs form field label — used across all builder/form UIs |
| `.cc-fade-up` | Entrance animation: fade + translate-Y |
| `.cc-fade-in` | Entrance animation: fade only |
| `.cc-slide-right` | Entrance animation: slide from left |
| `.cc-orb` / `.cc-orb-slow` | Background blob float animation (login hero) |
| `.cc-pulse-ring` | Expanding ring animation (super-admin login icon) |
| `.cc-delay-1…5` | Animation delay helpers (80ms…340ms) |

### Navigation Icons

Every sidebar nav item in `DashboardLayout` and `SuperAdminLayout` has a unique inline SVG icon:

| Route | Icon |
|-------|------|
| `/dashboard` | Home (house) |
| `/student/learning`, `/parent/learning` | Open book / Heart |
| `/students` | User group |
| `/teachers` | Academic cap |
| `/academic` | Building (school) |
| `/bulk-upload` | Arrow upload |
| `/homework` | Clipboard list |
| `/timetable` | Calendar |
| `/attendance` | Check circle |
| `/fees` | Credit card |
| `/marks` | Bar chart |
| `/parent-links` | Link chain |
| `/website-builder` | Globe |
| `/my-children` | Heart |
| `/profile` | User circle |

Active state: white pill background with icon in emerald (`#059669`).

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Emerald-600 | `#059669` | Primary CTA, active nav, focus rings |
| Emerald-900 | `#064e3b` | Login left panel, sidebar background (school-colored) |
| Slate-950 | `#020617` | Super Admin sidebar, dark surfaces |
| Slate-50 | `#f8fafc` | Main content background |
| White | `#ffffff` | Card surfaces |

## 7. API Contract Standard

All APIs follow:

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

Paginated responses use `PageResponse<T>`:

```json
{
  "success": true,
  "data": {
    "content": [...],
    "page": 0,
    "size": 20,
    "totalElements": 120,
    "totalPages": 6,
    "last": false
  }
}
```

Error responses use `success: false` with consistent HTTP status codes and a `message` field.

## 8. Docker and Runtime

Compose services:

- `postgres` — PostgreSQL 16
- `backend` — Spring Boot JAR
- `frontend` — Nginx serving Vite build

Operational recommendations:

- `docker compose down -v && docker compose up --build` for a clean-state validation
- Keep dev/prod environment variables in separate `.env` files
- Rotate `JWT_SECRET` and `BOOTSTRAP_ADMIN_PASSWORD` per environment
- Keep Flyway enabled for deterministic schema changes

## 9. Flyway Migration History

| Version | Description |
|---------|-------------|
| V1 | Initial public schema — platform users, tenant registry |
| V2 | Tenant domain tables (13 tables) — students, teachers, academic, etc. |
| V3 | Subscription plans, tenant subscriptions, platform payments |
| V4 | Razorpay payment gateway integration columns |
| V5–V9 | Website CMS tables — website config, sections, content, media, admission leads |
| V10 | `website_config` extension — 11 new columns: `logo_url`, `school_established_year`, `affiliation_board`, `medium_of_instruction`, `school_type`, `student_count`, `teacher_count`, `hero_cta_text`, `hero_cta_link`, `achievement_badge`, `notices_text` |

## 10. Target Refactor Direction

Recommended package convergence over time:

- `modules/` — domain modules (auth, tenant, student, ...)
- `common/` — API envelope, exceptions, shared abstractions
- `infra/` — persistence, messaging, external integrations
- `config/` — security and framework wiring

This can be applied incrementally module-by-module without a big-bang rewrite.
