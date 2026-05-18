# CloudCampus — Architecture Reference

**Version:** 2.2 | **Updated:** 2026-05-18 | **Branch:** `main`

Multi-tenant SaaS school management platform — Java 21 + Spring Boot 3 + React 19 + React Native.

---

## 1. Vision

CloudCampus powers complete digital school operations for 1,000+ schools, 1M+ students, and 100K+ staff — multi-tenant first, configuration-driven, feature-flagged, event-driven, mobile-ready, secure by default.

---

## 2. Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Java 21 LTS |
| Framework | Spring Boot 3.4.5 |
| Security | Spring Security 6.x — full RBAC |
| Auth | JWT (JJWT 0.12.6) — HS256 access + refresh tokens |
| ORM | Spring Data JPA + Hibernate 6 |
| Database | PostgreSQL 16 (pgvector extension for AI embeddings) |
| Cache | Redis 7 — Spring Data Redis, `GenericJackson2JsonRedisSerializer` |
| Messaging | RabbitMQ — topic exchange per domain |
| Storage | MinIO (S3-compatible) |
| Migrations | Flyway 10 — V1–V82 applied in order |
| AI | Spring AI 1.0.0 — Anthropic (chat) + OpenAI (embeddings) |
| Build | Maven, `spring-boot:run -Dspring-boot.run.profiles=dev` |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript + Vite |
| State | Zustand (with `persist` middleware for auth + visitor tracking) |
| Data fetching | React Query (`@tanstack/react-query`) |
| HTTP | Axios — `api` (authenticated) + `authClient` (unauthenticated) |
| Styling | Tailwind CSS 4 |
| Routing | React Router v6 — lazy-loaded routes |

### Mobile
| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 + React Native |
| Features | Offline sync, push notifications, QR attendance |

### Infrastructure
| Service | Image / Notes |
|---------|--------------|
| PostgreSQL | `pgvector/pgvector:pg16` — must NOT be `postgres:16-alpine` (pgvector required) |
| Redis | `redis:7-alpine` — password protected |
| MinIO | Object storage for media |
| RabbitMQ | `rabbitmq:3-management` |
| MailHog | SMTP trap for dev |
| Prometheus + Grafana | Metrics + dashboards |
| Tempo | Distributed tracing |
| pgbackup | Custom image — daily WAL backup |

---

## 3. Multi-Tenancy Model

Every request carries a `tenant_id` resolved from the JWT claim. All tenant-scoped entities use a Hibernate `@Filter` that automatically appends `AND tenant_id = :tenantId` to every query — no manual filtering needed in repositories.

```
HTTP Request
  → JwtAuthenticationFilter → extracts tenantId, userId, role → RequestContext (ThreadLocal)
  → TenantContextFilter → confirms tenantId matches JWT
  → TenantSuspensionFilter → rejects suspended tenants (Redis-cached, 60s TTL, fail-open)
  → Controller / Service / Repository → Hibernate @Filter applied transparently
```

**Tenant isolation guarantees:**
- JWT token contains `tenant_id` claim — cannot be spoofed without the HS256 secret
- Hibernate `@Filter` is activated in `TenantAwareRepositoryImpl` for all `JpaRepository` instances
- Cross-tenant queries are architecturally impossible at the ORM layer

---

## 4. Security Architecture

### Authentication & JWT
- **Access token:** 15-minute TTL, HS256 signed, carries `userId`, `tenantId`, `role`, `schoolId`
- **Refresh token:** 7-day TTL, stored in DB (`refresh_tokens` table), one-time use, rotated on refresh
- **Token revocation:** All refresh tokens for a user can be invalidated (`POST /v1/auth/revoke-all`)
- **Password:** BCrypt cost factor 12

### RBAC
Path matchers in `SecurityConfig` define role boundaries. Method-level `@PreAuthorize` for fine-grained checks.

| Role | Access |
|------|--------|
| `SUPER_ADMIN` | `/v1/super-admin/**`, platform-wide |
| `SCHOOL_ADMIN` | `/v1/school-admin/**`, own tenant only |
| `TEACHER` | `/v1/teacher/**`, own school only |
| `STUDENT` | `/v1/student/**`, own records only |
| `PARENT` | `/v1/parent/**`, linked children only |
| _(no auth)_ | `/v1/auth/**`, `/v1/experience/public/**` |

### Additional Security Layers
| Concern | Implementation |
|---------|---------------|
| Rate limiting | Redis sliding-window — login endpoint + per-user/tenant API |
| Security headers | `SecurityHeadersFilter` — 7 OWASP headers on every response |
| PII encryption | AES-256-GCM for sensitive fields (`EncryptionService`) |
| Audit logging | `AuditLogService` (@Async) — login, logout, password change, RBAC changes |
| Secrets guard | `SecretsGuardConfig` — fails startup if default secrets detected in prod |
| CORS | Configured for `localhost:*` (dev) + `*.cloudcampus.io` (prod) |
| GDPR | IP hash stored as `SHA-256(ip + daily_salt)` — never raw IP |

---

## 5. Backend Domain Packages

All under `com.cloudcampus.*`:

