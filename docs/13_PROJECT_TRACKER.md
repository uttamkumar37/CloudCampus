# CloudCampus — Project Tracker


> Last Updated: 2026-05-08 | Reflects actual codebase state

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Completed | 62 |
| ⚠️ In Progress | 0 |
| ❌ Pending | 0 |

---

## Changelog

### 2026-05-08 (Session 3)

- Branch: `feature/school-admin-profile-update`
- Task 62 — Role-wise login portal on public school website + login page deep-link support.
- **`SchoolWebsitePage`** — Added **School Portal section** above the footer: 4 role cards (School Admin · Teacher · Student · Parent), each with a colour-coded border, role icon, description, and "Sign in →" link. Added **"Login Portal"** pill button in the sticky navbar linking to `#portal`.
- **`LoginPage`** — Now reads `?school=<slug>` and `?role=<role>` query params via `useSearchParams`. `?school=` auto-fetches and locks the school (same flow as subdomain detection). `?role=` pre-selects the role dropdown. Links from the public website pre-fill both fields so users only need to enter username and password.
- All portal card links follow the pattern `/login?school=<tenantSlug>&role=<ROLE>`.

### 2026-05-08 (Session 2)

- Branch: `feature/school-admin-profile-update`
- Task 61 — Extended WebsiteConfig fields, AdmissionLeads stats fix, and professional SchoolWebsitePage overhaul.
- **Backend — V10 migration** (`V10__extend_website_config.sql`): 11 new columns on `public.website_config` — `logo_url`, `school_established_year`, `affiliation_board`, `medium_of_instruction`, `school_type`, `student_count`, `teacher_count`, `hero_cta_text`, `hero_cta_link`, `achievement_badge`, `notices_text`. All idempotent (`ADD COLUMN IF NOT EXISTS`).
- **Backend — Entity / DTOs / Service**: Updated `WebsiteConfig.java` (11 new `@Column` fields), `WebsiteConfigRequest.java`, `WebsiteConfigResponse.java`, and `WebsiteCmsServiceImpl.java` (`upsertConfig` + `toConfigResponse` mappers) to carry all 11 fields.
- **Frontend — `WebsiteConfigEditor` accordion overhaul** (8 collapsible sections replacing a flat form):
  - *Identity & Branding* — logo URL + live preview, 10 theme colour swatches (added Orange + Crimson), affiliation board dropdown (`CBSE`, `ICSE/ISC`, `IB`, `IGCSE`, `State Board`, `NIOS`, `Other`), medium of instruction dropdown, school type dropdown (Co-ed / Boys / Girls), established year dropdown (back to 1800).
  - *Hero Banner* — hero image URL + live preview, custom CTA text + link, achievement badge text.
  - *School Stats* — student count, teacher count; live stat chips preview (coloured).
  - *Contact & Location*, *About*, *Notice Board*, *Admissions*, *Social Media* — fully structured.
- **Frontend — `AdmissionLeadsPanel` stats bug fix**: changed to always fetch all leads (no `status` query param), filter client-side in component; stat counts (NEW / CONTACTED / CONVERTED / REJECTED) are now always accurate regardless of which filter is active.
- **Frontend — `SchoolWebsitePage` professional overhaul** (public tenant website):
  - **Sticky nav** — school logo (config `logoUrl` or tenant `logoUrl`), school name, affiliation board sub-label, nav links, "Admissions Open" pill button.
  - **Hero** — achievement badge chip (gold star icon), school tagline, established year, custom CTA button (text + link from config) with arrow icon; falls back to "Apply for Admissions" when `admissionsOpen` is true.
  - **Stats bar** — dark (`bg-slate-900`) strip showing student count, teacher count, years of excellence (derived), affiliation board, medium; only renders populated fields.
  - **About section** — vision/mission as cards with themed icon + school type badge.
  - **Notices board** — amber-toned section; each newline in `noticesText` becomes its own white card with a dot marker.
  - **Gallery** — hover overlay with caption slide-up animation.
  - **Admissions form** — class dropdown (Nursery → Class 12 streams); larger success state with checkmark icon.
  - **Contact section** — icon rows (address/phone/email) + social link buttons with SVG icons.
  - **Footer** — school address line + "Powered by CloudCampus" attribution.

