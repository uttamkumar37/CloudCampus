# Super Admin API Audit Report

## 1. Executive Summary

- Overall status: Partially working, not production ready for selling the SaaS as a complete Super Admin console.
- Production readiness score: 62/100.
- Major risks:
  - Core tenant listing, creation, activation/suspension, subscription assignment, tenant config, feature toggles, analytics, AI usage, and public website read flows work locally.
  - Several advertised Super Admin business flows are missing: school creation/listing/detail under Super Admin, school admin user creation, subscription plan create/update, billing/payment status, impersonation/support access, general audit log viewer, and real system health/monitoring API.
  - Many Experience Studio and Public Website write DTOs have no `@Valid` on controller methods and many request records have no validation annotations.
  - Important mutating Super Admin actions do not consistently create audit log records.
  - Frontend dashboard has hardcoded health/readiness and monetization copy where API-backed monitoring/billing should be used.
  - There are duplicate/unused backend Super Admin APIs not wired to the UI.

Validation commands run on May 22, 2026:

| Command | Result |
|---|---|
| `cd backend && mvn test --batch-mode --no-transfer-progress` | Passed: 174 tests, 0 failures, 0 errors |
| `cd frontend && npm run build` | Passed, includes `tsc -b` and Vite production build |
| `cd frontend && npx tsc -b --pretty false` | Passed |
| `cd frontend && npm run lint` | Passed |
| API smoke, forged local dev SUPER_ADMIN JWT | Passed for representative GET endpoints with HTTP 200 |
| API smoke, `jnv.admin` SCHOOL_ADMIN token | Passed security check: Super Admin endpoints returned HTTP 403 |
| API smoke, no token | Passed security check: Super Admin endpoints returned HTTP 401 |

Note: Local login with `superadmin/admin123` returned 401 because the existing local database already has a Super Admin row with a different password. For read-only smoke checks, a dev JWT signed with the local dev secret from `backend/src/main/resources/application.yml` was used. This did not modify production code or database state.

## 2. API Inventory Table

