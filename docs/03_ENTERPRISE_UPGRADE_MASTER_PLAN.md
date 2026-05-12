# CloudCampus — Enterprise Full-Stack Upgrade Master Plan

**Author:** Principal Architect Review
**Version:** 2026-05-12 session 4 — Phase A fully complete (A1–A6); Phase B starting
**Status:** Approved — awaiting phased execution
**Scope:** Backend · Database · Frontend · Mobile · DevOps · Security · Scaling

---

## Reading Guide

This document is the master upgrade plan for CloudCampus. It covers every layer of the stack.

**How to use:**
- Each section identifies problems, recommended fixes, risk level, and breaking-change status.
- Fixes are mapped to Task IDs (EUP-XXXX).
- At the end: prioritized execution order.
- Implementation is incremental — stop after each phase and confirm.

**Conventions:**

| Symbol | Meaning |
|--------|---------|
| ⚠️ | Current code has this problem |
| ✅ | Already implemented correctly |
| 🔴 | P0 — Must fix before any production traffic |
| 🟠 | P1 — Fix in Milestone 1 |
| 🟡 | P2 — Fix in Milestone 2 |
| 🔵 | P3 — Fix when relevant module ships |

---

## Current Codebase Inventory (2026-05-12)

| File / Module | Status |
|---------------|--------|
| `pom.xml` | ✅ Java 21, SB 3.4.5, all deps declared |
| `application.yml` | ✅ Hardened — compression, JPA batch, Prometheus |
| `application-dev.yml` | ✅ H2 + HikariCP + Redis dev overrides |
| `logback-spring.xml` | ✅ JSON async prod, colored dev |
| `SecurityConfig.java` | ✅ Phase 1 (permit-all); Phase 2 pending |
| `JwtUtil.java` | ✅ Generate + validate HS256 tokens |
| `JwtProperties.java` | ✅ Config binding record |
| `RequestContext.java` | ✅ ThreadLocal tenant/school/user propagation |
| `CorrelationIdFilter.java` | ✅ Sanitized correlation ID injection |
| `SecurityHeadersFilter.java` | ✅ 7 OWASP headers |
| `RestExceptionHandler.java` | ✅ Standardized error responses |
| `ApiResponse.java` / `ApiError.java` | ✅ Response envelopes |
| `TenantContextFilter.java` | ✅ Header-based tenant resolution |
| `Tenant.java` / `TenantRepository.java` | ✅ Entity + repo |
| `TenantServiceImpl.java` | ✅ CRUD with conflict detection |
| `User.java` / `UserRepository.java` | ✅ Entity + repo |
| `UserRole.java` / `UserStatus.java` | ✅ Enums (7 roles, 3 statuses) |
| `SuperAdminBootstrap.java` | ✅ Idempotent admin creation |
| V1–V5 Flyway migrations | ✅ Core schema done |
| `docker-compose.yml` | ✅ PG16, Redis7, MinIO, MailHog |
| `JwtAuthenticationFilter` | ✅ Built (CC-0102) — registered in SecurityConfig |
| Login / Auth API | ❌ Not built (CC-0103) |
| Refresh token system | ❌ Not built (CC-0105) |
| Feature flag service layer | ❌ Not built (CC-0012) |
| Tenant-aware JPA query filters | ❌ Not built (CC-0203) |
| Rate limiting | ❌ Not built (CC-1801) |
| Audit log writer | ❌ Not built (CC-1802) |
| Frontend | ❌ Not started |
| Mobile apps | ❌ Not started |
| CI/CD | ❌ Not started |
| OpenAPI / Swagger | ❌ Not configured |

---

## Section 1 — Backend Architecture

---

### EUP-001 · JwtAuthenticationFilter ✅ COMPLETED (2026-05-12)

**Current Problem**

`SecurityConfig` is in permit-all mode. No filter reads or validates JWT tokens from incoming requests. `RequestContext.userId` is never populated. The entire auth layer is non-functional in terms of enforcement.

**Recommended Upgrade**

Create `JwtAuthenticationFilter extends OncePerRequestFilter`:
- Reads `Authorization: Bearer <token>` header.
- Calls `JwtUtil.validateAndParse()`.
- On valid token: builds `UsernamePasswordAuthenticationToken`, sets it in `SecurityContextHolder`, populates `RequestContext` (tenantId, userId, schoolId from claims).
- On missing token: does NOT reject (Phase 1 still permit-all — filter just enriches context when token present).
- On invalid/expired token: clears context, continues chain (request fails authorization at matcher level).

Then in `SecurityConfig`, register the filter:
```java
.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
```

**Risk Level:** 🔴 P0
**Breaking Change:** No (permit-all unchanged for now)
**Migration Required:** No
**Task ID:** CC-0102

---

### EUP-002 · Login API (Missing — Critical)

**Current Problem**

No login endpoint. No way for any user to obtain a JWT token. The entire auth loop is broken end-to-end.

**Recommended Upgrade**

```
POST /v1/auth/login
Body: { "username": "...", "password": "..." }
Response: { "accessToken": "...", "refreshToken": "...", "expiresIn": 900, "role": "SUPER_ADMIN" }
```

Implementation path:
1. `AuthController` → `AuthService` interface → `AuthServiceImpl`
2. `AuthServiceImpl.login()`:
   - `UserRepository.findByUsername()` — if not found → 401 (never reveal "user not found" vs "wrong password")
   - Check `UserStatus.ACTIVE` — if SUSPENDED → 403
   - `passwordEncoder.matches(raw, hash)` — if false → 401
   - Check `forcePasswordChange` — if true → return special response `{ requiresPasswordChange: true }`
   - Generate access token via `JwtUtil`
   - Generate refresh token (opaque UUID, store in Redis with TTL)
   - Return token pair
3. Rate limit by IP (max 10 attempts / 15 min window) — see EUP-010

**Security Rules:**
- Never reveal which field is wrong (username vs password)
- Always constant-time compare (BCrypt handles this)
- Brute-force lockout: 5 failures → 15 min lockout stored in Redis
- Log auth events to `audit_log`

**Risk Level:** 🔴 P0
**Breaking Change:** No (new endpoint)
**Task ID:** CC-0103

---

### EUP-003 · Refresh Token System (Missing — Critical)

**Current Problem**

Access tokens expire in 15 minutes. Without a refresh mechanism, users must re-login constantly, breaking mobile app and frontend UX. No refresh token implementation exists.

**Recommended Upgrade**

Redis-backed, single-use rotating refresh tokens:

```
POST /v1/auth/refresh
Body: { "refreshToken": "..." }
Response: { "accessToken": "...", "refreshToken": "...", "expiresIn": 900 }
```

Redis key pattern: `rt:{jti}` → `{userId}:{username}:{role}:{tenantId}`
TTL: 30 days (2,592,000 seconds)

Rotation rules:
1. Validate refresh token exists in Redis.
2. Delete it immediately (single-use — prevents replay).
3. Issue new access token + new refresh token.
4. Store new refresh token in Redis.

Logout:
- Delete refresh token from Redis (`DEL rt:{jti}`).
- Optional: add access token JTI to short-lived blacklist (`bl:{jti}`, TTL = remaining access token lifetime).

**Risk Level:** 🔴 P0
**Breaking Change:** No (new endpoints)
**Task ID:** CC-0105

---

### EUP-004 · RBAC Enforcement (Incomplete — Critical)

**Current Problem**

`SecurityConfig` has `anyRequest().permitAll()`. All endpoints are publicly accessible regardless of role. A student can call super-admin endpoints. There is no authorization layer.

**Recommended Upgrade**

After `JwtAuthenticationFilter` is in place (EUP-001), progressively harden `SecurityConfig`:

```java
.authorizeHttpRequests(auth -> auth
    // Always public
    .requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
    .requestMatchers("/v1/public/**").permitAll()
    .requestMatchers("/v1/auth/login", "/v1/auth/refresh").permitAll()
    // Role-gated
    .requestMatchers("/v1/super-admin/**").hasRole("SUPER_ADMIN")
    .requestMatchers("/v1/admin/**").hasAnyRole("TENANT_ADMIN", "SUPER_ADMIN")
    .requestMatchers("/v1/teacher/**").hasAnyRole("TEACHER", "SCHOOL_ADMIN", "TENANT_ADMIN", "SUPER_ADMIN")
    .requestMatchers("/v1/student/**").hasAnyRole("STUDENT", "PARENT", "TEACHER", "SCHOOL_ADMIN", "TENANT_ADMIN", "SUPER_ADMIN")
    // Everything else requires auth
    .anyRequest().authenticated()
)
```

Also add method-level security where field-level access matters:
```java
@EnableMethodSecurity   // in SecurityConfig
```

**Risk Level:** 🔴 P0 (enable only after login + JWT filter are in place)
**Breaking Change:** Yes (any unauthenticated callers will get 401/403)
**Migration:** Enable endpoint by endpoint — start with `/v1/super-admin/**`
**Task ID:** CC-0113, CC-0114, CC-0115

---

### EUP-005 · Tenant-Aware JPA Query Filters (Missing — Critical)

**Current Problem**

All JPA repository methods (`findAll()`, `findById()`, etc.) query across all tenants. A request for tenant A can accidentally read tenant B's data. There are no row-level security filters applied at the JPA layer. This is the most critical multi-tenancy bug.

**Recommended Upgrade**

**Option A (Recommended): Hibernate @Filter with RequestContext**

Define a Hibernate filter on every multi-tenant entity:

```java
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = String.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
@Entity
public class Student { ... }
```

Enable the filter in a JPA aspect/interceptor:

```java
@Aspect
@Component
public class TenantFilterAspect {
    @Before("execution(* org.springframework.data.jpa.repository.JpaRepository+.*(..))")
    public void enableTenantFilter(JoinPoint jp) {
        String tenantId = RequestContext.getTenantId();
        if (tenantId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
        }
    }
}
```

**Option B: Explicit `tenantId` parameter on every query**

Every repository method takes an explicit `tenantId` parameter. Simpler but requires discipline across every query.

**Recommendation:** Use Option A (Hibernate @Filter) — it enforces isolation at the ORM level, invisible to developers, impossible to forget.

Apply to: every entity that has a `tenant_id` column (Student, Staff, Course, Class, etc. — not Tenant itself).

**Risk Level:** 🔴 P0 — data leak without this
**Breaking Change:** No (queries become more restrictive, never more permissive)
**Task ID:** CC-0203

---

### EUP-006 · OpenAPI / Swagger Documentation (Missing)

**Current Problem**

No API documentation exists. Frontend and mobile developers cannot discover endpoints. No contract testing is possible.

**Recommended Upgrade**

Add `springdoc-openapi-starter-webmvc-ui` to `pom.xml`:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.x</version>
</dependency>
```

Configure in `application.yml`:
```yaml
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    display-request-duration: true
  show-actuator: false
```

Annotate every controller method with `@Operation`, `@ApiResponse`, `@Parameter`.
Add JWT security scheme to OpenAPI config.
Lock `/swagger-ui.html` and `/v3/api-docs` to non-production profiles.

**Risk Level:** 🟠 P1
**Breaking Change:** No
**Task ID:** EUP-006

---

### EUP-007 · Virtual Thread Migration (RequestContext)

**Current Problem**

`RequestContext` uses `ThreadLocal<>`. Virtual threads in Java 21 can create millions of threads. If a virtual thread suspends and resumes on a different carrier thread, `ThreadLocal` values survive correctly (they are scoped to the virtual thread object, not the carrier). However, child virtual threads spawned from a parent do NOT inherit `ThreadLocal` values by default. This causes `RequestContext.getTenantId()` to return null in async/parallel contexts.

**Recommended Upgrade**

1. **Short term (safe for current Tomcat platform threads):** Add `InheritableThreadLocal` where child thread inheritance is needed.

2. **Medium term:** Migrate to Java 21 `ScopedValue`:
```java
public static final ScopedValue<String> TENANT_ID = ScopedValue.newInstance();
public static final ScopedValue<UUID> USER_ID = ScopedValue.newInstance();
```

Usage:
```java
ScopedValue.where(RequestContext.TENANT_ID, tenantId)
           .where(RequestContext.USER_ID, userId)
           .run(() -> service.doWork());
```

3. **Enable virtual threads** once ScopedValue migration is complete:
```yaml
# application.yml
server:
  tomcat:
    use-virtual-threads: true
```

**Risk Level:** 🟡 P2 (low risk today — becomes P0 when virtual threads are enabled)
**Breaking Change:** No
**Task ID:** CC-0011 (ScopedValue migration)

---

### EUP-008 · Password Reset Flow (Missing)

**Current Problem**

No forgot-password endpoint. Users locked out of accounts have no recovery path. Super admin cannot reset user passwords.

**Recommended Upgrade**

OTP-based reset via email:

```
POST /v1/auth/forgot-password  → sends OTP to email, stores in Redis (TTL 10 min)
POST /v1/auth/verify-otp       → validates OTP, returns short-lived reset token
POST /v1/auth/reset-password   → accepts reset token + new password, updates User
```

Redis key: `otp:{userId}` → `{hashedOtp}` (TTL 600s, max 3 attempts)

Enforce: new password cannot equal old password (BCrypt check).
After successful reset: invalidate all active refresh tokens for that user.

**Risk Level:** 🟠 P1
**Breaking Change:** No
**Task ID:** CC-0107, CC-0108

---

### EUP-009 · Audit Log Writer Service (Missing)

**Current Problem**

`audit_log` schema exists (V4 migration) but nothing writes to it. All auth events, tenant changes, config changes, permission changes go unrecorded. This is a compliance and forensics gap.

**Recommended Upgrade**

Create `AuditLogService`:
```java
@Service
public class AuditLogService {
    public void log(AuditCategory category, String eventType,
                    String resourceType, String resourceId,
                    String description, Map<String,Object> metadata) { ... }
}
```

Write audit events from:
- Login / logout / failed login
- Token refresh
- Password change / reset
- Tenant create / suspend / archive
- Feature toggle change
- Role assignment
- Bulk import / export
- System bootstrap events

Key design: **fire-and-forget via async**. Use `@Async` + dedicated `ThreadPoolTaskExecutor` so audit writes never block request threads. Audit failures must not fail business operations (log error, continue).

**Risk Level:** 🟠 P1
**Breaking Change:** No
**Task ID:** CC-1802, CC-0112

---

### EUP-010 · Rate Limiting (Missing — Security Critical)

**Current Problem**

No rate limiting on any endpoint. The login endpoint can be brute-forced unlimited times. Bulk data endpoints can be called at any rate. No per-tenant throttles.

**Recommended Upgrade**

Redis-backed sliding window rate limiter:

```java
@Component
public class RateLimiter {
    // Key: "rl:login:{ip}" or "rl:api:{tenantId}:{endpoint}"
    // Value: Lua script atomically increments + checks count in sliding window
    public boolean isAllowed(String key, int maxRequests, Duration window) { ... }
}
```

Rate limits:
| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /v1/auth/login` | 10 attempts | 15 min per IP |
| `POST /v1/auth/forgot-password` | 3 attempts | 1 hour per email |
| `POST /v1/auth/refresh` | 60 attempts | 1 hour per user |
| Any API per tenant | 1,000 req | 1 min per tenant |
| Any API per user | 300 req | 1 min per user |

Return `429 Too Many Requests` with `Retry-After` header.
Log rate-limit hits to `audit_log` with category `SECURITY`.