| Package | Domain | Key Classes |
|---------|--------|-------------|
| `auth` | Authentication | `AuthController`, `AuthServiceImpl`, `JwtUtil`, `JwtAuthenticationFilter`, `LoginRateLimiterService` |
| `tenant` | Tenant lifecycle | `Tenant`, `TenantService`, `SuperAdminTenantController` |
| `school` | School structure | `School`, `AcademicYear`, `ClassRoom`, `Section`, `Subject`, `Department` |
| `student` | Student lifecycle | `Student`, `StudentParentLink`, `StudentController` (bulk promote at `POST /v1/school-admin/schools/{id}/students/promote`) |
| `staff` | Staff & HR | `Staff`, `StaffService`, `StaffController` |
| `attendance` | Attendance | `AttendanceSession`, `AttendanceRecord`, QR self-mark flow |
| `finance` | Fees & Payments | `FeeCategory`, `FeeStructure`, `StudentFeeRecord`, `FeePayment`, `PaymentService` (Razorpay) |
| `payment` | Online payments | `PaymentController`, `PaymentServiceImpl`, Razorpay HMAC verify, webhook idempotency |
| `exam` | Examinations | `Exam`, `ExamSubject`, `StudentMark`, `ExamResult` |
| `timetable` | Timetable | `TimetableSlot` — conflict detection built into service |
| `homework` | Homework | `HomeworkAssignment`, `HomeworkSubmission` |
| `assignment` | Assignments | `Assignment`, `AssignmentSubmission` |
| `notice` | Notice board | `SchoolNotice` |
| `notification` | Notifications | `NotificationLog`, `WhatsAppMessageLog`, RabbitMQ queue |
| `feature` | Feature flags | `FeatureFlag`, `TenantFeature`, `@RequiresFeature` AOP, dependency engine |
| `ai` | AI Foundation | Spring AI 1.0.0, prompt registry, pgvector embeddings, mock mode, `AiGatewayService` |
| `ai.copilot` | AI Copilot | `SchoolAdminAiCopilotController` — `POST /v1/school-admin/ai/query` (CC-1603) |
| `experience` | DSEP + Studio | See Section 8 |
| `config` | Cross-cutting | `SecurityConfig`, `CacheConfig`, `AsyncConfig` (virtual threads), `JwtProperties` |
| `common` | Shared | `ApiResponse`, `RequestContext`, `TenantSuspensionFilter`, `RestExceptionHandler` |

---

## 6. Database Schema (Flyway Migrations)

### Core Schema — V1–V46
| Range | Content |
|-------|---------|
| V1–V10 | Tenants, users, auth (refresh tokens, OTP, audit logs) |
| V11–V20 | Schools, academic years, classes, sections, subjects, departments |
| V21–V30 | Students, staff, parent links, timetable |
| V31–V40 | Attendance, fees, exams, homework, assignments, notices |
| V41–V46 | Tenant config, JNV Lucknow seed, subscriptions, payment orders, pgvector + AI tables |

### Extended Schema — V47–V67
Security hardening, notifications (RabbitMQ), website builder, custom domains, reports, AI prompt registry, lesson plans, online classes, QR attendance, PII encryption columns.

### DSEP Schema — V68–V74
| Migration | Table(s) |
|-----------|----------|
| V68 | `platform_content_blocks` — global + per-tenant, versioned, publish-gated |
| V69 | `platform_presentations`, `platform_presentation_slides` |
| V70 | `platform_demo_scenarios`, `platform_demo_sessions` |
| V71 | `platform_investor_rooms`, `platform_investor_room_sections` |
| V72 | `platform_campaigns`, `platform_campaign_steps` |
| V73 | `platform_experience_events` — partitioned by quarter through 2027 Q1 |
| V74 | Seed — 3 demo scenarios + 10 default content blocks |

### Experience Studio Schema — V75–V82
| Migration | Table(s) |
|-----------|----------|
| V75 | `experience_brand_systems`, `experience_stakeholder_journeys` — Studio foundations |
| V76 | Seed — brand system + stakeholder journey baseline data |
| V77 | `experience_story_scenes`, `experience_trust_modules`, `experience_website_routes`, `experience_website_templates` — expansion domains |
| V78 | Seed — story scenes, trust modules, website routes, template marketplace data |
| V79 | `platform_public_website` — public-facing website builder tables |
| V80 | Seed — default public website pages and nav config |
| V81 | Extend `platform_experience_events` partitions through 2028 Q4 |
| V82 | Add idempotency keys to `payment_orders` for gateway deduplication |

### Key Schema Patterns
- **Soft delete:** `deleted_at` timestamp — all queries filter `WHERE deleted_at IS NULL`
- **Tenant filter:** Every tenant-scoped table has `tenant_id UUID NOT NULL` + Hibernate `@Filter`
- **JSONB:** Used for flexible content (`@JdbcTypeCode(SqlTypes.JSON)` — Hibernate 6 native, no hypersistence)
- **Partitioned table:** `platform_experience_events` partitioned by `created_at` (quarterly)
- **pgvector:** `ai_embeddings` table with `vector(1536)` column — cosine similarity search

---

## 7. Caching Strategy

Cache manager: `RedisCacheManager` with `GenericJackson2JsonRedisSerializer` using `NON_FINAL` default typing.

| Cache Name | TTL | Invalidation |
|------------|-----|-------------|
| `academic-years` | 10 min | Any write to AcademicYear |
| `classes` | 10 min | Any write to ClassRoom |
| `subjects` | 10 min | Any write to Subject |
| `sections` | 5 min | Any write to Section |
| `departments` | 10 min | Any write to Department |
| `exp:block` | 2 min | ContentBlock publish |
| `exp:scenarios` | 10 min | DemoScenario update |
| `exp:presentation` | 5 min | Presentation publish |

**Important constraint:** Do NOT use `@Cacheable` on methods returning `List<JavaRecord>` where record elements contain other records. Java records are `final` — Jackson's `NON_FINAL` typing omits `@class` from them, causing `InvalidTypeIdException` on read-back. Cache flat DTOs only.

---

## 8. DSEP — Dynamic Stakeholder Experience Platform

### What It Is
DSEP is CloudCampus's public-facing conversion engine: content blocks, interactive demos, investor data rooms, and presentation decks — all authored in the Super Admin console, zero code changes.