### 2026-05-08 (Session 1)

- Branch: `feature/school-admin-profile-update`
- Task 60 — Professional Website Builder overhaul (frontend).
- Redesigned `WebsiteBuilderPage` — replaced flat tab bar with **visual tab cards** (icon + label + description per tab); active tab turns solid emerald. Added **"Preview Website"** button in header that opens `/school/:slug` in a new tab using the stored tenant slug.
- Overhauled `WebsiteConfigEditor`:
  - **Theme colour** — 8 preset colour swatches (Emerald, Sky, Violet, Rose, Amber, Slate, Teal, Indigo) + inline custom colour picker; live hex chip preview.
  - **Hero image** — URL input with toggle preview button; renders a live banner mock with tagline overlay before saving.
  - **Country dropdown** — select from common countries (India, US, UK, etc.).
  - **State dropdown** — switches to 32 Indian states/UTs list when country is India; plain text input for other countries.
  - **Admissions toggle** — animated slide switch replacing checkbox; admission info textarea shown only when toggled on.
  - **Social links** — labelled with per-platform color dot (Facebook blue, Instagram pink, YouTube red, X black).
  - Added `field-label` CSS utility to `index.css` for consistent label styling.
- Overhauled `SectionsEditor`:
  - Sections rendered as visual cards with icon, visible/hidden badge, and section title preview.
  - **Inline animated toggle switch** per section for show/hide without opening modal.
  - Edit modal: **display order select dropdown** (Position 1–7) instead of raw number input; toggle switch inside modal.
  - Confirm dialog before removing a section.
- Overhauled `GalleryEditor`:
  - **Live image preview card** — renders the URL before adding with error state for broken links.
  - **Sample images panel** — 6 pre-loaded Unsplash images (Classroom, Library, Sports, Lab, Auditorium, Garden) for quick insert.
  - Hover overlay with **Remove** button + confirm dialog per photo.
  - Photo count chip in section header.
- Overhauled `AdmissionLeadsPanel`:
  - **4 stat cards** at top showing count by status (NEW / CONTACTED / CONVERTED / REJECTED); click to filter.
  - **Dropdown filter** (`<select>`) for status instead of pill buttons.
  - **Expandable lead cards** — click to reveal full contact details and status change actions.
  - Color-coded next-status action buttons per lead state.

### 2026-05-07

- Branch: `feature/school-admin-profile-update`
- Task 59 — Industry-level UI redesign across the entire frontend.
- Replaced Manrope font with **Inter** (Google Fonts) globally.
- Completely redesigned `LoginPage` — collapsed 3-step flow into a single compact form: school search dropdown, role `<select>`, username, and password all visible at once. Password show/hide toggle added.
- Redesigned `SuperAdminLoginPage` — dark glassmorphism card with animated pulsing ring and gradient submit button.
- Overhauled `DashboardLayout` — sidebar now shows an **SVG icon per nav item** (home, book, users, calendar, credit card, etc.), active state highlights in white pill with emerald icon, mobile hamburger drawer added.
- Overhauled `SuperAdminLayout` — matching dark-sidebar with icons, mobile drawer.
- Redesigned `SuperAdminDashboardPage` — KPI cards with colored emoji icons and `cc-badge` chips in tenant table.
- Redesigned `ProfilePage` — colored avatar with initials (deterministic per name), role badge with per-role color, details in a slate-50 grid.
- Improved `DataTable` — zebra-striped rows, rounded-2xl wrapper, no external Card dependency.
- Improved `PageHeader` — optional `action` slot and colored `badge` prop.
- Improved `Card` — three variants: `default`, `flat`, `bordered`.
- Improved `Button` — new `emerald` variant, `loading` spinner prop, `icon` slot.
- Improved `FormSelect` + `FormInput` + `Input` — `cc-input` base class, required asterisk, helper text, styled chevron arrow.
- Added `index.css` design system: `cc-input`, `cc-dropdown`, `cc-badge-*`, `cc-nav-link`, `cc-nav-icon`, `cc-orb`, `cc-pulse-ring`, `cc-skeleton-shimmer`, fade/slide/appear animations.
- Build: 243 modules, clean TypeScript compile, no new warnings.

