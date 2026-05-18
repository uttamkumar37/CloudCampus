# CloudCampus — Audit Remediation Status

**Branch:** `main`
**Last Updated:** 2026-05-18
**Auditor:** Principal Architect + Security + SRE + DBA (6-Agent Parallel Audit)

---

## Overall Progress

| Severity | Total | Done | Remaining | % |
|---|---|---|---|---|
| CRITICAL | 21 | **21** | 0 | **100%** ✅ |
| HIGH (labeled H-01 → H-30) | 30 | **30** | 0 | **100%** ✅ |
| MEDIUM (M-01 → M-20) | 20 | **20** | 0 | **100%** ✅ |
| LOW (L-01 → L-30) | 30 | **30** | 0 | **100%** ✅ |
| **Grand Total** | **101** | **101** | **0** | **100%** ✅ |

> **Production Gate:** All 101 labeled findings resolved. Platform is **fully hardened** per the audit's remediation plan. GA launch approved.

---

## CRITICAL Blockers — 21 / 21 Complete ✅

| ID | Finding | Commit | Status |
|---|---|---|---|
| CRIT-01 | Alertmanager disconnected — alerts fire into a void | `785b7dc` | ✅ Done |
| CRIT-02 | PostgreSQL TLS `NonValidatingFactory` in prod config | `785b7dc` | ✅ Done |
| CRIT-03 | No container resource limits — OOM risk | `785b7dc` | ✅ Done |
| CRIT-04 | All Docker ports exposed on `0.0.0.0` | `785b7dc` | ✅ Done |
| CRIT-05 | Hardcoded credentials in `docker-compose.yml` | `785b7dc` | ✅ Done |
| CRIT-06 | pgbackup container runs as root | `785b7dc` | ✅ Done |
| CRIT-07 | Backup dumps have no encryption (GDPR/PII risk) | `8b4a6cd` | ✅ Done |
| CRIT-08 | No HTTPS / no reverse proxy anywhere | `58becf5` | ✅ Done |
| CRIT-09 | Redis has no authentication | `785b7dc` | ✅ Done |
| CRIT-10 | `ThreadLocal` RequestContext unsafe for `@Async` | `f7a26a5` | ✅ Done |
| CRIT-11 | Refresh token rotation race condition (double-spend) | `5b06e5e` | ✅ Done |
| CRIT-12 | V46 pgvector migration fails on standard PostgreSQL | `f7a26a5` | ✅ Done |
| CRIT-13 | Receipt number race condition — duplicate receipts | `7cbc9cf` | ✅ Done |
| CRIT-14 | Fee record `findById()` bypasses tenant isolation | `7cbc9cf` | ✅ Done |
| CRIT-15 | Prompt injection in RAG knowledge base query | `7bb8076` | ✅ Done |
| CRIT-16 | AI budget enforcement bypass via `null` tenantId | `3a5e7d1` | ✅ Done |
| CRIT-17 | Zero backend unit tests for core business services | `8ec3741` | ✅ Done |
| CRIT-18 | RabbitMQ `acknowledge-mode: auto` — notifications lost | `b73df10` | ✅ Done |
| CRIT-19 | `@EnableScheduling` with no distributed lock (ShedLock) | `1140ed4` | ✅ Done |
| CRIT-20 | Unbounded `List<Student>` queries — OOM risk | `b2ef990` | ✅ Done |
| CRIT-21 | All GitHub Actions use mutable tags (supply chain risk) | `a227e50` | ✅ Done |

---

## HIGH Severity — 30 / 30 Complete ✅

### Security & Auth

| ID | Finding | Commit | Status |
|---|---|---|---|
| H-01 | Missing `@PreAuthorize` on payment school-admin endpoint | `f837ac6` | ✅ Done |
| H-02 | JWT access token not invalidated on logout | `ba30073` | ✅ Done |
| H-03 | OTP reset endpoint has no rate limiting | `97dc7be` | ✅ Done |
| H-04 | X-Forwarded-For spoofable — IP rate limiter bypassed | `a7dfaad` | ✅ Done |

### Backend & Database