**Risk Level:** 🔴 P0 (login endpoint brute-force gap)
**Breaking Change:** No
**Task ID:** CC-1801

---

### EUP-011 · N+1 Query Detection (Risk)

**Current Problem**

JPA @ManyToOne and @OneToMany relationships default to lazy loading. In list operations (paginated result sets), each row triggers N additional queries for related entities. At scale (1,000 students per page), this becomes 1,001 queries.

**Recommended Upgrade**

1. Add `spring.jpa.properties.hibernate.generate_statistics=true` in dev profile.
2. Add `p6spy` or Hibernate Statistics logging to detect N+1 at dev time.
3. Use `@EntityGraph` on repository methods that return lists with associations.
4. Prefer `@Query` with `JOIN FETCH` for complex list queries.
5. Avoid `@OneToMany` on the "one" side in high-cardinality scenarios — use explicit repository queries instead.
6. Enable `@BatchSize(size = 20)` as a safety net on collections.

```java
@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    @EntityGraph(attributePaths = {"parent", "currentClass"})
    Page<Student> findAllByTenantId(UUID tenantId, Pageable pageable);
}
```

**Risk Level:** 🟠 P1 (becomes P0 after student/teacher modules land)
**Breaking Change:** No
**Task ID:** EUP-011

---

### EUP-012 · Soft Delete Strategy (Missing)

**Current Problem**

No soft delete exists. Any `delete()` call permanently removes data. For an education SaaS, regulatory requirements (student records, fee history) demand data retention. Hard deletes also break foreign key references in audit logs and reports.

**Recommended Upgrade**

Add `deleted_at TIMESTAMPTZ DEFAULT NULL` to every entity that requires retention. Use Hibernate `@SQLDelete` + `@Where`:

```java
@SQLDelete(sql = "UPDATE students SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Entity
public class Student { ... }
```

For entities that must be genuinely deleted (OTP tokens, rate limit counters): use Redis TTL — not DB rows.

Add `V6__add_soft_delete.sql` Flyway migration to add `deleted_at` to relevant tables.

**Risk Level:** 🟡 P2 (add before student/staff modules land)
**Breaking Change:** No (existing data: all `deleted_at` values start as NULL)
**Task ID:** EUP-012

---

### EUP-013 · Database Index Strategy (Missing)

**Current Problem**

Current migrations (V1–V5) create primary keys and some foreign keys but no composite indexes for the most common query patterns. As data grows, every list query will do full table scans.

**Recommended Upgrade**

Add Flyway migration `V7__add_indexes.sql`:

```sql
-- Tenant queries
CREATE INDEX idx_users_tenant_id ON users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username);

-- Audit log queries (most common: by tenant + time range)
CREATE INDEX idx_audit_log_tenant_created ON audit_log(tenant_id, created_at DESC);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id, created_at DESC);

-- Feature flags (most common: by tenant)
CREATE INDEX idx_tenant_features_tenant ON tenant_features(tenant_id);

-- Future student queries
CREATE INDEX idx_students_tenant_class ON students(tenant_id, class_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_tenant_status ON students(tenant_id, status) WHERE deleted_at IS NULL;
```

**Risk Level:** 🟠 P1
**Breaking Change:** No
**Task ID:** EUP-013

---

### EUP-014 · Feature Flag Service Layer (Missing)

**Current Problem**

V3 migration created `features` and `tenant_features` tables with 13 seed features. No service layer exposes this. No API returns feature flags. No UI can manage features. No code checks feature flags before executing operations.

**Recommended Upgrade**

```java
@Service
public class FeatureFlagService {

    // Cache in Redis: "ff:{tenantId}" → Set<String> of enabled feature keys
    // TTL: 5 minutes (cache invalidated on toggle)
    public boolean isEnabled(String tenantId, String featureKey) { ... }

    // Admin endpoint — Super Admin only
    public void enable(String tenantId, String featureKey) { ... }
    public void disable(String tenantId, String featureKey) { ... }

    // Invalidate cache after toggle
    private void invalidateCache(String tenantId) { ... }
}
```

Annotation-based enforcement:
```java
@RequiresFeature("ATTENDANCE_QR")
@GetMapping("/qr-attendance")
public ResponseEntity<?> getQrAttendance() { ... }
```

AOP interceptor checks `FeatureFlagService.isEnabled()` before the method executes. Returns `403 Feature not enabled for your subscription plan` if disabled.

**Risk Level:** 🟠 P1
**Breaking Change:** No
**Task ID:** CC-0012

---

### EUP-015 · Testcontainers (Replace H2 for Integration Tests)

**Current Problem**

`application-dev.yml` uses H2 in PostgreSQL MODE. H2 does not support all PostgreSQL syntax. Flyway migrations that use PostgreSQL-specific types (UUID, JSONB, INET) fail or behave differently in H2. Tests can pass locally but fail on real PostgreSQL.

**Recommended Upgrade**

Replace H2 with Testcontainers PostgreSQL for integration tests:

```java
@SpringBootTest
@Testcontainers
class TenantServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
    }
}
```

Keep H2 only for unit tests that don't touch the DB at all.
Add `@ActiveProfiles("test")` profile with Testcontainers config.

**Risk Level:** 🟠 P1
**Breaking Change:** No
**Task ID:** CC-0210

---

## Section 2 — Database Architecture

---

### EUP-020 · Connection Pool Monitoring (Missing)

**Current Problem**

HikariCP pool settings are configured but no metrics are exposed or monitored. Under load, pool exhaustion causes request timeouts. There is no alert for pool saturation.

**Recommended Upgrade**

HikariCP metrics are auto-exposed via Micrometer. Add Grafana dashboard for:
- `hikaricp.connections.active`
- `hikaricp.connections.pending`
- `hikaricp.connections.timeout.total`

Alert thresholds:
- Warn: `active / max > 0.8` for 2 min
- Critical: `pending > 0` for 30 sec

Also add `spring.datasource.hikari.leak-detection-threshold=30000` to catch connection leaks.

**Risk Level:** 🟡 P2
**Task ID:** EUP-020

---

### EUP-021 · Database Backup Strategy (Missing — Production Critical)

**Current Problem**

No backup strategy exists. A production database failure would cause permanent data loss.

**Recommended Upgrade**

Minimum viable backup strategy:
1. **Continuous WAL archiving** (PostgreSQL `wal_level = replica`)
2. **Daily `pg_dump` snapshots** stored in cloud object storage (MinIO/S3)
3. **PITR (Point-in-Time Recovery)** — target RTO < 4 hours, RPO < 15 minutes
4. **Weekly restore drill** — automated test that restores yesterday's backup to a test instance

`docker-compose.yml` for dev: add `pgbackup` sidecar that runs `pg_dump` daily.

**Risk Level:** 🔴 P0 for production (not urgent for dev)
**Task ID:** CC-1904, CC-1905

---

### EUP-022 · Archival Strategy for High-Volume Tables (Planning)

**Current Problem**

Tables like `audit_log`, `attendance`, `notifications` will grow without bound. PostgreSQL's MVCC architecture means old rows block vacuum. Without an archival strategy, query performance degrades over time.

**Recommended Upgrade**

1. **Partitioning** — partition `audit_log` and `attendance` by month:
   ```sql
   CREATE TABLE audit_log (...)
   PARTITION BY RANGE (created_at);
   ```
2. **Retention policy** — automatically drop partitions older than 2 years (configurable per tenant via admin config).
3. **Cold archival** — export old partitions to Parquet/JSONL stored in object storage (MinIO/S3) before dropping.
4. **Implement after volume data exists** — premature partitioning adds complexity.

**Risk Level:** 🔵 P3 (implement when tables exceed 10M rows)
**Task ID:** CC-1901

---

## Section 3 — Security Architecture

---

### EUP-030 · Brute-Force Protection (Missing — Critical)

**Current Problem**

