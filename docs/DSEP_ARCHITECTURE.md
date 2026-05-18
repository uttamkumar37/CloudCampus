# CloudCampus — Dynamic Stakeholder Experience Platform (DSEP)
## Architecture & Implementation Guide

> **Status:** Phase 1–3 Complete ✅ | Branch: `remediation/phase-1-critical-security`
> **Version:** 1.1 | Last updated: 2026-05-18

---

## 1. Overview

The Dynamic Stakeholder Experience Platform (DSEP) transforms CloudCampus into a world-class
presentation, conversion, and engagement engine — comparable to Salesforce Experience Cloud,
HubSpot CMS Hub, and Webflow Enterprise — built natively on the existing stack.

Every experience (public website, interactive demo, investor room, presentation deck) is authored
in the **Super Admin Control Center**, deployed instantly, and personalized per stakeholder role —
**zero code changes required**.

**Core Philosophy:** Content-as-Data. Every pixel the public sees is a database row.

### What's Live (as of v1.1)

| Feature | Status | URL |
|---------|--------|-----|
| Content Block engine (62 blocks seeded) | ✅ Live | `/v1/experience/public/content-blocks` |
| Interactive demo page — 3 scenarios | ✅ Live | `http://localhost:5173/demo` |
| Investor data room — Series A | ✅ Live | `http://localhost:5173/investor/CC-SEED-A1` |
| Super Admin Experience Control Center | ✅ Live | `http://localhost:5173/super-admin/experience` |
| Analytics event pipeline (RabbitMQ async) | ✅ Live | `POST /v1/experience/public/events` |
| Rich seed data (62 blocks, 6 sections, 17 events) | ✅ Seeded | — |

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                  SUPER ADMIN CONTROL CENTER                         │
│  React SPA — role: SUPER_ADMIN — /super-admin/experience/**        │
├──────────────┬─────────────────┬──────────────┬───────────────────┤
│  Content     │  Demo           │  Investor    │  Presentation     │
│  Builder     │  Orchestrator   │  Room        │  Studio           │
├──────────────┴─────────────────┴──────────────┴───────────────────┤
│                  EXPERIENCE API LAYER                               │
│    Spring Boot 3 — /v1/experience/public/** (no auth)              │
│                  — /v1/super-admin/experience/** (SUPER_ADMIN)     │
├────────────┬────────────────┬───────────────┬─────────────────────┤
│ Content    │ Demo           │ InvestorRoom  │  Event              │
│ Block Svc  │ Orchestration  │ Service       │  Publisher          │
├────────────┴────────────────┴───────────────┴─────────────────────┤
│                     DATA LAYER                                      │
│  PostgreSQL (content + analytics)  │  Redis (content block cache)  │
│  RabbitMQ (async analytics events) │  Flyway V68–V74 migrations    │
└────────────────────────────────────────────────────────────────────┘
```

### Frontend API Client Pattern

Public pages use `authClient` (unauthenticated Axios, `baseURL: http://localhost:8080`).
Super Admin pages use `api` (authenticated Axios with auto Bearer token injection).
Both resolve to the backend directly — no Vite proxy configured.

```typescript
// Public pages → authClient (no token, correct base URL)
import authClient from '@/shared/api/authClient';

// Super admin pages → api (Bearer token from auth store)
import api from '@/shared/api/axiosInstance';
```

---

## 3. Database Schema

### Tables Created (Flyway V68–V74)

| Migration | Table(s) | Purpose |
|-----------|----------|---------|
| V68 | `platform_content_blocks` | Global + per-tenant content blocks with versioning |
| V69 | `platform_presentations`, `platform_presentation_slides` | Slide deck builder |
| V70 | `platform_demo_scenarios`, `platform_demo_sessions` | Self-serve demo provisioning |
| V71 | `platform_investor_rooms`, `platform_investor_room_sections` | Private data rooms |
| V72 | `platform_campaigns`, `platform_campaign_steps` | Marketing automation (schema only) |
| V73 | `platform_experience_events` | Analytics event store (partitioned by quarter) |
| V74 | Seed data | 3 demo scenarios + 10 default content blocks |

### Seed Data (applied post-migration)

| Category | Count |
|----------|-------|
| Content blocks | 62 (hero, features, testimonials, pricing, how-it-works, footer, SEO, stats) |
| Demo scenarios | 3 (CBSE Urban, ICSE Boarding, IB International) |
| Investor rooms | 1 (`CC-SEED-A1` — Series A Data Room) |
| Investor room sections | 6 (METRICS_DASHBOARD, TRACTION, FINANCIALS, TEAM, PRODUCT_DEMO, FAQ) |
| Presentation + slides | 1 deck × 7 slides |
| Analytics events | 17 (6 visitor sessions, PAGE_VIEW / SECTION_VIEW / CTA_CLICK / DEMO_START) |

### Key Design Decisions

- **JSONB for section content** — Section content varies radically by type. JSONB avoids EAV anti-pattern; PostgreSQL GIN indexing keeps queries fast. Mapped with `@JdbcTypeCode(SqlTypes.JSON)` (Hibernate 6 native — no hypersistence dependency).
- **Partitioned analytics** — `platform_experience_events` partitioned by quarter; quarterly partitions exist through 2027 Q1.
- **Tenant override pattern** — `platform_content_blocks` supports `tenant_id=NULL` (global) and per-tenant overrides (same `block_key`). Tenant-specific block always wins.
- **Sections in separate table** — `platform_investor_room_sections` is a child table of `platform_investor_rooms`. The GET endpoint joins and embeds sections in the response — no second API call required from the frontend.

---

## 4. Backend Package Structure

### Actual files created under `com.cloudcampus.experience/`

```
config/
  ExperienceQueueConfig.java        ← RabbitMQ: exchange cc.experience.events,
                                       queue cc.experience.analytics, DLX cc.experience.dlx

controller/
  PublicExperienceController.java   ← GET /v1/experience/public/** (no auth)
                                       content-blocks, demo-scenarios, demo/start, events
  InvestorRoomController.java       ← GET/POST /v1/experience/public/investor/**
  SuperAdminExperienceController.java ← /v1/super-admin/experience/**

dto/
  request/
    ContentBlockCreateRequest.java
    ContentBlockUpdateRequest.java
    DemoStartRequest.java
    IngestEventsRequest.java
    InvestorRoomCreateRequest.java
  response/
    ContentBlockResponse.java
    DemoScenarioResponse.java
    DemoSessionResponse.java
    InvestorRoomResponse.java         ← includes List<InvestorRoomSectionResponse> sections
    InvestorRoomSectionResponse.java
    PresentationResponse.java

entity/
  ContentBlock.java
  DemoScenario.java
  DemoSession.java
  ExperienceEvent.java
  InvestorRoom.java
  InvestorRoomSection.java            ← maps platform_investor_room_sections
  Presentation.java

repository/
  ContentBlockRepository.java         ← tenant override + global fallback queries
  DemoScenarioRepository.java
  DemoSessionRepository.java
  ExperienceEventRepository.java
  InvestorRoomRepository.java
  InvestorRoomSectionRepository.java  ← findByRoomIdAndVisibilityOrderByPosition
  PresentationRepository.java

service/
  ContentBlockService.java            ← @Cacheable exp:block (2 min TTL)
  DemoOrchestrationService.java       ← session token generation, @Scheduled cleanup
  ExperienceEventPublisher.java       ← RabbitMQ publish, never throws on failure
  InvestorRoomService.java            ← getRoom() joins sections; NOT cached (nested records)
  PresentationService.java

listener/
  ExperienceEventListener.java        ← @RabbitListener, manual ack, DLX on exception
```

### Why `InvestorRoomService.getRoom()` is not cached

Spring Redis uses `NON_FINAL` default typing with `@class` metadata. Java records are `final`,
so `List<InvestorRoomSectionResponse>` elements don't receive `@class`. Reading back from Redis
fails with `InvalidTypeIdException`. Since investor rooms are low-traffic, the DB query cost is
negligible and the cache was removed in favour of correctness.

---

## 5. API Reference

### Public Endpoints (no auth required) — all implemented

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/experience/public/content-blocks?keys=k1,k2&locale=en` | Batch fetch content blocks |
| GET | `/v1/experience/public/demo-scenarios` | List active demo scenarios |
| POST | `/v1/experience/public/demo/start` | Start self-serve demo session |
| GET | `/v1/experience/public/investor/{roomCode}` | Room metadata + all VISIBLE sections |
| POST | `/v1/experience/public/investor/{roomCode}/access` | Verify password |
| POST | `/v1/experience/public/events` | Ingest analytics events (async, batch) |

### Super Admin Endpoints (SUPER_ADMIN role) — all implemented

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/super-admin/experience/content-blocks` | List all global blocks |
| POST | `/v1/super-admin/experience/content-blocks` | Create draft block |
| PUT | `/v1/super-admin/experience/content-blocks/{id}` | Update block content |
| POST | `/v1/super-admin/experience/content-blocks/{id}/publish` | Publish draft |
| GET | `/v1/super-admin/experience/demo-scenarios` | List all scenarios |
| GET | `/v1/super-admin/experience/investor-rooms` | List active rooms |
| POST | `/v1/super-admin/experience/investor-rooms` | Create room |
| DELETE | `/v1/super-admin/experience/investor-rooms/{id}` | Archive room |
| GET | `/v1/super-admin/experience/presentations` | List presentations |
| POST | `/v1/super-admin/experience/presentations/{id}/publish` | Publish deck |

---

## 6. Caching Strategy

| Cache Key Pattern | TTL | Status |
|-------------------|-----|--------|
| `exp:block:{key}:{locale}:{tenantId}` | 2 min | ✅ Active — `@Cacheable` on ContentBlockService |
| `exp:scenarios` | 10 min | ✅ Active — demo scenario list |
| `exp:presentation:{slug}` | 5 min | ✅ Active |
| `exp:room:{roomCode}` | — | ❌ Removed — nested record list incompatible with Redis NON_FINAL typing |

**Note:** All cache regions use `GenericJackson2JsonRedisSerializer` with `NON_FINAL` default typing
from `CacheConfig.java`. Java record fields that are themselves records (or `List<record>`) cannot
be cached without a custom serializer. Avoid `@Cacheable` on methods returning nested record graphs.

---

## 7. Analytics Event Pipeline

```
Visitor action on public page
  → Frontend batches events (debounce 2s, max 10 per batch, keepalive fetch)
  → POST /v1/experience/public/events  (fire-and-forget, <10ms response)
  → ExperienceEventPublisher → RabbitMQ exchange: cc.experience.events
                                routing key: experience.event
  → ExperienceEventListener (async consumer, manual ack)
      → INSERT INTO platform_experience_events (partitioned by quarter)
      → basicNack + requeue=false on exception → routed to cc.experience.dlx
```

IP privacy: `SHA-256(ip + ":" + LocalDate.now())` stored — never raw IP (GDPR compliant).

---

## 8. Demo Tenant Provisioning Flow

```
POST /v1/experience/public/demo/start  { scenarioSlug, email?, utm* }
  1. Load DemoScenario by slug
  2. Generate visitor_token (128-bit SecureRandom, Base62 alphabet)
  3. Create DemoSession record (status=ACTIVE, expires_at=NOW()+ttl)
  4. Return { sessionToken, loginUrl, demoUsername, demoPassword, expiresAt }

Cleanup: @Scheduled(fixedDelay=15min) marks expired sessions EXPIRED
```

Note: In v1.1, demo session creation returns credentials directly. Full ephemeral tenant
provisioning (steps 3a–3d) is Phase 2 scope.

---

## 9. Security Model

| Concern | Approach |
|---------|----------|
| Public endpoint protection | SecurityConfig: `/v1/experience/public/**` → `permitAll()` |
| IP privacy | SHA-256(IP + daily_salt) stored — never raw IP (GDPR) |
| Investor room access | bcrypt password verification (`BCrypt.checkpw`) |
| Demo isolation | DemoSession tracks visitor token; tenant provisioning is Phase 2 |
| Content block safety | Only `published=true` blocks served on public endpoints |
| Analytics consent | `consentGiven` flag in Zustand store checked before any event fires |
| Super admin CRUD | All `/v1/super-admin/**` paths require `SUPER_ADMIN` role (SecurityConfig) |

---

## 10. Frontend Structure (actual)

```
frontend/src/features/experience/
├── api/
│   ├── experienceApi.ts        ← React Query hooks; uses authClient (public, no token)
│   └── analyticsTracker.ts     ← event batching, debounce 2s, max 10, keepalive
├── pages/
│   ├── DemoPage.tsx            ← scenario picker cards → email capture → DemoReady
│   └── InvestorRoomPage.tsx    ← dark theme; renders 6 section types; collapsible FAQ
└── store/
    └── experienceStore.ts      ← Zustand persist: visitorId, consentGiven, UTM params

frontend/src/features/super-admin/experience/
├── ExperienceControlCenter.tsx ← 3-tab control center (tab card navigation)
├── ContentBlockEditor.tsx      ← block list + search + JSON edit modal + publish
├── DemoScenarioManager.tsx     ← scenario cards with profile details + feature pills
└── InvestorRoomBuilder.tsx     ← room list + create modal + copy link + open room
```

### Route registration (router.tsx)

```tsx
// Public — no auth
<Route path="/demo"                   element={<DemoPage />} />
<Route path="/investor/:roomCode"     element={<InvestorRoomPage />} />

// Super Admin — SUPER_ADMIN role
<Route path="experience"             element={<ExperienceControlCenter />} />
```

### Investor Room Section Types (all rendered in InvestorRoomPage)

| sectionType | Renders |
|-------------|---------|
| `METRICS_DASHBOARD` | Coloured metric cards with delta/trend |
| `TRACTION` | Timeline + narrative + customer logo pills |
| `FINANCIALS` | ACV/CAC/LTV cards + cohort retention table + revenue mix bars |
| `TEAM` | Member cards with initials avatar + bio; advisor chips |
| `PRODUCT_DEMO` | Module grid with GA/BETA status badges + demo CTA link |
| `FAQ` | Collapsible accordion |
| `CUSTOM` | Plain text / whitespace-preserved body |

---

## 11. Performance Targets

| Endpoint | P50 | P95 |
|----------|-----|-----|
| Public content block batch | <20ms | <50ms |
| Demo session start | <500ms | <2s |
| Investor room with 6 sections | <50ms | <150ms |
| Analytics event ingest (batch 10) | <10ms | <30ms |

---

## 12. Implementation Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 — Foundation | Flyway V68–V74 + ContentBlockService + public API + Redis caching | ✅ Complete |
| 2 — Demo Platform | DemoOrchestrationService + session management + 3 scenarios seeded | ✅ Complete |
| 3 — Investor Rooms | Rooms + sections + access gates + 6-section Series A room seeded | ✅ Complete |
| 4 — AI Content Generation | Claude API integration for block copy generation | 🔲 Planned |
| 5 — Ephemeral Demo Tenants | Full isolated tenant provisioning per demo session | 🔲 Planned |
| 6 — Marketing Automation | Campaign orchestrator + drip engine (schema exists in V72) | 🔲 Planned |
| 7 — Analytics Dashboard | Full metrics UI + funnel + cohort analysis | 🔲 Planned |

---

## 13. Known Constraints & Future Work

- **Demo tenant provisioning** — `POST /demo/start` returns session metadata; it does NOT yet
  create an isolated tenant. Prospect credentials point to a placeholder login URL.
- **Redis cache + nested records** — Avoid `@Cacheable` on methods that return `List<JavaRecord>`
  until a custom serializer is added to `CacheConfig`.
- **Campaign tables (V72)** — Schema exists; `Campaign` and `CampaignStep` entities not yet
  implemented. Phase 6 scope.
- **Presentation viewer** — `PresentationService` and slides are queryable via API; a public
  `/presentation/:slug` React page is Phase 4 scope.