| ID | Finding | Commit | Status |
|---|---|---|---|
| H-05 | N+1 query in `getStudentReport()` — unbounded IN clause | `85a9cd9` | ✅ Done |
| H-06 | `tenantRepo.findAll()` in analytics — unbounded heap load | `458a409` | ✅ Done |
| H-07 | RabbitMQ no publisher confirms — messages silently lost | `56f4f29` | ✅ Done |
| H-08 | 5 tables missing `tenant_id` FK constraints | `4a322b8` | ✅ Done |
| H-09 | `payment_orders` missing `student_id` / `initiated_by` FKs | `4a322b8` | ✅ Done |
| H-10 | `lesson_plans`, `online_classes`, `video_resources` missing `school_id` indexes | `5feb8fc` | ✅ Done |
| H-11 | `@Async` AuditLogService crosses thread boundary — `RequestContext` null | `f7a26a5` | ✅ Done |
| H-12 | Non-atomic rate limiter sliding window — TOCTOU race | `79cac89` | ✅ Done |

### Observability & Performance

| ID | Finding | Commit | Status |
|---|---|---|---|
| H-13 | No custom Micrometer metrics — zero business signal visibility | `547ae26` | ✅ Done |
| H-14 | No Redis Lettuce connection pool | `d58ee03` | ✅ Done |
| H-15 | G1GC default — ZGC recommended for low-latency SaaS | `e9d0b4c` | ✅ Done |
| H-16 | `notificationExecutor` queue=100 too small | `632227a` | ✅ Done |
| H-17 | RabbitMQ no prefetch count — 250 auto-acked in-flight | `56f4f29` | ✅ Done |
| H-18 | Tempo trace retention 24h only | `632227a` | ✅ Done |
| H-19 | No `@NewSpan` instrumentation — no child spans in service calls | `36d0be2` | ✅ Done |
| H-20 | Frontend: no code splitting — single JS bundle for all routes | `dcacc90` | ✅ Done |

### Code Quality, Testing & AI Safety

| ID | Finding | Commit | Status |
|---|---|---|---|
| H-21 | No CI SAST / CVE scan / secret scanning | `e28e30e` | ✅ Done |
| H-22 | `ParentController` injects 8 repositories directly | `70496d3` | ✅ Done |
| H-23 | AI output unbounded — no length cap or content filter | `5bbcf52` | ✅ Done |
| H-24 | No per-user rate limit on AI endpoints | `e09192d` | ✅ Done |
| H-25 | Load tests hardcode `admin123` fallback credential | `ac432e4` | ✅ Done |
| H-26 | No tenant isolation tests for `findById()` on exam/fee records | `f846972` | ✅ Done |
| H-27 | Frontend test coverage superficial | `3b0af70` | ✅ Done |
| H-28 | No payment HMAC signature test | `00cec1d` | ✅ Done |
| H-29 | No CI backend test pipeline on PR | — | ✅ Already satisfied (`mvn verify` on every PR) |
| H-30 | Per-tenant API rate limit (60 req/min) too low | `6021c21` | ✅ Done |

---

## MEDIUM Severity — 20 / 20 Complete ✅

*These must be resolved before GA launch.*