### Architecture Overview
```
Super Admin Console (/super-admin/experience)
  → SuperAdminExperienceController (/v1/super-admin/experience/**)
  → ContentBlockService / InvestorRoomService / DemoOrchestrationService / PresentationService

Public Website / Demo / Investor Room (no auth)
  → PublicExperienceController + InvestorRoomController (/v1/experience/public/**)
  → authClient (Axios, no token, baseURL: http://localhost:8080)

CloudCampus public marketing website (no auth)
  → React route / and /home
  → CloudCampusPublicWebsitePage config-driven section renderer
  → Public website APIs hydrate nav/theme/page payloads when available
  → Same origin URL used across local/staging/prod

Analytics events (async)
  → POST /v1/experience/public/events
  → ExperienceEventPublisher → RabbitMQ exchange: cc.experience.events
  → ExperienceEventListener → INSERT INTO platform_experience_events (partitioned)
```

### Backend Package: `com.cloudcampus.experience`
```
config/    ExperienceQueueConfig          ← RabbitMQ topology
controller/ PublicExperienceController    ← public content + demo + events + render profile
            InvestorRoomController        ← room metadata + password verify
            SuperAdminExperienceController← full CRUD for all DSEP + Studio resources
dto/       request/ + response/           ← InvestorRoomResponse embeds sections list
entity/    ContentBlock, DemoScenario, DemoSession, ExperienceEvent,
           InvestorRoom, InvestorRoomSection, Presentation,
           BrandSystem, StakeholderJourney, StoryScene, TrustModule,
           WebsiteRouteConfig, WebsiteTemplate,
           MarketingCampaign, MarketingCampaignStep
repository/ includes all entity repositories (tenant-scoped)
service/   ContentBlockService (@Cacheable exp:block, 2 min)
           DemoOrchestrationService (Base62 tokens, @Scheduled cleanup)
           InvestorRoomService (joins sections; NOT cached — nested records)
           BrandSystemService, StakeholderJourneyService, StorySceneService
           TrustModuleService, WebsiteRouteService, WebsiteTemplateService
           MarketingCampaignService, ExperienceRenderProfileService
           ExperienceSeedHealthService (entity count reporting)
           ExperienceEventPublisher (fire-and-forget — never throws)
listener/  ExperienceEventListener (manual ack, DLX on failure)
```

### Public API Endpoints (no auth)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/experience/public/content-blocks?keys=k1,k2` | Batch fetch content blocks |
| GET | `/v1/experience/public/demo-scenarios` | List active demo scenarios |
| POST | `/v1/experience/public/demo/start` | Start demo session |
| GET | `/v1/experience/public/investor/{roomCode}` | Room + all VISIBLE sections |
| POST | `/v1/experience/public/investor/{roomCode}/access` | Verify password |
| POST | `/v1/experience/public/events` | Ingest analytics events (async) |
| GET | `/v1/experience/public/website/pages/{slug}` | Published public website page |
| GET | `/v1/experience/public/website/navigation` | Published public website navigation |
| GET | `/v1/experience/public/website/theme` | Published public website theme tokens |

### Super Admin API Endpoints (SUPER_ADMIN role)
| Method | Path | Notes |
|--------|------|-------|
| GET / POST | `/v1/super-admin/experience/content-blocks` | |
| PUT / POST `:id/publish` | `/v1/super-admin/experience/content-blocks/{id}` | |
| POST | `/v1/super-admin/experience/content-blocks/{id}/ai-generate` | AI copy generation |
| GET | `/v1/super-admin/experience/analytics?days=7` | Event funnel metrics |
| GET | `/v1/super-admin/experience/demo-scenarios` | |
| GET / POST / DELETE | `/v1/super-admin/experience/investor-rooms` | |
| GET / POST `:id/publish` | `/v1/super-admin/experience/presentations` | |
| GET / POST / PUT / DELETE | `/v1/super-admin/experience/brand-systems` | Studio domains |
| GET / POST / PUT / DELETE | `/v1/super-admin/experience/stakeholder-journeys` | Studio domains |
| GET / POST / PUT / DELETE | `/v1/super-admin/experience/story-scenes` | Studio domains |
| GET / POST / PUT / DELETE | `/v1/super-admin/experience/trust-modules` | Studio domains |
| GET / POST / PUT / DELETE | `/v1/super-admin/experience/website-routes` | Studio domains |
| GET / POST / PUT / DELETE | `/v1/super-admin/experience/website-templates` | Studio domains |
| GET / POST / PUT / DELETE | `/v1/super-admin/experience/campaigns` | Studio domains |
| GET | `/v1/super-admin/experience/seed-health` | Entity count report |
| GET | `/v1/super-admin/experience/render-profile` | Public render profile |
| GET | `/v1/super-admin/public-website/dashboard` | Website dashboard |
| GET / POST | `/v1/super-admin/public-website/pages` | Website pages |
| GET / POST | `/v1/super-admin/public-website/pages/{pageId}/sections` | Website sections |
| GET / POST | `/v1/super-admin/public-website/navigation` | Navigation builder |
| GET / POST | `/v1/super-admin/public-website/branding/themes` | Theme builder |
| GET / PUT | `/v1/super-admin/public-website/seo` | SEO settings |
| POST | `/v1/super-admin/public-website/publish` | Publish website snapshot |