### 2026-05-06 (Website Builder)

- Commit: `0576d29`
  Message: add Website CMS + Builder module with public school website
- Added Website CMS + Builder full-stack feature: `WebsiteBuilderPage` with tabs (General Info, Page Sections, Gallery, Admission Leads).
- Added `WebsiteConfigEditor`, `SectionsEditor`, `GalleryEditor`, `AdmissionLeadsPanel` components.
- Added public `SchoolWebsitePage` for tenant websites.
- Added `websiteApi.ts` and `useWebsite.ts` hook.
- Added public API routes: `GET /public/website`, `POST /public/website/admission-leads`.
- Full SQL schema: `tenant_website_config`, `website_sections`, `website_content`, `website_media`, `admission_leads`.

### 2026-05-06 (Bulk Operations + Tenant Admin)

- Commit: `3a62b61`
  Message: add bulk operations workflow and tenant admin provisioning
- Added guided bulk operations backend APIs: operations metadata, validate, preview, execute, jobs, retry, error report.
- Added richer School Admin tenant provisioning contract and frontend form fields.
- Added tenant activate/deactivate API and super-admin UI controls.
- Added student/teacher details APIs for dashboard-linked rich data views.
- Updated seeding script to pass required school-admin fields for tenant creation.

### 2026-05-05

- Commit: `6f7ef6c`  
  Message: Add dashboard and learning page updates across backend and frontend
- Added dedicated learning pages for parent and student workflows.
- Updated dashboard routes/layout and role-focused pages (student, parent, teacher).
- Updated backend auth/filter and exam/homework/timetable controllers to support the new UI flow.
- Updated dashboard seeding script to align demo/dev data with the latest dashboard behavior.

---

## ✅ Completed Features

### Infrastructure & Foundation

| # | Task | Module | Notes |
|---|------|--------|-------|
| 1 | Spring Boot 3.4.4 project setup | Infrastructure | Java 17, Maven, clean package structure |
| 2 | PostgreSQL multi-tenant schema-per-tenant design | Database | Flyway migrations V1, V2 |
| 3 | JWT authentication (HS256, 1-hour TTL) | Auth | JJWT 0.12.6, stateless |
| 4 | Spring Security configuration | Security | BCrypt, custom entry point and access denied handler |
| 5 | Multi-tenancy infrastructure | Tenant | `TenantContext`, `TenantRequestFilter`, Hibernate schema routing |
| 6 | Uniform `ApiResponse<T>` + `PageResponse<T>` | Common | All endpoints use this envelope |
| 7 | `GlobalExceptionHandler` | Common | Handles validation, business, and runtime errors |
| 8 | Swagger/OpenAPI 3.0 documentation | Config | `/swagger-ui.html`, `/v3/api-docs` |
| 9 | Docker + Docker Compose setup | Infrastructure | postgres:16, backend, frontend services |
| 10 | Build and dev scripts | Scripts | `build.sh`, `start-dev.sh` |

### Backend Domain Modules