| ID | Finding | File | Status |
|---|---|---|---|
| M-01 | No CI/CD container image vulnerability scanning | `ci.yml` | ✅ Done — Trivy added in H-21 (`e28e30e`) |
| M-02 | Grafana `admin/admin` + dashboard edit/delete enabled | `docker-compose.yml` | ✅ Done |
| M-03 | `ConstraintViolationException` leaks internal Java method names | `RestExceptionHandler.java` | ✅ Done |
| M-04 | Missing `DEFAULT gen_random_uuid()` on `notification_logs.id` | `V25__create_notification_logs.sql` | ✅ Done — V63 migration adds DEFAULT |
| M-05 | Redis `@Cacheable` has no TTL — feature flags permanently stale | `RedisConfig.java` | ✅ Done — per-cache TTLs in `CacheConfig.java` (`RedisCacheManager`) |
| M-06 | MMKV encryption keys hardcoded in mobile binary | `mobile/shared/storage/profileStore.ts` | ✅ Done — key derived from `expo-secure-store` (Keystore/SecureEnclave) |
| M-07 | Mobile: no 401-request queue — concurrent refresh breaks rotation | `mobile/shared/api/axiosInstance.ts` | ✅ Done — `isRefreshing` + `failedQueue` pattern added |
| M-08 | Mobile: `targetRoute` from push notification not validated | `useNotificationListeners.ts` | ✅ Done — exact-match allowlist before `router.push()` |
| M-09 | No certificate pinning on mobile app | `mobile/shared/api/axiosInstance.ts` | ✅ Done — Expo config plugin adds Android NSC + iOS ATS pinning |
| M-10 | Public site renders `imageUrl` into CSS without URL sanitization | `PublicSitePage.tsx` | ✅ Done — http/https allowlist before CSS injection |
| M-11 | MDC context not propagated to async tasks — traceId lost | `AsyncConfig.java` | ✅ Done — `RequestContextTaskDecorator` on both async executors |
| M-12 | `audit_log.actor_id` has no FK to `users(id)` | `V4__create_audit_log.sql` | ✅ Done — added in H-08 FK migration (`4a322b8`) |
| M-13 | V48 migration gap — prevents future V48 in production | Flyway migrations | ✅ Done — V48__DELETED.sql placeholder added |
| M-14 | `device_tokens` table missing `tenant_id` — filter cannot apply | `V10__create_device_tokens.sql` | ✅ Done — V64 migration + entity + repo + service updated |
| M-15 | Loki/Promtail not implemented — JSON logs go to stdout only | `logback-spring.xml` | ✅ Done — Loki + Promtail added to docker-compose; Grafana datasource provisioned |
| M-16 | HikariCP pool (20) insufficient for multi-replica deployment | `application-prod.yml` | ✅ Done — env-var driven `HIKARI_MAX_POOL_SIZE` with sizing formula documented |
| M-17 | `ai_usage_logs` missing `school_id` — no per-school cost attribution | `V46__ai_foundation.sql` | ✅ Done — V65 migration + entity/service/gateway updated |
| M-18 | `@EnableScheduling` — no metrics on executor queue depth | `AsyncConfig.java` | ✅ Done — `ExecutorServiceMetrics` bound to both executors |
| M-19 | `AttendanceRecordRepository` implicit JPQL cross-join bypasses filter | `AttendanceRecordRepository.java` | ✅ Done — both comma-join queries rewritten as native INNER JOIN |
| M-20 | No MinIO health indicator in Spring Actuator | `application.yml` | ✅ Done — `MinioHealthIndicator` added (bucket existence check) |

---

## LOW Severity — 30 / 30 Complete ✅