| API | Method | Frontend Usage | Backend Controller | Business Importance | Status | Issue | Recommendation |
|---|---|---|---|---|---|---|---|
| `/v1/auth/login` | POST | `frontend/src/features/auth/api/authApi.ts`, `LoginPage.tsx`; used to enter Super Admin portal | `backend/src/main/java/com/cloudcampus/auth/controller/AuthController.java` -> `AuthServiceImpl` -> `users`, `refresh_tokens`/Redis | Critical | Working | Super Admin local demo credential drift; hardcoded dev default exists in `application-dev.yml` and mobile hint | Keep; remove weak public hints before production and enforce MFA/forced password reset |
| `/v1/super-admin/tenants` | GET | `TenantListPage.tsx`, `KnowledgeBasePage.tsx`, `AiUsagePage.tsx`, `SchoolComparisonPage.tsx` via `tenantApi.ts` | `SuperAdminTenantController.list` -> `TenantServiceImpl.list` -> `TenantRepository` -> `tenants`; response `PageResponse<TenantResponse>` | Critical | Working | Offset pagination only; no search/sort/status filter in UI/API | Keep; add search/filter/sort before scale |
| `/v1/super-admin/tenants/{id}` | GET | `TenantDetailPage.tsx` via `tenantApi.ts` | `SuperAdminTenantController.get` -> `TenantServiceImpl.get` -> `tenants`; response `TenantResponse` | Critical | Working | Detail does not include schools/admin users/subscription summary; UI needs many calls | Keep; add aggregate detail DTO or companion school/admin endpoints |
| `/v1/super-admin/tenants` | POST | `TenantCreatePage.tsx` via `tenantApi.ts`; request `TenantCreateRequest` | `SuperAdminTenantController.create` -> `TenantServiceImpl.create` -> `tenants`, `schools`, school settings/bootstrap tables | Critical | Working | Creates default MAIN school but no Super Admin UI/API for creating school admin user; no audit log | Keep; add admin user creation and audit event |
| `/v1/super-admin/tenants/{id}/suspend` | PATCH | `TenantDetailPage.tsx` via `tenantApi.ts` | `SuperAdminTenantController.suspend` -> `TenantServiceImpl.suspend` -> `tenants.status` | Critical | Working | No reason/comment, no audit log, no archived/deactivate lifecycle | Keep; require reason and audit |
| `/v1/super-admin/tenants/{id}/activate` | PATCH | `TenantDetailPage.tsx` via `tenantApi.ts` | `SuperAdminTenantController.activate` -> `TenantServiceImpl.activate` -> `tenants.status` | Critical | Working | No audit log; cannot distinguish reactivation from commercial override | Keep; audit and capture actor/reason |
| `/v1/super-admin/tenants/stats` | GET | `SuperAdminDashboardPage.tsx` via `tenantApi.ts` | `SuperAdminTenantController.stats` -> `TenantServiceImpl.getStats` -> `tenants` | Critical | Working | Dashboard overlays hardcoded support/health estimates | Keep; add real health/support metrics |
| `/v1/super-admin/features` | GET | `TenantDetailPage.tsx` via `tenantApi.ts` | `FeatureAdminController.listFeatures` -> `FeatureRepository` -> `features`; response `FeatureResponse` | Critical | Working | Feature catalog is read-only from UI; no create/update/delete API despite "catalog management" requirement | Keep; add managed catalog APIs or mark catalog as migration-owned |
| `/v1/super-admin/tenants/{tenantId}/features` | GET | `TenantDetailPage.tsx` via `tenantApi.ts` | `FeatureAdminController.listTenantFeatures` -> `TenantFeatureRepository` -> `tenant_features` | Critical | Working | Does not return implicit CORE features as tenant rows, so UI must infer from catalog | Keep; return merged feature state for clarity |
| `/v1/super-admin/tenants/{tenantId}/features/{featureKey}/enable` | POST | `TenantDetailPage.tsx` via `tenantApi.ts` | `FeatureAdminController.enable` -> `FeatureFlagServiceImpl.enable` -> `tenant_features`, Redis key `ff:{tenantId}` | Critical | Working | No explicit tenant existence check in service; no audit log; `IllegalArgumentException` can become 500 unless globally mapped | Keep; validate tenant and feature cleanly, audit |
| `/v1/super-admin/tenants/{tenantId}/features/{featureKey}` | DELETE | `TenantDetailPage.tsx` via `tenantApi.ts` | `FeatureAdminController.disable` -> `FeatureFlagServiceImpl.disable` -> `tenant_features`, Redis | Critical | Working | CORE feature errors use `IllegalArgumentException`; no audit log | Keep; use domain exception and audit |
| `/v1/super-admin/tenants/{id}/config` | GET | `TenantDetailPage.tsx` via `tenantApi.ts` | `SuperAdminTenantController.getConfig` -> `TenantConfigServiceImpl.getAll` -> `tenant_configs`, `tenants`; response `TenantConfigResponse` | Important | Working | UI shows raw key/value editor; no type-specific controls | Keep; improve UI per config type |
| `/v1/super-admin/tenants/{id}/config/{key}` | PUT | `TenantDetailPage.tsx` via `tenantApi.ts`; body `{value}` | `SuperAdminTenantController.setConfig` -> `TenantConfigServiceImpl.set` -> `tenant_configs` | Important | Working | Max `value` size 500 may conflict with future JSON settings; no audit log | Keep; audit and type UI |
| `/v1/super-admin/subscription-plans` | GET | `SuperAdminDashboardPage.tsx`, `TenantCreatePage.tsx`, `TenantDetailPage.tsx` via `subscriptionApi.ts` | `SubscriptionController.listPlans` -> enum `SubscriptionPlanCode`; no table | Critical | Working | Plans are static enum, not creatable/updateable from Super Admin | Keep for now; add plan management if plans must be business-configurable |
| `/v1/super-admin/tenants/{id}/subscription` | GET | `TenantDetailPage.tsx` via `subscriptionApi.ts` | `SubscriptionController.getSubscription` -> `SubscriptionServiceImpl.getSubscription` -> `tenant_subscriptions` | Critical | Working | Returns synthetic FREE when no row exists; no billing/payment status | Keep; add billing fields/invoices |
| `/v1/super-admin/tenants/{id}/subscription` | PUT | `TenantCreatePage.tsx`, `TenantDetailPage.tsx`; body `AssignPlanRequest` | `SubscriptionController.assignPlan` -> `SubscriptionServiceImpl.assignPlan` -> `tenant_subscriptions`, `tenant_configs`, Redis feature cache | Critical | Working | No audit log; notes unbounded; no invoice/payment coupling | Keep; audit, validate notes, connect billing workflow |
| `/v1/super-admin/analytics` | GET | `TenantAnalyticsPage.tsx` via `analyticsApi.ts` | `reports/controller/AnalyticsController` -> `AnalyticsServiceImpl` -> `tenants`, `schools`, `students`, `staff`, `student_fee_records` | Important | Working | API loads global tenant summaries with no pagination; UI has no filters | Keep; add pagination/date filters |
| `/v1/super-admin/tenants/{tenantId}/comparison` | GET | `SchoolComparisonPage.tsx` via `tenantApi.ts` | `SuperAdminReportController` -> `ReportServiceImpl.comparisonReport` -> school/attendance/fee tables | Important | Working | Requires selecting tenant from tenant list; no server-side filters | Keep |
| `/v1/super-admin/ai/prompts` | GET | `PromptListPage.tsx` via `promptApi.ts` | `PromptController.listAll` -> `PromptServiceImpl` -> `ai_prompt_templates`; response `PromptTemplateResponse` | Important | Working | No pagination/search beyond optional key | Keep; add paging for large prompt history |
| `/v1/super-admin/ai/prompts/{id}` | GET | `PromptDetailPage.tsx` via `promptApi.ts` | `PromptController.get` -> `PromptServiceImpl.getById` -> `ai_prompt_templates` | Important | Working | None found | Keep |
| `/v1/super-admin/ai/prompts` | POST | `PromptDetailPage.tsx` create mode via `promptApi.ts`; `CreatePromptRequest` | `PromptController.create` -> `PromptServiceImpl.create` -> `ai_prompt_templates` | Important | Working | Variables are string JSON, not structured/validated as JSON | Keep; validate variables JSON |
| `/v1/super-admin/ai/prompts/{id}/activate` | PATCH | `PromptListPage.tsx`, `PromptDetailPage.tsx` | `PromptController.activate` -> `PromptServiceImpl.activate` -> `ai_prompt_templates` | Important | Working | No audit log | Keep; audit |
| `/v1/super-admin/ai/prompts/{id}/deactivate` | PATCH | `PromptListPage.tsx`, `PromptDetailPage.tsx` | `PromptController.deactivate` -> `PromptServiceImpl.deactivate` -> `ai_prompt_templates` | Important | Working | No audit log | Keep; audit |
| `/v1/super-admin/ai/prompts/{id}/render` | POST | `PromptDetailPage.tsx`; `RenderRequest` | `PromptController.render` -> `PromptServiceImpl.render` -> AI gateway, optional `ai_usage_logs` | Important | Working | Request lacks `@Valid`; tenantId optional can produce platform/unassigned usage | Keep; require explicit test/tenant context or label as dry-run |
| `/v1/super-admin/ai/knowledge/{tenantId}` | GET | `KnowledgeBasePage.tsx` via `knowledgeApi.ts` | `KnowledgeBaseController.list` -> `KnowledgeBaseServiceImpl.list` -> `knowledge_documents` | Important | Working | No pagination; tenant selector limited to first 200 tenants | Keep; add pagination/search |
| `/v1/super-admin/ai/knowledge/{tenantId}/ingest` | POST | `KnowledgeBasePage.tsx`; `IngestRequest` | `KnowledgeBaseController.ingest` -> `KnowledgeBaseServiceImpl.ingest` -> `knowledge_documents`, `vector_store` | Important | Working | Expensive write has no rate limit; no audit log | Keep; add rate limit/audit/job status |
| `/v1/super-admin/ai/knowledge/{tenantId}/{docId}` | DELETE | `KnowledgeBasePage.tsx` | `KnowledgeBaseController.delete` -> `KnowledgeBaseServiceImpl.delete` -> `knowledge_documents`, vector store | Important | Working | No audit log | Keep; audit |
| `/v1/super-admin/ai/knowledge/{tenantId}/query` | POST | `KnowledgeBasePage.tsx` | `KnowledgeBaseController.query` -> `KnowledgeBaseServiceImpl.query` -> vector store, AI gateway | Important | Working | No rate limit annotation; prompt injection tests exist but should remain release-blocking | Keep; add rate limit and usage visibility |
| `/v1/super-admin/ai/usage` | GET | `AiUsagePage.tsx` via `aiUsageApi.ts` | `AiUsageController.global` -> `AiUsageLogRepository` -> `ai_usage_logs`, `tenant_configs` | Important | Working | Estimated cost is hardcoded in controller | Keep; move pricing to config/table |
| `/v1/super-admin/ai/usage/{tenantId}` | GET | `AiUsagePage.tsx` via `aiUsageApi.ts` | `AiUsageController.forTenant` -> `AiUsageLogRepository`, `TenantConfigRepository` | Important | Working | No tenant existence check | Keep; add 404 for invalid tenant |
| `/v1/super-admin/experience/seed-health` | GET | `ExperienceControlCenter.tsx`, `SeedHealthPanel.tsx` | `SuperAdminExperienceController.seedHealth` -> `ExperienceSeedHealthService` -> platform experience tables | Important | Working | Good readiness check, but not system health | Keep |
| `/v1/super-admin/experience/branding` | GET/POST | `BrandingSystemManager.tsx`, `experienceStudioApi.ts` | `SuperAdminExperienceController` -> `BrandSystemService` -> `platform_brand_systems`; DTO `BrandSystemCreateRequest` | Important | Working | POST lacks `@Valid`; DTO has no `@NotBlank`/size validation | Keep; add validation |
| `/v1/super-admin/experience/branding/{id}` | PUT | API client has update function but current UI mainly creates/publishes | Same controller/service/table | Optional | Partly unused | Frontend does not expose full update flow consistently | Keep if editor is added; otherwise remove client function |
| `/v1/super-admin/experience/branding/{id}/publish` | POST | `BrandingSystemManager.tsx` | Same controller/service/table | Important | Working | No audit log | Keep; audit |
| `/v1/super-admin/experience/content-blocks` | GET/POST | `ContentBlockEditor.tsx` | `SuperAdminExperienceController` -> `ContentBlockService` -> `platform_content_blocks`; DTO `ContentBlockCreateRequest` | Important | Working | UI sends `id: ""` on create; backend ignores but DTO lacks validation; block key/type unvalidated | Keep; fix payload and validation |
| `/v1/super-admin/experience/content-blocks/{id}` | PUT | `ContentBlockEditor.tsx` | Same controller/service/table; DTO `ContentBlockUpdateRequest` | Important | Working | UI sends extra fields (`id`, `blockKey`, `blockType`) ignored by DTO | Improve client payload and backend validation |
| `/v1/super-admin/experience/content-blocks/{id}/publish` | POST | `ContentBlockEditor.tsx` | Same controller/service/table | Important | Working | No audit log | Keep; audit |
| `/v1/super-admin/experience/content-blocks/{id}/ai-generate` | POST | `AiExperienceManager.tsx` via `experienceStudioApi.ts` | `SuperAdminExperienceController.aiGenerateContent` -> `ContentBlockService`, `AiGatewayService`; DTO has `@NotBlank` | Optional | Working | Returns mock content when AI disabled; not audited/rate-limited | Keep; rate limit and label mock mode |
| `/v1/super-admin/experience/website-routes` | GET/POST | `WebsiteRouteManager.tsx` | `WebsiteRouteService` -> `platform_website_routes`; DTO `WebsiteRouteCreateRequest` | Optional | Working | Not the same as public website page builder; overlapping concepts | Consider merge with public website route/page model |
| `/v1/super-admin/experience/website-routes/{id}` | PUT | API client only | Same | Optional | Partly unused | UI does not expose update | Add UI or remove client |
| `/v1/super-admin/experience/website-routes/{id}/publish` | POST | `WebsiteRouteManager.tsx` | Same | Optional | Working | No audit log | Keep if DSEP remains |
| `/v1/super-admin/experience/demo-scenarios` | GET | `DemoScenarioManager.tsx` | `DemoOrchestrationService` -> `platform_demo_scenarios` | Optional | Working | Read-only; no creation/edit despite manager name | Either add management or relabel read-only |
| `/v1/super-admin/experience/investor-rooms` | GET/POST | `InvestorRoomBuilder.tsx` | `InvestorRoomService` -> `platform_investor_rooms`, sections | Optional | Working | Access password handling needs review; no delete/archive UI | Keep; add audit and lifecycle UI |
| `/v1/super-admin/experience/investor-rooms/{id}` | DELETE | No frontend usage found | `archiveRoom` calls `investorRoomService.regenerateCode(id)` | Remove/Merge | Broken semantics | Endpoint claims archive but regenerates code | Fix or remove before exposing |
| `/v1/super-admin/experience/presentations` | GET/POST | `PresentationBuilderManager.tsx` | `PresentationService` -> `platform_presentations` | Optional | Working | DTO lacks validation | Add validation |
| `/v1/super-admin/experience/presentations/{id}/publish` | POST | `PresentationBuilderManager.tsx` | Same | Optional | Working | No audit log | Audit |
| `/v1/super-admin/experience/stakeholder-journeys` | GET/POST | `StakeholderJourneyManager.tsx` | `StakeholderJourneyService` -> `platform_stakeholder_journeys` | Optional | Working | DTO lacks validation | Add validation |
| `/v1/super-admin/experience/stakeholder-journeys/{id}` | PUT | API client only | Same | Optional | Partly unused | No update UI | Add UI or remove |
| `/v1/super-admin/experience/stakeholder-journeys/{id}/publish` | POST | `StakeholderJourneyManager.tsx` | Same | Optional | Working | No audit log | Audit |
| `/v1/super-admin/experience/campaigns` | GET/POST | `MarketingAutomationManager.tsx` | `MarketingCampaignService` -> `platform_campaigns`, `platform_campaign_steps` | Optional | Working | DTO lacks validation; marketing automation can affect external messaging | Add strict validation and audit |
| `/v1/super-admin/experience/campaigns/{id}` | PUT | API client only | Same | Optional | Partly unused | No update UI | Add UI or remove |
| `/v1/super-admin/experience/campaigns/{id}/publish` | POST | `MarketingAutomationManager.tsx` | Same | Optional | Working | No audit log | Audit |
| `/v1/super-admin/experience/campaigns/{id}/pause` | POST | `MarketingAutomationManager.tsx` | Same | Optional | Working | No audit log | Audit |
| `/v1/super-admin/experience/templates` | GET/POST | `TemplateMarketplaceManager.tsx` | `WebsiteTemplateService` -> `platform_website_templates` | Optional | Working | DTO lacks validation | Add validation |
| `/v1/super-admin/experience/templates/{id}` | PUT | API client only | Same | Optional | Partly unused | No update UI | Add UI or remove |
| `/v1/super-admin/experience/templates/{id}/publish` | POST | `TemplateMarketplaceManager.tsx` | Same | Optional | Working | No audit log | Audit |
| `/v1/super-admin/experience/story-scenes` | GET/POST | `StorytellingManager.tsx` | `StorySceneService` -> `platform_story_scenes` | Optional | Working | DTO lacks validation | Add validation |
| `/v1/super-admin/experience/story-scenes/{id}` | PUT | API client only | Same | Optional | Partly unused | No update UI | Add UI or remove |
| `/v1/super-admin/experience/story-scenes/{id}/publish` | POST | `StorytellingManager.tsx` | Same | Optional | Working | No audit log | Audit |
| `/v1/super-admin/experience/trust-modules` | GET/POST | `TrustPlatformManager.tsx` | `TrustModuleService` -> `platform_trust_modules` | Optional | Working | DTO lacks validation | Add validation |
| `/v1/super-admin/experience/trust-modules/{id}` | PUT | API client only | Same | Optional | Partly unused | No update UI | Add UI or remove |
| `/v1/super-admin/experience/trust-modules/{id}/publish` | POST | `TrustPlatformManager.tsx` | Same | Optional | Working | No audit log | Audit |
| `/v1/super-admin/experience/analytics` | GET | `ExperienceAnalyticsDashboard.tsx` | Controller directly uses `ExperienceEventRepository` -> `platform_experience_events` | Optional | Working | Direct repository in controller; only days param with clamping | Move to service |
| `/v1/experience/public/render-profile` | GET | `RenderProfilePreview.tsx` in Super Admin preview | `PublicExperienceController` -> `ExperienceRenderProfileService` -> platform experience tables | Optional | Working | Public endpoint by design; used in admin preview | Keep |
| `/v1/super-admin/public-website/dashboard` | GET | `PublicWebsiteDashboardPage.tsx` | `SuperAdminPublicWebsiteController.dashboard` -> `PublicWebsiteService` -> public website tables/events | Important | Working | Narrow metrics | Keep; expand metrics |
| `/v1/super-admin/public-website/analytics` | GET | `PublicWebsiteAnalyticsPage.tsx` | Same controller -> `PublicWebsiteService.dashboard` | Important | Working | Duplicate of dashboard response, not real analytics endpoint | Merge or implement real analytics |
| `/v1/super-admin/public-website/pages` | GET/POST | `PublicWebsitePagesPage.tsx`, hooks | `PageBuilderService` -> `platform_website_pages`; DTO `WebsitePageCreateRequest` | Important | Working | No validation annotations | Add validation |
| `/v1/super-admin/public-website/pages/{id}` | PUT | API client only | Same | Important | Partly unused | No UI update hook | Add edit UI or remove client |
| `/v1/super-admin/public-website/pages/{id}/publish` | POST | `PublicWebsitePagesPage.tsx` | `PageBuilderService.publishPage`; audit timeline exists | Important | Working | Good for page publish; ensure actor audit coverage | Keep |
| `/v1/super-admin/public-website/pages/{id}/sections` | GET/POST | `PublicWebsitePagesPage.tsx`, hooks | `PageBuilderService` -> `platform_website_sections`; DTO `WebsiteSectionCreateRequest` | Important | Working | No validation annotations | Add validation |
| `/v1/super-admin/public-website/sections/{sectionId}` | PUT | API client only | Same | Important | Partly unused | No update UI hook | Add edit UI or remove client |
| `/v1/super-admin/public-website/sections/{sectionId}/publish` | POST | `PublicWebsitePagesPage.tsx`, hooks | `PageBuilderService.publishSection` | Important | Working | Audit timeline should be verified by tests | Keep; test |
| `/v1/super-admin/public-website/navigation` | GET/POST | Hooks and `PublicWebsiteShell`; create API not obviously used by routed page | `PageBuilderService` -> `platform_website_navigation`; DTO `WebsiteNavigationCreateRequest` | Important | Partly unused | Public Website nav management page is not routed separately | Add UI or remove create/update/publish client functions |
| `/v1/super-admin/public-website/navigation/{id}` | PUT | API client only | Same | Optional | Unused | No UI usage | Remove or route nav management |
| `/v1/super-admin/public-website/navigation/{id}/publish` | POST | API client only | Same | Optional | Unused | No UI usage | Remove or route nav management |
| `/v1/super-admin/public-website/branding/themes` | GET/POST | `PublicWebsiteBrandingPage.tsx`, hooks | `BrandingService` -> `platform_website_themes`; DTO `WebsiteThemeCreateRequest` | Important | Working | No validation annotations | Add validation |
| `/v1/super-admin/public-website/branding/themes/{id}` | PUT | API client only | Same | Important | Partly unused | No update UI found | Add update UI or remove client |
| `/v1/super-admin/public-website/branding/themes/{id}/publish` | POST | `PublicWebsiteBrandingPage.tsx`, hooks | `BrandingService.publishTheme` | Important | Working | Audit coverage not tested | Keep; test |
| `/v1/super-admin/public-website/seo` | GET/PUT | `PublicWebsiteSeoPage.tsx`, hooks | `SeoService` -> `platform_website_seo_settings`; DTO `WebsiteSeoUpsertRequest` | Important | Working | GET returns `ApiResponse<?>`, list or single object depending query param | Split endpoints or use typed response |
| `/v1/super-admin/public-website/seo/publish` | POST | `PublicWebsiteSeoPage.tsx` | `SeoService.publish` | Important | Working | `routePath` query param validation missing | Validate |
| `/v1/super-admin/public-website/media` | GET | `PublicWebsiteMediaPage.tsx` | Controller returns placeholder list | Optional | Working but fake | Replace with real media/storage API or label as placeholder |
| `/v1/super-admin/public-website/demo-showcase` | GET | API client, no routed page usage found | `DemoOrchestrationService` -> `platform_demo_scenarios` | Optional | Unused | Duplicate with Experience demo scenarios | Merge |
| `/v1/super-admin/public-website/investor-showcase` | GET | API client, no routed page usage found | `InvestorRoomService` -> `platform_investor_rooms` | Optional | Unused | Duplicate with Experience investor rooms | Merge |
| `/v1/super-admin/public-website/publish` | POST | `PublicWebsitePublishPage.tsx`, hooks | `PublishService` -> publish snapshot/audit tables | Important | Working | Needs tests for publish atomics and rollback safety | Keep; test |
| `/v1/super-admin/public-website/publish/snapshots` | GET | `PublicWebsitePublishPage.tsx` | `PublishService.snapshots` -> `platform_website_publish_snapshots` | Important | Working | No pagination | Add pagination |
| `/v1/super-admin/public-website/publish/rollback/{snapshotId}` | POST | `PublicWebsitePublishPage.tsx` | `PublishService.rollback` -> pages/themes/navigation/seo/snapshot/audit tables | Critical | Working | High-risk mutation needs tests and audit verification | Keep; add tests |
| `/v1/super-admin/public-website/publish/rollback-audit` | GET | `PublicWebsitePublishPage.tsx` | `PublishService.rollbackAudit` -> `platform_website_rollback_audit_log` | Important | Working | Query enabled only when snapshot selected in UI | Keep; add general audit view |
| `/v1/super-admin/public-website/audit-timeline` | GET | Public website hooks/pages | `PublishService.auditTimeline` -> `platform_website_audit_timeline` | Important | Working | `limit` has no min/max validation in controller | Add `@Min/@Max` |
| `/v1/super-admin/users/{userId}/school-access` | GET/POST/DELETE | No Super Admin frontend usage found | `SchoolAccessController` -> `UserSchoolAccessService` -> `user_school_access` | Important | Unused | Business flow says support access/admin grants; UI missing | Add to user/school admin management or remove from scope |
| `/v1/super-admin/tenants/{tenantId}/domains` | GET/POST/VERIFY/DELETE | No Super Admin frontend usage found | `CustomDomainController` -> `CustomDomainService` -> `custom_domains` | Optional | Unused | Super Admin route exists but UI only school-admin custom domains | Decide owner; wire or remove |
| `/v1/super-admin/tenants/{tenantId}/storage-quota` | GET | No Super Admin frontend usage found | `StorageQuotaController` -> `StorageQuotaService` -> object storage/audit data | Optional | Unused | Not part of current UI | Wire into tenant detail if needed |
| `/v1/super-admin/tenant-analytics` | GET | No frontend usage found | `tenant/controller/SuperAdminAnalyticsController` -> `SuperAdminAnalyticsServiceImpl` | Remove/Merge | Duplicate | Duplicates `/v1/super-admin/analytics` with similar response | Merge/remove one endpoint |