| # | Task | Module | Key Features |
|---|------|--------|--------------|
| 11 | Tenant CRUD + schema provisioning | Tenant | `POST /tenants`, auto-creates 13 tables |
| 12 | User management | User | Create + list users, BCrypt hashing, role enum |
| 13 | Student enrollment | Student | UPPERCASE admission no, uniqueness, pagination |
| 14 | Teacher management | Teacher | UPPERCASE employee no, unique email, pagination |
| 15 | Academic structure (classes, subjects, sections) | Academic | Unique codes, FK relationships |
| 16 | Attendance tracking | Attendance | UNIQUE(student, date), status enum, future-date guard |
| 17 | Fee management | Fees | Assignment + payment, auto status transitions (PENDING→PARTIALLY_PAID→PAID) |
| 18 | Exam scheduling + results | Exam | Duplicate guard, marks overflow guard, one result per student per exam |
| 19 | Homework assignments | Homework | Per class/section, with due date |
| 20 | Timetable slots | Timetable | dayOfWeek (1–7), time validation |
| 21 | Parent portal (linked children) | Parent | `parent_students` table, `GET /me/children` |
| 22 | Dashboard (tenant summary + super admin summary) | Dashboard | KPI cards, branding |
| 23 | Bulk upload (Excel via Apache POI) | Bulk | Students, Teachers, Classes, Sections sheets |
| 24 | Unit tests (User, Exam, Fees services) | Testing | JUnit 5 + Mockito, 30 tests |
| 41 | Ownership-aware authorization | Backend/Security | `OwnershipChecker` bean; role+ownership `@PreAuthorize` on Fees, Attendance, Exam results |
| 42 | Audit logging | Backend | `Auditable` MappedSuperclass, `JwtAuditorAware`, `@EnableJpaAuditing`; 10 entities updated |
| 43 | Soft delete | Backend | `deleted_at` on User/Student/Teacher; soft-delete-aware repos; `DELETE /students/{id}`, `DELETE /teachers/{id}` |
| 44 | Integration tests (Testcontainers) | Testing | Failsafe plugin; `IntegrationTestBase`; 17 IT tests across tenant provisioning, student CRUD, fee payment status |
| 48 | Payment gateway integration (Razorpay) | Backend+Frontend | Flyway V4; `PaymentGatewayService`; `RazorpayPaymentGatewayServiceImpl`; `POST /subscribe/initiate`; `POST /payments/webhook` (HMAC-SHA256) |
| 49 | First-login credential enforcement | Backend/Security | `FirstLoginEnforcementFilter`; blocks non-credential endpoints until secure update is completed |
| 50 | OTP-based credential update flow | Backend/Auth | `POST /auth/credentials/send-otp`; `POST /auth/credentials/update`; OTP storage + validation + retry limits |
| 51 | Auto credential provisioning | Backend/User | Optional username/password on user create; generated credentials + notification dispatch |
| 54 | Guided Bulk Operations Workflow | Backend+Frontend | validate/preview/execute/jobs/retry/error-report flow with operation metadata support |
| 55 | Tenant School Admin Provisioning | Backend+Frontend | `POST /tenants` now provisions SCHOOL_ADMIN user in one request; super-admin create-tenant UI updated |
| 56 | Tenant Status Management | Backend+Frontend | `PATCH /tenants/{tenantId}/status` + super-admin activate/deactivate UX with confirmation |
| 57 | Student & Teacher Detail APIs | Backend | `/students/{id}/details` and `/teachers/{id}/details` for richer dashboard-linked data |
| 58 | Website CMS + Builder Module | Backend+Frontend | Full dynamic website: config, sections, gallery, admission leads; public `GET /public/website` |

### Frontend

| # | Task | Module | Notes |
|---|------|--------|-------|
| 25 | React 19 + TypeScript + Vite + Tailwind CSS v4 setup | Frontend | Clean project structure |
| 26 | Auth module (login, JWT, route guards) | Auth | `useAuth` hook, `PrivateRoute`, `PublicRoute` |
| 27 | Dashboard page with KPI cards | Dashboard | `useTenantDashboardSummary` hook |
| 28 | Student module (list, create, pagination) | Student | Full CRUD UI with DataTable and form |
| 29 | Super Admin module (tenant list + create, user list) | Super Admin | Separate layout + routes |
| 30 | Subscription plans backend | Subscription | Flyway V3, 4 enums, 3 entities, 7 endpoints |
| 31 | Tenant subscription & payment backend | Subscription | Subscribe/cancel/record, SubscriptionGuardService (fail-open) |
| 32 | Subscription UI (Super Admin) | Frontend/Subscription | SubscriptionPlansPage, TenantSubscriptionPage, subscriptionApi, hooks |
| 33 | Role-based dashboards (Teacher, Student, Parent) | Frontend/Dashboard | Distinct views per role using existing summary data |
| 34 | Attendance UI | Frontend/Attendance | Date picker, class/section selector, bulk mark, report view |
| 35 | Fees UI | Frontend/Fees | Assignment form, payment form, status badge, payment history |
| 36 | Marks / Exams UI | Frontend/Marks | Exam form, results entry, results table per exam |
| 37 | Homework UI | Frontend/Homework | Homework list, create form, due-date highlighting |
| 38 | Timetable UI | Frontend/Timetable | Weekly grid view, slot create form, class/section filter |
| 39 | Parent Portal UI | Frontend/Parent | My children list, per-child fee/attendance/results view |
| 40 | Profile pages (all roles) | Frontend/Profile | View own profile for every role |
| 45 | Frontend UX hardening | Frontend (all) | `ConfirmDialog` component; delete student/teacher with confirm; 401 auto-redirect |
| 46 | Bulk upload UI | Frontend/Bulk | File picker (.xlsx filter), drag-and-drop, upload progress bar, result card, instructions modal |
| 47 | Documentation update | Docs/Postman | 07_API_REFERENCE.md (8 new sections); 08_API.md (v1.1); Postman (16 folders, 49 endpoints) |
| 52 | Parent links administration UI/API | Backend+Frontend | `GET /parents/links`; admin page for list/link/unlink parent-student pairs |
| 53 | Frontend test harness upgrades | Frontend/Testing | Vitest + Testing Library + jsdom setup and initial tests for endpoints and parent-link UI |
| 59 | Industry-Level UI Redesign | Frontend (all) | Inter font, login single-form with dropdown, sidebar icons, profile avatar, animated design system |