| ID | Finding | Commit | Status |
|---|---|---|---|
| L-01 | `useEffect` suppressed `react-hooks/exhaustive-deps` in QR scan page | `ae13215` | ✅ Done — `useRef` for initial token, `mutate` in deps |
| L-02 | No global error boundary in React app | `ae13215` | ✅ Done — `ErrorBoundary` class component wraps `App` |
| L-03 | Feature flags stale after subscription downgrade | `ae13215` | ✅ Done — `FeatureFlagService.invalidateForTenant()` called on subscription save |
| L-04 | `schoolId` taken from client-side Zustand store — not from JWT | `ae13215` | ✅ Done — `SchoolDashboardController` validates URL schoolId vs JWT claim |
| L-05 | Mobile: `useProactiveTokenRefresh` always no-ops | `ae13215` | ✅ Done — JWT `exp` claim decoded via `atob()` for absolute expiry comparison |
| L-06 | Mobile: no biometric re-authentication on session restore | `ae13215` | ✅ Done — `expo-local-authentication` biometric gate in `useSessionHydration` |
| L-07 | Mobile: WatermelonDB SQLite database unencrypted | `ae13215` | ✅ Done — 256-bit AES key in Keychain/Keystore via SecureStore; `initDatabase()` in root layout |
| L-08 | Mobile: no Universal Links / App Links configuration | `ae13215` | ✅ Done — iOS `associatedDomains` + Android `intentFilters` added to `app.json` |
| L-09 | Swagger UI `permitAll()` could drift from springdoc config | `ae13215` | ✅ Done — paths injected via `@Value` from springdoc properties |
| L-10 | File upload stores `getOriginalFilename()` in DB — XSS via filename | `ae13215` | ✅ Done — `sanitizeFilename()` strips HTML/path chars before DB insert |
| L-11 | Demo seed users have predictable UUIDs — server fingerprinting | `ae13215` | ✅ Done — `DemoDataSeeder` uses `UUID.randomUUID()` instead of `nameUUIDFromBytes` |
| L-12 | V48 migration gap — cannot safely add V48 later | `ae13215` | ✅ Done — resolved by M-13 (`V48__DELETED.sql` placeholder) |
| L-13 | Soft delete (`deleted_at`) missing on several content tables | `ae13215` | ✅ Done — V67 adds `deleted_at` + partial indexes on 5 content tables |
| L-14 | `student_fee_records.tenant_id` missing FK to `tenants(id)` | `ae13215` | ✅ Done — V66 migration adds FK constraint |
| L-15 | `BCryptPasswordEncoder(12)` thread saturation under high concurrent login | `ae13215` | ✅ Done — cost factor reduced to 10 in `SecurityConfig` |
| L-16 | `AiGatewayService` model name is a misspelled constant | `ae13215` | ✅ Done — model name driven by `@Value("${app.ai.chat-model:...}")` |
| L-17 | Mock AI response leaks "no API key configured" + prompt preview | `ae13215` | ✅ Done — `MockChatModel` returns neutral placeholder, no internal state exposed |
| L-18 | No payment flow integration test (Razorpay webhook → fee record update) | `ae13215` | ✅ Done — `PaymentFlowIntegrationTest` with Testcontainers + real PostgreSQL |
| L-19 | No authentication lockout integration test | `ae13215` | ✅ Done — `AuthLockoutIntegrationTest` with Testcontainers + Redis |
| L-20 | `Testcontainers` test runs only locally — not in any CI workflow | `ae13215` | ✅ Done — `mvn verify` in CI already executes Testcontainers integration tests |
| L-21 | Frontend tests use hardcoded text selectors — brittle against copy changes | `ae13215` | ✅ Done — `data-testid` attributes added; tests updated to `getByTestId()` |
| L-22 | `traceId`/`spanId` not in Logback MDC explicit allowlist | `ae13215` | ✅ Done — both keys added to `logback-spring.xml` MDC allowlist |
| L-23 | Virtual threads not enabled; `ThreadLocal` migration CC-0011 not completed | `ae13215` | ✅ Done — `spring.threads.virtual.enabled: true` in `application.yml` |
| L-24 | No cache hit/miss metrics bound to Prometheus | `ae13215` | ✅ Done — `RedisCacheManager.enableStatistics()` exposes Micrometer cache metrics |
| L-25 | `allEntries=true` cache eviction too aggressive for multi-school tenants | `ae13215` | ✅ Done — key-specific `@CacheEvict` SpEL expressions across 4 service impls |
| L-26 | MinIO `latest` Docker image tag — unpinned | `ae13215` | ✅ Done — MinIO uses pinned release tag in `docker-compose.yml` |
| L-27 | Docker log rotation not configured — disk fill risk | `ae13215` | ✅ Done — YAML anchor `x-logging` with `max-size: 10m, max-file: 3` on all services |
| L-28 | pgbackup downloads binaries without checksum verification | `ae13215` | ✅ Done — `sha256sum -c` verification in `infra/pgbackup/Dockerfile` |
| L-29 | `Retention_days` default mismatch: compose=7, `.env.example`=30 | `ae13215` | ✅ Done — `RETENTION_DAYS:-30` default in `docker-compose.yml` |
| L-30 | `application-local.yml` ships inside the JAR | `ae13215` | ✅ Done — Maven `<excludes>` in `pom.xml` prevents local config from entering JAR |

---

## Launch Gate Summary

| Gate | Requirement | Status |
|---|---|---|
| **Any deployment** | All 21 CRITICAL resolved | ✅ **CLEARED** |
| **Soft launch** (1–3 pilot schools) | CRITICAL + HIGH complete | ✅ **CLEARED** |
| **GA launch** | CRITICAL + HIGH + MEDIUM complete | ✅ **CLEARED** |
| **Fully hardened** | All 101 labeled findings resolved | ✅ **CLEARED** |

---

*Generated: 2026-05-17 · Branch: `remediation/phase-1-critical-security` · 32 commits*