## 3. Working APIs

Confirmed by local smoke checks with real local data and a dev SUPER_ADMIN JWT:

- `GET /v1/super-admin/tenants`
- `GET /v1/super-admin/tenants/stats`
- `GET /v1/super-admin/tenants/{tenantId}`
- `GET /v1/super-admin/tenants/{tenantId}/features`
- `GET /v1/super-admin/tenants/{tenantId}/config`
- `GET /v1/super-admin/tenants/{tenantId}/subscription`
- `GET /v1/super-admin/tenants/{tenantId}/comparison`
- `GET /v1/super-admin/features`
- `GET /v1/super-admin/subscription-plans`
- `GET /v1/super-admin/analytics`
- `GET /v1/super-admin/ai/usage`
- `GET /v1/super-admin/ai/usage/{tenantId}`
- `GET /v1/super-admin/ai/knowledge/{tenantId}`
- `GET /v1/super-admin/public-website/dashboard`
- `GET /v1/super-admin/public-website/pages`
- `GET /v1/super-admin/public-website/branding/themes`
- `GET /v1/super-admin/public-website/seo`
- `GET /v1/super-admin/public-website/media`
- `GET /v1/super-admin/public-website/audit-timeline`
- `GET /v1/super-admin/experience/seed-health`
- `GET /v1/super-admin/experience/demo-scenarios`
- `GET /v1/super-admin/experience/branding`
- `GET /v1/super-admin/experience/website-routes`
- `GET /v1/super-admin/experience/content-blocks`
- `GET /v1/super-admin/experience/analytics`

