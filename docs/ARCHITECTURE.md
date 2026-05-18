# CloudCampus — Architecture Reference

**Version:** 2.1 | **Updated:** 2026-05-18 | **Branch:** `main`

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
```

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
