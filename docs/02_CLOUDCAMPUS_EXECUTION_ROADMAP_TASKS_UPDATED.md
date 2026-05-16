# CloudCampus — Enterprise Execution Roadmap

**Purpose:** Divides the entire CloudCampus enterprise SaaS ERP vision into small, trackable, AI-friendly implementation tasks.

---

## Progress Summary (as of 2026-05-16 — E88 AI Foundation + QR Attendance + Subscriptions)

| Metric | Count |
|--------|-------|
| **Total tasks** | 193 |
| **Completed** | ~165 (85%) |
| **In Progress** | 0 |
| **Not Started** | ~28 |

### E88 Completions — AI Foundation + QR Attendance + Subscription Management + Onboarding Wizard (2026-05-16)

| Task | What was built |
|------|---------------|
| CC-0308 Subscription controller ✅ | `SubscriptionController` — `GET /v1/super-admin/subscription-plans`, `GET /v1/super-admin/tenants/{id}/subscription`, `PUT /v1/super-admin/tenants/{id}/subscription`; `assignPlan()` writes limits to `tenant_configs` so `UsageLimitEnforcer` picks them up immediately |
| CC-0308 Subscription frontend ✅ | `subscriptionApi.ts` with `listSubscriptionPlans`, `getTenantSubscription`, `assignTenantPlan`; `TenantDetailPage` subscription section with plan picker dropdown and billing cycle radio; `PlanUpgradePage` replaced with real plan catalog cards |
| CC-0204 Onboarding wizard ✅ | `TenantCreatePage` full rewrite — 3-step wizard: Step 0 (Identity: code+name via react-hook-form+zod), Step 1 (Plan: card-based selector + Monthly/Annual billing toggle with 17% annual discount), Step 2 (Review: summary table → Create); on submit: `createTenant` → `assignTenantPlan` → navigate to detail |
| CC-1600 AI Gateway ✅ | `AiGatewayService` wraps `ChatModel.call(Prompt)`, extracts token counts from `ChatResponseMetadata.getUsage()`, writes to `ai_usage_logs` via `UsageLoggingService` (`@Transactional(REQUIRES_NEW)` for best-effort logging) |
| CC-1601 AI Prompt Registry ✅ | `AiPromptTemplate` JPA entity + `AiPromptTemplateRepository` (with `deactivateAllByPromptKey` JPQL + `findMaxVersionByPromptKey`); `PromptServiceImpl` — `create()` auto-increments version, `activate()` atomically deactivates all others for same key, `render()` uses Spring AI `PromptTemplate.render(vars)`; `PromptController` at `/v1/super-admin/ai/prompts` (CRUD + activate/deactivate/render); `V46__ai_foundation.sql` — pgvector extension, `ai_prompt_templates` (unique partial index `WHERE is_active = true`), `ai_usage_logs`, `vector_store` with HNSW index |
| CC-1601 Prompt Registry frontend ✅ | `promptApi.ts` full CRUD + renderPrompt; `PromptListPage` — groups by promptKey, shows all versions with activate/deactivate buttons; `PromptDetailPage` — dual export (CreatePromptForm for `/new`, PromptDetail with render playground otherwise); routes wired at `/super-admin/ai/prompts` and `/super-admin/ai/prompts/:id` |
| CC-1602 AI Embedding Service ✅ | `EmbeddingServiceImpl` wraps `VectorStore`, stores `tenant_id` in metadata, uses `FilterExpressionBuilder` for tenant-scoped similarity search |
| CC-1600 Spring AI config ✅ | Spring AI BOM 1.0.0 in `pom.xml`; `spring-ai-starter-model-anthropic`, `spring-ai-starter-model-openai`, `spring-ai-starter-vector-store-pgvector`; `AiConfiguration` with `@ConditionalOnMissingBean` `MockChatModel` + `MockEmbeddingModel`; `application-dev.yml` — `spring.ai.anthropic.chat.enabled: false`, `spring.ai.openai.embedding.enabled: false`; `docker-compose.yml` postgres image switched to `pgvector/pgvector:pg16` |
| CC-0802 QR Attendance backend ✅ | `QrAttendanceService` updated — QR now encodes full deep-link URL (`{FRONTEND_BASE_URL}/student/attendance/scan?token=…`); `selfMark` takes `userId` and resolves student via `StudentRepository.findByUserId(UUID)`; `app.frontend.base-url` added to `application.yml`; `QrAttendanceController` for student self-mark (`POST /v1/student/attendance/qr-mark`); `TeacherAttendanceController.openSessionWithQr` — `POST /v1/teacher/attendance/sessions/with-qr` creates session + generates QR in one round-trip |
| CC-0802 QR Attendance frontend ✅ | `QrPanel` component in `TeacherAttendancePage` — calls `openSessionWithQr` with slot params, displays base64 QR image with live countdown (green → amber ≤30s → red expired), refresh button; `StudentQrScanPage` — reads `?token=` from URL, auto-submits on mount, shows spinner/success/error/no-token states; `/student/attendance/scan` route wired in router; `qrMarkAttendance` added to `studentPortalApi.ts` |

### E87 Completions — JNV Demo Seed + Systemic Bug Fixes (2026-05-15)

| Task | What was built |
|------|---------------|
| V42 JNV Lucknow seed migration ✅ | Flyway `V42__jnv_lucknow_seed.sql` — idempotent `ON CONFLICT DO NOTHING` inserts: tenant `jnv-lucknow`, school JNV Lucknow, 7 classes (VI–XII), 14 sections (A/B each), 560 students (27 boys + 13 girls per section), 23 staff (principal, vice-principal, 20 teachers, 1 lab assistant), April 2026 attendance sessions (14/day × 30 days), fee records, 9 notices, 4 exams, 11 subjects, 6 departments, 5 user accounts (superadmin/schooladmin/teacher1/student1/parent1 — all `Admin@123`) |
| `TenantContextFilter` root-cause fix ✅ | `TenantContextFilter` ran after `JwtAuthenticationFilter` in the Spring filter chain and overwrote the JWT-derived tenant UUID with the raw `X-Tenant-Id` header slug (`jnv-lucknow`). Downstream code doing `UUID.fromString(RequestContext.getTenantId())` threw `IllegalArgumentException` in 40+ call sites across controllers and services. Fix: only set from header if `RequestContext.getTenantId()` is not already populated by the JWT filter |
| `CacheConfig` serializer fix ✅ | Default `GenericJackson2JsonRedisSerializer()` uses `EVERYTHING` Jackson default typing, conflicting with Java records containing `Instant` fields (from `jackson-datatype-jsr310`). All `@Cacheable` endpoints returned `INTERNAL_ERROR`. Fix: inject Spring `ObjectMapper`, copy with `NON_FINAL` typing and explicit `PolymorphicTypeValidator` allowing `com.cloudcampus.*`, `java.util.*`, `java.time.*` subtypes |
| `SchoolDashboardController` fix ✅ | `validateSchool()` called `UUID.fromString(RequestContext.getTenantId())` directly then did `findByTenantIdAndCode(tenantId, "MAIN")`. After TenantContextFilter fix this UUID parse would work, but the approach is fragile. Simplified to `findById(schoolId).orElseThrow(NotFoundException)` |
| Postman collection rebuild ✅ | Replaced sparse 2-folder collection with 8-folder comprehensive collection (~80 requests): `0.Health`, `1.Auth` (5 logins with auto-token-save scripts), `2.Super Admin`, `3.School Admin` (11 sub-folders), `4.Teacher`, `5.Student`, `6.Parent`, `7.Mobile`, `8.Public`. Login test scripts: `pm.environment.set('schoolAdminToken', j.data.accessToken)` etc. |
| Postman environment rebuild ✅ | Replaced 5-variable environment with 73-variable environment containing all JNV UUIDs: `apiRoot`, `baseUrl`, `tenantId`, `schoolId`, `academicYearId`, 5 token variables (all secret type), 7 class IDs, 14 section IDs, staff IDs, student IDs, department IDs, subject IDs, exam IDs, fee IDs, session IDs, notice/homework IDs |
| URL fixes in collection ✅ | Timetable (added 3 required params), attendance sessions (school-level `?date=`, class-level `?from=&to=`), student/parent attendance (added date range), teacher "My Sessions" → correct endpoint `GET /teacher/attendance/students?classId=&sectionId=` |
| End-to-end smoke test ✅ | All 5 logins verified; 30+ endpoints across all roles return `success:true` on clean Redis; parent child endpoints verified with correct student record UUID (`77777777-...`) not user UUID |

### E86 Completions — Tenant Analytics Dashboard (CC-0309) (2026-05-15)

| Task | What was built |
|------|---------------|
| Native analytics queries ✅ | `StudentRepository`: `countActiveGlobal()` + `countActiveGroupedByTenant()`; `StaffRepository`: same pattern; `SchoolRepository`: same; `StudentFeeRecordRepository`: `sumAmountDueGlobal()`, `sumAmountPaidGlobal()`, `sumAmountsGroupedByTenant()` — all `nativeQuery=true` to bypass Hibernate tenant filter |
| `PlatformAnalyticsResponse` DTO ✅ | Global totals: `totalTenants`, `activeTenants`, `totalStudents`, `totalStaff`, `totalSchools`, `totalFeeDue`, `totalFeePaid`, `feeCollectionRate` + embedded `List<TenantAnalyticsSummary>` |
| `TenantAnalyticsSummary` DTO ✅ | Per-tenant row: id, name, code, status, activeStudents, activeStaff, activeSchools, totalFeeDue, totalFeePaid, feeCollectionRate |
| `AnalyticsServiceImpl` ✅ | Loads native group-by results into `Map<UUID, Long>` / `Map<UUID, BigDecimal[]>`; iterates all tenants; computes per-tenant metrics; sorts by `activeStudents DESC` |
| `GET /v1/super-admin/analytics` ✅ | `AnalyticsController` — `@PreAuthorize("hasRole('SUPER_ADMIN')")`, `@RateLimit`; returns full platform snapshot in one call |
| `analyticsApi.ts` ✅ | `getPlatformAnalytics()` via authenticated axiosInstance |
| `TenantAnalyticsPage.tsx` ✅ | 6-card summary strip (tenants, students, staff, schools, fee due, collection %); sortable per-tenant table with status badges + color-coded collection rate badges (green ≥80%, amber ≥50%, red <50%) |
| Router + nav ✅ | `/super-admin/analytics` route wired; "Analytics" nav item added to `SuperAdminLayout` between Tenants and Comparison |
| Frontend build ✅ | 329 modules, 0 errors |

### E85 Completions — Tenant Branding Engine (CC-0206) (2026-05-15)

| Task | What was built |
|------|---------------|
| `TenantConfigKey` branding keys ✅ | 4 new keys: `LOGO_URL` (default `""`), `FAVICON_URL` (default `""`), `PRIMARY_COLOR` (default `#2563EB`), `SECONDARY_COLOR` (default `#1e40af`) |
| Validation in `TenantConfigServiceImpl` ✅ | `HEX_COLOR_RE` (`^#([0-9A-Fa-f]{3}\|[0-9A-Fa-f]{6})$`) for colors; `URL_RE` (`^https?://...`) for URL fields — empty string allowed for optional URLs |
| `BrandingResponse` DTO ✅ | Record with `logoUrl`, `faviconUrl`, `primaryColor`, `secondaryColor` |
| `BrandingController` ✅ | `GET /v1/public/branding` — no auth required; reads `X-Tenant-Id` header directly (TenantContextFilter skips `/v1/public`); falls back to defaults on absent/unknown tenant; overlays stored overrides from `TenantConfigRepository` |
| `brandingApi.ts` ✅ | `getBrandingApi(tenantId)` — plain axios GET to `/v1/public/branding` with `X-Tenant-Id` header |
| `useBranding` hook ✅ | `useQuery` with 10-min staleTime; applies `--brand-primary` / `--brand-secondary` CSS custom properties on `<html>`; swaps `<link rel="icon">` when faviconUrl is set; returns `BrandingResponse \| null` |
| `SchoolAdminLayout` ✅ | Calls `useBranding()`; sidebar header shows `<img>` when `branding.logoUrl` is set, otherwise falls back to "CloudCampus" text |
| Frontend build ✅ | 327 modules, 0 errors |

### E84 Completions — Feature Dependency Engine (CC-0307) (2026-05-15)

| Task | What was built |
|------|---------------|
| `FeatureDependencies` ✅ | `public final class` with static `REQUIRES` map: `ATTENDANCE_QR/GPS → ATTENDANCE_MANUAL`, `AI_COPILOT → ANALYTICS_ADVANCED`; `getRequired(key)` + `getDependents(key)` helpers |
| `FeatureFlagServiceImpl.enable()` ✅ | Before enabling feature F, iterates `FeatureDependencies.getRequired(F)` and auto-upserts each non-CORE dependency as enabled; full cache invalidation after |
| `FeatureFlagServiceImpl.disable()` ✅ | Before disabling feature F, calls `FeatureDependencies.getDependents(F)`, filters for those currently enabled in DB via `isEnabledInDb()`; throws `BadRequestException` with named blockers if any exist |
| `isEnabledInDb()` helper ✅ | Private method on `FeatureFlagServiceImpl` — looks up `TenantFeatureId` directly, returns `false` if row absent |
| `FeatureResponse` DTO ✅ | Added `List<String> dependencies` field; `from()` populates via `FeatureDependencies.getRequired()` |
| Frontend `FeatureResponse` type ✅ | Added `dependencies: string[]` to `tenant.ts` interface |
| Frontend `TenantDetailPage` ✅ | "Requires: X" amber chip row shown under feature description; `featureError` state captures blocker messages; dismissible red error banner above feature list; `onError` handlers on both `enableMutation` and `disableMutation` extract `error.response.data.error.message` |
| `ChangePasswordPage` fix ✅ | Fixed pre-existing `s.logout` → `s.clearAuth` mismatch (AuthStore has `clearAuth`, not `logout`) |
| Frontend build ✅ | 325 modules, 0 errors |