### Frontend Structure
```
features/experience/
  api/experienceApi.ts           ← React Query hooks via authClient (public, no token)
  api/analyticsTracker.ts        ← event batching, debounce 2s, max 10, keepalive
  api/experienceStudioApi.ts     ← all super-admin Studio CRUD hooks
  pages/DemoPage.tsx             ← scenario picker → email capture → credential reveal
  pages/InvestorRoomPage.tsx     ← dark theme; 7 section type renderers; collapsible FAQ
  store/experienceStore.ts       ← Zustand persist: visitorId, consent, UTM params

features/super-admin/experience/
  ExperienceControlCenter.tsx    ← 10-domain Studio shell
  ContentBlockEditor.tsx         ← list + search + JSON modal + publish
  DemoScenarioManager.tsx        ← scenario cards with feature pills
  InvestorRoomBuilder.tsx        ← room list + create modal + copy link
  BrandingSystemManager.tsx      ← global brand config
  StakeholderJourneyManager.tsx  ← journey editor + audience picker
  StorytellingManager.tsx        ← scene cards + type badges
  TrustPlatformManager.tsx       ← trust module cards
  WebsiteRouteManager.tsx        ← route table + create/edit modal
  TemplateMarketplaceManager.tsx ← template grid + usage count
  MarketingAutomationManager.tsx ← campaign list + step count
  AiExperienceManager.tsx        ← AI content generation UI
  PresentationBuilderManager.tsx ← presentation list + slide builder
  SeedHealthPanel.tsx            ← entity count dashboard with status badges
  RenderProfilePreview.tsx       ← live public render profile preview
  ExperienceAnalyticsDashboard.tsx ← stat cards + CSS bar chart, period selector

features/public-site/pages/
  CloudCampusPublicWebsitePage.tsx ← public SaaS homepage at / and /home
                                    Config object drives nav, hero, stats,
                                    role showcase, feature grid, portal preview,
                                    investor, demo, pricing, and footer sections
  PublicSitePage.tsx               ← tenant school public site renderer

features/super-admin/public-website/
  components/PublicWebsiteShell.tsx ← Website Builder shell + dynamic View Live Website link
  config/websiteBuilderTemplates.ts ← default section templates + builder readiness metadata
  pages/*                           ← dashboard, pages, branding, SEO, analytics, media, publish
```

### Public Website Runtime Notes
- The CloudCampus public homepage is reachable at `/` and `/home`.
- The homepage is intentionally component-based and content-driven via `siteConfig`, so future Super Admin Website Builder editing can map section type, order, visibility, title, subtitle, CTA, and card data without rewriting the renderer.
- The public homepage still calls `getPublicNavigation`, `getPublicTheme`, and `getPublicPage(slug)` through React Query, allowing published website data to hydrate nav/theme/page context as backend editing matures.
- Super Admin exposes dynamic public-site links in both the main shell and Public Website Builder shell. The URL is generated with `new URL('/', window.location.origin).toString()`, avoiding hardcoded local/staging/prod hostnames.
- Super Admin Website Builder pages now expose route composition, audience/device preview cues, default section templates, and publish/rollback readiness on top of the existing `WebsitePage`, `WebsiteSection`, and snapshot APIs.
- Admin Login remains `/login`; authenticated Super Admin, School Admin, Teacher, Student, and Parent routes remain protected by existing route guards.

### School Admin — AI Copilot (CC-1603)
```
backend:  POST /v1/school-admin/ai/query
          SchoolAdminAiCopilotController → AiGatewayService
          Feature-gated (app.ai.enabled); CRIT-15 prompt injection prevention
          Mock response when AI disabled (safe for CI/dev)

frontend: features/school-admin/api/aiCopilotApi.ts
          features/school-admin/pages/AiCopilotPage.tsx
          Chat UI: suggested-question chips, message history, token counter,
          export conversation (.txt), retry:false mutation
          Route: /school-admin/ai-copilot
```

### Mobile — QR Attendance + Student Promotion
```
student QR scan:  app/(app)/qr-attendance.tsx
                  Reads ?token= via useLocalSearchParams → auto-submits
                  POST /v1/student/attendance/qr-mark
                  Manual paste fallback for non-deep-link entry

teacher QR:       QrGenerateCard in TeacherAttendanceScreen
                  POST /v1/teacher/attendance/sessions/with-qr
                  Shows shareable qrDeepLink + 5-min countdown + Share API

student promotion: app/(app)/student-promotion.tsx (SCHOOL_ADMIN)
                   Cascading class/section pickers
                   POST /v1/school-admin/schools/{id}/students/promote
```

### Investor Room Section Types
| sectionType | Renders |
|-------------|---------|
| `METRICS_DASHBOARD` | Coloured metric cards with delta/trend |
| `TRACTION` | Timeline milestones + narrative + customer logos |
| `FINANCIALS` | ACV/CAC/LTV + cohort retention table + revenue mix bars |
| `TEAM` | Member cards with initials avatar + bio; advisor chips |
| `PRODUCT_DEMO` | Module grid with GA/BETA badges + demo CTA |
| `FAQ` | Collapsible accordion |
| `CUSTOM` | Plain text body |

### Seed Data (live in DB)
| Resource | Count |
|----------|-------|
| Content blocks | 62 (hero, features, testimonials, pricing, how-it-works, footer, SEO, stats) |
| Demo scenarios | 3 (CBSE Urban, ICSE Boarding, IB International) |
| Investor room (`CC-SEED-A1`) | 1 × 6 sections |
| Presentation + slides | 1 × 7 slides |
| Analytics events | 17 across 6 visitor sessions |

### Implementation Status
| Phase | Scope | Status |
|-------|-------|--------|
| 1 — Foundation | Content blocks + public API + Redis cache | ✅ Complete |
| 2 — Demo Platform | Session management + 3 scenarios | ✅ Complete |
| 3 — Investor Rooms | Rooms + sections + password gate | ✅ Complete |
| 3b — Studio Expansion | Brand System, Stakeholder Journeys, Story Scenes, Trust Modules, Website Routes, Templates, Campaigns, Seed Health, Render Profile | ✅ Complete (V75–V78) |
| 3c — Public Website | Platform public website tables + seed (V79/V80) | ✅ Complete |
| 3d — Premium Public SaaS UI | Landing page hero, stats, role showcase, feature grid, platform preview, investor, demo, pricing, footer, dynamic Super Admin live-site links | ✅ Complete |
| 4 — AI Content Gen | Claude API for block copy generation | 🔲 Planned |
| 5 — Ephemeral Tenants | Real isolated tenant per demo session | 🔲 Planned |
| 6 — Analytics Dashboard | Funnel + cohort analysis UI | 🔲 Planned |