No account lockout mechanism. The login endpoint has no rate limiting or lockout after failed attempts. An attacker can try unlimited passwords against any username.

**Recommended Upgrade**

Two-layer defense:

**Layer 1 — Redis sliding window per IP:**
```
Key: "bl:ip:{ip}" → count
On each failed login: INCR + EXPIRE
After 10 failures in 15 min → return 429
```

**Layer 2 — Account lockout per username:**
```
Key: "bl:user:{username}" → fail count
After 5 failures → set status = SUSPENDED temporarily
After 30 min → auto-unlock (or require admin reset for permanent lock)
```

Never reveal which lock is active. Always return the same 401 message.
Write every lock event to `audit_log` with category `SECURITY`.

**Risk Level:** 🔴 P0
**Task ID:** CC-1801, CC-0116

---

### EUP-031 · File Upload Security (Missing — for Future Upload Features)

**Current Problem**

No file upload endpoints exist yet, but the architecture plan includes document upload for students, file storage via MinIO. Insufficient planning for upload security leads to dangerous vulnerabilities when these features ship.

**Recommended Upgrade**

When building upload endpoints:
1. **Validate MIME type** from content (never trust `Content-Type` header) — use Apache Tika.
2. **Size limits** — already in `application.yml` (10MB). Enforce at the filter level too.
3. **Filename sanitization** — strip path traversal (`../`), normalize to UUID-based filenames.
4. **Store files outside webroot** — in MinIO (object storage), never on the filesystem.
5. **Signed URL for access** — never serve files directly from the API; generate presigned MinIO URLs with short TTL.
6. **Virus scan** — async scan with ClamAV after upload; set file status to `PENDING_SCAN` until cleared.
7. **Tenant isolation** — MinIO bucket prefix = `{tenantId}/` — enforce via policy.

**Risk Level:** 🔴 P0 when upload features ship
**Task ID:** EUP-031

---

### EUP-032 · Secrets Management (Missing — Production Critical)

**Current Problem**

Secrets (`JWT_SECRET`, `DB_PASSWORD`, `REDIS_PASSWORD`) are managed via environment variables. There is no rotation strategy, no audit of secret access, no revocation mechanism.

**Recommended Upgrade**

For production:

1. **Short term:** Use `.env` files (never committed). Add `.env` to `.gitignore`. Document required variables in `.env.example`.

2. **Medium term:** Use AWS Secrets Manager or HashiCorp Vault:
   - JWT secret rotation without downtime (accept both old and new key during rotation window)
   - DB credentials rotation (Vault dynamic credentials)
   - Kubernetes Secret → mounted as volume (not env var — avoids CLI exposure)

3. **Immediate:** Enforce minimum secret length validation at startup:
   ```java
   @PostConstruct
   void validateSecret() {
       if (jwtProperties.secret().length() < 32) {
           throw new IllegalStateException("JWT secret must be at least 32 characters");
       }
   }
   ```

**Risk Level:** 🔴 P0 for production
**Task ID:** CC-1906

---

### EUP-033 · SQL Injection Prevention (Status Check)

**Current Status**

✅ Spring Data JPA uses parameterized queries by default — SQL injection is prevented at the ORM layer for all repository-based queries.

⚠️ **Risk area:** Any `@Query` with string concatenation (e.g., dynamic sort columns) can create SQL injection vectors.

**Recommended Upgrade**

1. Review all `@Query` annotations for dynamic parameters.
2. Use `Pageable` sort parameter with an allowlist:
   ```java
   Sort.by(allowedColumns.contains(column) ? column : "createdAt");
   ```
3. Never use `EntityManager.createNativeQuery(userInput)`.

**Risk Level:** 🟠 P1 (verify on each new query added)
**Task ID:** EUP-033

---

### EUP-034 · HTTPS Enforcement (Production Config)

**Current Problem**

`application.yml` has no HTTPS redirect or HSTS enforcement. `Strict-Transport-Security` header is set by `SecurityHeadersFilter` for responses, but if the app accepts HTTP, the first request is insecure.

**Recommended Upgrade**

1. In production: terminate TLS at the load balancer / reverse proxy (nginx / AWS ALB). The app itself runs on HTTP internally. The proxy adds `X-Forwarded-Proto: https`.
2. Enable `server.forward-headers-strategy=native` in `application.yml` so Spring knows the external scheme is HTTPS.
3. Redirect HTTP → HTTPS at the nginx/load-balancer level.
4. Never configure self-signed certs on the app itself — delegate TLS to infrastructure.

**Risk Level:** 🔴 P0 for production
**Task ID:** EUP-034

---

## Section 4 — Frontend Architecture

---

### EUP-040 · Frontend Tech Stack Decision (Greenfield)

**Situation**

Frontend does not exist yet. This is the architecture decision point.

**Recommended Architecture**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | **React 19** | Ecosystem, team familiarity, libraries |
| Language | **TypeScript 5.x** | Type safety, refactoring confidence |
| Build tool | **Vite 6** | Fast HMR, tree-shaking, plugin ecosystem |
| UI library | **shadcn/ui + Tailwind CSS 4** | Accessible, composable, no vendor lock-in |
| State management | **Zustand** (global) + **TanStack Query** (server state) | Simple, no boilerplate, excellent caching |
| Routing | **TanStack Router** | Type-safe routes, nested layouts |
| Forms | **React Hook Form + Zod** | Performant, schema-validated |
| Tables/grids | **TanStack Table** | Virtualization, 1M+ rows |
| Charts | **Recharts** | Simple, composable |
| Testing | **Vitest + React Testing Library** | Fast, Vite-native |
| E2E testing | **Playwright** | Reliable, cross-browser |
| i18n | **react-i18next** | Multi-language (English, Hindi, regional) |
| Date handling | **date-fns** | Lightweight, tree-shakeable |

**Risk Level:** 🟠 P1 (decide before writing any frontend code)
**Breaking Change:** N/A (greenfield)
**Task ID:** EUP-040

---

### EUP-041 · Frontend Folder Structure

**Recommended Structure**

```
frontend/
├── src/
│   ├── app/                    # App entry, router config, providers
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── features/               # Domain modules (one per feature area)
│   │   ├── auth/
│   │   │   ├── components/     # LoginForm, ForgotPasswordForm
│   │   │   ├── hooks/          # useLogin, useRefreshToken
│   │   │   ├── api/            # authApi.ts (Axios calls)
│   │   │   ├── store/          # authStore.ts (Zustand)
│   │   │   ├── types/          # LoginRequest, AuthResponse
│   │   │   └── pages/          # LoginPage, ForgotPasswordPage
│   │   ├── dashboard/
│   │   ├── tenant/
│   │   ├── student/
│   │   ├── staff/
│   │   ├── attendance/
│   │   ├── fees/
│   │   ├── communication/
│   │   ├── exams/
│   │   └── reports/
│   ├── shared/                 # Shared across features
│   │   ├── components/         # Button, Modal, Table, Badge, etc.
│   │   ├── hooks/              # useDebounce, usePagination, usePermission
│   │   ├── api/                # apiClient.ts (Axios instance, interceptors)
│   │   ├── types/              # ApiResponse<T>, PageResponse<T>
│   │   └── utils/              # formatDate, formatCurrency, etc.
│   ├── config/                 # Environment variables, feature flags
│   ├── styles/                 # Global CSS, Tailwind config
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**Key Rules:**
- Features are self-contained. No cross-feature imports (only through `shared/`).
- API calls only in `api/` folders — never in components or hooks.
- Business logic only in hooks — never in components.
- Components are purely presentational.

**Risk Level:** 🟠 P1
**Task ID:** EUP-041

---

### EUP-042 · Auth Token Handling (Frontend)

**Current Problem (Planned Risk)**

Common mistake: storing JWT in `localStorage`. This exposes tokens to XSS attacks — any injected script can read `localStorage`.

**Recommended Upgrade**

1. **Store access token in memory only** (Zustand store, not localStorage/sessionStorage).
2. **Store refresh token in `HttpOnly SameSite=Strict` cookie** — inaccessible to JavaScript, immune to XSS.
3. **API client (Axios):**
   - Attach access token from memory to `Authorization` header.
   - On 401: automatically call `/v1/auth/refresh` (cookie sent automatically).
   - Store new access token in memory.
   - Retry original request.
4. **On tab close / session end:** access token is lost (in memory). Refresh token in cookie persists across sessions.
5. **Backend:** `POST /v1/auth/login` sets `Set-Cookie: refreshToken=...; HttpOnly; SameSite=Strict; Secure; Path=/v1/auth/refresh`.

This approach:
- ✅ Survives page refresh (refresh token in cookie)
- ✅ Immune to XSS (refresh token never readable by JS)
- ✅ Automatic token rotation (Axios interceptor)

**Risk Level:** 🔴 P0 (security architecture for all frontend auth)
**Task ID:** EUP-042

---

### EUP-043 · Feature-Flag-Driven UI Rendering

**Recommended Architecture**

```typescript
// hooks/useFeatureFlag.ts
export function useFeatureFlag(feature: string): boolean {
  const features = useAuthStore(s => s.features);  // from login response
  return features.includes(feature);
}