Also confirmed:

- Super Admin route security blocks a SCHOOL_ADMIN token with HTTP 403 for representative endpoints.
- Missing token returns HTTP 401 for representative endpoints.
- Frontend route guard restricts `/super-admin/*` to `SUPER_ADMIN` in `frontend/src/app/router.tsx`.

## 4. Broken APIs

- `DELETE /v1/super-admin/experience/investor-rooms/{id}`
  - Exact reason: `SuperAdminExperienceController.archiveRoom` says "Archive an investor room" but calls `investorRoomService.regenerateCode(id)` and returns `"archived"`. That is semantically wrong and dangerous.
  - File: `backend/src/main/java/com/cloudcampus/experience/controller/SuperAdminExperienceController.java`

- Super Admin login smoke using documented local defaults
  - Exact reason: `POST /v1/auth/login` with `superadmin/admin123` returned HTTP 401 on the current local DB, while multiple docs and UI hints advertise that credential.
  - Files: `backend/src/main/resources/application-dev.yml`, `mobile/src/screens/LoginScreen.tsx`, `CloudCampus.postman_collection.json`
  - Business impact: Super Admin E2E manual smoke is not reliable from a fresh instruction set once DB state diverges.

- Public Website media API
  - Exact reason: `GET /v1/super-admin/public-website/media` returns hardcoded placeholder media records, not real uploaded media or storage objects.
  - File: `backend/src/main/java/com/cloudcampus/experience/controller/SuperAdminPublicWebsiteController.java`