### E83 Completions — Usage Limit Enforcement + Roadmap Reconciliation (CC-0312 + CC-0107/0108/0109/0115/0116/0507/0508) (2026-05-15)

| Task | What was built / reconciled |
|------|---------------------------|
| `UsageLimitExceededException` ✅ | New exception → 422 Unprocessable Entity; carries `limitKey`, `current`, `limit`; registered in `RestExceptionHandler` |
| `UsageLimitEnforcer` ✅ | `@Component` with `checkStudentLimit`, `checkStaffLimit`, `checkSchoolLimit`; reads ceiling from `TenantConfigRepository` (falls back to enum default); compares against live count from repo |
| `SchoolRepository.countByTenantIdAndStatus` ✅ | New derived query for school ceiling check |
| `StudentServiceImpl.admit()` ✅ | Calls `limitEnforcer.checkStudentLimit(tenantId, schoolId)` before persisting |
| `StaffServiceImpl.create()` ✅ | Calls `limitEnforcer.checkStaffLimit(tenantId, schoolId)` before persisting |
| CC-0107 ✅ (reconciled) | Forgot password flow already implemented — `PasswordResetService` + `POST /v1/auth/forgot-password` + `ForgotPasswordPage` (E50) |
| CC-0108 ✅ (reconciled) | OTP verification already implemented — Redis key `cc:otp:{userId}` TTL 5 min, 6-digit TOTP, `PasswordResetServiceImpl` (E50) |
| CC-0109 ✅ (reconciled) | Session management = stateless JWT (15 min) + Redis refresh tokens (30 days) + revoke-all (E81) |
| CC-0115 ✅ (reconciled) | API security middleware already covers: `CorrelationIdFilter` (X-Request-Id MDC), `SecurityHeadersFilter` (7 headers), `TenantContextFilter`, `JwtAuthenticationFilter`, `RateLimitInterceptor`, `TenantSuspensionFilter` |
| CC-0116 ✅ (reconciled) | Password policy + account lockout fully completed — N-strikes suspend in `AuthServiceImpl` (E47) + `@StrongPassword` Bean Validation (E49) + `ChangePasswordPage` |
| CC-0507 ✅ (reconciled) | Student ID generation already implemented — `student_number` auto-generated as `{YEAR}-{schoolSeq}-{4-digit-counter}` in `StudentServiceImpl.resolveStudentNumber()` |
| CC-0508 ✅ (reconciled) | Bulk student import already implemented — `BulkStudentImporter` + `POST /v1/school-admin/schools/{id}/students/bulk` returning `BulkImportResult` with per-row error details |

### E82 Completions — Tenant Configuration Engine + Roadmap Reconciliation (CC-0207 + CC-0301–CC-0306) (2026-05-15)

| Task | What was built / reconciled |
|------|---------------------------|
| `V41__tenant_configs.sql` ✅ | `tenant_configs(tenant_id, config_key, config_value, updated_at)` — composite PK; index on tenant_id |
| `TenantConfigKey` enum ✅ | 6 predefined keys with defaults + descriptions: `MAX_SCHOOLS` (5), `MAX_STUDENTS_PER_SCHOOL` (2000), `MAX_STAFF_PER_SCHOOL` (200), `SUPPORT_EMAIL` (""), `TIMEZONE` (UTC), `DEFAULT_LANGUAGE` (en) |
| `TenantConfig` entity ✅ | `@IdClass(PK)` composite-key JPA entity; `@PreUpdate` timestamps |
| `TenantConfigRepository` ✅ | `findAllByTenantId` + `findByTenantIdAndConfigKey` |
| `TenantConfigService` + `TenantConfigServiceImpl` ✅ | `getAll()` merges stored values with defaults; `set()` upserts with per-key validation (integer range, email regex, `ZoneId.of`, language code) |
| `GET /v1/super-admin/tenants/{id}/config` ✅ | Returns all keys with current value + default + description |
| `PUT /v1/super-admin/tenants/{id}/config/{key}` ✅ | Upserts a single key; validates value; returns updated full config |
| Frontend `TenantDetailPage` config section ✅ | Inline-editable config table: click value → edit input + Save/Cancel; renders all keys with description tooltips |
| CC-0301–CC-0306 ✅ (reconciled) | All were already implemented in earlier epics — `SuperAdminDashboardPage`, `TenantListPage`, `TenantCreatePage`, `TenantDetailPage` (suspend/activate), feature toggles UI, `FeatureAdminController` + feature catalog |

### E81 Completions — Session Revocation Strategy (CC-0117) (2026-05-15)

| Task | What was built |
|------|---------------|
| Per-user token index ✅ | `cc:rt:user:{userId}` Redis Set — maintained on every `issueRefreshToken`; EXPIRE reset to 30 days on each add; SREM on `logout` and `refresh` rotation |
| `revokeAllSessions()` ✅ | `AuthService` + `AuthServiceImpl` — SMEMBERS per-user index → pipeline DELETE all `rt:{uuid}` keys → DELETE index; returns revoked count; audit logged as `AUTH_ALL_SESSIONS_REVOKED` |
| `POST /v1/auth/revoke-all` ✅ | Authenticated endpoint; returns 204 + `X-Revoked-Sessions` header |
| `AUTH_ALL_SESSIONS_REVOKED` ✅ | New `AuditAction` enum value + `AuditLogService.logAllSessionsRevoked()` |
| `revokeAllSessionsApi()` ✅ | Added to `authApi.ts` — `POST /v1/auth/revoke-all` via authenticated axiosInstance |
| "Sign out from all devices" ✅ | Danger-zone section on `ChangePasswordPage` — calls `revokeAllSessions`, then clears auth store and navigates to `/login`; hidden during forced-password-change flow |

### E80 Completions — Secrets Management Standard (CC-1906) (2026-05-15)

| Task | What was built |
|------|---------------|
| `SecretsGuardConfig` ✅ | `@PostConstruct` startup validator — skips in `dev`/`test` profiles; in all other profiles blocks boot with a formatted error if JWT_SECRET or ENCRYPTION_SECRET match known dev defaults or are shorter than 32 chars; also checks DB password is set and bootstrap password is not a well-known weak value |
| `.env.example` ✅ | Comprehensive environment variable reference: PostgreSQL, JWT, encryption, bootstrap admin, Redis, RabbitMQ, SMTP, Firebase, MinIO/S3, pgbackup — each with a description and `openssl rand` generation command |
| `infra/secrets/vault-local.sh` ✅ | Local Vault dev bootstrap: starts `vault server -dev` with root token, writes all CloudCampus secrets to `secret/cloudcampus` KV path; supports `teardown` subcommand; documents Spring Cloud Vault config for local use |

### E79 Completions — Backup/Restore Drill Automation (CC-1905 + CC-1705) (2026-05-15)

| Task | What was built |
|------|---------------|
| `drill.sh` ✅ | Disaster-recovery drill script — 6 phases: (1) trigger fresh `backup.sh`, (2) find latest dump in MinIO via `mc find`, (3) download dump, (4) create scratch DB `${PG_DB}_drilltest`, (5) restore via `pg_restore --no-owner --no-privileges`, (6) validate: `schools` + `users` row counts > 0, `flyway_schema_history` migration count > 0, V40 present; also queries `students` / `staff` / `attendance_sessions` as informational; reports PASS/FAIL + always cleans up via `trap EXIT` |
| `DRILL_SKIP_BACKUP=1` ✅ | Optional flag to skip backup and use latest existing MinIO dump (for staging/CI use) |
| `Dockerfile` ✅ | Added `COPY drill.sh /usr/local/bin/drill.sh` + `chmod +x` alongside existing `backup.sh` |
| CC-1705 ✅ | Caching strategy documented by implementation: Redis TTL table in `CacheConfig`; `@Cacheable` + `@CacheEvict` on reference-data services; strategy captured in E71 completion notes |

### E78 Completions — RabbitMQ Queue Integration (CC-1504) (2026-05-15)

| Task | What was built |
|------|---------------|
| `spring-boot-starter-amqp` ✅ | Added to pom.xml |
| `rabbitmq` Docker Compose service ✅ | `rabbitmq:3-management-alpine` — AMQP :5672, UI :15672, cloudcampus/cloudcampus_dev |
| `NotificationMessage` record ✅ | JSON-serialisable queue payload — messageId, tenantId, schoolId, channel, templateCode, recipient, variables, publishedAt |
| `NotificationQueueConfig` ✅ | Topic exchange `cc.notifications`; queues `cc.notifications.email` + `.sms` with DLX backing; dead-letter queue `cc.notifications.dead`; `Jackson2JsonMessageConverter`; `RabbitTemplate`; `SimpleRabbitListenerContainerFactory` with `defaultRequeueRejected=false` |
| `NotificationQueuePublisher` ✅ | `publishEmail()` + `publishSms()` — publish to exchange with routing key; fails open on `AmqpException` |
| `NotificationQueueConsumer` ✅ | `@RabbitListener` on email + SMS queues; delegates to existing `NotificationService`; nack-without-requeue routes to DLQ on exception |
| `application.yml` ✅ | `spring.rabbitmq.*` with env-var overrides for prod; `listener.simple.concurrency: 1–3` |
| Test exclusion ✅ | `RabbitAutoConfiguration` excluded in test profile — tests load without a broker |

### E77 Completions — Load & Stress Testing (CC-1703 / CC-1704) (2026-05-15)

| Task | What was built |
|------|---------------|
| `smoke.js` ✅ | 3 VUs / 30 s — sanity-checks health, login, and tenant list endpoints |
| `load-auth.js` ✅ | Ramp → 50 VUs — auth throughput + BCrypt + JWT SLO (p95 < 500 ms) |
| `load-reports.js` ✅ | Ramp → 20 VUs — attendance / fee / performance report aggregation SLO (p95 < 2 s) |
| `stress.js` ✅ | Ramp → 200 VUs — breaking-point test; 429s tracked separately from 5xx error rate |
| `helpers/auth.js` ✅ | Shared login helper + `authHeaders()` used across all scripts |
| `README.md` ✅ | Install, run, and interpret output; SLO table; staging override instructions |

Also marked CC-1904 (Backup automation) as completed — `infra/pgbackup/` (Dockerfile + backup.sh + crontab) was already implemented.

### E76 Completions — PII Data Retention + Scheduled Purge (CC-1806) (2026-05-14)

| Task | What was built |
|------|---------------|
| `RetentionProperties` ✅ | `@ConfigurationProperties(prefix="app.retention")` record — `softDeleteRetentionDays` (default 90); set to 0 to disable physical purge |
| `DataRetentionService` ✅ | `@Scheduled(cron="0 0 2 * * *", zone="UTC")` nightly job — computes cutoff, calls `hardDeleteExpiredUsers`, logs via `AuditLogService` |
| `UserRepository.hardDeleteExpiredUsers` ✅ | Native `DELETE FROM users WHERE deleted_at IS NOT NULL AND deleted_at < :cutoff` with `@Modifying(clearAutomatically=true)` — bypasses `@SQLRestriction` |
| `AuditAction.DATA_PURGE_COMPLETED` ✅ | New enum value + `AuditLogService.logDataPurge(count, days)` async method |
| `@EnableScheduling` ✅ | Added to `AsyncConfig` alongside existing `@EnableAsync` |
| `application.yml` ✅ | `app.retention.soft-delete-retention-days: 90`; test yml uses 1 day |

### E75 Completions — At-Rest PII Field Encryption (CC-1803) (2026-05-14)

| Task | What was built |
|------|---------------|
| `EncryptedStringConverter` ✅ | JPA `AttributeConverter<String,String>` — AES-256-GCM with `ENC:` prefix + Base64(IV ‖ ciphertext ‖ GCM tag); backward-compat: plaintext column values pass through and are re-encrypted on next save |
| `EncryptionProperties` ✅ | `@ConfigurationProperties(prefix="app.encryption")` record — `secret` field; key derived via SHA-256 |
| `EncryptionConfig` ✅ | `@PostConstruct` pushes AES key into converter's static field before Hibernate processes any entity |
| `Student` entity ✅ | `@Convert(converter=EncryptedStringConverter.class)` on `phone` + `address` |
| `Staff` entity ✅ | `@Convert(converter=EncryptedStringConverter.class)` on `phone`, `email`, `address` |
| `V40__pii_encryption_column_widths.sql` ✅ | `ALTER TABLE students/staff` — widens columns to fit encrypted form (phone → 500, address → 1000, email → 500) |
| `application.yml` ✅ | `app.encryption.secret: ${ENCRYPTION_SECRET:dev-...}` |

### E74 Completions — Query Optimisation Indexes (CC-1701) (2026-05-14)

| Task | What was built |
|------|---------------|
| `V39__performance_indexes.sql` ✅ | 5 composite indexes: `attendance_sessions(school_id, academic_year_id)` — report hot-path; `attendance_records(session_id, status)` — covering index for aggregate queries; `exam_results(school_id, exam_id, rank ASC NULLS LAST)` — performance report sort-avoiding; `school_notices(school_id, is_published, priority DESC, created_at DESC)` — notice listing sort-avoiding; `school_notices(school_id, target, is_published)` — target-audience filter |

### E73 Completions — Per-User / Per-Tenant API Rate Limiting (CC-1805) (2026-05-14)

| Task | What was built |
|------|---------------|
| `@RateLimit` annotation ✅ | `common/ratelimit/RateLimit.java` — marker annotation for annotated controller methods |
| `ApiRateLimitProperties` ✅ | `@ConfigurationProperties(prefix="app.rate-limit.api")` record — `perUserRequests`, `perUserWindowSeconds`, `perTenantRequests`, `perTenantWindowSeconds` |
| `ApiRateLimiterService` ✅ | Redis sorted-set sliding-window per user + per tenant; fails open when Redis unavailable |
| `RateLimitInterceptor` ✅ | `HandlerInterceptor.preHandle` — reads `@RateLimit` via reflection, looks up userId from `auth.getName()` + tenantId from `RequestContext`; throws 429 on breach |
| `WebMvcConfig` ✅ | `WebMvcConfigurer.addInterceptors` — registers `RateLimitInterceptor` |
| All report + notice endpoints ✅ | `@RateLimit` added to all 6 report endpoints + all notice board endpoints |
| `application.yml` ✅ | `app.rate-limit.api.*` block; `test/application.yml` updated with matching block |