// Component usage
function AttendanceNav() {
  const hasQr = useFeatureFlag('ATTENDANCE_QR');
  return (
    <>
      <NavItem to="/attendance/manual" label="Manual Attendance" />
      {hasQr && <NavItem to="/attendance/qr" label="QR Attendance" />}
    </>
  );
}
```

Login response must include `features: string[]` array for the tenant.
Backend: `AuthService` queries `FeatureFlagService` for the tenant and includes enabled features in login response.

**Risk Level:** 🟠 P1
**Task ID:** EUP-043

---

### EUP-044 · Route Protection & Permission-Based Rendering

**Recommended Implementation**

```typescript
// ProtectedRoute.tsx
function ProtectedRoute({ roles, feature, children }: Props) {
  const { user } = useAuthStore();
  const hasFeature = useFeatureFlag(feature);

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/403" replace />;
  if (feature && !hasFeature) return <Navigate to="/plan-upgrade" replace />;
  return <>{children}</>;
}

// Router config
<Route path="/super-admin" element={
  <ProtectedRoute roles={['SUPER_ADMIN']}>
    <SuperAdminLayout />
  </ProtectedRoute>
}>
```

**Risk Level:** 🟠 P1
**Task ID:** EUP-044

---

### EUP-045 · Frontend Performance Rules

| Area | Rule |
|------|------|
| Code splitting | Every feature module lazy-loaded with `React.lazy()` |
| Bundle size | Target < 200KB initial bundle (gzipped) |
| Images | WebP format, lazy loading (`loading="lazy"`), srcset for responsive |
| Tables | Virtualization with TanStack Virtual for > 100 rows |
| API caching | TanStack Query: `staleTime: 5 * 60 * 1000` for reference data |
| Fonts | Self-hosted, `font-display: swap` |
| API calls | Debounce search inputs (300ms), cancel on unmount |
| Pagination | Cursor-based preferred over offset for large datasets |

**Risk Level:** 🟡 P2
**Task ID:** EUP-045

---

## Section 5 — Mobile App Architecture

---

### EUP-050 · Mobile Tech Stack Decision (Greenfield)

**Situation**

Mobile apps do not exist yet. Choosing the right framework is critical.

**Recommended Architecture**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | **React Native 0.76+ (New Architecture)** | Code sharing with frontend, TypeScript, large ecosystem |
| Build | **Expo SDK 52** (bare workflow) | Managed build service, OTA updates, Expo Router |
| Navigation | **Expo Router** | File-based routing, native deep linking |
| State | **Zustand** | Same pattern as frontend |
| Server state | **TanStack Query** | Offline caching, background sync |
| Local DB | **MMKV** (encrypted) | Fastest React Native key-value store |
| Offline sync | **WatermelonDB** | SQLite-backed, designed for offline-first sync |
| Push notifications | **Expo Notifications** | FCM (Android) + APNs (iOS) unified |
| Biometrics | **Expo LocalAuthentication** | TouchID/FaceID/fingerprint |
| Auth storage | **Expo SecureStore** | Keychain (iOS) / Keystore (Android) encrypted storage |
| OTA updates | **Expo Updates** | Hot-fix rollout without App Store review |
| Analytics | **Firebase Analytics** or **Posthog** | Crash reporting + funnel analytics |

**Alternative if team is Java/Kotlin native:**
- Android: Kotlin + Jetpack Compose + Hilt + Room + Retrofit
- iOS: Swift + SwiftUI + Combine + URLSession

**Recommendation:** React Native for single codebase (≈ 85% code sharing). Go native only if performance-critical features (AR, heavy video processing) are needed.

**Risk Level:** 🟠 P1 (decide before any mobile code is written)
**Task ID:** EUP-050

---

### EUP-051 · Offline-First Architecture (Mobile)

**Current Problem (Planned Risk)**

Attendance marking is a critical function that must work when the school has poor internet. Without offline support, teachers cannot mark attendance during connectivity issues.

**Recommended Upgrade**

**Sync architecture:**

```
Teacher marks attendance offline
    ↓
WatermelonDB local SQLite (immediately visible in UI)
    ↓
Background sync queue (MMKV queue of pending operations)
    ↓
On connectivity restored: POST /v1/attendance/sync (batch)
    ↓
Server processes batch, returns success/conflicts
    ↓
Conflict resolution: last-write-wins (or teacher-wins for attendance)
```

**Offline scope:**
- ✅ View today's class (pre-synced)
- ✅ Mark attendance (offline, queued)
- ✅ View student list (pre-synced)
- ❌ View fee payments (requires live data — show cached + timestamp)
- ❌ Submit exam marks (requires live validation)

**Sync trigger:**
- `AppState` change (background → foreground)
- `NetInfo` connectivity change
- Push notification (silent sync notification)

**Conflict resolution:**
- Attendance: last-write-wins (teacher's device wins vs earlier sync)
- Fees: server-wins (financial data must be authoritative)

**Risk Level:** 🟠 P1 for teacher app
**Task ID:** EUP-051

---

### EUP-052 · Secure Token Storage (Mobile)

**Recommended Architecture**

| Token | Storage | Why |
|-------|---------|-----|
| Access token | In-memory (`useRef` / Zustand) | Never persisted; lost on app close |
| Refresh token | `Expo SecureStore` (Keychain/Keystore) | Encrypted hardware-backed storage |
| User profile | `MMKV` (encrypted) | Fast access, encrypted at rest |

Token refresh flow:
1. On app foreground: check access token expiry.
2. If < 2 min remaining: proactively refresh.
3. On any 401: call refresh endpoint, retry original request.
4. On refresh failure: clear all stored data, navigate to login.

**Risk Level:** 🔴 P0 for mobile
**Task ID:** EUP-052

---

### EUP-053 · Push Notification Architecture

**Recommended Architecture**

```
Event in backend (attendance finalized, fee due, exam result)
    ↓
AuditLogService writes event
    ↓
NotificationService (async, @Async pool)
    ↓
FCM (Android) / APNs (iOS) via Firebase Admin SDK
    ↓