---

## ⚠️ In Progress

_None_

---

## ❌ Pending

_None — all planned tasks completed._

---

## Module Status Summary

| Module | Backend | Frontend |
|--------|---------|----------|
| Auth | ✅ Complete | ✅ Complete |
| Tenant Management | ✅ Complete | ✅ Complete |
| User Management | ✅ Complete | ✅ Complete |
| Students | ✅ Complete | ✅ Complete |
| Teachers | ✅ Complete | ✅ Complete |
| Academic (Classes/Subjects/Sections) | ✅ Complete | ✅ Complete |
| Attendance | ✅ Complete | ✅ Complete |
| Fees | ✅ Complete | ✅ Complete |
| Exams / Marks | ✅ Complete | ✅ Complete |
| Homework | ✅ Complete | ✅ Complete |
| Timetable | ✅ Complete | ✅ Complete |
| Parent Portal | ✅ Complete | ✅ Complete |
| Dashboard | ✅ Complete | ✅ Complete |
| Bulk Upload / Operations | ✅ Complete | ✅ Complete |
| Website CMS + Builder | ✅ Complete | ✅ Complete |
| Ownership Authorization | ✅ Complete | ✅ Complete |
| Audit Logging | ✅ Complete | N/A |
| Soft Delete | ✅ Complete | N/A |
| Integration Tests | ✅ Complete | N/A |
| Subscription Plans | ✅ Complete | ✅ Complete |
| Payment Gateway (Razorpay) | ✅ Complete | ✅ Complete |
| Tenant Subscriptions | ✅ Complete | ✅ Complete |
| Platform Payments | ✅ Complete | ✅ Complete |
| UI Design System | N/A | ✅ Complete |

---

## Architecture Decisions (Recorded)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Multi-tenancy | Schema-per-tenant | Complete data isolation; no discriminator columns; straightforward backup per school |
| Authentication | Stateless JWT (HS256) | Scalable; no server-side session; standard for REST APIs |
| ORM | Spring Data JPA + Hibernate | Mature, well-supported; custom multi-tenancy hooks available |
| Migration | Flyway | Declarative SQL migrations; easy rollback tracking |
| API Contract | `ApiResponse<T>` envelope | Consistent client-side handling; standard error format |
| DTO pattern | Java records | Immutable, concise; auto-generates `equals`, `hashCode`, `toString` |
| Frontend state | TanStack Query | Server state separate from UI state; automatic caching and invalidation |
| Frontend routing | React Router v7 | Nested routes for layouts; role-based route guards |
| UI font | Inter (Google Fonts) | Industry-standard SaaS typeface; wide browser support; weight range 300–800 |
| UI styling | Tailwind CSS v4 + CSS utility classes | Utility-first with reusable `cc-*` primitives for inputs, nav, badges, animations |
