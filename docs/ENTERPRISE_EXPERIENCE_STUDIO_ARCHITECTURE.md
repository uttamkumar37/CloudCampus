# CloudCampus Enterprise Experience Studio

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
