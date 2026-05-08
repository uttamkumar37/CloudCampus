# Changelog

All notable changes to CloudCampus are documented here.

---

## [Unreleased] — 2026-05-08

### Added
- **Teacher management redesign** — full parity with Student management in the Admin portal
  - `TeachersPage` — modal create/edit, status tabs (All / Active / Inactive / Resigned / On Leave), search by name/employee no/email, professional table with class-teacher column, hover actions (View / Edit / Delete)
  - `TeacherAdminProfilePage` — 4-tab profile: Overview, Timetable, Recent Homework, Class Assignments
  - Class Assignments tab — assign/unassign sections as class teacher directly from teacher profile
- **Class Teacher feature**
  - `sections.class_teacher_id UUID` — nullable FK to `teachers.id ON DELETE SET NULL` (V12 migration + new-tenant DDL)
  - `teachers.status VARCHAR(20) DEFAULT 'ACTIVE'` — `TeacherStatus` enum: ACTIVE, INACTIVE, RESIGNED, ON_LEAVE (V12 migration + new-tenant DDL)
  - `GET/POST /academics/sections` return `classTeacherId` and `classTeacherName`
  - `PUT /academics/sections/{sectionId}/class-teacher` — assign a teacher
  - `DELETE /academics/sections/{sectionId}/class-teacher` — remove assignment
  - `TeacherResponse.classTeacherSections` — list of sections where teacher is class teacher
- **Teacher search and status filter** — `GET /teachers?search=&status=` — 4-branch query routing (no Hibernate null-param JPQL bug); mirrors student pattern
- **`GET /teachers/{id}/details`** response updated — `totalAssignedClasses`, `timetable`, `homework` fields

### Changed
- `TeacherController.getTeachers` — added `search` and `status` query params
- `TeacherService.getTeachers` — new 3-arg signature
- `TeacherUpdateRequest` — added `status` field
- `TenantServiceImpl.initializeTenantTables` — teachers and sections DDL updated to include new columns

---

## [Unreleased] — 2026-05-08

### Added
- **Mobile — all-role access** — every role can now log in and use the mobile app
  - **Role picker on login** — 4-card selector (Admin / Teacher / Student / Parent) with icon, description, and demo-password hint
  - **Role-based tab navigator** — `_layout.tsx` reads `session.role` after login and renders a different tab set per role
  - **Teacher portal** — reuses Dashboard + Students + Attendance tabs; Fees tab is hidden
  - **Student portal** (3 tabs): My Profile (hero card, exam results, attendance summary, sign-out), My Fees (fee status cards with pending alert), My Attendance (ring % + record list)
  - **Parent portal**: My Children list (linked children with class/section) → tap → Child Detail (fee summary with pending amount, exam results, attendance %)
  - New mobile API modules: `src/api/parent.ts` (`GET /parents/me/children`), `src/api/selfProfile.ts` (`GET /students/me/details`)
  - New mobile types: `src/types/parent.ts`
- **Mobile application** — React Native + Expo app (initial release)
  - **Login screen** — school slug + username + password + role picker; JWT session in SecureStore via Zustand
  - **Dashboard** — KPI cards (students, teachers, attendance %, fees), role badge, quick actions, activity feed
  - **Students** — auto-load on mount, colored initials avatars, search, tap → full detail
  - **Student detail** — profile hero, fee progress bars, attendance ring, exam grades, parent contacts
  - **Fees** — fee summary card (navy), per-fee progress bars, Record Payment bottom-sheet modal
  - **Attendance** — date navigator (← →), ring percentage, summary chips, record list
  - **Design system** — `src/theme.ts`: Colors, Spacing, Radius, Shadow, Typography, `avatarColor()`
  - **EAS build profiles** — development (devClient/internal), preview (APK), production (AAB)
  - API base URL configurable via `EXPO_PUBLIC_API_URL` env var
- **JNV Palamau demo seed** — replaces Sunrise Academy; idempotent on startup (`app.seed.demo-enabled=true`)
  - Tenant slug `jnv-palamau`, school name "Jawahar Navodaya Vidyalaya, Palamau"
  - Admin: `uttam.kumar` / `Uttam@2026!` (uttamkumar3797@gmail.com, 7905025730)
  - Vice Principal: `priya.nirmal` / `Priya@2026!` (uttamgaurav2020@gmail.com, 8724099452)
  - 11 teachers, 28 students (Classes 6–12, JNV admission numbers), 15 parents, default password `Jnv@Demo2026`
  - 7 classes, 14 sections (A/B per class; Science/Arts for 11–12), 15 subjects
  - 23 exams with results, 30 days attendance, fee assignments (Hostel/Lab/Board Registration), 20 homework assignments, 12 admission leads
  - JNV public website config: tagline, Medininagar address, theme `#1E40AF`
- **`GET /students/me/details`** — new endpoint (STUDENT role) returning full student detail including parents, fees, exams, attendance, and homework
- **`StudentFullProfilePage`** — 6-tab student self-profile page (Overview, Parents, Exams, Attendance, Fees, Homework) linked from student dashboard

### Added
- **Website Builder v3 — 100+ features across 20 tabs in 5 groups**
  - *Website group* — General Info, Design & Theme (fonts/animations/custom CSS), Page Sections, Photo Gallery
  - *Content group* — Blog & News (CRUD + categories), Events Calendar (RSVP + 7 types), Teacher Profiles (directory + bios), Social Proof (testimonials/awards/FAQ)
  - *Admissions group* — Admission Leads, Fee Structure (8 fee fields + calculator), Bookings & Services (PTM/open day/virtual tour), Admissions Tools (age calculator, eligibility quiz, waitlist, CSV export)
  - *Marketing group* — SEO & Analytics (meta tags, GA4, Search Console, sitemap), Communication (WhatsApp/live chat/newsletter/push), Marketing Tools (UTM campaign builder, visitor counter, Google Business Profile sync, page speed optimizer, school comparison widget), Media Embeds (YouTube/Google Reviews/Instagram/map/video testimonials/news ticker)
  - *Advanced group* — Courses & Timetable (subject catalog + interactive grid), Alumni & Portfolio (alumni network, student portfolio, board toppers, press & media), A/B Testing & AI (hero variant testing with CTR, version history snapshots, scheduled publishing, AI admissions chatbot), Store & Branding (merchandise store, canteen menu, Razorpay/Stripe/UPI payment gateway, favicon/app icon, custom 404 builder, multilingual support)
- **PricingPlansSection** — 4 plan tiers (FREE / GROWTH / PRO / ELITE) with monthly/annual billing toggle (33% savings), feature comparison table, trust badges, FAQ; plan activation stored in localStorage
- **Plan-gated tabs** — blur overlay + upgrade CTA for GROWTH/PRO/ELITE features; `isPlanAtLeast()` helper used across all 20 tabs
- All new feature editors use `localStorage` (keys: `wb_blog_posts`, `wb_events`, `wb_teachers`, `wb_seo_settings`, `wb_communication`, `wb_design_settings`, `wb_media_embeds`, `wb_courses`, `wb_timetable`, `wb_alumni`, `wb_portfolio`, `wb_toppers`, `wb_press`, `wb_quiz`, `wb_waitlist`, `wb_marketing`, `wb_utm_campaigns`, `wb_ab_variants`, `wb_snapshots`, `wb_scheduled`, `wb_chatbot`, `wb_merch`, `wb_canteen`, `wb_payments`, `wb_branding`, `wb_language`)

---

## [1.0.0] — 2026-05-08

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