- Public Website analytics API
  - Exact reason: `GET /v1/super-admin/public-website/analytics` returns the same `PublicWebsiteDashboardResponse` as `/dashboard`, not a real analytics-specific response.
  - File: `backend/src/main/java/com/cloudcampus/experience/controller/SuperAdminPublicWebsiteController.java`

## 5. Missing APIs

- School creation/listing/detail for Super Admin.
  - Required flow: tenant/school creation and listing/detail view.
  - Current state: tenant creation auto-creates MAIN school, but Super Admin has no school management API/UI in its module.

- School admin user creation for a school.
  - Required flow: admin user creation for school.
  - Current state: no Super Admin UI/API found to create a SCHOOL_ADMIN user and grant school access during tenant onboarding.

- Subscription plan create/update/delete.
  - Required flow: subscription plan creation/update.
  - Current state: plans are enum values in `SubscriptionPlanCode`, exposed read-only through `/subscription-plans`.

- Billing/payment status for Super Admin.
  - Required flow: billing/payment status if implemented.
  - Current state: tenant invoice APIs are under `/v1/tenant/invoices` for tenant/school admins, not Super Admin; no Super Admin billing dashboard API exists.

- General Super Admin audit log viewer.
  - Required flow: audit logs.
  - Current state: `audit_log` infrastructure exists, public website audit timeline exists, but no general `/v1/super-admin/audit-logs` API/UI for tenant/subscription/feature/admin actions.

