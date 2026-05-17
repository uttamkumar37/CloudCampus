# CloudCampus — Audit Remediation Status

**Branch:** `remediation/phase-1-critical-security`
**Last Updated:** 2026-05-17
**Auditor:** Principal Architect + Security + SRE + DBA (6-Agent Parallel Audit)

---

## Overall Progress

| Severity | Total | Done | Remaining | % |
|---|---|---|---|---|
| CRITICAL | 21 | **21** | 0 | **100%** ✅ |
| HIGH (labeled H-01 → H-30) | 30 | **30** | 0 | **100%** ✅ |
| MEDIUM (M-01 → M-20) | 20 | 0 | 20 | 0% |
| LOW (L-01 → L-30) | 30 | 0 | 30 | 0% |
| **Grand Total** | **101** | **51** | **50** | **50%** |

> **Production Gate:** All CRITICAL blockers cleared. All labeled HIGH findings resolved. The platform may proceed to **soft launch (1–3 pilot schools)** per the audit's Phase 1 + Phase 2 recommendation. GA requires MEDIUM completion.

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

## MEDIUM Severity — 0 / 20 Complete ❌

*These must be resolved before GA launch.*

| ID | Finding | File | Status |
|---|---|---|---|
| M-01 | No CI/CD container image vulnerability scanning | `ci.yml` | ✅ Done — Trivy added in H-21 (`e28e30e`) |
| M-02 | Grafana `admin/admin` + dashboard edit/delete enabled | `docker-compose.yml` | ✅ Done |
| M-03 | `ConstraintViolationException` leaks internal Java method names | `RestExceptionHandler.java` | ✅ Done |
| M-04 | Missing `DEFAULT gen_random_uuid()` on `notification_logs.id` | `V25__create_notification_logs.sql` | ✅ Done — V63 migration adds DEFAULT |
| M-05 | Redis `@Cacheable` has no TTL — feature flags permanently stale | `RedisConfig.java` | ✅ Done — per-cache TTLs in `CacheConfig.java` (`RedisCacheManager`) |
| M-06 | MMKV encryption keys hardcoded in mobile binary | `mobile/shared/storage/profileStore.ts` | ⬜ Pending |
| M-07 | Mobile: no 401-request queue — concurrent refresh breaks rotation | `mobile/shared/api/axiosInstance.ts` | ⬜ Pending |
| M-08 | Mobile: `targetRoute` from push notification not validated | `useNotificationListeners.ts` | ⬜ Pending |
| M-09 | No certificate pinning on mobile app | `mobile/shared/api/axiosInstance.ts` | ⬜ Pending |
| M-10 | Public site renders `imageUrl` into CSS without URL sanitization | `PublicSitePage.tsx` | ⬜ Pending |
| M-11 | MDC context not propagated to async tasks — traceId lost | `AsyncConfig.java` | ✅ Done — `RequestContextTaskDecorator` on both async executors |
| M-12 | `audit_log.actor_id` has no FK to `users(id)` | `V4__create_audit_log.sql` | ✅ Done — added in H-08 FK migration (`4a322b8`) |
| M-13 | V48 migration gap — prevents future V48 in production | Flyway migrations | ✅ Done — V48__DELETED.sql placeholder added |
| M-14 | `device_tokens` table missing `tenant_id` — filter cannot apply | `V10__create_device_tokens.sql` | ✅ Done — V64 migration + entity + repo + service updated |
| M-15 | Loki/Promtail not implemented — JSON logs go to stdout only | `logback-spring.xml` | ⬜ Pending |
| M-16 | HikariCP pool (20) insufficient for multi-replica deployment | `application-prod.yml` | ⬜ Pending |
| M-17 | `ai_usage_logs` missing `school_id` — no per-school cost attribution | `V46__ai_foundation.sql` | ✅ Done — V65 migration + entity/service/gateway updated |
| M-18 | `@EnableScheduling` — no metrics on executor queue depth | `AsyncConfig.java` | ✅ Done — `ExecutorServiceMetrics` bound to both executors |
| M-19 | `AttendanceRecordRepository` implicit JPQL cross-join bypasses filter | `AttendanceRecordRepository.java` | ⬜ Pending |
| M-20 | No MinIO health indicator in Spring Actuator | `application.yml` | ⬜ Pending |