Device receives push notification
```

**Backend additions:**
1. `DeviceToken` entity — stores FCM/APNs token per user per device.
2. `POST /v1/devices/register` — called by mobile app on every login.
3. `NotificationService` — fire-and-forget, async, never blocks business logic.

**Topics (for group notifications):**
- `tenant:{tenantId}:all` — platform announcements
- `tenant:{tenantId}:class:{classId}` — class-specific notifications
- `user:{userId}` — individual notifications

**Risk Level:** 🟠 P1
**Task ID:** CC-1003

---

## Section 6 — DevOps & Infrastructure

---

### EUP-060 · CI/CD Pipeline (Missing — Critical)

**Current Problem**

No CI/CD pipeline exists. All deployments are manual. No automated test execution on PR. No build reproducibility guarantee.

**Recommended Architecture**

**GitHub Actions** pipeline:

```yaml
# .github/workflows/backend-ci.yml
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_DB: test, ... }
      redis:
        image: redis:7-alpine
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21', distribution: 'temurin' }
      - name: Build and test
        run: |
          cd backend
          ./mvnw verify -Dspring.profiles.active=test
      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

**Pipeline stages:**
1. **PR checks:** compile + unit tests + static analysis (SpotBugs / PMD)
2. **Integration tests:** Testcontainers tests
3. **Build artifact:** `mvn package` → Docker image → push to registry
4. **Deploy to staging:** auto-deploy on `main` merge
5. **Deploy to production:** manual approval gate

**Risk Level:** 🟠 P1
**Task ID:** CC-1502

---

### EUP-061 · Docker Production Image (Missing)

**Current Problem**

`docker-compose.yml` exists for local dev infrastructure but no `Dockerfile` exists for the application itself. Cannot containerize the app for deployment.

**Recommended Upgrade**

Multi-stage `Dockerfile` in `backend/`:

```dockerfile
# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn/ .mvn/
RUN ./mvnw dependency:go-offline -q
COPY src/ src/
RUN ./mvnw package -DskipTests -q

# Stage 2: Extract layers (Spring Boot layered JAR)
FROM eclipse-temurin:21-jdk-alpine AS extractor
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Stage 3: Runtime (minimal image)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=extractor /app/dependencies/ ./
COPY --from=extractor /app/spring-boot-loader/ ./
COPY --from=extractor /app/snapshot-dependencies/ ./
COPY --from=extractor /app/application/ ./
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "org.springframework.boot.loader.launch.JarLauncher"]
```

Key features:
- Non-root user (security)
- Layered JAR (fast rebuilds — only changed layers pushed)
- JVM container awareness (`UseContainerSupport`)
- Memory-bounded (`MaxRAMPercentage=75.0`)

**Risk Level:** 🟠 P1
**Task ID:** EUP-061

---

### EUP-062 · Observability Stack ✅ Phase 1 COMPLETED

**Phase 1 Status: DONE** (12 May 2026)

Phase 1 is fully implemented:
- `infra/prometheus/prometheus.yml` — scrapes `/actuator/prometheus` every 10s
- `infra/prometheus/alert_rules.yml` — 5 alert rules (error rate, p95 latency, HikariCP exhaustion, backend-down, JVM heap)
- `infra/grafana/dashboards/cloudcampus-backend.json` — 9-panel dashboard (req rate, error rate, p50/p95/p99, HikariCP, JVM heap, threads, status breakdown, slowest endpoints, tenant volume)
- `docker-compose.yml` — `prometheus:9090` + `grafana:3100` services with auto-provisioned datasource and dashboard

**Remaining (Phase 2 + 3 — not yet started):**

Micrometer + Prometheus are configured but no log aggregation or distributed tracing yet.

**Recommended Upgrade (Phased)**

**Phase 1 (Now — minimal viable observability):**
- Prometheus scrapes `/actuator/prometheus`
- Grafana dashboard: API response times, error rates, HikariCP pool, JVM heap, tenant request volume
- Alert rules: error rate > 1%, p95 latency > 2s, pool exhaustion

**Phase 2 (Mid-term):**
- **Log aggregation:** Promtail → Loki → Grafana (JSON logs already structured from `logback-spring.xml`)
- **Distributed tracing:** OpenTelemetry + Grafana Tempo
- Add `spring-boot-starter-actuator` OpenTelemetry exporter

**Phase 3 (At scale):**
- Grafana Agent (unified collector: logs + metrics + traces)
- SLO dashboards per tenant
- Error tracking: Sentry (frontend) + OpenTelemetry (backend)

**docker-compose.yml additions for dev:**
```yaml
prometheus:
  image: prom/prometheus:latest
  volumes: ["./prometheus.yml:/etc/prometheus/prometheus.yml"]
  ports: ["9090:9090"]

grafana:
  image: grafana/grafana:latest
  ports: ["3100:3000"]
  volumes: ["grafana_data:/var/lib/grafana"]
```

**Risk Level:** 🟠 P1
**Task ID:** CC-0017

---

### EUP-063 · Environment Separation ✅ COMPLETED

**Status: DONE** (12 May 2026)

All four Spring profiles are now defined and active:

| Environment | Profile | DB | Config file | Status |
|-------------|---------|-----|------------|--------|
| `dev` | `dev` | H2 in-memory | `application-dev.yml` | ✅ exists |
| `test` | `test` | Testcontainers PostgreSQL | (inherits base) | ✅ Testcontainers configured |
| `staging` | `staging` | PostgreSQL (env-var driven) | `application-staging.yml` | ✅ created |
| `production` | `prod` | PostgreSQL (env-var driven, SSL) | `application-prod.yml` | ✅ created |

Key differences per profile:
- **staging**: Swagger enabled; INFO logging; 15-conn pool; leak-detection enabled; Flyway validates checksums
- **prod**: Swagger DISABLED; actuator on port 8081 (internal only); SSL datasource; no JWT_SECRET default (deployment fails if unset)

**Risk Level:** ✅ Resolved
**Task ID:** EUP-063

---

## Section 7 — Multi-Tenancy

---

### EUP-070 · School Entity (Missing — Architecture Gap)

**Current Problem**

`Tenant` exists but `School` does not. The architecture specifies that a tenant can contain multiple schools. Without a `School` entity, every feature must be rebuilt when the first enterprise customer (school group) requires multi-school support. This is a design debt that must be resolved before any domain entities (Student, Teacher, Class) are created.

**Recommended Upgrade**

Create `School` entity now (even if initially every tenant has exactly one school auto-created):

```java
@Entity
@Table(name = "schools")
public class School {
    @Id UUID id;
    @Column(nullable = false) UUID tenantId;
    @Column(nullable = false) String name;
    @Column(unique = true, nullable = false) String code;   // e.g. "MAIN", "NORTH"
    String address;
    String phone;
    SchoolStatus status;                                    // ACTIVE / INACTIVE
    Instant createdAt;
    Instant updatedAt;
}
```

Flyway migration `V8__create_schools.sql`.
Auto-create one default school when a tenant is created (in `TenantServiceImpl`).
All subsequent domain entities (Student, Class, Attendance) reference both `tenantId` and `schoolId`.

**Risk Level:** 🔴 P0 — must exist before any domain entities are created
**Breaking Change:** No (adds new tables, no changes to existing)
**Task ID:** CC-0213

---

### EUP-071 · Tenant Isolation Automated Test Suite

**Current Problem**

There is no automated test that verifies cross-tenant data isolation. A developer can introduce a query bug that leaks tenant B's data to tenant A, and no test will catch it.

**Recommended Upgrade**

```java
@SpringBootTest
@Testcontainers
class TenantIsolationTest {

    @Test
    void studentQuery_shouldNeverReturnOtherTenantData() {
        // Create tenant A + student A
        // Create tenant B + student B
        // Set RequestContext.tenantId = tenantA
        // Assert: studentRepository.findAll() returns only student A
        // Assert: student B is never in the result
    }

    @Test
    void directIdAccess_fromWrongTenant_shouldReturnEmpty() {
        // Set RequestContext.tenantId = tenantA
        // Assert: studentRepository.findById(studentB.id) returns Optional.empty()
    }
}
```

This test must run in CI on every PR.

**Risk Level:** 🔴 P0 — must exist before any domain data
**Task ID:** CC-0210

---

## Section 8 — Website Builder