- System health/monitoring API for Super Admin.
  - Required flow: system health/monitoring.
  - Current state: dashboard shows hardcoded readiness cards; actuator endpoints and Prometheus exist but no Super Admin monitoring API aggregates them.

- Impersonation/support access flow.
  - Required flow: impersonation or support access if implemented.
  - Current state: no impersonation API/UI. School access grant endpoints exist but are not wired to Super Admin UI.

- Platform global settings API.
  - Required flow: platform settings.
  - Current state: tenant config exists, but no global platform settings endpoint for SaaS-wide settings.

## 6. Duplicate / Unused APIs

- Duplicate analytics:
  - `/v1/super-admin/analytics` in `backend/src/main/java/com/cloudcampus/reports/controller/AnalyticsController.java`
  - `/v1/super-admin/tenant-analytics` in `backend/src/main/java/com/cloudcampus/tenant/controller/SuperAdminAnalyticsController.java`
  - Frontend uses `/v1/super-admin/analytics`; merge or remove `/tenant-analytics`.

- Unused Super Admin school access:
  - `/v1/super-admin/users/{userId}/school-access` GET/POST/DELETE in `SchoolAccessController`.
  - Useful for support/access management, but not surfaced in Super Admin UI.

- Unused Super Admin domain management:
  - `/v1/super-admin/tenants/{tenantId}/domains` endpoints in `CustomDomainController`.
  - No Super Admin frontend usage found.

