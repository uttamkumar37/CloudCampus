# Website Builder Master Plan

Status: Product Shell Implemented; Backend Expansion In Progress
Owner: CloudCampus Website Builder and Public Website
Last updated: 2026-05-20

## Operating Rules

- Do not break tenant isolation, role-based permissions, authentication, SEO, custom domains, or current public website rendering.
- Work one task at a time. After each task, update this file, validate, explain changes, and wait for approval before starting the next task.
- Avoid mass rewrites. Prefer a staged adapter approach: improve UX first, then add data contracts, gating, AI, CMS, analytics, and rendering upgrades.
- Keep APIs backward compatible. Add new endpoints/fields without removing existing `website`, `website_pages`, `website_sections`, and `website_nav_items` behavior.
- Reuse existing React Query, `axiosInstance`, shared UI, tenant context, subscription, custom domain, audit, and website service patterns.

## Current Architecture Map

### School Website Builder

- Frontend builder: `frontend/src/features/school-admin/pages/WebsiteBuilderPage.tsx`
- Builder API client: `frontend/src/features/school-admin/api/websiteApi.ts`
- Public site page: `frontend/src/features/public-site/pages/PublicSitePage.tsx`
- Public site API client: `frontend/src/features/public-site/api/publicSiteApi.ts`
- Backend admin controller: `backend/src/main/java/com/cloudcampus/website/controller/WebsiteAdminController.java`
- Backend public controller: `backend/src/main/java/com/cloudcampus/website/controller/PublicSiteController.java`
- Backend service: `backend/src/main/java/com/cloudcampus/website/service/WebsiteServiceImpl.java`
- DB foundation: `backend/src/main/resources/db/migration/V51__website_builder.sql`

### Related Systems

- Subscription plans: `backend/src/main/java/com/cloudcampus/subscription/entity/SubscriptionPlanCode.java`
- Superadmin subscription UI/API: `frontend/src/features/super-admin/api/subscriptionApi.ts`, `TenantDetailPage.tsx`
- Custom domain UI/API: `frontend/src/features/school-admin/pages/CustomDomainPage.tsx`, `CustomDomainController.java`
- Platform public website studio: `frontend/src/features/super-admin/public-website/*`, `backend/src/main/java/com/cloudcampus/experience/*`

## Phase 1 UX Audit


### Critical Findings

| Area | Finding | Risk | Required Direction |
| --- | --- | --- | --- |
| Builder UX | Builder is a page list plus raw JSON section editor. Non-technical school admins cannot understand section content. | High | Replace raw JSON-first flow with visual section cards, presets, and forms. Keep JSON only as advanced/developer mode. |
| Empty State | Empty builder says only "Select a page or create a new one." | High | Add onboarding wizard, template selection, starter content, and guided next steps. |
| Visual Editing | No live preview, no inline editing, no section thumbnails, no responsive preview. | High | Introduce split layout: page tree, visual canvas, inspector panel, device preview modes. |
| Publishing | Website publish toggle is separate from page publish; public API does not appear to block site-level unpublished websites. | High | Add publish checklist and verify backend public rendering respects website-level `published`. |
| Navigation | API supports nav items but builder page does not expose navigation management. | Medium | Add navigation tab with page-linked menu builder and external link support. |
| Templates | No school templates in school-admin builder. Superadmin studio has platform templates, but they target CloudCampus marketing pages. | High | Create tenant school templates: government, international, coaching, college, residential, modern premium. |
| Subscription | Existing plans only expose student/staff/school limits. No builder feature entitlements. | High | Add website feature matrix and school-admin plan visibility without breaking current plans. |
| Monetization | No upgrade prompts, locked states, usage meters, premium labels, or plan comparison. | High | Add a subscription-aware builder shell with feature gates and upgrade CTAs. |
| AI | There is AI prompt infrastructure, but no school website generation journey. | Medium | Add AI generation as a gated workflow that produces pages/sections through existing APIs first. |
| CMS | Notices/events/gallery/faculty/admissions/downloads are not modeled as CMS content in the school builder. | Medium | Add CMS modules incrementally, starting with UI-level content blocks and later normalized entities. |
| Public Website | Public site contains hard-coded government/NVS content, hard-coded announcements, quick links, address, and footer contact data. | High | Move these to tenant website content/theme config with safe fallbacks. |
| Branding | Public website and builder are disconnected visually and structurally. | Medium | Share section schemas, preview components, theme tokens, and rendering rules. |
| SEO | Pages store SEO title/description but builder lacks SEO score, preview, checklist, sitemap/schema readiness. | Medium | Add SEO inspector and publish checklist, preserving current fields. |
| Domains | Custom domain exists in a separate page and copy references ERP portal, not public website. | Medium | Link domain status into builder launch checklist and public site settings. |
| Responsiveness | Builder has fixed left pane and desktop-oriented forms. | Medium | Add mobile/tablet builder layout and device preview. |
| Rendering Safety | Public renderer accepts JSON content; text is React-escaped, but URL/image fields and schema need validation as section types expand. | Medium | Add typed section schema validation and safe URL/image handling. |
| Tailwind | Public site uses dynamic `sm:grid-cols-${...}` which Tailwind may not compile reliably. | Low | Replace with stable class map during renderer cleanup. |