> **Note:** `POST /demo/start` returns credentials and a session record. Full ephemeral tenant provisioning (real isolated school per demo) is Phase 5.

---

## 9. Async / Event Architecture

### RabbitMQ Topology
| Exchange | Type | Queue | Routing Key | DLX |
|----------|------|-------|-------------|-----|
| `cc.notifications` | topic | `cc.notifications.email` | `notification.email` | `cc.notifications.dlx` |
| `cc.notifications` | topic | `cc.notifications.sms` | `notification.sms` | `cc.notifications.dlx` |
| `cc.notifications` | topic | `cc.notifications.push` | `notification.push` | `cc.notifications.dlx` |
| `cc.experience.events` | topic | `cc.experience.analytics` | `experience.event` | `cc.experience.dlx` |

All listeners use manual ack. On exception: `basicNack(requeue=false)` → routed to DLX.

### Scheduled Jobs
| Service | Schedule | Task |
|---------|----------|------|
| `DemoOrchestrationService` | Every 15 min | Mark expired demo sessions |
| `DemoSessionRepository` | Bulk UPDATE | `expireOldSessions(now)` |

---

## 10. AI Foundation

- **Framework:** Spring AI 1.0.0
- **Chat model:** Anthropic Claude (configurable via `ANTHROPIC_API_KEY`)
- **Embeddings:** OpenAI `text-embedding-3-small`, 1536 dimensions → pgvector
- **Mock mode:** `APP_AI_ENABLED=false` in dev — returns deterministic mock responses
- **Prompt registry:** Versioned templates in DB, activate/deactivate via API
- **Similarity search:** `ai_embeddings` table, cosine distance, tenant-scoped

---

## 11. Frontend API Client Pattern

Two Axios instances — both resolve to `http://localhost:8080` (no Vite proxy):

```typescript
// axiosInstance.ts — authenticated (Bearer token auto-injected from Zustand auth store)
// Used by: all school-admin / teacher / student / parent / super-admin pages
import api from '@/shared/api/axiosInstance';

// authClient.ts — unauthenticated (no interceptor)
// Used by: /v1/auth/* endpoints + all DSEP public pages
import authClient from '@/shared/api/authClient';
```

`api` has a 401-retry interceptor: silent token refresh → queue in-flight requests → replay on success.

---

## 12. Feature Flags

| Flag Key | Controls |
|----------|----------|
| `ATTENDANCE_ENABLED` | Attendance module |
| `FEE_MANAGEMENT_ENABLED` | Fee module |
| `EXAM_ENABLED` | Exam module |
| `HOMEWORK_ENABLED` | Homework module |
| `NOTIFICATIONS_ENABLED` | Notification dispatch |
| `AI_ENABLED` | AI features (prompts, embeddings) |
| `EXPERIENCE_PLATFORM_ENABLED` | DSEP master switch |
| `DEMO_PROVISIONING_ENABLED` | Self-serve demo sessions |
| `INVESTOR_ROOM_ENABLED` | Investor data rooms |

Flags are enforced via `@RequiresFeature` AOP. Dependencies are declared in `FeatureFlagService` — enabling `AI_ENABLED` auto-enables its prerequisites.

---

## 13. CI/CD

GitHub Actions — 4-job pipeline:
1. **backend-test** — Maven test, JaCoCo coverage report
2. **frontend-build** — `npm ci` + `npm run build` (287 modules, 0 errors)
3. **mobile-check** — `npm ci --legacy-peer-deps` + TypeScript check
4. **docker-build** — multi-stage Docker build for backend image

---

## 14. Known Architectural Constraints

| Constraint | Detail |
|------------|--------|
| Redis cache + nested Java records | `NON_FINAL` typing omits `@class` from `final` record types. Cache flat DTOs, not `List<Record>` where elements contain records. |
| Demo tenant provisioning | Phase 5 — not yet built. `POST /demo/start` returns session metadata; `loginUrl` points to `/demo/login?token=...` (no route yet). |
| Presentation viewer | Public `/presentation/:slug` React page is Phase 4. |
| pgvector image | Must use `pgvector/pgvector:pg16` — plain `postgres:16-alpine` will fail V46. |
| Experience Studio AI (Phase 4) | `AiExperienceManager` UI shell is built; Claude-backed content generation endpoint is not yet wired. |


---

# Enterprise Experience Studio Architecture

_Former source: `docs/ENTERPRISE_EXPERIENCE_STUDIO_ARCHITECTURE.md`._


Date: 2026-05-18
Status: Production blueprint + Phase-1 implementation alignment

## Executive Summary

Enterprise Experience Studio is a Super Admin controlled digital experience platform inside CloudCampus.
It allows no-code control of global branding, dynamic websites, stakeholder journeys, demo environments,
AI showcases, presentations, campaigns, templates, and trust narratives.

This document maps the target architecture to existing CloudCampus capabilities and defines an implementation
roadmap that preserves tenant isolation, RBAC, auditability, and production-grade reliability.

## 1. Full Architecture

### 1.1 Platform Layers

1. Experience Orchestration Layer
- Audience segmentation
- Journey routing
- Rendering policies
- Feature-flag gates

2. Experience Domain Layer
- Branding Engine
- Website Builder
- Stakeholder Journey Engine
- Demo Orchestration
- AI Experience Layer
- Presentation Builder
- Marketing Automation
- Template Marketplace
- Analytics and Insights
- Enterprise Trust Modules

3. Experience Data Layer
- PostgreSQL content/config tables
- Redis hot cache for rendering and flags
- MinIO/S3 for assets
- RabbitMQ event stream for analytics and automations