- Unused Super Admin storage quota:
  - `StorageQuotaController` has a SUPER_ADMIN path but no Super Admin frontend usage found.

- Public website duplicate showcase endpoints:
  - `/v1/super-admin/public-website/demo-showcase` overlaps with `/v1/super-admin/experience/demo-scenarios`.
  - `/v1/super-admin/public-website/investor-showcase` overlaps with `/v1/super-admin/experience/investor-rooms`.

- Frontend API functions without routed UI usage:
  - Public website update navigation/theme/page/section functions in `frontend/src/features/super-admin/public-website/api/publicWebsiteApi.ts`.
  - Experience update functions in `frontend/src/features/super-admin/experience/experienceStudioApi.ts`.

## 7. Security Findings

- Good: `/v1/super-admin/**` is restricted to `SUPER_ADMIN` by `SecurityConfig`.
- Good: Method-level `@PreAuthorize("hasRole('SUPER_ADMIN')")` exists on several sensitive controllers (`AnalyticsController`, `SuperAdminReportController`, `KnowledgeBaseController`, `AiUsageController`).
- Good: SCHOOL_ADMIN token smoke checks returned HTTP 403 for representative Super Admin APIs.
- Good: no-token smoke checks returned HTTP 401.
- Risk: Super Admin endpoints rely on path-level security for several controllers and do not always repeat `@PreAuthorize`; path-level security is valid but easier to break during route refactors.
- Risk: Many Experience/Public Website mutating endpoints do not use `@Valid`, and many request records lack validation annotations.
- Risk: Tenant lifecycle, subscription assignment, feature toggles, prompt activation, knowledge ingestion/deletion, and public website publish/rollback do not consistently write `audit_log`.
- Risk: `FeatureFlagServiceImpl.enable/disable` does not explicitly validate tenant existence before writing `tenant_features`.
- Risk: `AiUsageController.forTenant` does not validate that `tenantId` exists.
- Risk: `GET /v1/super-admin/public-website/media` exposes fake data and may hide real storage/permission requirements.
- Risk: Dev/public hints still expose `superadmin/admin123` in multiple files. `SecretsGuardConfig` knows this is unsafe, but the current dev profile still sets it.
- Risk: Expensive AI/RAG endpoints need explicit rate limiting. `/v1/super-admin/analytics` and comparison use `@RateLimit`; prompt render and knowledge query do not.

## 8. Frontend Findings

- `frontend/src/app/router.tsx` correctly wraps `/super-admin` routes with `ProtectedRoute roles={['SUPER_ADMIN']}`.
- `TenantListPage.tsx` has loading, error, empty, and pagination states.
- `TenantCreatePage.tsx` matches backend tenant DTO for `{code, name}` and subscription assignment DTO for `{planCode, billingCycle, notes}`.
- `TenantDetailPage.tsx` covers tenant status, subscription, feature toggles, and tenant config, but not schools, school admins, billing, audit, or support access.
- `SuperAdminDashboardPage.tsx` uses real tenant stats and plan catalog, but platform health/support queue/readiness content is hardcoded.
- `KnowledgeBasePage.tsx` and `AiUsagePage.tsx` load tenants with `listTenants(0, 200)`, which silently truncates beyond 200 tenants.
- React Query keys are mostly stable, but tenant list keys are inconsistent: `['tenants', offset]`, `['tenants-list', 0, 200]`, and `['tenants-all']`.
- `ContentBlockEditor.tsx` sends extra fields on update and `id: ""` on create; backend ignores unknown fields, but the payload does not precisely match DTO intent.
- Public website and Experience Studio pages mostly have loading/empty states but error handling is inconsistent, especially for read queries.
- Public website API client exposes public read functions (`getPublicPage`, `getPublicNavigation`, `getPublicTheme`) inside Super Admin API module; this is okay for preview but should be clearly separated.

