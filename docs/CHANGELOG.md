# Changelog

All notable changes to CloudCampus are documented here.

---

## [Unreleased] — 2026-05-08

### Added
- **Role-wise login portal** on the public school website — 4 colour-coded role cards (School Admin, Teacher, Student, Parent) linking to `/login?school=<slug>&role=<ROLE>`
- **Login deep-link support** — `LoginPage` now reads `?school=` and `?role=` query params to pre-fill school and role selections
- **School Portal nav link** on public website sticky navbar

### Changed
- **AdmissionLeadsPanel stats fix** — always fetch all leads, filter client-side so stat counts are always accurate regardless of active filter

---

## [0.9.0] — 2026-05-08

### Added
- **V10 migration** — 11 new columns on `website_config`: `logo_url`, `school_established_year`, `affiliation_board`, `medium_of_instruction`, `school_type`, `student_count`, `teacher_count`, `hero_cta_text`, `hero_cta_link`, `achievement_badge`, `notices_text`
- **WebsiteConfigEditor accordion overhaul** — 8 collapsible sections with dropdowns for affiliation board, medium, school type, established year; logo URL + live preview; achievement badge and notices fields
- **SchoolWebsitePage professional overhaul** — sticky nav with logo + affiliation, hero with achievement badge + custom CTA, dark stats bar, notices board, gallery with hover captions, contact icon rows, social SVG links

---

## [0.8.0] — 2026-05-08

### Added
- **Website Builder professional overhaul** — visual tab cards with icons, Preview Website button
- **WebsiteConfigEditor** — 10 theme colour swatches + custom picker, live hero image preview, 32 Indian state dropdown, admissions animated toggle, social links with brand colour dots
- **SectionsEditor** — visual cards, inline animated toggle switches, display-order dropdown, confirm-before-delete
- **GalleryEditor** — live URL preview, 6 Unsplash sample images, hover remove overlay with confirm
- **AdmissionLeadsPanel** — 4 stat chips (NEW / CONTACTED / CONVERTED / REJECTED), expandable lead cards, colour-coded next-status buttons

---

## [0.7.0] — 2026-05-07

### Added
- **Industry-level UI redesign** across all frontend pages
- Inter font (Google Fonts) replacing Manrope globally
- `cc-*` CSS design system: `cc-input`, `cc-dropdown`, `cc-badge-*`, `cc-nav-link`, `cc-nav-icon`, `cc-orb`, `cc-pulse-ring`, `cc-skeleton-shimmer`, fade/slide/appear animations
- **LoginPage** — single compact form: school search dropdown, role select, username, password, password show/hide
- **SuperAdminLoginPage** — dark glassmorphism card with animated pulsing ring
- **DashboardLayout + SuperAdminLayout** — SVG icon per nav item, mobile hamburger drawer
- **ProfilePage** — colour avatar with initials, role badge per role
- Improved `DataTable`, `PageHeader`, `Card`, `Button`, `FormSelect`, `FormInput`

---

## [0.6.0] — 2026-05-06

### Added
- **Website CMS + Builder** — full-stack module for tenant public websites
  - `WebsiteBuilderPage` with 4 tabs: General Info, Page Sections, Gallery, Admission Leads
  - Public `SchoolWebsitePage` at `/school/:slug`
  - Public APIs: `GET /public/website/:slug`, `POST /public/website/:slug/admission-leads`
  - DB: `website_config`, `website_sections`, `website_gallery`, `admission_leads`
- **Guided Bulk Operations Workflow** — validate → preview → execute → job tracking → error-report download
- **Tenant School Admin Provisioning** — `POST /tenants` now creates SCHOOL_ADMIN account in one request
- **Tenant Status Management** — `PATCH /tenants/{tenantId}/status` with Super Admin UI activate/deactivate
- **Student & Teacher Detail APIs** — `/students/{id}/details`, `/teachers/{id}/details`
- Comprehensive demo seed (`seed_dashboard_data.py`) — Sunrise Academy with 10 teachers, 15 students, 7 parents, full academic data

---

## [0.5.0] — 2026-05-05

### Added
- **Dashboard pages** — role-specific dashboards (SCHOOL_ADMIN, TEACHER, STUDENT, PARENT)
- Learning pages for parent and student workflows
- Updated backend auth/filter and exam/homework/timetable controllers

---

## [0.4.0] — 2026-05-01

### Added
- **Razorpay payment gateway** — `POST /subscribe/initiate`, `POST /payments/webhook` (HMAC-SHA256 verified), Razorpay checkout.js integration
- **First Login Credential Enforcement** — `FirstLoginEnforcementFilter`, OTP-based credential update flow
- **Parent Links Admin Management** — `GET /parents/links`, admin link/unlink UI
- **Frontend Unit Test Foundation** — Vitest + Testing Library + jsdom
- **Ownership-Aware Authorization** — `OwnershipChecker` bean, `@PreAuthorize` on Fees, Attendance, Exam
- **Audit Logging** — `Auditable` base class, `JwtAuditorAware`, `@EnableJpaAuditing`
- **Soft Delete** — `deleted_at` on Student, Teacher, User
- **Integration Tests** — Testcontainers + Failsafe, 17 IT tests
- Frontend UX hardening — `ConfirmDialog`, 401 auto-redirect, bulk upload UI (drag-and-drop, Excel, progress bar)

---

## [0.3.0] — 2026-04-28

### Added
- Teacher, Academic, Attendance, Fees, Exams, Homework, Timetable, Parent Portal frontend modules
- Subscription plans, tenant subscriptions, platform payments
- Postman collection (16 folders, 49 endpoints)
- Full API documentation (`docs/API.md`)

---

## [0.2.0] — Initial Backend

### Added
- Spring Boot 3.4 modular monolith
- Schema-per-tenant PostgreSQL multi-tenancy (Hibernate SCHEMA strategy)
- JWT auth in HttpOnly cookie, role-based `@PreAuthorize`
- Core domain modules: auth, user, tenant, academic, student, teacher, attendance, fees, exam, homework, timetable, parent, dashboard
- Flyway migrations V1–V7
- Docker Compose stack (PostgreSQL + backend + frontend)