4. Delivery Layer
- Public web renderer
- Super Admin Studio renderer
- API gateway and edge cache/CDN

### 1.2 Existing Foundation Already Present

Backend already contains:
- Super Admin experience APIs under /v1/super-admin/experience
- Public experience APIs under /v1/experience/public
- Platform tables for content blocks, presentations, demos, investor rooms, campaigns, and events
- RabbitMQ event ingestion and listener pipeline for experience events

Frontend already contains:
- Super Admin Experience Control Center route
- Content Block editor
- Demo Scenario manager
- Investor Room builder
- Public demo and investor pages

## 2. Super Admin Module Structure

Top-level module name:
- Enterprise Experience Studio

Studio sections:
- Mission and governance
- Experience domains board
- Active management consoles
- Publishing and release controls
- Rollback and version history

## 3. Database Design

Current platform tables (already migrated):
- platform_content_blocks
- platform_presentations
- platform_presentation_slides
- platform_demo_scenarios
- platform_demo_sessions
- platform_investor_rooms
- platform_investor_room_sections
- platform_investor_room_views
- platform_campaigns
- platform_campaign_steps
- platform_campaign_enrollments
- platform_experience_events (partitioned)

Next-wave tables to add:
- platform_brand_systems
- platform_brand_tokens
- platform_brand_versions
- platform_website_routes
- platform_website_layouts
- platform_widget_registry
- platform_stakeholder_journeys
- platform_template_marketplace
- platform_ai_experience_policies
- platform_publish_releases

## 4. Dynamic Rendering Engine Architecture

Rendering key:
- renderKey = tenant + audience + role + locale + brandVersion + featureFlags + route

Policy chain:
1. Identify audience and role
2. Resolve applicable brand pack and overrides
3. Resolve route layout schema
4. Resolve widget tree and data contracts
5. Apply feature-flag and permission gates
6. Render with cache stamps and telemetry hooks

Caching:
- L1 in-memory (frontend)
- L2 Redis (server-side composition)
- CDN cache for public anonymous pages

## 5. Website Builder Architecture

No-code model:
- Route schema
- Section schema
- Widget schema
- SEO schema
- Publish schema

Editor capabilities:
- Drag-drop section ordering
- Reusable section library
- Header/footer composition
- Dynamic route templates
- Preview by audience/device/locale

Current implementation:
- Pages are created through `/v1/super-admin/public-website/pages` with SEO and builder settings.
- Sections are created through `/v1/super-admin/public-website/pages/{id}/sections`.
- The Super Admin UI offers default templates for hero, stakeholder showcase,
  trust metrics, investor narrative, demo conversion, and pricing sections.
- Every UI-created section receives a non-empty structured `configJson` with a
  template id and editable content defaults, preserving the future no-code edit
  model.
- Website publishing remains snapshot-backed through
  `/v1/super-admin/public-website/publish` with rollback via
  `/v1/super-admin/public-website/publish/rollback/{snapshotId}`.

## 6. Branding Engine Architecture

Brand model:
- Token system (color, spacing, radius, typography, motion)
- Theme variants (light/dark/high-contrast)
- Brand packs with versions
- Tenant and campaign override rules

Runtime:
- Token packs compiled to CSS variable bundles
- Render-time token override map per audience/route

## 7. Presentation Engine Architecture

Slide architecture:
- Presentation metadata
- Ordered slide graph
- Slide widgets (metric, chart, timeline, media, CTA)
- Animation profile per slide

Delivery:
- Public share links
- Password-gated mode
- Export pipeline (PDF/PPT as async job)

## 8. Marketing Engine Architecture

Automation model:
- Trigger -> enrollment -> step execution -> conversion tracking

Supported triggers:
- Signup
- Demo start
- Demo completion
- Route visit
- Manual campaign launch

Channels:
- Email
- In-app prompt
- Webhook
- WhatsApp connector (adapter)

## 9. AI Experience Architecture

Core services:
- Prompt orchestration
- Safety and policy enforcement
- Budget controller
- Usage metering
- Explainability and audit trail

Control dimensions:
- tenant-aware
- role-aware
- audience-aware
- feature-flag controlled

## 10. Analytics Architecture

Ingestion:
- Client event batches -> public events API -> RabbitMQ -> persistence

Computed views:
- Funnel by audience
- Journey drop-offs
- Demo conversion
- Feature engagement
- Campaign attribution
- AI consumption metrics

## 11. Folder Structure

Frontend target structure:

- src/features/super-admin/experience-studio/
  - components/
  - pages/
  - hooks/
  - api/
  - schemas/
  - types/
  - store/

Backend target structure:

- com/cloudcampus/experience/
  - controller/
  - dto/request/
  - dto/response/
  - entity/
  - repository/
  - service/
  - config/
  - listener/

## 12. React Component Architecture

Studio shell components:
- StudioHeader
- DomainBoard
- DomainCard
- ActiveConsoles
- PublishCenter
- ReleaseTimeline

Builder components:
- RouteCanvas
- SectionPalette
- WidgetConfigurator
- AudiencePreviewPanel
- SeoInspector

## 13. Backend Module Architecture

Core services:
- ExperienceCompositionService
- BrandResolutionService
- JourneyResolutionService
- RenderPolicyService
- PublishReleaseService
- ExperienceAuditService

## 14. API Structure