---

### EUP-080 · Website Builder Architecture Decision

**Current Problem (Planning)**

Website builder is a major feature (Phase 21 in the roadmap). Without upfront architecture decisions, it will be implemented ad-hoc and will be impossible to scale or maintain.

**Recommended Architecture**

**Rendering approach:**
- **Option A:** Server-Side Rendering (SSR) with Next.js — good for SEO, works for school public pages.
- **Option B:** Static Site Generation (SSG) — generated on each publish, served from CDN — best performance, not real-time.
- **Option C:** Client-Side Rendering (CSR) with pre-built JSON schema — simplest but bad for SEO.

**Recommendation:** Option A (Next.js SSR) for school public websites — SEO is critical for admissions.

**JSON schema for pages:**
```json
{
  "page": {
    "slug": "about-us",
    "sections": [
      { "type": "HERO", "data": { "title": "Welcome", "image": "..." } },
      { "type": "FEATURES", "data": { "items": [...] } },
      { "type": "GALLERY", "data": { "images": [...] } }
    ]
  }
}
```

Backend stores this JSON per tenant. SSR app fetches JSON, renders component tree.

**Tenant domain strategy:**
- Default: `{tenantSlug}.cloudcampus.io`
- Custom domain: DNS CNAME verification → SSL provisioning via Let's Encrypt

**Risk Level:** 🔵 P3 (build after core ERP is complete)
**Task ID:** CC-2001

---

## Section 9 — Subscription & Feature Management

---

### EUP-090 · Subscription System Architecture

**Recommended Architecture**

```
Plan
 ├── name: "STARTER", "PROFESSIONAL", "ENTERPRISE"
 ├── maxStudents: 500
 ├── maxTeachers: 50
 ├── allowedFeatures: ["STUDENT_MANAGEMENT", "ATTENDANCE_MANUAL", ...]
 └── price: monthly / annual

TenantSubscription
 ├── tenantId
 ├── planId
 ├── status: TRIAL | ACTIVE | PAST_DUE | CANCELLED
 ├── trialEndsAt
 ├── currentPeriodEndsAt
 └── billingProvider: STRIPE | RAZORPAY | OFFLINE
```

**API-level enforcement:**
- `FeatureFlagService` checks `TenantSubscription.allowedFeatures` before any operation.
- Usage limit checks: `studentCount >= plan.maxStudents → 403 Limit reached`.

**UI-level enforcement:**
- Features not in subscription are hidden or shown with "Upgrade Plan" CTA.
- Usage gauges shown in School Admin dashboard.

**Trial system:**
- New tenants get 30-day trial with PROFESSIONAL plan features.
- After trial: downgrade to STARTER unless subscribed.
- Email reminders: 7 days before trial end, 3 days, 1 day.

**Risk Level:** 🟡 P2
**Task ID:** EUP-090

---

## Section 10 — Guest Demo Portal

---

### EUP-100 · Demo Tenant Strategy

**Recommended Architecture**

1. **Dedicated demo tenant** — created as a regular tenant with slug `demo`.
2. **Pre-seeded data** — realistic but fake: students, teachers, attendance records, fee records.
3. **Read-only mode** — all write operations return 200 but are silently discarded (no DB writes).
4. **Auto-reset** — scheduled job resets demo data every 24 hours.
5. **Rate limiting** — aggressive limits on demo tenant (max 50 concurrent sessions).
6. **No real emails** — use MailHog / fake email domain.
7. **Separate subdomain** — `demo.cloudcampus.io` — isolated from production traffic.

**Implementation:**
```java
// In each service method that writes data:
if ("demo".equals(RequestContext.getTenantId())) {
    log.debug("Demo mode: write operation silently skipped");
    return existingObject;  // return as-if success
}
```

Or: use a `@DemoMode` aspect that intercepts all write operations for the demo tenant.

**Risk Level:** 🟡 P2
**Task ID:** EUP-100

---

## Final Architecture Summary

---

### Backend Final Architecture

```
com.cloudcampus/
├── CloudCampusApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── JwtProperties.java
│   ├── RedisConfig.java
│   ├── AsyncConfig.java              ← ThreadPoolTaskExecutor for @Async
│   └── OpenApiConfig.java            ← Swagger/OpenAPI
├── common/
│   ├── api/                          ← ApiResponse, ApiError, PageResponse
│   ├── exception/                    ← All exception classes
│   ├── web/                          ← Filters, RequestContext, pagination
│   └── audit/                        ← AuditLogService, AuditCategory
├── auth/
│   ├── controller/                   ← AuthController
│   ├── service/                      ← AuthService, AuthServiceImpl
│   ├── security/                     ← JwtUtil, JwtAuthenticationFilter
│   ├── entity/                       ← User, UserRole, UserStatus
│   ├── repository/                   ← UserRepository
│   ├── dto/                          ← LoginRequest, LoginResponse, RefreshRequest
│   └── bootstrap/                    ← SuperAdminBootstrap
├── tenant/
│   ├── controller/                   ← SuperAdminTenantController
│   ├── service/                      ← TenantService, TenantServiceImpl
│   ├── entity/                       ← Tenant, TenantStatus
│   ├── repository/                   ← TenantRepository
│   ├── dto/                          ← TenantCreateRequest, TenantResponse
│   └── web/                          ← HeaderTenantResolver, TenantContextFilter
├── school/
│   ├── entity/                       ← School, SchoolStatus  ← NEW (EUP-070)
│   └── repository/
├── feature/
│   ├── service/                      ← FeatureFlagService
│   ├── entity/                       ← Feature, TenantFeature
│   └── annotation/                   ← @RequiresFeature
├── student/                          ← (future)
├── staff/                            ← (future)
├── attendance/                       ← (future)
├── fees/                             ← (future)
└── notification/                     ← (future)
```

---

### Frontend Final Architecture

```
frontend/
├── src/
│   ├── app/                    App shell, router, providers
│   ├── features/               One folder per domain (auth, tenant, student, ...)
│   ├── shared/                 Cross-feature UI components, hooks, API client
│   └── config/                 Environment variables, theme
├── Vite + TypeScript + React 19
├── TanStack Router (type-safe routing)
├── TanStack Query (server state + caching)
├── Zustand (auth + UI state)
├── shadcn/ui + Tailwind CSS 4
└── Vitest + Playwright (tests)
```

---

### Mobile Final Architecture

```
mobile/
├── app/              Expo Router — file-based navigation
├── features/         Same domain breakdown as frontend
├── shared/           Shared components, hooks, API client
└── offline/          WatermelonDB + sync engine
React Native + Expo SDK
Expo SecureStore (tokens)
MMKV (fast encrypted storage)
WatermelonDB (offline sync)
TanStack Query (online state)
```

---

### Infrastructure Stack

| Component | Choice | Notes |
|-----------|--------|-------|
| Cloud | AWS / GCP / Azure | Any; recommendation: AWS |
| App hosting | ECS Fargate / Cloud Run | Serverless containers; Kubernetes only at 100K+ users |
| Database | PostgreSQL 16 (managed RDS) | Multi-AZ at production |
| Cache | Redis 7 (managed ElastiCache) | Single node dev, cluster at 10K+ users |
| Object storage | MinIO (dev) / S3 (prod) | Files, backups, exports |
| Queue | Redis Streams (dev) → RabbitMQ (at 10K users) → Kafka (at 100K users) | Start simple |
| CDN | CloudFront / Cloudflare | Static assets, school public websites |
| Email | MailHog (dev) → AWS SES (prod) | Already in docker-compose |
| SMS | — | Twilio / MSG91 when CC-1001 ships |

---

### DevOps Stack