### E72 Completions — CI/CD Pipeline (CC-1502) (2026-05-14)

| Task | What was built |
|------|---------------|
| `.github/workflows/ci.yml` ✅ | 4-job pipeline: `backend` (Maven verify + Testcontainers), `frontend` (npm ci + Vite build), `mobile` (npm ci + tsc --noEmit), `docker` (needs all three; builds + pushes layered Docker image to GHCR on main-branch push only) |
| Concurrency control ✅ | `cancel-in-progress: true` per ref so stale PR runs are cancelled on force-push |
| Testcontainers compatibility ✅ | `-Dapi.version=1.41` Surefire arg already in `pom.xml`; works with `ubuntu-latest` Docker socket |

### E71 Completions — Redis API Caching (CC-1702) (2026-05-14)

| Task | What was built |
|------|---------------|
| `spring-boot-starter-cache` ✅ | Added to `pom.xml` |
| `CacheConfig` ✅ | `@EnableCaching` + `RedisCacheManager` with per-cache TTLs: `academic-years` 10 min, `classes` 10 min, `subjects` 10 min, `sections` 5 min, `departments` 10 min; `GenericJackson2JsonRedisSerializer` for values |
| `AcademicYearServiceImpl` ✅ | `@Cacheable("academic-years")` on `listBySchool`; `@CacheEvict(allEntries=true)` on create / update / setAsCurrent / close |
| `SubjectServiceImpl` ✅ | `@Cacheable("subjects")` on `listBySchool` + `listActive`; `@CacheEvict(allEntries=true)` on mutations |
| `ClassRoomServiceImpl` ✅ | `@Cacheable("classes")` on `listByAcademicYear`; `@CacheEvict(allEntries=true)` on mutations |
| `SectionServiceImpl` ✅ | `@Cacheable("sections")` on `listByClass`; `@CacheEvict(allEntries=true)` on mutations |

### E70 Completions — Cross-School Comparison Dashboard (CC-1404) (2026-05-14)

| Task | What was built |
|------|---------------|
| `countByStatusForSessions` ✅ | New `@Query` JPQL on `AttendanceRecordRepository` — GROUP BY status for a list of session IDs |
| `SchoolComparisonRow` + `ComparisonResponse` DTOs ✅ | Per-school metrics: activeStudents, totalSessions, attendanceRate, totalDue, totalPaid, feeCollectionRate |
| `ReportServiceImpl.comparisonReport()` ✅ | Iterates schools in tenant; per school: current academic year → session IDs → attendance aggregate → fee aggregate; sorted alphabetically |
| `SuperAdminReportController` ✅ | `GET /v1/super-admin/tenants/{tenantId}/comparison`; `@PreAuthorize("hasRole('SUPER_ADMIN')")` |
| `SchoolComparisonPage.tsx` ✅ | Tenant picker, sortable table with color-coded attendance + fee-rate badges, summary strip |
| Router + nav ✅ | `/super-admin/comparison` route wired; "Comparison" item in `SuperAdminLayout` nav |

### E69 Completions — Student Name Enrichment in Reports (CC-1401/CC-1402/CC-1403) (2026-05-14)

| Task | What was built |
|------|---------------|
| `ReportServiceImpl` batch enrichment ✅ | `studentRepo.findAllById(ids)` batch fetch → `Map<UUID, Student>`; populates `studentNumber`, `firstName`, `lastName` in both `attendanceReport()` and `performanceReport()` |
| `AttendanceReportResponse.Row` ✅ | Added `studentNumber`, `firstName`, `lastName` fields |
| `PerformanceReportResponse.Row` ✅ | Added `studentNumber`, `firstName`, `lastName` fields |
| `ReportController` CSV exports ✅ | Headers updated to `Student Number,First Name,Last Name,...`; all 6 endpoints annotated `@RateLimit` |
| `reportApi.ts` ✅ | `AttendanceReportRow` + `PerformanceReportRow` TS interfaces updated with name fields |
| `ReportsPage.tsx` ✅ | "Student" column renders `{lastName}, {firstName}` with `studentNumber` sub-text; "Student ID" column header removed |

### E52 Completions — Mobile Student Timetable Tab (2026-05-14)

| Task | What was built |
|------|---------------|
| `timetableApi.ts` additions ✅ | `getStudentTimetable(academicYearId?)` — `GET /v1/student/timetable`; renamed `getMyTimetable` → `getTeacherTimetable` for clarity |
| `TimetableScreen.tsx` role-aware ✅ | Reads role from `useAuthStore`; picks `getStudentTimetable` for STUDENT, `getTeacherTimetable` for TEACHER; role-specific error message when fetch fails |
| `_layout.tsx` tab visibility ✅ | `canViewTimetable = TEACHER \|\| STUDENT`; Timetable tab now appears for students |

### E51 Completions — Mobile Parent Child Homework + Fees (2026-05-14)

| Task | What was built |
|------|---------------|
| `parentApi.ts` additions ✅ | `HomeworkStatus` type, `ChildHomework` interface, `getChildHomework(studentId)` → `GET /v1/parent/children/{id}/homework`; `FeeStatus` type, `ChildFeeRecord` interface, `getChildFees(studentId)` → `GET /v1/parent/children/{id}/fees` |
| `ParentDashboardScreen.tsx` ✅ | `ChildDetail` panel expanded — Homework section (title, due date, status badge in color), Fees section (balance-due alert banner + per-record rows with ₹ amounts and status badge); TanStack Query parallel fetches |

### E50 Completions — Mobile Forgot / Reset Password (2026-05-14)

| Task | What was built |
|------|---------------|
| `authApi.ts` additions ✅ | `forgotPasswordApi(email)` → `POST /v1/auth/forgot-password`; `resetPasswordApi(email, otp, newPassword)` → `POST /v1/auth/reset-password` |
| `ForgotPasswordScreen.tsx` ✅ | Email validation + OWASP enumeration-safe success panel (always shown); routes to `/(auth)/reset-password?email=...` |
| `ResetPasswordScreen.tsx` ✅ | Pre-fills email from `useLocalSearchParams`; OTP numeric-only; show/hide password toggle; `isStrongPassword()` client-side check; on success → `/(auth)/login` |
| Route wrappers ✅ | `mobile/app/(auth)/forgot-password.tsx` + `reset-password.tsx` thin wrappers |
| Login screen ✅ | "Forgot password?" link added below Sign In button |

### E49 Completions — Password Complexity Rules (2026-05-14)

| Task | What was built |
|------|---------------|
| `@StrongPassword` annotation ✅ | `common/validation/StrongPassword.java` — Bean Validation `@Constraint` annotation |
| `StrongPasswordValidator` ✅ | Checks length ≥8, uppercase, lowercase, digit, special char via compiled `Pattern` constants |
| DTO updates ✅ | `ChangePasswordRequest.newPassword` + `ResetPasswordRequest.newPassword` annotated `@StrongPassword` (replaces `@Size(min=8)`) |
| Frontend parity ✅ | `isStrongPassword()` helper added to `ChangePasswordPage.tsx` and `ResetPasswordPage.tsx`; hint text updated |

### E48 Completions — Mobile Teacher Timetable / Homework / Assignments (2026-05-14)

| Task | What was built |
|------|---------------|
| Teacher timetable ✅ | `TimetableScreen.tsx` grid view; `GET /v1/teacher/timetable`; day-column cards with period badges and time ranges |
| Teacher homework ✅ | `TeacherHomeworkScreen.tsx`; `GET /v1/teacher/homework`; list with status badges and due dates |
| Teacher assignments ✅ | `TeacherAssignmentsScreen.tsx`; `GET /v1/teacher/assignments`; paginated list |
| Tab visibility ✅ | `canViewTeacherHomework` + `canViewTeacherAssignments` + `canViewTimetable` (TEACHER only at this stage) in `_layout.tsx` |

### E47 Completions — Account Lockout After Repeated Failures (CC-0116) (2026-05-14)

| Task | What was built |
|------|---------------|
| `AuditAction.AUTH_ACCOUNT_LOCKED` ✅ | New enum value + `AuditLogService.logAccountLocked()` async method |
| `RateLimitProperties` ✅ | Added `lockoutThreshold` (int) + `lockoutWindowSeconds` (long); configured 10 failures / 1 hour in `application.yml` |
| `LoginRateLimiterService` ✅ | `recordCredentialFailure(username)` — Redis `INCR` + `EXPIRE`; returns true when threshold reached. `clearCredentialFailures(username)` — deletes key on successful login |
| `AuthServiceImpl` ✅ | On bad credentials: `maybeUser.ifPresent()` increments counter, suspends account + audits on first lockout; on success: clears counter |
| Frontend lockout UX ✅ | `LoginPage.tsx` shows 403 → "Account not active", 429 → "Too many attempts" error messages |

### E38 Completions — Student Exam Results & Fee Status Self-Service (2026-05-14)

| Task | What was built |
|------|---------------|
| CC-0601 student results ✅ | `StudentResultsController` — `GET /v1/student/results`; `@PreAuthorize("hasRole('STUDENT')")`; batch-loads exam metadata via `examRepo.findAllById()` + `Collectors.toMap` to avoid N+1; returns `List<StudentResultSummary>` (examName, examType, examStatus, marks, percentage, grade, rank, passed, generatedAt) ordered newest-first |
| CC-0901 student fees ✅ | `StudentFeesController` — `GET /v1/student/fees?academicYearId=`; delegates to `feeService.listRecordsByStudent()` which handles category name enrichment; optional `academicYearId` filter |
| Frontend results ✅ | `StudentResultsPage` — summary strip (total/passed/failed/avg%), card grid per exam with percentage bar, grade, rank, pass/fail badge; `getMyResults()` API fn + `StudentResultSummary` TS interface |
| Frontend fees ✅ | `StudentFeesPage` — summary strip (total due/paid/balance); fee table with category, amount due, discount, paid, balance, due date, status badge; `getMyFees(academicYearId?)` API fn + `StudentFeeRecord` TS interface + `FeeStatus` union type |
| Nav & routes ✅ | `StudentLayout` NAV updated with "Results" + "Fees" items; `/student/results` + `/student/fees` routes wired in `router.tsx`; `npm run build` → **314 modules, 0 errors** |

### E46 Completions — Parent Portal Child Fee Records Tab (2026-05-14)

| Task | What was built |
|------|---------------|
| Backend GET fees endpoint ✅ | `GET /v1/parent/children/{studentId}/fees` in `ParentController`; delegates to `FeeService.listRecordsByStudent(studentId, null)`; guarded by `checkAccess()` parent-link verification |
| `parentApi.ts` additions ✅ | `ChildFeeRecord` interface + `getChildFees()` API function |
| `FeesTab` component ✅ | Added to `ParentChildPage.tsx` — 3-card summary (total due / paid / balance, balance card red when >0) + per-record table (category, amounts in ₹, due date, status badge) |
| Tab bar expansion ✅ | Tab bar in `ParentChildPage` now has 5 tabs (Attendance / Homework / Results / Timetable / Fees) with `overflow-x-auto` for horizontal scroll on narrow screens |

### E45 Completions — Mobile Change-Password Screen + Navigation Guard Fix (2026-05-14)

| Task | What was built |
|------|---------------|
| `ChangePasswordScreen.tsx` ✅ | 3-field form (current / new / confirm); calls `POST /v1/auth/change-password`; clears `requiresPasswordChange` in Zustand store on success; routes to `/(app)/` |
| Expo Router entry point ✅ | `mobile/app/(auth)/change-password.tsx` — thin wrapper mounting `ChangePasswordScreen` |
| `NavigationGuard` fix ✅ | `_layout.tsx` — added case: if authenticated AND `requiresPasswordChange` AND not already on change-password → redirect to `/(auth)/change-password`, preventing infinite redirect loops |

### E44 Completions — Populate schoolId in Login Response for SCHOOL_ADMIN (2026-05-14)

| Task | What was built |
|------|---------------|
| `LoginResponse.java` update ✅ | Added `UUID schoolId` field (non-null only for SCHOOL_ADMIN role) |
| `AuthServiceImpl` schoolId resolution ✅ | Injected `SchoolRepository`; resolves school via `findByTenantIdAndCode(tenantId, "MAIN")` for SCHOOL_ADMIN at login time |
| Frontend type fix ✅ | `LoginResponseData` interface typed with `schoolId?: string \| null`; removed `(data as any).schoolId` cast in `LoginPage.tsx` |
| Impact ✅ | Unblocks `NoticeBoardPage` which had `enabled: !!schoolId` — schoolId was always null before this fix |

### E43 Completions — Change Password for Authenticated Users (CC-0116 partial) (2026-05-14)

| Task | What was built |
|------|---------------|
| `ChangePasswordRequest.java` DTO ✅ | Validated DTO (currentPassword, newPassword, confirmPassword) |
| `AuthService.changePassword()` ✅ | Interface method + `AuthServiceImpl` implementation: BCrypt verify current, reject if new == current, encode new hash, clear `forcePasswordChange`, fire `AUTH_PASSWORD_CHANGED` audit event; `AuditLogService.logPasswordChanged()` added |
| `POST /v1/auth/change-password` ✅ | `AuthController` endpoint; `@PreAuthorize("isAuthenticated()")` — any authenticated role can call it |
| `ChangePasswordPage.tsx` ✅ | Forced-change banner when `requiresPasswordChange=true`; client-side validation (min 8 chars, confirm match); success state with role-appropriate redirect; `changePasswordApi()` in `authApi.ts` |
| Sidebar links ✅ | All 5 portal layouts (Student / Teacher / Parent / SchoolAdmin / SuperAdmin) — "Change Password" link added in sidebar footer above "Sign Out" |
| `/change-password` route ✅ | Wired as `ProtectedRoute` (any authenticated role) |