## Product Target

CloudCampus Website Builder should become a subscription-aware no-code school website platform comparable to Wix, Webflow, Framer, Squarespace, Shopify page builder, and premium school SaaS website tools.

Schools should be able to:

- Launch a website from a template in minutes.
- Understand what their current plan unlocks.
- Generate content with AI when plan allows it.
- Edit visually without JSON.
- Preview desktop, tablet, and mobile.
- Publish confidently with SEO, domain, and content readiness checks.
- Capture admission leads and inquiries.
- Manage notices, events, gallery, faculty, achievements, downloads, and admissions content.

## Subscription Entitlement Model

Status: Planned

Current backend plans: `FREE`, `STARTER`, `PROFESSIONAL`, `ENTERPRISE`.

Requested product plans: Free, Starter, Professional, Enterprise, AI Premium.

Implementation rule: add website feature entitlements in a backward-compatible layer first. Do not immediately break existing `SubscriptionPlanCode` checks or DB constraints. AI Premium can be introduced as an add-on flag or new plan only after DB/API migration planning.

| Capability | Free | Starter | Professional | Enterprise | AI Premium |
| --- | --- | --- | --- | --- | --- |
| Published pages | 1 | 5 | 25 | Unlimited | Based on base plan |
| School templates | Basic | Starter templates | Premium templates | Enterprise templates | AI-optimized templates |
| Custom domain | Locked | Locked or add-on | Included | Included | Based on base plan |
| AI generation | Locked | Locked | Limited | Higher limit | Full access |
| Media storage | Low | Medium | High | Custom | Add-on quota |
| SEO tools | Basic fields | Checklist | Advanced | Advanced + schema | AI SEO |
| Analytics | Locked | Basic | Advanced | Enterprise | AI insights |
| Branding removal | Locked | Locked | Included | Included | Based on base plan |
| Forms/leads | Locked | Basic inquiry | Admissions CRM | Advanced workflows | AI lead summaries |
| Advanced components | Locked | Limited | Included | Included | AI-generated |

## Implementation Backlog

### Phase 1 - Audit and Plan

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |
| WB-002 | Confirm first implementation slice and acceptance criteria with user. | WB-001 | Pending |

### Phase 2 - Builder UX Foundation

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |

### Phase 3 - Typed Section Editing

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |
| WB-023 | Add client-side validation for section content and safe URL/image fields. | WB-021 | Partial |

### Phase 4 - Templates and Themes

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |
| WB-032 | Add theme presets: light, dark, government, international, premium, coaching. | WB-031 | Partial |
| WB-033 | Persist theme config in a backward-compatible way. | WB-032 | Pending |

### Phase 5 - Subscription and Monetization

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |
| WB-043 | Add school-admin subscription read endpoint or safe existing subscription access path. | WB-041 | Pending |
| WB-044 | Add backend enforcement for hard gates after UI gates are visible. | WB-043 | Pending |

### Phase 6 - AI Website Generation

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |
| WB-052 | Integrate AI prompt infrastructure for homepage/about/admissions/SEO content. | WB-050 | Pending |
| WB-053 | Add AI section suggestions and rewrite actions in inspector. | WB-021, WB-052 | Partial |