| Component | Choice |
|-----------|--------|
| CI/CD | GitHub Actions |
| Container registry | GitHub Container Registry (GHCR) or ECR |
| Infrastructure-as-code | Terraform or AWS CDK |
| Secrets | AWS Secrets Manager |
| Monitoring | Prometheus + Grafana |
| Logs | Loki (via Promtail) |
| Tracing | OpenTelemetry + Grafana Tempo |
| Alerting | Grafana Alerting → Slack / PagerDuty |
| Backup | AWS RDS automated backups + custom pg_dump |

---

### Scalability Plan

| Stage | Users | Architecture |
|-------|-------|-------------|
| **1K users** | 1 school | Single instance; docker-compose; managed RDS; Redis single node |
| **10K users** | 10–20 schools | 2–3 app replicas; Redis cluster; CDN for static assets; read replica |
| **100K users** | 100–200 schools | ECS Fargate auto-scaling; RabbitMQ for async jobs; read replicas; table partitioning; connection pooling (PgBouncer) |
| **1M users** | 1,000+ schools | Modular monolith → extract notification/reporting as microservices; Kafka; CQRS for read models; multi-region |

**Key principle:** Do not build for 1M on day one. The architecture is designed so each layer can be scaled independently when needed without rewriting the application.

---

### Final Production Readiness Score (Current State)

| Area | Score | Notes |
|------|-------|-------|
| Backend foundation | 9/10 | Auth, RBAC, brute-force, audit log, school entity, feature flags all done |
| Database | 8/10 | Indexes, soft delete, Flyway V1–V10; missing: archival/partitioning, backup |
| Security | 8/10 | JWT enforcement, RBAC, rate limiting, brute-force, HTTPS config in prod profile |
| Auth | 9/10 | Login, refresh, logout, password reset, token rotation all complete |
| Frontend | 7/10 | React + TanStack; auth, tenant CRUD, route guard — 31/31 tests passing |
| Mobile | 7/10 | Expo RN; offline attendance, push notifications, secure storage all done |
| DevOps | 7/10 | Dockerfile, GitHub Actions CI, Prometheus, Grafana, staging/prod profiles |
| Observability | 7/10 | Phase 1 dashboards + alert rules done; Phase 2 (Loki/Tempo) pending |
| Multi-tenancy | 8/10 | Hibernate @Filter isolation, tenant isolation tests, school entity done |
| **Overall** | **7.5/10** | Core platform complete; production hardening and observability phase 2 pending |

---

## Prioritized Execution Order

### 🔴 Phase A — Auth Enforcement (Do First — Blocks Everything)

| # | Task | ID | Est. Effort |
|---|------|----|------------|
| A1 | `JwtAuthenticationFilter` — reads Bearer token, populates SecurityContext + RequestContext | CC-0102 | ✅ COMPLETED |
| A2 | `POST /v1/auth/login` — `AuthController`, `AuthService`, `LoginRequest`, `LoginResponse` | CC-0103 | ✅ COMPLETED |
| A3 | Redis refresh token system + `POST /v1/auth/refresh` + `POST /v1/auth/logout` | CC-0105 | ✅ COMPLETED |
| A4 | Brute-force protection on login (Redis sliding window) | CC-1801 / EUP-030 | ✅ COMPLETED |
| A5 | `AuditLogService` (`@Async`) — log auth events | CC-1802 | ✅ COMPLETED |
| A6 | Progressively enforce RBAC in SecurityConfig | CC-0113 | ✅ COMPLETED |

### ✅ Phase B — Foundation Completeness

| # | Task | ID | Est. Effort |
|---|------|----|------------|
| B1 | `School` entity + migration + auto-create on tenant onboarding | CC-0213 / EUP-070 | ✅ COMPLETED |
| B2 | Hibernate `@Filter` tenant isolation on all entities | CC-0203 / EUP-005 | ✅ COMPLETED |
| B3 | Tenant isolation automated test suite | CC-0210 / EUP-071 | ✅ COMPLETED |
| B4 | `FeatureFlagService` + `@RequiresFeature` AOP | CC-0012 / EUP-014 | ✅ COMPLETED |
| B5 | Flyway `V7__add_indexes.sql` | EUP-013 | ✅ COMPLETED |
| B6 | Flyway `V8__create_schools.sql` | EUP-070 | ✅ COMPLETED |
| B7 | OpenAPI / Swagger setup | EUP-006 | ✅ COMPLETED |
| B8 | `Dockerfile` (multi-stage, non-root user) | EUP-061 | ✅ COMPLETED |
| B9 | GitHub Actions CI pipeline | CC-1502 / EUP-060 | ✅ COMPLETED |
| B10 | Testcontainers integration tests (replace H2) | CC-0210 / EUP-015 | ✅ COMPLETED |
| B11 | Password reset flow (email OTP) | CC-0107, CC-0108 | ✅ COMPLETED |
| B12 | Soft delete strategy + `V9__soft_delete.sql` | EUP-012 | ✅ COMPLETED |

### ✅ Phase C — Frontend Start

| # | Task | ID | Status |
|---|------|----|---------|
| C1 | Scaffold React + TypeScript + Vite + TanStack project | EUP-040 | ✅ COMPLETED |
| C2 | Auth module (login page, token management in memory, refresh interceptor) | EUP-042 | ✅ COMPLETED |
| C3 | Route protection + role guard + feature flag gate | EUP-043, EUP-044 | ✅ COMPLETED |
| C4 | Super Admin: tenant list + tenant create | CC-0302, CC-0304 | ✅ COMPLETED |
| C5 | Frontend tests (31/31 passing, Vitest + React Testing Library) | — | ✅ COMPLETED |

### 🔵 Phase D — Mobile + DevOps + Scale

| # | Task | ID | Status |
|---|------|----|---------|
| D1 | React Native + Expo scaffold + navigation + auth store | EUP-050 | ✅ COMPLETED |
| D2 | Secure token storage (Expo SecureStore + MMKV + hydration) | EUP-052 | ✅ COMPLETED |
| D2b | Offline attendance (WatermelonDB + sync queue + sync engine) | EUP-051 | ✅ COMPLETED |
| D2c | Push notifications (Expo Notifications + FCM/APNs + device register) | EUP-053 | ✅ COMPLETED |
| D3 | Prometheus + Grafana dashboard + alert rules (docker-compose) | EUP-062 | ✅ COMPLETED |
| D4 | Staging + production environment profiles | EUP-063 | 🔄 IN PROGRESS |
| D5 | Backup strategy (dev: `pg_dump` cron sidecar) | EUP-021 | ⏳ PENDING |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Cross-tenant data leak via missing query filter | High | Critical | EUP-005 — Hibernate @Filter (Phase B2) |
| Brute-force attack on login | High | High | EUP-030 (Phase A4) |
| JWT secret in environment — no rotation strategy | Medium | High | EUP-032 — Secrets manager (before production) |
| N+1 queries on student list at scale | Medium | Medium | EUP-011 — @EntityGraph + @BatchSize |
| H2/PostgreSQL divergence in tests | Medium | Medium | EUP-015 — Testcontainers |
| School entity missing — all domain data is tenant-scoped only | High | High | EUP-070 — create before Student/Class/Attendance |
| Virtual thread + ThreadLocal misuse | Low | Medium | EUP-007 — ScopedValue migration |
| Token stored in localStorage (frontend) | High | High | EUP-042 — in-memory access token |
| Mobile app without offline support for attendance | Medium | High | EUP-051 — WatermelonDB sync |

---

## Rollback Strategy (General)

For every database migration: Flyway's `repair` command can undo failed migrations. Each migration must be idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).

For every feature flag: all new features are introduced behind a flag. Roll back = disable the flag in Redis without touching code.

For every API change: API versioning (`/v1/`, `/v2/`) ensures old clients continue to work during migration.

For every configuration change: `application.yml` changes are environment-variable-overridable. Roll back = revert the env var, restart the pod.

---

*This document must be updated when any architectural decision is made or changed.*
*Next review: after Phase B is complete.*