### E42 Completions — Teacher Notices Page + Role-Aware Mobile Dashboard (2026-05-14)

| Task | What was built |
|------|---------------|
| `TeacherNoticesPage.tsx` ✅ | Category filter, paginated list, high-priority notices with red border; calls existing `GET /v1/mobile/notices` endpoint |
| TeacherLayout NAV update ✅ | "Notices" nav item added; `/teacher/notices` route wired |
| `mobile/app/(app)/index.tsx` rewrite ✅ | Role-aware TanStack Query hooks with `enabled` flags per role; Student section (attendance %, homework, assignments, fee balance alert, low-attendance warning <75% badge); Teacher section (today's classes, pending review chips); Parent section (children list with attendance badges); all roles: latest 3 notices |

### E41 Completions — Student Attendance Self-View (backend + web + mobile) (2026-05-14)

| Task | What was built |
|------|---------------|
| `AttendanceRecordRepository` addition ✅ | `findStudentHistory()` JPQL query with implicit join; ordered by session date descending |
| `StudentAttendanceController` ✅ | `GET /v1/student/attendance`; `@PreAuthorize("hasRole('STUDENT')")`; returns `MyAttendanceResponse` (totalSessions, presentCount, absentCount, lateCount, excusedCount, attendancePct, List recent) |
| `StudentAttendancePage.tsx` ✅ | 5-card summary strip (total / present / absent / late / excused); percentage bar (green ≥75%, red <75% with warning banner); paginated sessions table |
| `AttendanceScreen.tsx` (mobile) ✅ | 4 summary cards, percentage bar with color coding, session rows list; route `mobile/app/(app)/my-attendance.tsx` |
| Nav & routes ✅ | `StudentLayout` NAV updated with "Attendance" item; `/student/attendance` route wired |

### E40 Completions — Mobile Student Assignments, Results, Fees Screens (2026-05-14)

| Task | What was built |
|------|---------------|
| `AssignmentsScreen.tsx` ✅ | Student assignment list with submission-status badges (PENDING / SUBMITTED / LATE / GRADED) |
| `ResultsScreen.tsx` ✅ | Exam results list with percentage bars and pass/fail indicators |
| `FeesScreen.tsx` ✅ | Fee records with ₹-formatted summary (total due / paid / balance), status badges per record |
| Route files ✅ | `mobile/app/(app)/assignments.tsx`, `results.tsx`, `fees.tsx` — Expo Router entry points |
| `_layout.tsx` tabs update ✅ | Added `canViewAssignments`, `canViewResults`, `canViewFees` tab visibility flags for STUDENT role |

### E39 Completions — Teacher Attendance Marking Portal (2026-05-14)

| Task | What was built |
|------|---------------|
| `TeacherAttendancePage.tsx` ✅ | Teacher can select a class/section and mark attendance session directly from the teacher portal (previously only school-admin could do this) |
| Backend ✅ | No new endpoint required — reuses existing `POST /v1/attendance/sessions` and `PATCH /v1/attendance/sessions/{id}/mark` endpoints |
| Nav & routes ✅ | `TeacherLayout` NAV updated with "Attendance" item; `/teacher/attendance` route wired |

### E37 Completions — School Admin Dashboard Live Stats (2026-05-14)

| Task | What was built |
|------|---------------|
| Repo queries ✅ | `ClassRoomRepository.countBySchoolId(UUID)`; `LeaveRequestRepository.countBySchoolIdAndStatus(UUID, LeaveStatus)`; `StudentFeeRecordRepository.countBySchoolIdAndStatus(UUID, FeeStatus)` — Spring Data derived count queries |
| `SchoolDashboardController` ✅ | `GET /v1/school-admin/schools/{schoolId}/dashboard`; `@PreAuthorize("hasRole('SCHOOL_ADMIN')")`; returns `DashboardStats(totalStudents, totalStaff, totalClasses, pendingLeaveRequests, pendingFeeRecords, partialFeeRecords, publishedNotices)`; notice count via `noticeRepo.findFiltered(..., PageRequest.of(0,1)).getTotalElements()` |
| Frontend dashboard ✅ | `SchoolAdminDashboardPage` rewritten with live `useQuery`; alert banners for pending leave + unpaid fees; 4 overview stat cards (students/staff/classes/notices with links); fee health section (PENDING + PARTIAL); 8 quick-action links; `schoolDashboardApi.ts` + `SchoolDashboardStats` interface |

### E35 Completions — Teacher Dashboard (2026-05-14)

| Task | What was built |
|------|---------------|
| Repo additions ✅ | `HomeworkSubmissionRepository` JPQL subquery count by teacher+status; `SubmissionRepository` subquery count by teacher+statusIn; `HomeworkRepository.countBySchoolIdAndAssignedBy`; `AssignmentRepository.countBySchoolIdAndAssignedBy` |
| `TeacherDashboardController` ✅ | `GET /v1/teacher/dashboard`; resolves staff via `findBySchoolIdAndUserId`; converts `java.time.DayOfWeek` → `com.cloudcampus.timetable.entity.DayOfWeek` with try-catch for SUNDAY (not in school enum); returns today's timetable slots + pending homework review count + pending assignment grading count + total posted counts |
| Frontend dashboard ✅ | `TeacherDashboardPage` — today's schedule grid sorted by period number, pending-work alert banner, 5 stat cards with links, quick-action links; `formatTime(t: string \| null)` null-safe; `teacherDashboardApi.ts` + `TeacherDashboardData` interface |
| Nav & routes ✅ | `TeacherLayout` NAV updated with "Dashboard" as first item; `/teacher/dashboard` route added; `Navigate` index redirect updated; login redirect changed from `/teacher/timetable` → `/teacher/dashboard` |

### E34 Completions — Staff Leave Management (CC-0604) (2026-05-14)

| Task | What was built |
|------|---------------|
| CC-0604 backend ✅ | Staff leave request system — entities, Flyway migration, `LeaveStatus` enum (PENDING/APPROVED/REJECTED/CANCELLED); `LeaveRequestRepository` (by-school, by-staff, by-status with optional filters); `LeaveService`/`LeaveServiceImpl` (submit, list, approve/reject with reason, cancel); `LeaveRequestController` — staff self-service endpoints + school-admin review endpoints; `@PreAuthorize` per role |

### E33 Completions — Staff Attendance System (CC-0603) (2026-05-14)

| Task | What was built |
|------|---------------|
| CC-0603 backend ✅ | Staff attendance tracking — `StaffAttendance` entity + Flyway migration; `StaffAttendanceStatus` enum; `StaffAttendanceRepository`; `StaffAttendanceService`/`StaffAttendanceServiceImpl` (mark, bulk mark, list by date/staff); `StaffAttendanceController` — school-admin endpoints for marking + querying staff attendance |

### E32 Completions — Parent Portal (CC-1302) (2026-05-14)

| Task | What was built |
|------|---------------|
| CC-1302 ✅ | Parent portal frontend — `ParentLayout` (sidebar nav, sign-out); `ParentDashboardPage` (child list cards via `GET /v1/parent/children`); `ParentChildPage` (child detail: timetable, homework, notices tabs via student-facing APIs); `parentApi.ts`; `ProtectedRoute roles={['PARENT']}`; `/parent` routes wired; login redirect for PARENT role |

### E31 Completions — Student Portal (CC-0601, CC-0701, CC-0703) (2026-05-14)

| Task | What was built |
|------|---------------|
| CC-0601/0701/0703 frontend ✅ | Student portal frontend — `StudentLayout` (sidebar with 5→7 nav items); `StudentDashboardPage`; `StudentHomeworkPage` (list + submit modal); `StudentAssignmentsPage` (list + submit modal); `StudentTimetablePage` (weekly grid); `StudentNoticesPage` (paginated list); `studentPortalApi.ts` (6 API functions, 8 interfaces); `ProtectedRoute roles={['STUDENT']}`; login redirect for STUDENT role |

### E30 Completions — Teacher Assignment Portal (CC-0703) (2026-05-14)

| Task | What was built |
|------|---------------|
| CC-0703 teacher frontend ✅ | Teacher assignment portal — `TeacherAssignmentListPage` (filters: academicYear/class/subject/status; inline status advance; draft delete); `TeacherAssignmentCreatePage` (full form, max-marks field, optional immediate publish); `TeacherAssignmentDetailPage` (submission stats bar, student submission table, inline grade modal with max-marks enforcement); `teacherAssignmentApi.ts` (7 fns); "Assignments" nav item; 3 routes; `npm run build` passes |

### E29 Completions — Teacher Homework Portal (CC-0702) (2026-05-14)

| Task | What was built |
|------|---------------|
| CC-0702 teacher frontend ✅ | Teacher homework portal — `TeacherHomeworkListPage` (cascading filters: academicYear/class/section/subject/status, overdue badge, status advance, draft delete); `TeacherHomeworkCreatePage` (full form with publish toggle, due-date min tomorrow); teacher-facing `homeworkApi.ts` (5 fns); "Homework" nav item; 2 routes wired |

### E28 Completions — Bug Fixes, Full API Audit & System Hardening (2026-05-13)

| Task | What was built / fixed |
|------|----------------------|
| BF-001 ✅ | **TenantSuspensionFilter Redis fail-open** — Root cause of 401 UNAUTHORIZED for all tenant-scoped roles (TEACHER/STUDENT/PARENT): `redis.opsForValue().get(key)` was outside the try-catch in `resolveStatus()`. When Redis is unavailable, this threw `RedisConnectionException` which Spring error-dispatched to `/error`, where `AnonymousAuthenticationFilter` reset the SecurityContext → all tenant-scoped users got 401. Fix: moved Redis GET inside existing try-catch; fail-open returns `ACTIVE` for availability. SUPER_ADMIN was unaffected (no tenant_id → filter skipped). |
| BF-002 ✅ | **SecurityConfig FilterRegistrationBean** — Added `FilterRegistrationBean<JwtAuthenticationFilter>` and `FilterRegistrationBean<TenantSuspensionFilter>` beans with `setEnabled(false)` to prevent Spring Boot from auto-registering `@Component`-annotated filters as plain Servlet filters in addition to the `addFilterBefore()` chain registration. |
| BF-003 ✅ | **ExamType MIDTERM enum** — Seed data had `exam_type = 'MIDTERM'` but `ExamType` enum lacked it, causing `IllegalArgumentException` on exam queries. Added `MIDTERM` between `UNIT_TEST` and `TERM`. |
| BF-004 ✅ | **Optional `academicYearId` in Homework** — `GET /v1/school-admin/schools/{schoolId}/homework` rejected requests without `academicYearId`. Made param `required = false` in `HomeworkController`; updated JPQL with `(:academicYearId IS NULL OR h.academicYearId = :academicYearId)`. |
| BF-005 ✅ | **Optional `academicYearId` in Assignments** — Same fix for `AssignmentController` and `AssignmentRepository`. |
| BF-006 ✅ | **Optional `academicYearId` in FeeStructures** — `FeeStructureRepository.findBySchoolId()` added; `FeeController.listStructures` made `academicYearId` optional; `FeeServiceImpl` null-safe branching. |
| BF-007 ✅ | **Optional `academicYearId` + `status` in FeeRecords** — `StudentFeeRecordRepository` gained `findBySchoolId()` and `findBySchoolIdAndStatus()`; `FeeController.listRecordsBySchool` made both params optional; `FeeServiceImpl` null-safe 4-branch logic. |
| AUDIT ✅ | **Full backend API audit** — All 35 endpoints across 13 modules verified to return HTTP 2xx with valid JWT: auth (3), tenants (3), schools (2), academic-years/classes/sections/subjects (8), students (4), staff (2), attendance (3), fees (5), timetable (1), homework (1), assignments (1), exams (2). Zero failures after fixes above. |
| FRONTEND ✅ | **Frontend build verified** — `npm run build` (Vite) → **287 modules, 0 errors, 0 warnings**. CORS confirmed: backend allows `http://localhost:5174`, all preflight requests succeed. |

### E20 Completions — Assignment Engine (CC-0703)

| Task | What was built |
|------|---------------|
| CC-0703 ✅ | Assignment engine — `V33` migration (two tables: `assignments` + `assignment_submissions` — UNIQUE submission per student, PENDING/SUBMITTED/LATE/GRADED status, marks_obtained, feedback, graded_by/graded_at); `AssignmentStatus`/`SubmissionStatus` enums; `Assignment` entity + `AssignmentSubmission` entity (both tenant-filtered, factory methods, `publish()`/`close()`/`submit()`/`grade()` methods); `AssignmentRepository` (filtered paginated JPQL) + `SubmissionRepository`; `AssignmentCreateRequest`/`AssignmentStatusUpdateRequest`/`GradeSubmissionRequest`/`AssignmentResponse`/`SubmissionResponse` DTOs; `AssignmentService`/`AssignmentServiceImpl` (create + optional publish, paginated list, getById, updateStatus lifecycle guards, delete DRAFT-only, listSubmissions, gradeSubmission with max-marks validation); `AssignmentController` (7 endpoints: POST/GET list/GET:id/PATCH:status/DELETE/GET:submissions/PATCH:submission/grade); frontend: `assignment.ts` types, `assignmentApi.ts` (7 fns), `AssignmentListPage` (filterable table, status advance, draft delete), `AssignmentCreatePage` (max marks field, publish toggle), `AssignmentDetailPage` (stats bar, submissions table, inline grade modal with max-marks enforcement); 3 routes + "Assignments" nav item; **272 modules, 0 errors** |

### E19 Completions — Homework Management (CC-0702)

| Task | What was built |
|------|---------------|
| CC-0702 ✅ | Homework management — `V32` migration (`homework_assignments` table: tenant/school/academic-year/class/section/subject/staff FKs, nullable section (class-wide), `status` CHECK DRAFT/PUBLISHED/CLOSED, `attachment_urls` TEXT, 5 indexes); `HomeworkStatus` enum; `HomeworkAssignment` entity (tenant-filtered @FilterDef/@Filter, factory, publish/close methods); `HomeworkRepository` (filtered paginated JPQL with optional class/section/status, by-school+id); `HomeworkCreateRequest`/`HomeworkStatusUpdateRequest`/`HomeworkResponse` DTOs; `HomeworkService`/`HomeworkServiceImpl` (create with optional immediate publish, paginated list, getById, updateStatus with lifecycle guards — PUBLISHED assignments cannot be deleted, DRAFT→PUBLISHED→CLOSED transitions); `HomeworkController` (POST/GET/GET:id/PATCH:status/DELETE); frontend: `homework.ts` types, `homeworkApi.ts` (create/list/get/updateStatus/delete), `HomeworkListPage` (cascading filters + overdue badge + status advance + draft delete), `HomeworkCreatePage` (full form with publish toggle, due-date min tomorrow); "Homework" nav item; 2 routes wired; **268 modules, 0 errors** |

### E18 Completions — Timetable Management (CC-0701)

| Task | What was built |
|------|---------------|
| CC-0701 ✅ | Timetable management — `V31` migration (`timetable_slots` table: tenant/school/academic-year/class/section/subject/staff FKs, `day_of_week` CHECK constraint MON–SAT, `period_number` 1–12, optional start/end times, UNIQUE per section+day+period, 4 indexes); `DayOfWeek` enum; `TimetableSlot` entity (tenant-filtered @FilterDef/@Filter, factory, @PrePersist/@PreUpdate); `TimetableRepository` (by-class+section, section conflict lookup, teacher conflict JPQL, by-school+id); `TimetableSlotCreateRequest`/`TimetableSlotResponse` DTOs; `TimetableService`/`TimetableServiceImpl` (addSlot with dual conflict detection — section double-booking + teacher double-booking, listSlots, deleteSlot); `TimetableController` (POST/GET/DELETE:/slotId); frontend: `timetable.ts` types, `timetableApi.ts`, `TimetablePage` (academic-year→class→section cascading filters, weekly Mon–Sat × Period 1–8 grid, inline Add Slot form with conflict error display, slot delete); "Timetable" nav item; route wired; **265 modules, 0 errors** |

### E16 Completions — Marks Entry System (CC-1102)

| Task | What was built |
|------|---------------|
| CC-1102 ✅ | Marks entry — `V29` migration (`student_marks` table: tenant/exam/paper/student FKs, nullable `marks_obtained`, `is_absent`, `remarks`, `entered_by`, UNIQUE per paper+student, 4 indexes); `StudentMark` entity (tenant-filtered @FilterDef/@Filter, factory, `update()` method); `StudentMarkRepository` (by-paper, by-exam+student, upsert lookup, cascading deletes); `BulkMarksEntryRequest`/`MarksEntryRequest`/`StudentMarkResponse` DTOs; `MarksService`/`MarksServiceImpl` (bulk upsert, list, update, delete; validates marks ≤ total; absent=0); `MarksController` (POST /bulk, GET, PUT /:markId, DELETE /:markId); frontend: `marks.ts` types, `marksApi.ts`, `MarksEntryPage` (spreadsheet grid — absent checkbox, pass/fail color coding, live stats bar, Save All); "Enter Marks" link per paper in ExamDetailPage; route wired; **259 modules, 0 errors** |

### E15 Completions — Examination System (CC-1101)

| Task | What was built |
|------|---------------|
| CC-1101 ✅ | Exam creation — `V27` migration (exams table + 5 indexes); `V28` migration (exam_subjects table + 4 indexes); `ExamType` enum (UNIT_TEST/TERM/HALF_YEARLY/ANNUAL/MOCK/PRACTICAL); `ExamStatus` enum (DRAFT/SCHEDULED/ONGOING/COMPLETED/CANCELLED); `Exam` entity (tenant-isolated `@FilterDef`/`@Filter`, factory, status-transition methods); `ExamSubject` entity (paper per class/subject/date, room, invigilator); `ExamRepository` + `ExamSubjectRepository`; `ExamService`/`ExamServiceImpl` (create with optional inline subjects, list with filter by academicYear/status, getById with subjects, updateStatus lifecycle guard, addSubject, removeSubject); `ExamController` (POST/GET/GET:id/PATCH:status/POST:subjects/DELETE:subjects); frontend: `ExamListPage` (status step-advance inline), `ExamCreatePage` (dynamic subject papers array), `ExamDetailPage` (stepper, inline add/remove papers); nav item + 3 routes wired; **257 modules, 0 errors** |

### E12–E14 Completions — Communication System (CC-1001–CC-1004)

| Task | What was built |
|------|---------------|
| CC-1001 ✅ | SMS notification baseline — `NotificationService`, `NotificationLog` entity (V25 migration), SMS stub dispatch, `GET /notification-logs` with pagination |
| CC-1002 ✅ | Email integration — JavaMailSender wired; `NotificationTemplateCode` enum; `TemplateRenderer`; `POST /notifications/send-email` (202 Accepted); MailHog in docker-compose dev |
| CC-1003 ✅ | Push notification system — Firebase Admin SDK (v9.3.0); `FirebaseConfig`/`FirebaseProperties` (`@ConditionalOnProperty`); `PushService`/`PushServiceImpl`; device token fan-out; auto-prune `UNREGISTERED` tokens; `POST /notifications/send-push` (202 Accepted) |
| CC-1004 ✅ | WhatsApp integration — `WhatsAppMessageLog` entity + `V26` migration; `WhatsAppService`/`WhatsAppServiceImpl` (async stub, E14 labeled, BSP-swappable); `POST /whatsapp/send` + `GET /whatsapp/logs`; frontend `NotificationLogPage` (3 tabs: log/email/push) + `WhatsAppPage` (2 tabs: log/send); nav items + routes wired; **253 modules, 0 errors** |

### E11 Completions — Finance & Fees (CC-0901, CC-0902, CC-0905)

| Task | What was built |
|------|---------------|
| CC-0901 ✅ | Fee structure engine — `FeeCategory`, `FeeStructure` entities; `V22` + `V23` migrations; `FeeCategoryRepository`, `FeeStructureRepository`; category + structure APIs under `/v1/school-admin/schools/{schoolId}/fee-*`; `FeeFrequency` enum (ANNUAL/TERM/MONTHLY/ONE_TIME) |
| CC-0902 ✅ | Fee collection — `StudentFeeRecord` entity + `V24` migration; `FeePaymentRepository`, `StudentFeeRecordRepository`; `FeeService`/`FeeServiceImpl`; `applyPayment()` auto-recalculates PENDING→PARTIAL→PAID; waive record API; batch-load enrichment avoids N+1 |
| CC-0905 ✅ | Receipt generation — `FeePayment` entity (immutable); receipt numbers `RCT-YYYY-NNNNNNN` (sequential per year prefix); `FeeReceiptResponse` DTO with nested payment lines; `GET /fee-records/{id}/receipt` |
| Frontend ✅ | 4 pages: `FeeStructureListPage`, `FeeStructureCreatePage`, `FeeCollectionPage`, `StudentFeeDetailPage`; `financeApi.ts` (11 fns); "Fees"+"Fee Collection" nav (FINANCE feature flag); router routes; `npm run build` → **249 modules, 0 errors** |

### E10 Completions — Attendance Frontend

| Task | What was built |
|------|---------------|
| CC-0801 frontend ✅ | 3 pages: `AttendanceSessionListPage`, `AttendanceCreateSessionPage`, `AttendanceMarkPage` (bulk mark PRESENT/ABSENT/LATE); `attendanceApi.ts`; router + nav; **244 modules** build |

### E9 Completions — Staff Frontend

| Task | What was built |
|------|---------------|
| CC-0602 frontend ✅ | 3 pages: `StaffListPage`, `StaffCreatePage` (react-hook-form + Zod), `StaffProfilePage`; `staffApi.ts`; router + nav; **240 modules** build |

### E8 Completions — Student Frontend

| Task | What was built |
|------|---------------|
| CC-0502 frontend ✅ | `StudentAdmitPage` — multi-section admission form (personal, contact, academic) + Zod validation |
| CC-0503 frontend ✅ | `StudentProfilePage` — full profile view with parent links, certificates section |
| CC-0504 frontend ✅ | `StudentListPage` — filterable/searchable table with class/section/status filters |

### E7 Completions — School Admin Frontend

| Task | What was built |
|------|---------------|
| CC-0002 ✅ | Frontend scaffold — React 19 + TypeScript + Vite + TanStack Router + Zustand + TanStack Query v5 + react-hook-form v7 + Zod v4 + Axios + TailwindCSS 4 |
| CC-0401 ✅ | `SchoolAdminDashboardPage` — stats cards + welcome banner |
| CC-0402 frontend ✅ | `AcademicYearListPage` — create + list academic years |
| CC-0403 frontend ✅ | `ClassListPage` — create + list classes |
| CC-0404 frontend ✅ | `SectionListPage` — create + list sections |
| CC-0405 frontend ✅ | `SubjectListPage` — create + list subjects |
| CC-0408 ✅ | `SchoolAdminLayout` — sidebar nav with `useFeatureFlag` hook driving visibility |

### E1–E6 Completions — Backend: Academic, Student, Staff, Attendance

| Task | What was built |
|------|---------------|
| CC-0402 ✅ | `AcademicYear` entity + `V11` migration; `AcademicYearService`/`AcademicYearController` |
| CC-0403 ✅ | `Class` entity + `V12` migration; service + controller |
| CC-0404 ✅ | `Section` entity + `V13` migration; service + controller |
| CC-0405 ✅ | `Subject` entity + `V14` migration; service + controller |
| CC-0406 ✅ | `Department` entity + `V15` migration; service + controller |
| CC-0501 ✅ | `Student` entity + `V17` migration; `StudentRepository`; tenant-filtered |
| CC-0502–0504 ✅ | Student admission, profile, listing APIs — `StudentService`/`StudentController` |
| CC-0506 ✅ | `StudentParentLink` entity + `V18` migration; parent mapping APIs |
| CC-0601 ✅ | `Staff` entity + `V19` migration; `StaffRepository`; tenant-filtered |
| CC-0602 ✅ | Staff profile APIs — `StaffService`/`StaffController` |
| CC-0801 ✅ | Attendance backend — `AttendanceSession`+`AttendanceRecord` entities; `V20`+`V21` migrations; `AttendanceService`/`AttendanceController`; lock session, bulk mark |
| CC-0805 ✅ | Attendance reports — `GET /schools/{id}/attendance` with date/class/section filters |
| B4–B6 ✅ | `V8__add_indexes.sql` (composite indexes), `V9__soft_delete.sql` (deleted_at), `V10__create_device_tokens.sql`, `V16__create_school_settings.sql` |

### Session 5 Completions (2026-05-12) — Phase B1, B2, B3 Complete

| Task | What was built |
|------|---------------|
| CC-0213 ✅ | `School` entity + `V6__create_schools.sql`; `SchoolRepository`, `SchoolStatus` enum; auto-created by `TenantServiceImpl` on tenant onboarding (code = "MAIN") |
| CC-0203 ✅ | Hibernate `@Filter` + `@FilterDef` tenant isolation — `TenantFilter` constants, `TenantFilterAspect` (`@Before` AOP on all `JpaRepository` methods); `@Filter` on `School`, `User`, `AuditLog`; `@ParamDef` type `UUID.class` for PostgreSQL |
| CC-0210 ✅ | Tenant isolation test suite — `TenantIsolationTest` (6 tests, Testcontainers PG16 + Redis7); Docker API 1.41 compat; all 6 tests **pass** |

### Session 4 Completions (2026-05-12) — Phase A Complete

| Task | What was built |
|------|---------------|
| CC-0103 ✅ | `POST /v1/auth/login` — `AuthController`, `AuthServiceImpl`; constant-time BCrypt dummy hash prevents user enumeration |
| CC-0104 ✅ | `POST /v1/auth/logout` — refresh token revocation via Redis delete |
| CC-0105 ✅ | Redis refresh token system + `POST /v1/auth/refresh` — opaque UUID tokens, 30-day TTL, rotation on every use |
| CC-1801 ✅ | Brute-force protection — `LoginRateLimiterService` (Redis sliding window), `TooManyRequestsException` (429), `RateLimitProperties` |
| CC-1802 ✅ | `AuditLogService` (`@Async("auditExecutor")`, `REQUIRES_NEW` tx) — `AuditLog` entity, `AuditAction` enum; wired for LOGIN_SUCCESS/FAILED/BLOCKED, LOGOUT, TOKEN_REFRESHED |
| CC-0113 ✅ | Full RBAC enforcement in `SecurityConfig` — `/v1/super-admin/**` → SUPER_ADMIN, `/v1/admin/**` → TENANT_ADMIN+, `/v1/school-admin/**` → SCHOOL_ADMIN+, `anyRequest().authenticated()` |
| CC-0114 ✅ | `JsonAuthEntryPoint` — JSON `ApiResponse` 401/403 for unauthenticated/unauthorized requests |

> Update these counts whenever task statuses change.

---

## Task Template (Standard Format)

```
CC-XXXX | Title | P0/P1/P2/P3 | STATUS
Depends on: CC-YYYY, CC-ZZZZ
Scope:
  - API endpoints:
  - UI screens:
  - DB entities/migrations:
Definition of Done:
  - Unit tests:
  - Integration tests:
  - Audit logs:
  - Metrics/alerts:
  - Tenant isolation verified:
Notes/Risks:
```

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| `NOT_STARTED` | Task not started |
| `PLANNED` | Planned for execution |
| `IN_PROGRESS` | Currently developing |
| `BLOCKED` | Waiting for dependency |
| `TESTING` | Under QA/testing |
| `COMPLETED` | Production ready |
| `OPTIMIZATION_PENDING` | Optimization required |
| `SCALING_PENDING` | Scaling improvements pending |
| `FUTURE_SCOPE` | Future roadmap |

---

## Priority Definitions

| Priority | Meaning |
|----------|---------|
| **P0** | Critical foundation — blocks everything else |
| **P1** | High importance — ships in current milestone |
| **P2** | Medium importance — ships in next milestone |
| **P3** | Optional / future enhancement |

---

## Execution Phases

| Phase | Domain |
|-------|--------|
| 1 | Foundation Architecture |
| 2 | Authentication & Security |
| 3 | Multi-Tenant Engine |
| 4 | Super Admin System |
| 5 | School Admin System |
| 6 | Student Management |
| 7 | Staff & HRMS |
| 8 | Academic Management |
| 9 | Attendance System |
| 10 | Finance & Fees |
| 11 | Communication System |
| 12 | Examination System |
| 13 | Online Learning |
| 14 | Mobile App APIs |
| 15 | Reporting & Analytics |
| 16 | Infrastructure & DevOps |
| 17 | AI & Automation |
| 18 | Performance Optimization |
| 19 | Security Hardening |
| 20 | Enterprise Scale Preparation |
| 21 | Website Builder & Digital Experience Platform |

---

## Phase 1 — Foundation Architecture

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0001 | Setup backend project structure | P0 | ✅ COMPLETED | Spring Boot 3.4.5, Java 21 |
| CC-0002 | Setup frontend architecture | P0 | ✅ COMPLETED | React 19 + TypeScript + Vite + TanStack Query v5 + Zustand + Zod v4 + TailwindCSS 4 |
| CC-0003 | Setup modular package structure | P0 | ✅ COMPLETED | `common/`, `tenant/`, `auth/`, `config/` packages |
| CC-0004 | Setup environment management | P0 | ✅ COMPLETED | `application.yml` + `application-dev.yml` with profile separation |
| CC-0005 | Setup logging framework | P0 | ✅ COMPLETED | `logback-spring.xml` — JSON async prod, readable dev |
| CC-0006 | Setup exception handling system | P0 | ✅ COMPLETED | `RestExceptionHandler`, `ForbiddenException`, `ConflictException`, `TenantSuspendedException` |
| CC-0007 | Setup API response standardization | P0 | ✅ COMPLETED | `ApiResponse`, `ApiError`, `PageResponse` |
| CC-0008 | Setup DTO architecture | P0 | ✅ COMPLETED | Request/response DTO separation per module |
| CC-0009 | Setup validation framework | P0 | ✅ COMPLETED | `@Pattern`, `@Size`, `@NotBlank` on all DTOs |
| CC-0010 | Setup configuration management | P0 | ✅ COMPLETED | `JwtProperties` (`@ConfigurationProperties`), `SecurityConfig` |
| CC-0011 | Setup tenant-aware architecture | P0 | ✅ COMPLETED | `TenantContextFilter`, `HeaderTenantResolver`, `RequestContext` (userId slot added, VThread docs) |
| CC-0012 | Setup feature flag architecture | P0 | ✅ COMPLETED | V3 migration + 13 seed features + `FeatureFlagService` + `@RequiresFeature` AOP + Redis cache + `useFeatureFlag` hook (frontend) |
| CC-0013 | API versioning + pagination standard | P0 | ✅ COMPLETED | `/v1/` URI versioning, `PageResponse<T>` with `page`/`size`/`totalElements`/`totalPages` |
| CC-0014 | Global error schema standardization | P0 | ✅ COMPLETED | `ApiError` with `correlationId`, `status`, `code`, `message`, `timestamp` |
| CC-0015 | Request correlation IDs + structured logs | P0 | ✅ COMPLETED | `CorrelationIdFilter` with sanitization (`^[a-zA-Z0-9\-]{1,64}$`), MDC propagation |
| CC-0016 | Health/readiness endpoints + probes | P0 | ✅ COMPLETED | `/actuator/health/liveness`, `/actuator/health/readiness` |
| CC-0017 | Observability baseline (metrics + tracing) | P0 | ✅ COMPLETED | Prometheus + Micrometer + OTLP tracing exporter + local Tempo + Grafana Tempo datasource provisioning complete |
| CC-0018 | DB migrations strategy (Flyway/Liquibase) | P0 | ✅ COMPLETED | Flyway 10 with `flyway-database-postgresql`; V1–V5 migrations applied |
| CC-0019 | Seed data + template bootstrapping | P1 | NOT_STARTED | — |

---

## Phase 2 — Authentication & Security

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0101 | User entity creation | P0 | ✅ COMPLETED | `User.java`, `UserRole` (7 roles), `UserStatus`, `UserRepository`; V5 migration |
| CC-0102 | JWT authentication setup | P0 | ✅ COMPLETED | `JwtUtil` + `JwtProperties` + `JwtAuthenticationFilter` done; filter registered in `SecurityConfig`; `SecurityContext` + `RequestContext` fully populated on valid token |
| CC-0103 | Login API | P0 | ✅ COMPLETED | `AuthController` + `AuthServiceImpl`; constant-time BCrypt dummy hash prevents user enumeration; returns `LoginResponse` with access + refresh tokens |
| CC-0104 | Logout API | P0 | ✅ COMPLETED | `POST /v1/auth/logout` — Redis refresh token delete; no-op if already expired |
| CC-0105 | Refresh token system | P0 | ✅ COMPLETED | `POST /v1/auth/refresh` — opaque UUID tokens stored in Redis (`rt:{uuid}` → userId), 30-day TTL, rotated on every use |
| CC-0106 | Password encryption | P0 | ✅ COMPLETED | `BCryptPasswordEncoder(12)` bean in `SecurityConfig`; `SuperAdminBootstrap` uses it |
| CC-0107 | Forgot password flow | P1 | ✅ COMPLETED | `PasswordResetService` + `POST /v1/auth/forgot-password` + `ForgotPasswordPage`; OWASP-safe always-200 (E50, reconciled E83) |
| CC-0108 | OTP verification | P1 | ✅ COMPLETED | 6-digit OTP in Redis `cc:otp:{userId}` TTL 5 min; `PasswordResetServiceImpl.verifyAndReset()` (E50, reconciled E83) |
| CC-0109 | Session management | P1 | ✅ COMPLETED | Stateless JWT 15 min + Redis refresh tokens 30 days + per-user set for revoke-all (E81, reconciled E83) |
| CC-0110 | Device tracking | P1 | NOT_STARTED | Device fingerprint + session binding |
| CC-0111 | Multi-device login control | P2 | NOT_STARTED | — |
| CC-0112 | Login audit logs | P1 | ✅ COMPLETED | `AuditLogService` (`@Async("auditExecutor")`) + `AuditLog` entity + `AuditAction` enum + `AuditLogRepository`; `AsyncConfig` named thread pool; wired for LOGIN_SUCCESS, LOGIN_FAILED, LOGIN_BLOCKED, LOGOUT, TOKEN_REFRESHED |
| CC-0113 | Role-based authorization | P0 | ✅ COMPLETED | `SecurityConfig` matchers — `/v1/super-admin/**` (SUPER_ADMIN), `/v1/admin/**` (TENANT_ADMIN+), `/v1/school-admin/**` (SCHOOL_ADMIN+), `anyRequest().authenticated()` |
| CC-0114 | Permission middleware | P0 | ✅ COMPLETED | `JsonAuthEntryPoint` — JSON `ApiResponse` 401/403 for Spring Security rejections |
| CC-0115 | API security middleware | P0 | ✅ COMPLETED | `CorrelationIdFilter` (X-Request-Id MDC), `SecurityHeadersFilter` (7 headers), `TenantContextFilter`, `JwtAuthenticationFilter`, `RateLimitInterceptor`, `TenantSuspensionFilter` (reconciled E83) |
| CC-0116 | Password policy + account lockout | P1 | ✅ COMPLETED | `@StrongPassword` Bean Validation (E49) + N-strikes SUSPENDED in `AuthServiceImpl` (E47) + `POST /v1/auth/change-password` + `ChangePasswordPage` (E43) |
| CC-0117 | Session revocation strategy | P1 | ✅ COMPLETED | Per-user Redis Set tracks all refresh tokens; `POST /v1/auth/revoke-all` bulk-deletes them; "Sign out from all devices" on ChangePasswordPage (E81) |
| CC-0118 | Security headers + CORS policy | P1 | ✅ COMPLETED | `SecurityHeadersFilter` (7 headers), `SecurityConfig` CORS with origin allowlist |

---

## Phase 3 — Multi-Tenant Engine

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0201 | Tenant entity design | P0 | ✅ COMPLETED | `Tenant.java` with `updatedAt`, immutable `code`, `@PrePersist`/`@PreUpdate` |
| CC-0202 | Tenant resolver middleware | P0 | ✅ COMPLETED | `HeaderTenantResolver`, `TenantContextFilter`, `RequestContext` |
| CC-0203 | Tenant-aware database filters | P0 | ✅ COMPLETED | `TenantFilter` constants + `TenantFilterAspect` (`@Before` AOP); `@Filter`+`@FilterDef(UUID)` on `User`, `School`, `AuditLog`; `@FilterDef` declared once on `User` (Hibernate 6 constraint) |
| CC-0204 | Tenant onboarding flow | P0 | 🔄 IN_PROGRESS | `SuperAdminTenantController` + `TenantServiceImpl` done; full onboarding wizard + validation pending |
| CC-0205 | Tenant suspension system | P1 | ✅ COMPLETED | `TenantSuspensionFilter` (Redis-cached, fail-open) + `TenantSuspendedException` enforced; suspension API + activate API + admin UI actions in `TenantDetailPage` complete |
| CC-0206 | Tenant branding engine | P1 | ✅ COMPLETED | 4 TenantConfigKey branding entries; hex/URL validation; `GET /v1/public/branding` (no auth); `useBranding` hook applies CSS vars + favicon; SchoolAdminLayout shows tenant logo (E85) |
| CC-0207 | Tenant configuration engine | P0 | ✅ COMPLETED | `TenantConfig` entity + `TenantConfigKey` enum (6 keys with defaults); `GET`/`PUT` config endpoints; inline-editable config section on `TenantDetailPage` (E82) |
| CC-0208 | Tenant theme management | P2 | NOT_STARTED | — |
| CC-0209 | Tenant feature mapping | P0 | ✅ COMPLETED | `tenant_features` table (V3) + 13 seed features + feature dependency engine + toggle API/service + frontend toggle UI complete |
| CC-0210 | Tenant isolation automated test suite | P0 | ✅ COMPLETED | `TenantIsolationTest` — 6 Testcontainers tests (PostgreSQL 16 + Redis 7); all pass; `findByIdFiltered()` JPQL added to `SchoolRepository` |
| CC-0211 | Tenant-aware seed data (roles/menus) | P1 | NOT_STARTED | — |
| CC-0212 | Custom domain verification workflow | P2 | NOT_STARTED | DNS verification + SSL provisioning |
| CC-0213 | School/Campus entity design (multi-school ready) | P1 | ✅ COMPLETED | `School` entity + `V6__create_schools.sql`; `SchoolRepository`; auto-created by `TenantServiceImpl` on onboarding |
| CC-0214 | Cross-school access model (within tenant) | P1 | NOT_STARTED | Depends on CC-0213 |

---

## Phase 4 — Super Admin System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0301 | Super admin dashboard | P0 | ✅ COMPLETED | `SuperAdminDashboardPage` — stat cards (total/active/suspended/new), links to create + list tenants (reconciled E82) |
| CC-0302 | Tenant listing page | P0 | ✅ COMPLETED | `TenantListPage` — paginated table with status badges, search, link to detail (reconciled E82) |
| CC-0303 | Tenant profile management | P0 | ✅ COMPLETED | `TenantDetailPage` — suspend/activate, info card, config section, feature toggles (reconciled E82) |
| CC-0304 | Tenant create wizard | P0 | ✅ COMPLETED | `TenantCreatePage` — code + name form, navigates to detail on success (reconciled E82) |
| CC-0305 | Tenant feature access UI | P0 | ✅ COMPLETED | Feature toggle switches on `TenantDetailPage`; CORE locked, OPTIONAL/PREMIUM/BETA togglable (reconciled E82) |
| CC-0306 | Feature catalog engine | P0 | ✅ COMPLETED | `FeatureAdminController` + `features` table; CORE/OPTIONAL/PREMIUM/BETA types seeded in V3 migration (reconciled E82) |
| CC-0307 | Feature dependency engine | P0 | ✅ COMPLETED | `FeatureDependencies` static graph; cascade-enable deps on toggle-on; blocker check on toggle-off; `dependencies[]` in `FeatureResponse`; "Requires:" chips + error banner in frontend (E84) |
| CC-0308 | Subscription management UI | P1 | NOT_STARTED | — |
| CC-0309 | Tenant analytics dashboard | P1 | ✅ COMPLETED | Native cross-tenant queries; `AnalyticsService`; `GET /v1/super-admin/analytics`; `TenantAnalyticsPage` with 6-card summary strip + per-tenant table (E86) |
| CC-0310 | Global monitoring dashboard | P2 | NOT_STARTED | — |
| CC-0311 | Tenant merge/migration admin tool | P2 | NOT_STARTED | — |
| CC-0312 | Usage metering + limit enforcement | P1 | ✅ COMPLETED | `UsageLimitEnforcer` gates `admit()` + `create()` against `MAX_STUDENTS_PER_SCHOOL` / `MAX_STAFF_PER_SCHOOL`; 422 `UsageLimitExceededException`; `SchoolRepository.countByTenantIdAndStatus` for `MAX_SCHOOLS` (E83) |

---

## Phase 5 — School Admin System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0401 | School dashboard | P0 | ✅ COMPLETED | `SchoolAdminDashboardPage` — stats cards + welcome banner |
| CC-0402 | Academic year management | P0 | ✅ COMPLETED | Backend + frontend: `AcademicYear` entity, V11 migration, service, controller, `AcademicYearListPage` |
| CC-0403 | Class management | P0 | ✅ COMPLETED | Backend + frontend: `Class` entity, V12, `ClassListPage` |
| CC-0404 | Section management | P0 | ✅ COMPLETED | Backend + frontend: `Section` entity, V13, `SectionListPage` |
| CC-0405 | Subject management | P0 | ✅ COMPLETED | Backend + frontend: `Subject` entity, V14, `SubjectListPage` |
| CC-0406 | Department management | P1 | ✅ COMPLETED | `Department` entity, V15, service, controller |
| CC-0407 | School settings module | P1 | 🔄 IN_PROGRESS | V16 schema done; full settings management UI pending |
| CC-0408 | Dynamic menu rendering | P0 | ✅ COMPLETED | `SchoolAdminLayout` with `useFeatureFlag` hook — feature-flag-driven sidebar nav |

---

## Phase 6 — Student Management

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0501 | Student entity | P0 | ✅ COMPLETED | `Student` entity + V17 migration; `StudentRepository`; tenant-filtered |
| CC-0502 | Student admission form | P0 | ✅ COMPLETED | Backend API + `StudentAdmitPage` (multi-section form, Zod validation) |
| CC-0503 | Student profile page | P0 | ✅ COMPLETED | Backend API + `StudentProfilePage` (profile view, parent links) |
| CC-0504 | Student listing filters | P0 | ✅ COMPLETED | Backend API + `StudentListPage` (filterable/searchable by class/section/status) |
| CC-0505 | Student document upload | P1 | NOT_STARTED | — |
| CC-0506 | Parent mapping system | P1 | ✅ COMPLETED | `StudentParentLink` entity + V18 migration; parent mapping APIs |
| CC-0507 | Student ID generation | P1 | ✅ COMPLETED | `student_number` auto-generated as `{YEAR}-{4-digit}` sequence per school in `StudentServiceImpl.resolveStudentNumber()` (reconciled E83) |
| CC-0508 | Bulk student import | P1 | ✅ COMPLETED | `BulkStudentImporter` (REQUIRES_NEW per row) + `POST .../students/bulk` → `BulkImportResult` with per-row errors (reconciled E83) |

---

## Phase 7 — Staff & HRMS

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0601 | Staff entity | P0 | ✅ COMPLETED | `Staff` entity + V19 migration; `StaffRepository`; tenant-filtered |
| CC-0602 | Teacher profile management | P0 | ✅ COMPLETED | Backend API + `StaffListPage`, `StaffCreatePage`, `StaffProfilePage` |
| CC-0603 | Staff attendance system | P1 | ✅ COMPLETED | `StaffAttendance` entity + Flyway migration; `StaffAttendanceStatus` enum; bulk mark + list endpoints (E33) |
| CC-0604 | Leave management | P1 | ✅ COMPLETED | `LeaveRequest` entity + Flyway migration; `LeaveStatus` enum; staff self-service + school-admin review endpoints (E34) |
| CC-0605 | Payroll engine | P2 | NOT_STARTED | — |

---

## Phase 8 — Academic Management

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0701 | Timetable management | P1 | ✅ COMPLETED | V31 migration; TimetableSlot entity; conflict detection; weekly grid frontend |
| CC-0702 | Homework management | P1 | ✅ COMPLETED | V32 migration; HomeworkAssignment entity; DRAFT→PUBLISHED→CLOSED lifecycle; list + create pages |
| CC-0703 | Assignment engine | P1 | ✅ COMPLETED | V33 migration (2 tables); Assignment+Submission entities; PENDING→SUBMITTED/LATE→GRADED; grade modal |
| CC-0704 | Lesson planning | P2 | NOT_STARTED | — |

---

## Phase 9 — Attendance System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0801 | Manual attendance | P0 | ✅ COMPLETED | Backend: `AttendanceSession`+`AttendanceRecord` entities, V20+V21 migrations, `AttendanceService`/`AttendanceController`; Frontend: session list, create session, mark attendance (PRESENT/ABSENT/LATE) |
| CC-0802 | QR attendance | P1 | NOT_STARTED | — |
| CC-0803 | GPS attendance | P2 | NOT_STARTED | — |
| CC-0804 | Biometric integration | P2 | NOT_STARTED | — |
| CC-0805 | Attendance reports | P1 | ✅ COMPLETED | `GET /schools/{id}/attendance` with date/class/section/status filters |

---

## Phase 10 — Finance & Fees

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-0901 | Fee structure engine | P0 | ✅ COMPLETED | `FeeCategory`+`FeeStructure` entities; V22+V23 migrations; category + structure APIs; `FeeFrequency` enum; `FeeStructureListPage`+`FeeStructureCreatePage` |
| CC-0902 | Fee collection module | P0 | ✅ COMPLETED | `StudentFeeRecord` entity; V24 migration; `FeeServiceImpl` with `applyPayment()` auto-status; waive record; `FeeCollectionPage` with summary cards |
| CC-0903 | Online payment integration | P1 | NOT_STARTED | — |
| CC-0904 | Invoice generation | P1 | NOT_STARTED | — |
| CC-0905 | Receipt generation | P1 | ✅ COMPLETED | `FeePayment` entity; `RCT-YYYY-NNNNNNN` receipt numbers; `FeeReceiptResponse`; `StudentFeeDetailPage` with payment history |

---

## Phase 11 — Communication System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1001 | SMS integration | P1 | ✅ COMPLETED | SMS stub + `NotificationLog` entity (V25); `NotificationService`/`NotificationServiceImpl`; async REQUIRES_NEW tx |
| CC-1002 | Email integration | P1 | ✅ COMPLETED | JavaMailSender; `TemplateRenderer`; `NotificationTemplateCode` enum; send-email endpoint; MailHog dev |
| CC-1003 | Push notification system | P1 | ✅ COMPLETED | Firebase Admin SDK 9.3.0; `FirebaseConfig` (conditional); `PushService`; device token fan-out; auto-prune |
| CC-1004 | WhatsApp integration | P2 | ✅ COMPLETED | `WhatsAppMessageLog` (V26); async stub; send + log APIs; full frontend pages wired |

---

## Phase 12 — Examination System

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1101 | Exam creation | P1 | ✅ COMPLETED | V27+V28 migrations; Exam+ExamSubject entities; service; controller; 3 frontend pages |
| CC-1102 | Marks entry system | P1 | ✅ COMPLETED | V29 migration; StudentMark entity; bulk upsert service; 4 endpoints; MarksEntryPage grid |
| CC-1103 | Result generation | P1 | DONE | V30 migration, ExamResult entity, ResultService, ResultController (generate/list/detail) |
| CC-1104 | Report card generation | P1 | DONE | ReportCardPage (per-subject breakdown, print support), ResultsPage ranked table, resultApi |

---

## Phase 13 — Online Learning

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1201 | Online classes | P2 | NOT_STARTED | — |
| CC-1202 | Video upload system | P2 | NOT_STARTED | MinIO available in dev |
| CC-1203 | Assignment submissions | P2 | NOT_STARTED | — |

---

## Phase 14 — Mobile App APIs

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1301 | Student app APIs | P1 | 🔄 IN_PROGRESS | `AssignmentsScreen`, `ResultsScreen`, `FeesScreen`, `AttendanceScreen` + role-aware mobile dashboard (E40/E41/E42); change-password screen (E45) |
| CC-1302 | Parent app APIs | P1 | 🔄 IN_PROGRESS | Parent section in role-aware mobile dashboard (E42); change-password screen (E45) |
| CC-1303 | Teacher app APIs | P1 | 🔄 IN_PROGRESS | Teacher section in role-aware mobile dashboard (E42); change-password screen (E45) |

---

## Phase 15 — Reporting & Analytics

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1401 | Attendance reports | P1 | ✅ COMPLETED | JSON + CSV export; student names enriched (E69) |
| CC-1402 | Fee reports | P1 | ✅ COMPLETED | JSON + CSV export (E69) |
| CC-1403 | Student performance reports | P1 | ✅ COMPLETED | JSON + CSV export; rank + grade (E69) |
| CC-1404 | Cross-school comparison dashboards (within tenant) | P2 | ✅ COMPLETED | `SuperAdminReportController` + `SchoolComparisonPage` (E70) |
| CC-1405 | Super Admin anonymized benchmarking (optional) | P3 | NOT_STARTED | — |

---

## Phase 16 — Infrastructure & DevOps

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1501 | Docker setup | P0 | ✅ COMPLETED | `docker-compose.yml` — PostgreSQL 16, Redis 7, MinIO, MailHog with health checks |
| CC-1502 | CI/CD pipeline | P1 | ✅ COMPLETED | 4-job GitHub Actions: backend / frontend / mobile / docker (E72) |
| CC-1503 | Redis integration | P1 | ✅ COMPLETED | `RedisCacheManager` + `RedisTemplate` rate-limiter; `@Cacheable` on reference data (E71) |
| CC-1504 | Queue integration | P1 | ✅ COMPLETED | RabbitMQ topic exchange + DLQ; `NotificationQueuePublisher` + `NotificationQueueConsumer` (E78) |

---

## Phase 17 — AI & Automation

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1600 | AI gateway service (provider abstraction + routing) | P0 | NOT_STARTED | — |
| CC-1601 | Prompt & policy registry (versioning + rollout + rollback) | P0 | NOT_STARTED | — |
| CC-1602 | Embeddings + vector store integration | P0 | NOT_STARTED | — |
| CC-1603 | Tenant knowledge base (RAG ingestion + retrieval) | P1 | NOT_STARTED | — |
| CC-1604 | AI audit logs + tracing + usage analytics | P1 | NOT_STARTED | — |
| CC-1605 | AI usage metering + budgets + plan limits | P1 | NOT_STARTED | — |
| CC-1606 | AI evaluation dataset + regression checks per module | P1 | NOT_STARTED | — |
| CC-1607 | ERP in-app AI copilot (admin/teacher/parent/student) | P2 | NOT_STARTED | — |
| CC-1608 | AI analytics insights (attendance/fees/academics) | P2 | NOT_STARTED | — |
| CC-1609 | AI performance prediction | P3 | NOT_STARTED | — |

---

## Phase 18 — Performance Optimization

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1701 | Query optimization | P1 | ✅ COMPLETED | V39: 5 composite/covering indexes for report hot-paths + notice board (E74) |
| CC-1702 | API caching | P1 | ✅ COMPLETED | `RedisCacheManager` + `@Cacheable` on academic-years / classes / subjects / sections (E71) |
| CC-1703 | Load testing | P1 | ✅ COMPLETED | k6 smoke + load-auth + load-reports scripts; SLO thresholds defined (E77) |
| CC-1704 | Stress testing | P1 | ✅ COMPLETED | k6 stress.js — ramp → 200 VUs; 429s excluded from error SLO (E77) |
| CC-1705 | Caching strategy definition (what/where/TTL) | P1 | ✅ COMPLETED | `CacheConfig` documents what/where/TTL: academic-years/classes/subjects/sections/departments all 5–10 min in Redis; `@Cacheable` + `@CacheEvict` pattern established (E71/E79) |

---

## Phase 19 — Security Hardening

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1801 | Rate limiting | P1 | ✅ COMPLETED | `LoginRateLimiterService` — Redis sliding window, 429 `TooManyRequestsException`, `RateLimitProperties` |
| CC-1802 | Security audit logging | P1 | ✅ COMPLETED | `AuditLogService` `@Async` writer wired for auth events; `AuditLog` entity + `AuditAction` enum |
| CC-1803 | Data encryption validation | P1 | ✅ COMPLETED | AES-256-GCM `EncryptedStringConverter` on Student/Staff PII fields; V40 migration (E75) |
| CC-1804 | Tenant isolation verification | P0 | ✅ COMPLETED | `TenantIsolationTest` (6 tests, Testcontainers) — all pass |
| CC-1805 | Abuse prevention (throttles per tenant/user) | P1 | ✅ COMPLETED | `@RateLimit` annotation + `RateLimitInterceptor` + `ApiRateLimiterService` (E73) |
| CC-1806 | PII handling policy + retention | P1 | ✅ COMPLETED | Nightly `DataRetentionService` hard-purges expired soft-deleted users; configurable window (E76) |

---

## Phase 20 — Enterprise Scale Preparation

| Task ID | Title | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| CC-1901 | Database partitioning | P1 | NOT_STARTED | Partition by `tenant_id` for large tables |
| CC-1902 | Read replica support | P1 | NOT_STARTED | — |
| CC-1903 | Horizontal scaling preparation | P2 | NOT_STARTED | — |
| CC-1904 | Backup automation | P1 | ✅ COMPLETED | `infra/pgbackup/` — pg_dump sidecar with MinIO upload + 7-day retention cron |
| CC-1905 | Backup/restore drill automation | P1 | ✅ COMPLETED | `infra/pgbackup/drill.sh` — 6-phase DR drill: fresh backup → download from MinIO → restore to scratch DB → validate row counts + Flyway history → PASS/FAIL + teardown (E79) |
| CC-1906 | Secrets management standard | P1 | ✅ COMPLETED | `SecretsGuardConfig` startup validator; `.env.example` reference; `infra/secrets/vault-local.sh` dev bootstrap; Vault KV path standard documented (E80) |

---

## Final Goal

> CloudCampus should become a **fully scalable enterprise-grade multi-tenant SaaS operating system** for educational institutions.

---

## Thin-Slice MVP Milestones

### M1 — Tenant Onboarding + Secure Access

- Tenant entity + resolver + tenant-aware DB filters (CC-0201, CC-0202, CC-0203)
- User + JWT + RBAC + permission middleware (CC-0101, CC-0102, CC-0113, CC-0114)
- Super Admin: create tenant + assign plan/features (CC-0304, CC-0305)

### M2 — School Admin Basics

- Academic year + class/section/subject (CC-0402–CC-0405)
- Student entity + admission + listing (CC-0501–CC-0504)
- Basic dashboard (CC-0401)

### M3 — Operational Core

- Manual attendance + attendance report (CC-0801, CC-0805)
- Fee structure + collection + receipt (CC-0901, CC-0902, CC-0905)
- SMS/email notification baseline (CC-1001, CC-1002)

### M4 — Enterprise Guardrails

- Audit logs + observability + backups (CC-1802, CC-1904)
- Rate limiting + tenant isolation test suite (CC-1801, CC-0210)

---

## Phase 21 — Website Builder & Digital Experience Platform

### Core Architecture

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2001 | Setup website builder architecture | P0 | NOT_STARTED |
| CC-2002 | Create dynamic page engine | P0 | NOT_STARTED |
| CC-2003 | Create dynamic section engine | P0 | NOT_STARTED |
| CC-2004 | Create navigation builder | P1 | NOT_STARTED |
| CC-2005 | Create theme engine | P1 | NOT_STARTED |
| CC-2006 | Create layout engine | P1 | NOT_STARTED |

### Content Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2010 | Blog management system | P1 | NOT_STARTED |
| CC-2011 | Events calendar module | P1 | NOT_STARTED |
| CC-2012 | Photo gallery module | P1 | NOT_STARTED |
| CC-2013 | Teacher profile pages | P1 | NOT_STARTED |
| CC-2014 | Student achievement showcase | P2 | NOT_STARTED |
| CC-2015 | Dynamic homepage sections | P1 | NOT_STARTED |

### Marketing Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2020 | SEO management engine | P1 | NOT_STARTED |
| CC-2021 | Meta tag management | P1 | NOT_STARTED |
| CC-2022 | Sitemap generation | P2 | NOT_STARTED |
| CC-2023 | Analytics integration | P1 | NOT_STARTED |
| CC-2024 | Inquiry form builder | P1 | NOT_STARTED |
| CC-2025 | Lead tracking system | P2 | NOT_STARTED |
| CC-2026 | CTA management engine | P2 | NOT_STARTED |

### Communication Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2030 | WhatsApp website integration | P2 | NOT_STARTED |
| CC-2031 | Newsletter integration | P2 | NOT_STARTED |
| CC-2032 | Social media embeds | P2 | NOT_STARTED |
| CC-2033 | Contact form workflows | P2 | NOT_STARTED |

### AI Modules

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2040 | AI content generator | P3 | NOT_STARTED |
| CC-2041 | AI SEO assistant | P3 | NOT_STARTED |
| CC-2042 | AI page generator | P3 | NOT_STARTED |
| CC-2043 | AI admissions campaign generator | P3 | NOT_STARTED |

### Template Marketplace

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2050 | Template marketplace engine | P2 | NOT_STARTED |
| CC-2051 | Modern school template | P2 | NOT_STARTED |
| CC-2052 | International school template | P2 | NOT_STARTED |
| CC-2053 | College template | P2 | NOT_STARTED |
| CC-2054 | Coaching institute template | P2 | NOT_STARTED |

### Subscription & Feature Access

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2060 | Website feature subscription mapping | P1 | NOT_STARTED |
| CC-2061 | Website premium feature controls | P1 | NOT_STARTED |
| CC-2062 | Website plan upgrade flows | P2 | NOT_STARTED |
| CC-2063 | Dynamic website module visibility | P1 | NOT_STARTED |

### Performance & Infrastructure

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2070 | CDN integration | P1 | NOT_STARTED |
| CC-2071 | Image optimization pipeline | P1 | NOT_STARTED |
| CC-2072 | Static page optimization | P2 | NOT_STARTED |
| CC-2073 | Website cache optimization | P1 | NOT_STARTED |
| CC-2074 | Lazy loading implementation | P1 | NOT_STARTED |

### Analytics

| Task ID | Title | Priority | Status |
|---------|-------|----------|--------|
| CC-2080 | Visitor analytics | P2 | NOT_STARTED |
| CC-2081 | Conversion tracking | P2 | NOT_STARTED |
| CC-2082 | Lead analytics dashboard | P2 | NOT_STARTED |
| CC-2083 | SEO performance dashboard | P2 | NOT_STARTED |

---

---

## Next Session — Exact Implementation Order

Follow this order strictly. One task per session. Stop after each and confirm.

### 🔴 Phase A — Auth Enforcement (✅ COMPLETE)

| Session | Task ID | What to build | Status |
|---------|---------|--------------|--------|
| ✅ Done | CC-0102 | `JwtAuthenticationFilter` | ✅ DONE |
| ✅ Done | CC-0103 | `POST /v1/auth/login` | ✅ DONE |
| ✅ Done | CC-0105 | Redis refresh token system | ✅ DONE |
| ✅ Done | CC-1801 | Brute-force protection — Redis sliding window rate limiter | ✅ DONE |
| ✅ Done | CC-1802 | `AuditLogService` — `@Async` writer, log auth events | ✅ DONE |
| ✅ Done | CC-0113/CC-0114 | RBAC enforcement in `SecurityConfig` | ✅ DONE |

### 🟠 Phase B — Foundation Completeness (✅ COMPLETE)

| Session | Task ID | What to build | Status |
|---------|---------|---------------|--------|
| B1 | CC-0213 | `School` entity + `V6__create_schools.sql` + auto-create on tenant onboarding | ✅ DONE |
| B2 | CC-0203 | Hibernate `@Filter` tenant isolation on all entities | ✅ DONE |
| B3 | CC-0210 | Tenant isolation automated test suite (Testcontainers) | ✅ DONE |
| B4 | CC-0012 | `FeatureFlagService` + `@RequiresFeature` AOP + Redis cache + `useFeatureFlag` hook | ✅ DONE |
| B5 | V8 | `V8__add_indexes.sql` — composite indexes | ✅ DONE |
| B6 | V9 | `V9__soft_delete.sql` — `deleted_at` column | ✅ DONE |

### 🟡 Phase C — ERP Core (✅ COMPLETE — E1–E14)

| Session | Domain | What was built | Status |
|---------|--------|---------------|--------|
| E1–E3 | Academic backend | Academic years, classes, sections, subjects, departments (V11–V15) | ✅ DONE |
| E4 | Student backend | Student entity, admission, listing, parent mapping (V17–V18) | ✅ DONE |
| E5 | Staff backend | Staff entity, profiles (V19) | ✅ DONE |
| E6 | Attendance backend | Attendance sessions + records, mark/lock (V20–V21) | ✅ DONE |
| E7 | School admin frontend | React scaffold, dashboard, academic year/class/section/subject pages, feature-flag nav | ✅ DONE |
| E8 | Student frontend | Student admit, profile, listing pages | ✅ DONE |
| E9 | Staff frontend | Staff list, create, profile pages | ✅ DONE |
| E10 | Attendance frontend | Session list, create session, mark attendance pages | ✅ DONE |
| E11 | Finance (full-stack) | Fee categories, structures, collection, receipts — backend + 4 frontend pages | ✅ DONE |
| E12 | Communication backend | `NotificationService`, SMS stub, email (JavaMailSender), `NotificationLog` entity + V25 migration | ✅ DONE |
| E13 | Push notifications | Firebase Admin SDK 9.3.0, `PushService`/`PushServiceImpl`, device token fan-out, send-push endpoint | ✅ DONE |
| E14 | WhatsApp integration | `WhatsAppMessageLog` + V26 migration, async stub service, send + log APIs, `NotificationLogPage` (3 tabs) + `WhatsAppPage` (2 tabs); 253 modules 0 errors | ✅ DONE |
| E15 | Exam system | `Exam`+`ExamSubject` entities + V27+V28 migrations; service; 6 endpoints; `ExamListPage`+`ExamCreatePage`+`ExamDetailPage`; 257 modules 0 errors | ✅ DONE |
| E16 | Marks entry | `StudentMark` entity + V29 migration; `MarksService`; 4 endpoints; `MarksEntryPage` spreadsheet grid; 259 modules 0 errors | ✅ DONE |

### 🔵 Phase D — Communication & Notifications ✅ COMPLETE

| Session | Task ID | What to build | Status |
|---------|---------|---------------|--------|
| E12 | CC-1001/CC-1002 | SMS + Email notification baseline — `NotificationService`, templates, MailHog integration, notification dispatch API | ✅ DONE |
| E13 | CC-1003 | Push notification system — device token management, FCM/APNs dispatch | ✅ DONE |
| E14 | CC-1004 | WhatsApp integration | ✅ DONE |

### 🟣 Phase E — Examination System (E15 ✅ DONE)

| Session | Task ID | What to build | Status |
|---------|---------|---------------|--------|
| E15 | CC-1101 | Exam creation — `Exam` entity, scheduling, subjects assignment | ✅ DONE |
| E16 | CC-1102 | Marks entry system — marks recording per student per subject | ✅ DONE |
| E17 | CC-1103/CC-1104 | Result generation + report card generation | ✅ DONE |
| E18 | CC-0701 | Timetable management — weekly grid, conflict detection, backend + frontend | ✅ DONE |
| E19 | CC-0702 | Homework management — DRAFT→PUBLISHED→CLOSED lifecycle, list + create pages | ✅ DONE |
| E20 | CC-0703 | Assignment engine — submissions + grading, 2-table schema, grade modal | ✅ DONE |

### 🟤 Phase G — Portal Completions & Cross-Cutting (E28–E46 ✅ COMPLETE)

| Session | Domain | What was built | Status |
|---------|--------|---------------|--------|
| E28 | Bug fixes + hardening | Redis fail-open fix, FilterRegistrationBean, ExamType MIDTERM, optional academicYearId params (homework/assignments/fees), full 35-endpoint API audit, 287 modules 0 errors | ✅ DONE |
| E29 | Teacher homework portal | `TeacherHomeworkListPage` (cascading filters, overdue badge), `TeacherHomeworkCreatePage`, 5 API functions, 2 routes | ✅ DONE |
| E30 | Teacher assignment portal | `TeacherAssignmentListPage`, `TeacherAssignmentCreatePage`, `TeacherAssignmentDetailPage` (grade modal, max-marks), 7 API functions, 3 routes | ✅ DONE |
| E31 | Student portal | `StudentLayout`, `StudentDashboardPage`, homework+assignments+timetable+notices pages, `studentPortalApi.ts`, STUDENT role guards | ✅ DONE |
| E32 | Parent portal | `ParentLayout`, `ParentDashboardPage`, `ParentChildPage` (tabs: timetable/homework/notices), `parentApi.ts`, PARENT role guards | ✅ DONE |
| E33 | Staff attendance backend | `StaffAttendance` entity, `StaffAttendanceStatus` enum, bulk mark, school-admin endpoints (CC-0603) | ✅ DONE |
| E34 | Leave management backend | `LeaveRequest` entity, `LeaveStatus` enum, staff self-service + school-admin review endpoints (CC-0604) | ✅ DONE |
| E35 | Teacher dashboard | `TeacherDashboardController` (today's timetable, pending reviews), `TeacherDashboardPage`, updated login redirect | ✅ DONE |
| E37 | School admin live dashboard | `SchoolDashboardController` with live counts, `SchoolAdminDashboardPage` rewritten with live TanStack Query + alert banners | ✅ DONE |
| E38 | Student results + fees self-service | `StudentResultsController`, `StudentFeesController`, `StudentResultsPage`, `StudentFeesPage`, nav + routes (CC-0601/CC-0901) | ✅ DONE |
| E39 | Teacher attendance marking | `TeacherAttendancePage` — teacher-portal class/section attendance marking, reuses existing session/mark endpoints | ✅ DONE |
| E40 | Mobile student screens | `AssignmentsScreen`, `ResultsScreen`, `FeesScreen` with ₹-formatted summaries; Expo Router files; STUDENT tab flags in `_layout.tsx` | ✅ DONE |
| E41 | Student attendance self-view | `AttendanceRecordRepository.findStudentHistory()`, `StudentAttendanceController` (`GET /v1/student/attendance`), `StudentAttendancePage`, `AttendanceScreen` (mobile) | ✅ DONE |
| E42 | Teacher notices + role-aware mobile dashboard | `TeacherNoticesPage`, mobile `index.tsx` rewritten with per-role TanStack Query hooks (Student / Teacher / Parent sections + notices) | ✅ DONE |
| E43 | Change password (CC-0116 partial) | `ChangePasswordRequest` DTO, `AuthServiceImpl.changePassword()` (BCrypt verify + audit), `POST /v1/auth/change-password`, `ChangePasswordPage`, sidebar links in all 5 layouts | ✅ DONE |
| E44 | schoolId in login response | `LoginResponse.schoolId` UUID field, `AuthServiceImpl` resolves school for SCHOOL_ADMIN at login, frontend type cleanup, unblocks `NoticeBoardPage` | ✅ DONE |
| E45 | Mobile change-password + nav guard | `ChangePasswordScreen`, `/(auth)/change-password` Expo route, `NavigationGuard` forced-change redirect case | ✅ DONE |
| E46 | Parent child fee records tab | `GET /v1/parent/children/{studentId}/fees`, `getChildFees()` API fn, `FeesTab` component in `ParentChildPage`, 5-tab bar with `overflow-x-auto` | ✅ DONE |

### ⚪ Phase F — Remaining Foundations (Parallel with E12+)

| Session | Task ID | What to build |
|---------|---------|---------------|
| F1 | EUP-006 | OpenAPI/Swagger setup (springdoc) |
| F2 | EUP-008 | Multi-stage `Dockerfile` (non-root user, layered JAR) |
| F3 | CC-1502 | GitHub Actions CI pipeline (build + test + Docker push) |
| F4 | CC-0107/CC-0108 | Forgot password / OTP reset flow |

---

*End of Roadmap — updated 2026-05-14 E46 complete (112/193 tasks — 58.0%) — Next: E47*