---

## LOW Severity — 0 / 30 Complete ❌

*Fix before GA. No production blocker but should not accumulate.*

| ID | Finding | Status |
|---|---|---|
| L-01 | `useEffect` suppressed `react-hooks/exhaustive-deps` in QR scan page | ⬜ Pending |
| L-02 | No global error boundary in React app | ⬜ Pending |
| L-03 | Feature flags stale after subscription downgrade | ⬜ Pending |
| L-04 | `schoolId` taken from client-side Zustand store — not from JWT | ⬜ Pending |
| L-05 | Mobile: `useProactiveTokenRefresh` always no-ops | ⬜ Pending |
| L-06 | Mobile: no biometric re-authentication on session restore | ⬜ Pending |
| L-07 | Mobile: WatermelonDB SQLite database unencrypted | ⬜ Pending |
| L-08 | Mobile: no Universal Links / App Links configuration | ⬜ Pending |
| L-09 | Swagger UI `permitAll()` could drift from springdoc config | ⬜ Pending |
| L-10 | File upload stores `getOriginalFilename()` in DB — XSS via filename | ⬜ Pending |
| L-11 | Demo seed users have predictable UUIDs — server fingerprinting | ⬜ Pending |
| L-12 | V48 migration gap — cannot safely add V48 later | ⬜ Pending |
| L-13 | Soft delete (`deleted_at`) missing on several content tables | ⬜ Pending |
| L-14 | `student_fee_records.tenant_id` missing FK to `tenants(id)` | ⬜ Pending |
| L-15 | `BCryptPasswordEncoder(12)` thread saturation under high concurrent login | ⬜ Pending |
| L-16 | `AiGatewayService` model name is a misspelled constant | ⬜ Pending |
| L-17 | Mock AI response leaks "no API key configured" + prompt preview | ⬜ Pending |
| L-18 | No payment flow integration test (Razorpay webhook → fee record update) | ⬜ Pending |
| L-19 | No authentication lockout integration test | ⬜ Pending |
| L-20 | `Testcontainers` test runs only locally — not in any CI workflow | ⬜ Pending |
| L-21 | Frontend tests use hardcoded text selectors — brittle against copy changes | ⬜ Pending |
| L-22 | `traceId`/`spanId` not in Logback MDC explicit allowlist | ⬜ Pending |
| L-23 | Virtual threads not enabled; `ThreadLocal` migration CC-0011 not completed | ⬜ Pending |
| L-24 | No cache hit/miss metrics bound to Prometheus | ⬜ Pending |
| L-25 | `allEntries=true` cache eviction too aggressive for multi-school tenants | ⬜ Pending |
| L-26 | MinIO `latest` Docker image tag — unpinned | ⬜ Pending |
| L-27 | Docker log rotation not configured — disk fill risk | ⬜ Pending |
| L-28 | pgbackup downloads binaries without checksum verification | ⬜ Pending |
| L-29 | `Retention_days` default mismatch: compose=7, `.env.example`=30 | ⬜ Pending |
| L-30 | `application-local.yml` ships inside the JAR | ⬜ Pending |

---

## Launch Gate Summary

| Gate | Requirement | Status |
|---|---|---|
| **Any deployment** | All 21 CRITICAL resolved | ✅ **CLEARED** |
| **Soft launch** (1–3 pilot schools) | CRITICAL + HIGH complete | ✅ **CLEARED** |
| **GA launch** | CRITICAL + HIGH + MEDIUM complete | ❌ 20 MEDIUM remaining |
| **Fully hardened** | All 101 labeled findings resolved | ❌ 50 remaining |

---

*Generated: 2026-05-17 · Branch: `remediation/phase-1-critical-security` · 31 commits*