Super Admin APIs:
- /v1/super-admin/experience/*
- /v1/super-admin/experience/branding/*
- /v1/super-admin/experience/websites/*
- /v1/super-admin/experience/journeys/*
- /v1/super-admin/experience/templates/*
- /v1/super-admin/experience/campaigns/*
- /v1/super-admin/experience/presentations/*

Public APIs:
- /v1/experience/public/*
- /v1/experience/public/render/*
- /v1/experience/public/events
- /v1/experience/public/render-profile

## 15. Feature Flag Architecture

Flag scopes:
- global flag
- tenant flag
- audience flag
- route flag

Evaluation precedence:
- hard security gate -> tenant entitlement -> audience route policy -> experiment flag

## 16. Dynamic Widget Architecture

Widget contract:
- widgetType
- dataSource
- permissions
- featureRequirements
- renderConfig
- fallbackBehavior

Registry:
- server-side whitelist of widget types
- schema validation at publish time

## 17. SEO Architecture

SEO model per route:
- title templates
- meta descriptions
- OG tags
- canonical URLs
- schema.org JSON-LD
- sitemap inclusion policy

Automation:
- generate sitemap on publish
- invalidate CDN and search index queue

## 18. Multi-Tenant Rendering Strategy

Rules:
- no cross-tenant data joins in rendering
- content lookup scoped by tenant with global fallback
- RequestContext tenant enforcement in service layer
- tenant-specific cache keys

## 19. Demo Environment Strategy

Isolation model:
- ephemeral demo tenant/session
- seeded fake but realistic school datasets
- role switch profiles
- TTL cleanup and reset APIs

Safety model:
- no write paths to production tenants
- synthetic credentials and data only

## 20. Performance Optimization Strategy

Targets:
- sub-100ms config fetch from cache
- async non-blocking analytics ingestion
- precomputed route payload snapshots
- lazy load heavy widgets
- code splitting by studio domain

## 21. UI/UX Design System

Direction:
- premium enterprise visual language
- clear information hierarchy
- bold but disciplined color tokens
- role-centric storytelling templates

System foundations:
- tokenized spacing and typography
- motion presets by narrative intensity
- reusable composable primitives

## 22. Enterprise Animation Strategy

Animation principles:
- purpose-driven transitions
- staged reveal for metrics and narratives
- avoid decorative-only motion

Runtime controls:
- reduced-motion support
- per-page motion profile

## 23. Responsive Design Strategy

Breakpoints:
- mobile first composition
- adaptive navigation in studio and public experiences
- role-specific CTA placement for small screens

## 24. Production-Grade Implementation Roadmap

Phase A (now, 2-3 sprints)
- Upgrade Super Admin shell to Enterprise Experience Studio
- Stabilize existing content/demo/investor tools
- Add publish/release audit trail endpoints

Phase B (3-6 sprints)
- Branding engine data model + token runtime
- Website route/layout builder MVP
- Stakeholder journey rule engine

Phase C (6-10 sprints)
- Template marketplace
- Presentation export pipeline
- Campaign channel expansion

Phase D (10+ sprints)
- AI autonomous journey optimization
- advanced trust center widgets
- franchise/government packs

## 25. Priority-Based Execution Plan

P0
- Tenant safety and RBAC on all experience APIs
- Publish workflow with audit logs and rollback
- Rendering contract and schema validators

P1
- Branding engine + website builder MVP
- Stakeholder journey engine
- Analytics dashboards for conversion and engagement

P2
- Template marketplace and campaign intelligence
- Presentation exports and advanced storytelling modules

P3
- Autonomous AI optimization, AR/VR modules, global expansion packs

## Current Implementation Updates in This Change

Implemented now:
- Super Admin experience module upgraded to Enterprise Experience Studio shell
- Domain board covering all major platform capabilities
- Existing working consoles preserved for content blocks, demo scenarios, and investor rooms
- Super Admin navigation renamed to Experience Studio
- New persisted backend domains added for:
  - Branding systems
  - Website route configurations
  - Stakeholder journeys
- New Super Admin APIs added under /v1/super-admin/experience for:
  - /branding
  - /website-routes
  - /stakeholder-journeys
- New Studio UI managers added for:
  - Branding systems
  - Website routes
  - Stakeholder journeys
- New Flyway migration added to create foundational platform tables for the three domains

Not yet implemented in code (planned by roadmap):
- Full no-code website drag/drop builder
- Branding token runtime and brand versioning UI
- Advanced journey orchestration and runtime rendering policy evaluator
- Template marketplace and export subsystems


---

# AI Development Instructions

_Former source: `CLAUDE.md`._


## Project Overview

CloudCampus is a multi-tenant SaaS school management platform.

Architecture:

* Backend: Spring Boot 3 + Java 21
* Frontend: React + TypeScript + Vite
* Mobile: React Native
* Database: PostgreSQL
* Cache: Redis
* Storage: MinIO
* Monitoring: Prometheus + Grafana
* Email: MailHog (dev)
* Infrastructure: Docker Compose
* Authentication: JWT-based
* Multi-tenancy: tenant-aware architecture

---

# Core Engineering Principles

## 1. Never break existing functionality

Before modifying:

* inspect dependencies
* inspect related services
* inspect frontend/backend integration
* inspect tenant isolation
* inspect RBAC/security impact

Always preserve backward compatibility unless explicitly instructed.

---

## 2. Multi-tenant safety is critical

Every tenant must remain isolated.

Always verify:

* tenantId propagation
* repository filtering
* JWT tenant claims
* role isolation
* school isolation
* query scoping

Never expose cross-tenant data.

---

## 3. Security-first development

Always preserve:

* JWT validation
* password hashing
* audit logging
* RBAC checks
* rate limiting
* input validation
* tenant validation
* permission checks

Never bypass authentication/security.

---

## 4. Production-grade code only

Avoid:

* temporary hacks
* duplicate logic
* hardcoded secrets
* unstructured services
* weak validation
* poor naming
* unoptimized queries

Prefer:

* clean architecture
* SOLID principles
* reusable components
* DTO separation
* service abstraction
* proper transaction handling

---

# Project Structure

## Backend

```text
backend/
```

Tech stack:

* Spring Boot 3
* Java 21
* Maven
* PostgreSQL
* Redis
* Flyway
* JWT

---

## Frontend

```text
frontend/
```

Tech stack:

* React
* TypeScript
* Vite
* Zustand
* React Query

---

## Mobile

```text
mobile/
```

Tech stack:

* React Native
* Offline sync
* Shared auth contracts

---

## Infrastructure

```text
infra/
```

Contains:

* Docker
* Prometheus
* Grafana
* load testing
* backups
* observability

---

# Required Workflow Before Coding

## ALWAYS perform architecture analysis first

Before implementing features:

```bash
graphify query "how <feature> works"
```

Examples:

```bash
graphify query "how authentication works"
graphify query "how attendance works"
graphify query "how fee management works"
graphify query "how tenant isolation works"
```

---

# Graphify Commands

## Full extraction

```bash
graphify extract . --backend gemini --max-concurrency 2
```

---

## Incremental update

```bash
graphify update .
```

---

## Watch mode

```bash
graphify watch .
```

---

## Generate architecture tree

```bash
graphify tree
```

Open:

```bash
open graphify-out/GRAPH_TREE.html
```

---

## Generate call-flow diagrams

```bash
graphify export callflow-html
```

Open:

```bash
open graphify-out/CloudCampus-callflow.html
```

---

## Explain architecture node

```bash
graphify explain "JwtUtil"
```

---

## Find dependency path

```bash
graphify path "LoginPage()" "JwtUtil"
```

---

# Required Workflow After Coding

After ANY architecture/code changes:

```bash
graphify update .
```

After major feature/module changes:

```bash
graphify export callflow-html
graphify tree
```

---

# Backend Development Rules

## Controllers

Controllers should:

* remain thin
* validate requests
* delegate to services
* never contain business logic

---

## Services

Services should:

* contain business logic
* enforce tenant isolation
* enforce RBAC
* remain modular
* use transactions properly

---

## Repositories

Repositories must:

* scope tenant data properly
* avoid N+1 queries
* use indexes efficiently
* support soft delete

---

## DTOs

Never expose entities directly.

Use:

* request DTOs
* response DTOs
* mapper layer if needed

---

## Security

Always validate:

* JWT
* roles
* tenant access
* school ownership
* permissions

---

## Logging

Security-sensitive operations must:

* create audit logs
* include actor/user info
* include tenant context
* avoid secret leakage

---

# Frontend Development Rules

## Avoid infinite API loops

Never write:

```tsx
useEffect(() => {
  apiCall()
})
```

Always include dependencies.

---

## React Query

For login/auth mutations:

```tsx
retry: false
```

Avoid auth retry loops.

---

## State Management

Use Zustand stores cleanly.

Avoid:

* duplicated state
* stale auth state
* circular updates

---

## API Layer

Keep API calls centralized:

```text
features/*/api/
```

---

## RBAC UI

Frontend must respect:

* permissions
* roles
* tenant restrictions
* school restrictions

Never expose unauthorized UI.

---

# Mobile Development Rules

Maintain compatibility with:

* backend contracts
* auth flow
* offline sync
* shared DTOs

Avoid diverging schemas.

---

# Database Rules

## Use Flyway migrations only

Never manually modify schema.

---

## Preserve tenant isolation

Every tenant-scoped table should:

* include tenant_id
* filter correctly
* index correctly

---

## Avoid destructive migrations

Prefer:

* additive migrations
* safe transformations
* rollback-safe operations

---

# Docker Rules

Infrastructure services run in Docker:

```text
postgres
redis
minio
mailhog
grafana
prometheus
```

Backend/frontend run locally during development.

---

# Authentication Rules

Current auth stack:

* JWT access tokens
* refresh tokens
* rate limiting
* audit logging
* password reset
* tenant-aware auth

Never weaken auth/security.

---

# Rate Limiting

Development environments may temporarily relax limits.

Production must always enforce:

* login protection
* brute-force prevention
* abuse prevention

---

# Audit Logging

Critical actions must create audit events:

* login
* logout
* password changes
* tenant changes
* RBAC changes
* fee operations
* attendance operations

---

# Architecture Analysis Guidelines

Before refactoring:

```bash
graphify path "A" "B"
```

Before implementing:

```bash
graphify query "how <module> works"
```

After major changes:

```bash
graphify export callflow-html
graphify tree
```

---

# Recommended Daily Workflow

## Start day

```bash
graphify watch .
```

---

## Before coding

```bash
graphify query "how <feature> works"
```

---

## After coding

```bash
graphify update .
```

---

## End of day

```bash
graphify export callflow-html
graphify tree
```

Commit updated graph outputs.

---

# Git Rules

Commit important architecture outputs:

```text
graphify-out/graph.json
graphify-out/GRAPH_TREE.html
graphify-out/CloudCampus-callflow.html
```

Do not commit:

```text
.graphify_cache/
```

---

# Current Local Development URLs

Backend:

```text
http://localhost:8080
```

Frontend:

```text
http://localhost:5173
```

MinIO:

```text
http://localhost:9001
```

Grafana:

```text
http://localhost:3100
```

Prometheus:

```text
http://localhost:9090
```

MailHog:

```text
http://localhost:8025
```

---

# Important CloudCampus Modules

Core systems:

* Authentication
* RBAC
* Tenant Management
* School Management
* Student Lifecycle
* Attendance
* Fee Management
* Notifications
* Audit Logging
* Feature Flags
* Observability
* Reporting
* Parent/Guardian Links
* Mobile Sync

---

# AI Agent Expectations

Claude should:

* inspect architecture before changes
* avoid hallucinating APIs
* preserve module boundaries
* preserve tenant isolation
* preserve RBAC
* update Graphify outputs after changes
* maintain production-grade code quality

---

# Current Graph Stats

CloudCampus currently contains:

* ~1791 graph nodes
* ~4013 graph edges
* ~150 architecture communities

This is already a large SaaS-scale architecture.
