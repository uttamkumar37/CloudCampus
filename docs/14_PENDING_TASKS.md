# CloudCampus — Pending Tasks


> Last Updated: 2026-05-08 | See [13_PROJECT_TRACKER.md](./13_PROJECT_TRACKER.md) for full completed work log.

---

## Priority Legend

| Icon | Meaning |
|------|---------|
| 🔴 | High Priority |
| 🟡 | Medium Priority |
| 🟢 | Low Priority |

---

## ✅ Completed Since Last Update (2026-05-07 → 2026-05-08)

| Task | Module | Completion Notes |
|------|--------|------------------|
| Task 62 — Role-wise Login Portal on Public Website | Frontend | School Portal section with 4 role cards (Admin/Teacher/Student/Parent); Login Portal nav link; LoginPage reads `?school=` + `?role=` query params to pre-fill school and role |
| Task 61 — Extended WebsiteConfig + AdmissionLeads fix + Public Website overhaul | Backend + Frontend | V10 migration (11 new columns); accordion config editor (8 sections, dropdowns for board/medium/type/year); AdmissionLeads stats always accurate (fetch-all + client-side filter); SchoolWebsitePage rebuilt: stats bar, notices board, hero CTA, achievement badge, gallery hover captions, contact icon rows, social SVG links |
| Task 60 — Website Builder Professional Overhaul | Frontend | Visual tab cards with icons; Preview Website button; theme colour swatches; hero image live preview; country/state dropdowns; admissions animated toggle; gallery sample images + live URL preview; section inline toggle switches; expandable lead cards with stat chips |

---

## ✅ Previously Completed (2026-05-06 → 2026-05-07)

| Task | Module | Completion Notes |
|------|--------|------------------|
| Task 54 — Guided Bulk Operations Workflow | Backend + Frontend | validate/preview/execute/jobs/retry/error-report flow; operation metadata support |
| Task 55 — Tenant School Admin Provisioning | Backend + Frontend | `POST /tenants` now provisions SCHOOL_ADMIN credentials in one request; super-admin create-tenant form updated |
| Task 56 — Tenant Status Management | Backend + Frontend | `PATCH /tenants/{tenantId}/status`; super-admin activate/deactivate UX with confirmation dialog |
| Task 57 — Student & Teacher Detail APIs | Backend | `/students/{id}/details` and `/teachers/{id}/details` for richer dashboard-linked data views |
| Task 58 — Website CMS + Builder Module | Backend + Frontend | Full dynamic website per tenant: `WebsiteBuilderPage` (General Info, Page Sections, Gallery, Admission Leads tabs); public `SchoolWebsitePage`; SQL schema: `tenant_website_config`, `website_sections`, `website_content`, `website_media`, `admission_leads`; public APIs `GET /public/website`, `POST /public/website/admission-leads` |
| Task 59 — Industry-Level UI Redesign | Frontend (all) | Inter font via Google Fonts; login collapsed to single form with school search dropdown + role `<select>`; super-admin login glassmorphism card with pulsing ring; sidebar with per-item SVG icons and mobile drawer; profile page with color avatar; DataTable with zebra rows; `cc-*` design system utility classes; animations: fade-up, slide-right, orb float, pulse-ring, shimmer |

---

## ✅ Previously Completed (2026-05-01 → 2026-05-06)

| Task | Module | Completion Notes |
|------|--------|------------------|
| Task 30 — Teacher Module UI | `frontend/src/features/teacher/` | `TeachersPage.tsx`, `TeacherForm.tsx`, hooks, toast notifications |
| Task 31 — Academic Module UI | `frontend/src/features/academic/` | Classes/Subjects/Sections tabs, forms, `academicApi.ts` |
| Task 33 — Attendance UI | `frontend/src/features/attendance/` | Date picker, class/section selector, status dropdown, report view |
| Task 34 — Fees UI | `frontend/src/features/fees/` | Assignment form, payment form, status badge, payment history |
| Task 35 — Marks/Exams UI | `frontend/src/features/marks/` | Exam form, result entry, results table |
| Task 36 — Homework UI | `frontend/src/features/homework/` | Homework list, create form, overdue highlighting |
| Task 37 — Timetable UI | `frontend/src/features/timetable/` | Weekly grid, slot form, class/section filter |
| Task 38 — Parent Portal UI | `frontend/src/features/parent/` | My children list, per-child view (fees/attendance/results) |
| Task 39 — Ownership-Aware Authorization | Backend/Security | `OwnershipChecker` bean; `@PreAuthorize` ownership on Fees, Attendance, Exam endpoints |
| Task 40 — Audit Logging | Backend (all modules) | `Auditable` MappedSuperclass, `JwtAuditorAware`, `@EnableJpaAuditing`; 10 entities updated |
| Task 41 — Soft Delete | Backend (Student, Teacher, User) | `deleted_at TIMESTAMPTZ`; soft-delete repos; `DELETE /students/{id}`, `DELETE /teachers/{id}` |
| Task 42 — Integration Tests | Testing | Testcontainers + Failsafe; `IntegrationTestBase`; 17 IT tests |
| Task 45 — Frontend UX Hardening | Frontend (all) | `ConfirmDialog` component; delete with confirm dialogs; 401 auto-redirect |
| Task 46 — Bulk Upload UI | `frontend/src/features/bulk-upload/` | File picker (.xlsx), drag-and-drop, progress bar, result card, per-row error table, instructions modal |
| Task 47 — Documentation Update | `docs/`, `docs/postman/` | 07_API_REFERENCE.md, 08_API.md (v1.1), Postman collection: 16 folders, 49 endpoints |
| Task 48 — Payment Gateway Integration | Backend + Frontend | Flyway V4; `RazorpayPaymentGatewayServiceImpl`; `POST /subscribe/initiate`; `POST /payments/webhook` (HMAC-SHA256); Razorpay checkout.js |
| Task 49 — First Login Credential Enforcement | Backend/Security | `FirstLoginEnforcementFilter`; first-login users restricted to credential endpoints only |
| Task 50 — OTP Credential Update Flow | Backend/Auth | `POST /auth/credentials/send-otp` and `POST /auth/credentials/update`; OTP persistence and verification |
| Task 51 — Auto User Credential Provisioning | Backend/User | Optional username/password mode; generated credentials + first-login-required flag |
| Task 52 — Parent Links Admin Management | Backend + Frontend | `GET /parents/links` plus admin UI for linking/unlinking parent/student records |
| Task 53 — Frontend Unit Test Foundation | Frontend/Testing | Vitest + Testing Library + jsdom setup with initial endpoint and parent-link tests |

---

## ⚠️ In Progress

_None_

---

## ❌ Pending (Not Started)

_None — all planned tasks completed._

---

## Future Improvements (Optional Backlog)

| Priority | Item | Notes |
|----------|------|-------|
| 🟡 | Increase backend integration test coverage for bulk workflow endpoints | Validate/preview/execute paths need Testcontainers IT tests |
| 🟡 | Add UI tests for tenant status update and bulk execution wizard states | Vitest + Testing Library |
| 🟢 | Add CI docs-sync check to catch API contract drift early | Could compare `07_API_REFERENCE.md` against actual controller annotations |
| 🟢 | Add notification delivery backend for OTP (email/SMS) | Currently OTP is returned in API response — production should send via SMTP/SMS |
| 🟢 | Website builder drag-and-drop section reorder | Currently ordered by display_order integer; DnD would improve UX |
| 🟢 | Mobile-responsive improvements for dashboard tables | DataTable and form grids could benefit from card-view on narrow viewports |