### Phase 7 - CMS Experience

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |
| WB-061 | Implement drafts, publish/unpublish, scheduling, tags, and search for initial CMS item type. | WB-060 | Pending |
| WB-062 | Connect public sections to CMS content safely. | WB-061 | Pending |

### Phase 8 - Public Website Upgrade

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |
| WB-071 | Add premium sticky header, CTA sections, testimonials, stats, gallery, announcement ticker, and admission blocks. | WB-070 | Partial |
| WB-073 | Add accessibility pass: semantic landmarks, focus states, alt text, contrast checks. | WB-071 | Partial |

### Phase 9 - Leads and Conversion

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |
| WB-080 | Add inquiry/admission/callback form sections in builder and public renderer. | WB-020 | Partial |
| WB-081 | Add backend lead entity and tenant-scoped APIs. | WB-080 | Pending |
| WB-082 | Add lead inbox and CRM-ready statuses in school-admin. | WB-081 | Pending |
| WB-083 | Add WhatsApp/contact CTA integration with existing WhatsApp area where appropriate. | WB-082 | Pending |

### Phase 10 - Analytics and Insights

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |
| WB-091 | Add page view/lead conversion event tracking. | WB-081 | Pending |
| WB-092 | Add SEO and performance insights. | WB-091 | Pending |

### Phase 11 - Domain, SEO, and Publish Safety

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |
| WB-102 | Add SEO preview and scoring panel. | WB-020 | Partial |

### Phase 12 - Security and Performance

| Task | Scope | Dependencies | Status |
| --- | --- | --- | --- |
| WB-110 | Audit tenant isolation for all website admin mutations and public reads. | WB-010 | Partial |
| WB-111 | Add schema validation for section content on backend. | WB-020 | Pending |
| WB-112 | Add image/media handling plan: upload limits, safe URLs, lazy loading, CDN-ready paths. | WB-060 | Pending |
| WB-113 | Add public render caching and query optimization plan. | WB-070 | Pending |

## First Implementation Candidate

Recommended next task: WB-010 - Builder launch dashboard and onboarding-ready empty state.

Why this first:

- It improves the confusing/empty builder immediately without changing backend contracts.
- It creates the product surface needed for templates, plans, domains, SEO, and AI prompts.
- It is low risk for tenant isolation and public rendering because it stays inside the school-admin builder UI.

Acceptance criteria for WB-010:

- Existing page/section CRUD remains functional.
- Builder starts with a premium overview when no page is selected.
- Shows website status, public URL, current pages count, SEO readiness placeholder, domain status placeholder, and plan/upgrade placeholder.
- Adds clear quick actions: choose template, create page, add section, preview, publish checklist.
- Includes loading, empty, and success/error states using existing shared UI/toast patterns.
- Responsive on desktop/tablet/mobile.

## Validation Checklist Per Task

- `npm run build` from `frontend`
- Targeted backend build/test when backend changes are made
- API smoke test for affected endpoints
- Confirm no unrelated files were modified
- Confirm role/tenant behavior is preserved
- Confirm public website still renders existing tenant site
- Confirm builder works at `http://localhost:5173` with backend CORS origin

## Task Log

| Date | Task | Result | Validation |
| --- | --- | --- | --- |
| 2026-05-20 | WB-020 to WB-023 | Added typed frontend section system, visual section editor, and advanced JSON fallback. | `npm run build` passed; backend schema validation still pending. |
| 2026-05-20 | WB-030 to WB-042 | Added six school templates, template installation via existing APIs, plan entitlements, feature locks, upgrade nudges, and monetization UI. | `npm run build` passed. |
| 2026-05-20 | WB-050 to WB-060 | Added AI draft generator fallback, AI tab, and CMS hub surface for school content types. | `npm run build` passed; live AI provider and persistent CMS entities still pending. |
| 2026-05-20 | WB-070 to WB-103 | Upgraded public renderer, removed hard-coded school shell, added richer section rendering, fixed dynamic Tailwind grid issue, integrated domain/SEO launch readiness, and enforced website-level public publish safety. | `npm run build` and `mvn package -DskipTests` passed. |