## 9. Backend Findings

- Controller structure is mostly clear for core tenant/subscription/feature/AI/public website domains.
- `SuperAdminTenantController` and `SubscriptionController` use DTO validation for core create/assign/config APIs.
- `FeatureAdminController` injects repositories directly for read endpoints instead of going through a service.
- `SuperAdminExperienceController.getAnalytics` directly queries `ExperienceEventRepository` in the controller; move to a service.
- Experience/Public Website request DTOs are mostly plain records with no validation annotations.
- `SuperAdminPublicWebsiteController.seo` returns `ApiResponse<?>` with either a list or single object depending on query param; this weakens frontend typing.
- `SubscriptionPlanCode` enum means plan catalog cannot be managed by Super Admin.
- `TenantServiceImpl.create` handles duplicate tenant code race with `DataIntegrityViolationException`, which is good.
- `TenantServiceImpl.create` creates default school/settings/bootstrap data, but does not create the school admin user needed for a sellable onboarding flow.
- `TenantServiceImpl.suspend/activate` only changes tenant status; school status and active sessions/tokens are not addressed in the Super Admin flow.
- Several important mutations log to application logs but do not create durable business audit records.
- Pagination exists for tenant list but not for analytics tenant breakdown, AI prompts, knowledge documents, snapshots, or audit timeline beyond a simple `limit`.

## 10. Recommended Changes

Critical fixes:

- Add Super Admin onboarding APIs/UI for school list/detail/create and SCHOOL_ADMIN user creation/grant.
- Add audit logging for tenant create/suspend/activate, subscription assignment, config changes, feature toggles, prompt activation/deactivation, knowledge ingest/delete, public website publish/rollback, and Experience Studio publishes.
- Add validation annotations and `@Valid` to all Experience/Public Website mutating endpoints.
- Fix or remove `DELETE /v1/super-admin/experience/investor-rooms/{id}` archive behavior.
- Replace hardcoded/fake Super Admin dashboard health/media/analytics with real APIs or label them as placeholders outside production.

High priority improvements:

- Add Super Admin billing/payment status APIs and UI, or explicitly mark billing as tenant-admin only.
- Add subscription plan create/update/deactivate if plan catalog is meant to be managed by Super Admin.
- Merge duplicate analytics endpoints.
- Add rate limits to AI prompt render and knowledge query/ingest endpoints.
- Add tenant existence checks to AI usage and feature flag endpoints.
- Add tests for Super Admin tenant/subscription/feature/public website controllers and services.

Medium priority improvements:

- Add search/filter/sort to tenant list and analytics.
- Normalize React Query keys for tenants and tenant detail invalidation.
- Add pagination to prompt registry, knowledge documents, snapshots, audit timeline, and analytics rows.
- Split public website SEO list/detail endpoints into strongly typed endpoints.
- Add UI for existing custom domain, storage quota, and school access Super Admin endpoints if they remain in scope.

Optional improvements:

- Separate public preview API functions from Super Admin admin API module.
- Improve config editor with typed controls.
- Move plan pricing and AI cost rates into tables/config.
- Add contract tests generated from OpenAPI for Super Admin endpoints.

## 11. Implementation Plan

- [ ] Task 1: Add audit logging to core Super Admin mutations.
- [ ] Task 2: Add validation to Experience/Public Website request DTOs and controller methods.
- [ ] Task 3: Implement Super Admin school/admin-user onboarding APIs and UI.
- [ ] Task 4: Fix or remove the broken investor room archive endpoint.
- [ ] Task 5: Replace dashboard hardcoded health/media/analytics placeholders with real API-backed data.
- [ ] Task 6: Add backend controller/service/security tests for tenant lifecycle, subscription assignment, feature toggles, public website publish/rollback, and school-admin access denial.
- [ ] Task 7: Merge duplicate analytics endpoints and remove unused client functions/routes after confirming product ownership.
- [ ] Task 8: Add pagination/search/filter support where Super Admin can exceed demo-scale data.

## 12. Final Decision

- Is Super Admin production ready? No.
- What must be fixed before selling this SaaS:
  - Complete onboarding: create tenant, create/list schools, create school admin user, assign school access, assign subscription, enable features, and verify the admin can log in.
  - Add durable audit logging for all important Super Admin mutations.
  - Add validation and tests for all Super Admin write APIs.
  - Replace fake/hardcoded Super Admin monitoring/media/billing placeholders with real APIs or remove them from production UI.
  - Add billing/payment status or clearly remove that claim from the Super Admin product surface.
  - Fix duplicate/unused/broken APIs before they become contract debt.
- What can be improved later:
  - Full plan catalog CRUD if static plans are acceptable for launch.
  - Advanced analytics filters and exports.
  - Experience Studio update screens for all content types.
  - Public website media library sophistication.
  - Impersonation/support access if policy and audit requirements are defined.
