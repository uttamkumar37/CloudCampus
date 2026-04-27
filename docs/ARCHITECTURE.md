# CampusCloud — Architecture

A living document of every architectural decision in the platform.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Layered Architecture](#2-layered-architecture)
3. [Backend Module Map](#3-backend-module-map)
4. [Multi-Tenancy Deep Dive](#4-multi-tenancy-deep-dive)
5. [Security & Auth Pipeline](#5-security--auth-pipeline)
6. [Database Schema Layout](#6-database-schema-layout)
7. [Fee Reconciliation Algorithm](#7-fee-reconciliation-algorithm)
8. [Exam Marks Guard](#8-exam-marks-guard)
9. [Error Handling Contract](#9-error-handling-contract)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Infrastructure & DevOps](#11-infrastructure--devops)
12. [Key Design Decisions](#12-key-design-decisions)
13. [Conventions](#13-conventions)
14. [Adding a New Module Checklist](#14-adding-a-new-module-checklist)

---

## 1. System Overview

```
+--------------------------------------------------------------+
|            React 18 SPA  (port 5173 dev / dist/)             |
|                                                              |
|  React Router v6                                             |
|  TanStack Query v5  (server state cache + mutations)         |
|  Tailwind CSS 3     (utility classes)                        |
|  Axios              (interceptors inject JWT + X-Tenant-ID)  |
+------------------------------+-------------------------------+
                               | HTTPS / REST JSON
+------------------------------v-------------------------------+
|       Spring Boot 3.x API  (port 8080)                       |
|                                                              |
|  Servlet Filter Chain (ordered):                             |
|    1. TenantRequestFilter                                    |
|         reads X-Tenant-ID header                             |
|         -> TenantContext.setTenant(schema)  (ThreadLocal)    |
|         finally: TenantContext.clear()                       |
|    2. JwtAuthenticationFilter  (OncePerRequestFilter)        |
|         Bearer token -> JwtService.validateTokenAndGetClaims |
|         -> SecurityContextHolder.setAuthentication           |
|                                                              |
|  Spring MVC Controllers  (@PreAuthorize on every method)     |
|    /api/v1/auth  /tenants  /users  /students  /teachers      |
|    /academic     /attendance  /fees  /exams                  |
|                                                              |
|  Service Layer  (all business logic + validateTenantContext) |
|                                                              |
|  Spring Data JPA Repositories                                |
|    CurrentTenantIdentifierResolver reads TenantContext       |
|    -> all SQL targets: <schema>.<table>                      |
|                                                              |
|  GlobalExceptionHandler (@RestControllerAdvice)              |
|    wraps all exceptions in ApiResponse<Void>                 |
+------------------------------+-------------------------------+
                               | JDBC (HikariCP pool)
+------------------------------v-------------------------------+
|                   PostgreSQL 16                              |
|                                                              |
|  public schema  (Flyway V1 + V2)                             |
|    tenants                                                   |
|    flyway_schema_history                                     |
|                                                              |
|  greenwood schema  (provisioned on POST /tenants)            |
|    users | students | teachers | classes | subjects          |
|    sections | attendance_records | fee_assignments           |
|    fee_payments | exams | exam_results                       |
|                                                              |
|  riverside schema  (another tenant — completely isolated)    |
|    same 11 tables, no shared data, no discriminator columns  |
+--------------------------------------------------------------+
```

---

## 2. Layered Architecture

| Layer | Package | Responsibility | Rules |
|---|---|---|---|
| **Controller** | `*.controller` | Parse HTTP, call service, return `ApiResponse<T>` | No business logic; `@PreAuthorize` on every method |
| **Service Interface** | `*.service` | Defines contract | One interface per domain |
| **Service Impl** | `*.service.impl` | Business logic | `@Transactional` where needed; validates tenant context first |
| **Repository** | `*.repository` | Spring Data JPA | No raw SQL; custom finders only |
| **Entity** | `*.entity` | JPA-mapped table rows | Never returned from controllers; `@PrePersist` sets UUID + `createdAt` |
| **DTO** | `*.dto` | Java records (request/response) | One `*Request` and one `*Response` per use case; no JPA annotations |
| **Config** | `com.campuscloud.config` | Spring beans | `SecurityConfig`, `SwaggerConfig`, `PasswordConfig` |
| **Common** | `com.campuscloud.common` | Cross-cutting types | `ApiResponse<T>`, `PageResponse<T>`, `GlobalExceptionHandler` |
| **Tenant** | `com.campuscloud.tenant` | Multi-tenancy infrastructure | `TenantContext`, `TenantRequestFilter`, Hibernate resolvers |

**SOLID in this codebase:**

- **S** — Controller handles HTTP only; Service handles logic only; Repository handles persistence only.
- **O** — New modules extend via new packages; no existing service is modified.
- **L** — `FeesService` and `FeesServiceImpl` contract: implementations swap without affecting controllers.
- **I** — Each service interface is narrow (5–8 methods); no God interfaces.
- **D** — Controllers depend on service interfaces, not `@Service` classes; injected via constructor.

---

## 3. Backend Module Map

### auth

```
com.campuscloud.auth/
  controller/
    AuthController              POST /api/v1/auth/login -> LoginResponse
  filter/
    JwtAuthenticationFilter     OncePerRequestFilter; reads Bearer token;
                                  extracts username + role -> SecurityContext
  service/
    JwtService                  interface: generateToken, extractUsername, isTokenValid
    JwtServiceImpl              @Service; JJWT HS256; expiry from config
    DatabaseUserDetailsService  UserDetailsService impl;
                                  intercepts bootstrap admin username first,
                                  then queries tenant schema users table
  dto/
    LoginRequest                record { username, password }
    LoginResponse               record { token, username, role }
```

### common

```
com.campuscloud.common/
  ApiResponse<T>                record { boolean success, String message, T data, Instant timestamp }
  PageResponse<T>               record { List<T> content, int page, int size, long totalElements, int totalPages, boolean last }
  GlobalExceptionHandler        @RestControllerAdvice
                                  @ExceptionHandler(IllegalArgumentException)  -> 400
                                  @ExceptionHandler(AccessDeniedException)      -> 403
                                  @ExceptionHandler(Exception)                  -> 500
```

### config

```
com.campuscloud.config/
  SecurityConfig                @Configuration @EnableWebSecurity @EnableMethodSecurity
                                  SecurityFilterChain bean:
                                    sessionManagement(STATELESS)
                                    csrf(disabled)
                                    /api/v1/auth/** -> permitAll()
                                    all other routes -> authenticated()
                                  adds TenantRequestFilter before JwtAuthenticationFilter
  SwaggerConfig                 @Configuration OpenAPI bean; @SecurityScheme(JWT Bearer)
  PasswordConfig                @Configuration BCryptPasswordEncoder bean (strength=12)
```

### tenant

```
com.campuscloud.tenant/
  controller/
    TenantController            POST, GET /api/v1/tenants; GET /api/v1/tenants/{id}
                                  @PreAuthorize("hasRole('SUPER_ADMIN')")
  service/
    TenantService               interface: createTenant, getAllTenants, getTenantById
    TenantServiceImpl           @Service; createTenant -> saves Tenant entity in public schema
                                  -> calls initializeTenantTables(schemaName) via JdbcTemplate
                                  initializeTenantTables: executes 12 CREATE TABLE statements
  repository/
    TenantRepository            JpaRepository<Tenant, UUID>; findBySchemaName
  entity/
    Tenant                      @Entity @Table(schema="public", name="tenants")
                                  fields: id(UUID), name, schemaName, active, createdAt
  TenantContext                 static ThreadLocal<String> holder; get/set/clear
  TenantRequestFilter           @Component; runs in filter chain; reads X-Tenant-ID header
                                  -> TenantContext.setTenant(schema)
                                  -> chain.doFilter(...)
                                  -> finally: TenantContext.clear()
  TenantIdentifierResolver      implements CurrentTenantIdentifierResolver<String>
                                  -> resolveCurrentTenantIdentifier() returns TenantContext.getTenant()
  SchemaMultiTenantConnectionProvider
                                implements MultiTenantConnectionProvider<String>
                                  -> getConnection(tenantIdentifier): SET search_path = <schema>
```

### user / student / teacher / academic / attendance / fees / exam

Each follows the same pattern:

```
controller/
  XController   @RestController, @RequestMapping("/api/v1/<path>")
                  @PreAuthorize on every method
service/
  XService      interface
  XServiceImpl  @Service, constructor-injected repository
                  first call: validateTenantContext()
                  normalises inputs (lower/upper case)
                  checks uniqueness via repository.existsBy*()
                  business logic
repository/
  XRepository   JpaRepository<XEntity, UUID>
                  custom finders: existsByX, findByX, findAllByX
entity/
  XEntity       @Entity
                  @PrePersist: id = UUID.randomUUID(), createdAt = Instant.now()
dto/
  XRequest      Java record (input, validated with @NotBlank / @NotNull)
  XResponse     Java record (output, mapped from entity)
```

---

## 4. Multi-Tenancy Deep Dive

### Strategy

Schema-per-tenant. PostgreSQL schemas are namespaces for tables. Each tenant's data lives in its own schema. Hibernate switches schemas per-request via `search_path`.

### Why Schema-per-Tenant (vs Row-level with discriminator)

| Factor | Schema-per-Tenant | Row-level |
|---|---|---|
| Data isolation | Complete — no WHERE clause bugs | Risk of missing WHERE clause |
| Query simplicity | No tenant filter on every query | `WHERE tenant_id = ?` everywhere |
| Index efficiency | Indexes cover only one tenant | Indexes span all tenants |
| Backup/restore | Per-tenant dump possible | Must filter + copy |
| Tenant offboarding | `DROP SCHEMA greenwood CASCADE` | Complex DELETE cascade |
| Scale | ~100s of tenants per DB node | Millions of rows possible |

### ThreadLocal Lifecycle

```
                             HTTP Thread

    +-----------+   sets    +---------------+   reads   +-------------------+
    | Tenant    |  ------>  | TenantContext |  <------  | TenantIdentifier  |
    | Request   |           | (ThreadLocal) |           | Resolver          |
    | Filter    |           +---------------+           | (Hibernate hook)  |
    |           |   clears                              +-------------------+
    | (finally) |  ------>  TenantContext.clear()
    +-----------+
```

**Critical:** The `finally` block in `TenantRequestFilter` guarantees the ThreadLocal is cleared even if an exception occurs. Without this, the ThreadLocal would leak to the next request on the same thread (thread pool reuse), causing cross-tenant data access.

### Tenant Provisioning Transaction

`TenantServiceImpl.createTenant()`:

```
@Transactional
1. Check tenant name uniqueness (throws 400 if exists)
2. Check schema name uniqueness (throws 400 if exists)
3. Save Tenant entity to public.tenants
4. Execute JdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS <schemaName>")
5. Execute 11x CREATE TABLE IF NOT EXISTS <schemaName>.<table> (...)
   Each statement is idempotent (IF NOT EXISTS)
6. Transaction commits all 13 operations atomically
```

If step 5 fails (e.g., PostgreSQL permission error), the Tenant entity save in step 3 is rolled back via `@Transactional`.

### Hibernate Configuration (application.yml)

```yaml
spring:
  jpa:
    properties:
      hibernate:
        multi_tenancy: SCHEMA
        tenant_identifier_resolver: com.campuscloud.tenant.TenantIdentifierResolver
        multi_tenant_connection_provider: com.campuscloud.tenant.SchemaMultiTenantConnectionProvider
```

`SchemaMultiTenantConnectionProvider.getConnection(tenantId)`:
1. Gets a connection from HikariCP pool
2. Executes `SET search_path = <tenantId>` on the connection
3. Returns the connection to Hibernate
4. All subsequent JPA operations in this request target `<tenantId>.<table>`

---

## 5. Security & Auth Pipeline

### Filter Chain (in order)

```
Incoming Request
    |
    v
TenantRequestFilter                     (reads X-Tenant-ID → ThreadLocal)
    |
    v
JwtAuthenticationFilter                 (reads Authorization: Bearer → SecurityContext)
    |
    v
Spring Security Authorization           (checks SecurityContext against @PreAuthorize)
    |
    v
DispatcherServlet → Controller
```

### JWT Token Structure

```
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "username",
           "role": "ROLE_SUPER_ADMIN",
           "iat": 1745744800,
           "exp": 1745748400 }
Signature: HMACSHA256(base64url(header) + "." + base64url(payload), secret)
```

Role is stored as `ROLE_<ENUM_NAME>` (Spring Security convention):

| UserRole enum | Stored in JWT |
|---|---|
| SUPER_ADMIN | ROLE_SUPER_ADMIN |
| SCHOOL_ADMIN | ROLE_SCHOOL_ADMIN |
| TEACHER | ROLE_TEACHER |
| STUDENT | ROLE_STUDENT |
| PARENT | ROLE_PARENT |

### @PreAuthorize Examples

```java
// Tenant controller — only SUPER_ADMIN
@PreAuthorize("hasRole('SUPER_ADMIN')")
public ResponseEntity<ApiResponse<TenantResponse>> createTenant(...)

// User controller — SUPER_ADMIN or SCHOOL_ADMIN
@PreAuthorize("hasAnyRole('SUPER_ADMIN','SCHOOL_ADMIN')")
public ResponseEntity<ApiResponse<UserResponse>> createUser(...)

// Student list — any staff
@PreAuthorize("hasAnyRole('SUPER_ADMIN','SCHOOL_ADMIN','TEACHER')")
public ResponseEntity<ApiResponse<PageResponse<StudentResponse>>> listStudents(...)
```

Spring Security evaluates `hasRole('SUPER_ADMIN')` as `hasAuthority('ROLE_SUPER_ADMIN')`.

### Bootstrap Super Admin

Defined in `DatabaseUserDetailsService`:

```java
@PostConstruct
private void initBootstrapAdmin() {
    this.bootstrapAdminDetails = User.builder()
        .username(bootstrapAdminUsername)
        .password(passwordEncoder.encode(bootstrapAdminPassword))
        .roles(bootstrapAdminRole)
        .build();
}

@Override
public UserDetails loadUserByUsername(String username) {
    if (username.equals(bootstrapAdminUsername)) {
        return bootstrapAdminDetails;  // in-memory, never hits DB
    }
    // else: query tenant schema users table
    ...
}
```

Bootstrap admin **does not need `X-Tenant-ID`** for tenant management endpoints. It does need `X-Tenant-ID` for all tenant-scoped endpoints.

### Security Config

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/v1/auth/**",
                             "/swagger-ui/**",
                             "/v3/api-docs/**").permitAll()
            .anyRequest().authenticated()
        )
        .addFilterBefore(tenantRequestFilter, JwtAuthenticationFilter.class)
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

---

## 6. Database Schema Layout

### Public Schema (Flyway-managed)

```
public/
  tenants              Platform registry of schools
  flyway_schema_history Flyway migration tracking
```

Flyway migrations:
- `V1__init_public_schema.sql` — creates `public.tenants`
- `V2__baseline_public_schema_extensions.sql` — extensions/indexes

Flyway only manages the `public` schema. Tenant schemas are provisioned imperatively by `TenantServiceImpl`.

### Tenant Schema (11 tables per tenant)

```
<schema>/
  users                Staff accounts (role-based)
  students             Enrolled students
  teachers             Teaching staff
  classes              Class year groups (Grade 10, etc.)
  subjects             Academic subjects (Math, Science, etc.)
  sections             Sub-divisions of a class (Section A, B)
    FK: sections.class_id -> classes.id
  attendance_records   Daily attendance
    UNIQUE(student_id, attendance_date)
  fee_assignments      Fee items assigned to students
    status: PENDING | PARTIALLY_PAID | PAID
  fee_payments         Individual payment records
    FK: fee_payments.fee_assignment_id -> fee_assignments.id
  exams                Exam schedule
    UNIQUE(title, exam_date, class_id, section_id, subject_id)
  exam_results         Student results per exam
    FK: exam_results.exam_id -> exams.id
    UNIQUE(exam_id, student_id)
```

### Type Conventions

| Java Type | PostgreSQL Type | Notes |
|---|---|---|
| `UUID` | `UUID` | PKs generated in `@PrePersist` |
| `String` | `VARCHAR(n)` | n varies by field semantics |
| `LocalDate` | `DATE` | ISO 8601: yyyy-MM-dd |
| `Instant` | `TIMESTAMPTZ` | Stored in UTC |
| `BigDecimal` | `NUMERIC(12,2)` | Fee amounts |
| `BigDecimal` | `NUMERIC(8,2)` | Exam marks |
| `boolean` | `BOOLEAN` | Active flags, published flag |
| `Enum` | `VARCHAR(n)` | Stored as name(), not ordinal |

### ID Generation

All PKs are `UUID` set programmatically in `@PrePersist`:

```java
@PrePersist
protected void onCreate() {
    if (id == null) id = UUID.randomUUID();
    if (createdAt == null) createdAt = Instant.now();
}
```

`@GeneratedValue` is intentionally NOT used — UUIDs are generated application-side for predictability in tests and to avoid DB round-trips.

---

## 7. Fee Reconciliation Algorithm

```
POST /api/v1/fees/payments  ->  FeesServiceImpl.recordPayment(request)

1. Load FeeAssignment by request.feeAssignmentId
   -> throw 400 if not found

2. Validate tenant context
   -> throw 400 if no valid tenant schema

3. Load all existing FeePayments for this assignment
   totalAlreadyPaid = SUM(payment.amountPaid for payment in existing)

4. remaining = assignment.amount - totalAlreadyPaid

5. if request.amountPaid > remaining:
       throw IllegalArgumentException("Overpayment: remaining is " + remaining)

6. Save new FeePayment entity

7. newTotalPaid = totalAlreadyPaid + request.amountPaid

8. if newTotalPaid >= assignment.amount:
       assignment.status = FeeStatus.PAID
   else:
       assignment.status = FeeStatus.PARTIALLY_PAID

9. Save updated FeeAssignment

State machine:
    PENDING ---------> PARTIALLY_PAID ---------> PAID
      (first partial)   (subsequent payments)    (fully paid)
    PENDING -----------------------------------------> PAID
                        (single full payment)
```

Status never goes backwards. Once `PAID`, no further payments are accepted (remaining = 0, so any `amountPaid > 0` fails step 5).

---

## 8. Exam Marks Guard

```
POST /api/v1/exams/results  ->  ExamServiceImpl.enterResult(request)

1. Validate tenant context

2. Load Exam by request.examId
   -> throw 400 if not found

3. if request.marksObtained > exam.maxMarks:
       throw IllegalArgumentException("Marks " + marks + " exceed max " + max)

4. Check UNIQUE(exam_id, student_id):
   if existsByExamIdAndStudentId(examId, studentId):
       throw IllegalArgumentException("Result already exists")

5. Save ExamResult entity

Invariants guaranteed:
  - 0 <= marksObtained <= maxMarks  (service checks upper bound; DB constraint = app trust)
  - One result per student per exam  (UNIQUE constraint + service guard)
  - maxMarks always > 0             (required field, no DB constraint — future validator)
```

---

## 9. Error Handling Contract

### GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleBadRequest(IllegalArgumentException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleForbidden(AccessDeniedException ex) {
        return ApiResponse.error("Access denied: " + ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return ApiResponse.error("An unexpected error occurred");
    }
}
```

All business rule violations use `IllegalArgumentException` — simple, no custom exception hierarchy needed at this stage.

### ApiResponse

```java
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    Instant timestamp
) {
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now());
    }
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, Instant.now());
    }
}
```

### HTTP Status Mapping

| Condition | Status | `success` | `data` |
|---|---|---|---|
| Normal response | 200 | true | payload |
| Business rule violation / duplicate | 400 | false | null |
| Auth challenge (missing/invalid token) | 401 | — | Spring Security default |
| Insufficient role | 403 | false | null |
| Unhandled exception | 500 | false | null |

Note: 401 responses from `JwtAuthenticationFilter` are handled by Spring Security's `AuthenticationEntryPoint` (default response). A future task adds a custom `AuthenticationEntryPoint` to return `ApiResponse` format.

---

## 10. Frontend Architecture

### State Model

```
Server State   TanStack Query v5   (remote data, cached, stale-while-revalidate)
Client State   React Context       (auth only)
Local State    useState / useForm  (form inputs, UI toggles)
URL State      React Router v6     (page, pagination, filters in query params)
```

### Auth Flow

```
LoginPage
  -> POST /api/v1/auth/login (no interceptor needed for this call)
  -> success: save token + tenantId to localStorage
  -> AuthContext.login() sets user state
  -> navigate to /dashboard

PrivateRoute
  -> reads AuthContext.isAuthenticated
  -> false -> <Navigate to="/login" />

axiosClient interceptors (every subsequent request)
  -> Authorization: Bearer <token from localStorage>
  -> X-Tenant-ID: <tenantId from localStorage>
```

### Query Conventions

```typescript
// List (paginated)
useQuery({
  queryKey: ['students', page, size],
  queryFn: () => studentApi.list({ page, size }),
})

// Create mutation
const mutation = useMutation({
  mutationFn: studentApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['students'] });
    navigate('/students');
  },
})
```

### API Client Pattern

All modules expose an API object:

```typescript
// src/features/student/studentApi.ts
export const studentApi = {
  list:   (params) => axiosClient.get('/students', { params }).then(r => r.data),
  getById:(id)     => axiosClient.get(`/students/${id}`).then(r => r.data),
  create: (body)   => axiosClient.post('/students', body).then(r => r.data),
};
```

---

## 11. Infrastructure & DevOps

### Container Build (multi-stage)

```
Stage 1 (builder): maven:3.9-eclipse-temurin-17
  - Downloads dependencies (cached layer)
  - mvn clean package -DskipTests
  - Output: target/digital-school-saas-0.0.1-SNAPSHOT.jar

Stage 2 (runtime): eclipse-temurin:17-jre-alpine
  - Non-root user: spring (addgroup/adduser)
  - COPY jar from builder
  - ENTRYPOINT with container-aware JVM flags
```

JVM flags used:
- `-XX:+UseContainerSupport` — honours cgroup memory limits
- `-XX:MaxRAMPercentage=75.0` — limits heap to 75% of container memory

### GitHub Actions Pipelines

**ci.yml** (every push + PR to main):
- Spins up PostgreSQL 16 service container
- `mvn verify` with full env vars set
- Fails fast if any test fails

**docker-publish.yml** (push to main + version tags):
- Builds Docker image
- Pushes to GitHub Container Registry (`ghcr.io/<owner>/<repo>:latest`)
- Uses `GITHUB_TOKEN` — no secrets to manage

### Health Check (docker-compose)

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME} -d ${DB_NAME}"]
  interval: 10s
  timeout: 5s
  retries: 5
```

The `app` service has `depends_on: { db: { condition: service_healthy } }` — app only starts after PostgreSQL is ready.

---

## 12. Key Design Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | **Schema-per-tenant** | Complete isolation without discriminator column risk; simpler queries; per-tenant backup possible |
| 2 | **Modular monolith** | Fast to develop; clean domain boundaries; extractable to microservices when needed |
| 3 | **UUID PKs from application** | Predictable in tests; no DB round-trip for ID; portable across DB engines |
| 4 | **Java records for DTOs** | Immutable, concise, no Lombok needed; equals/hashCode/toString built in |
| 5 | **IllegalArgumentException for business errors** | No custom exception hierarchy overhead; GlobalExceptionHandler maps it to 400 |
| 6 | **Stateless JWT** | No session store needed; horizontally scalable from day one |
| 7 | **No `@GeneratedValue`** | UUID generated in `@PrePersist` — same UUID available before and after save |
| 8 | **`@PreAuthorize` on every method** | Explicit — no implicit permissions; grepping shows exactly who can do what |
| 9 | **Flyway public schema only** | Tenant schemas are dynamic (created at runtime); Flyway manages the static platform schema only |
| 10 | **Bootstrap admin in memory** | Super admin never lives in a tenant schema; no chicken-and-egg problem on first deployment |

---

## 13. Conventions

| Item | Convention |
|---|---|
| Package naming | `com.campuscloud.<module>.<layer>` |
| Controller method return | `ResponseEntity<ApiResponse<T>>` |
| HTTP status | Always 200 with `success: true/false`; only 4xx/5xx from exceptions |
| Service first line | `validateTenantContext()` call |
| Input normalisation | `toLowerCase()` for emails/usernames; `toUpperCase()` for IDs (admissionNo, employeeNo) |
| Uniqueness check | `repository.existsByX(value)` before save; never rely on DB unique constraint alone |
| Logging | `@Slf4j`; INFO for major operations; WARN for business violations; ERROR for unexpected exceptions |
| Test naming | `<method>_<condition>_<expected>` e.g. `createUser_duplicateUsername_throws` |
| DTO → Entity mapping | Manual in service (no MapStruct yet — avoid magic for readability) |
| Entity → Response mapping | `XResponse.from(entity)` static factory method on the record |

---

## 14. Adding a New Module Checklist

Follow this checklist when adding a new domain module (e.g., `library`):

```
[ ] 1. Create package: com.campuscloud.library/
[ ] 2. Entity: LibraryEntity extends BaseEntity (if extracted)
       @Entity, @Table(name = "library_books")
       @PrePersist sets id + createdAt
[ ] 3. Migration SQL: Add CREATE TABLE to TenantServiceImpl.initializeTenantTables()
       (existing tenants need a separate migration script)
[ ] 4. Repository: LibraryRepository extends JpaRepository<LibraryEntity, UUID>
[ ] 5. DTOs: LibraryRequest record, LibraryResponse record with static from() factory
[ ] 6. Service: LibraryService interface + LibraryServiceImpl
       - constructor injection of repository
       - validateTenantContext() first in every public method
       - normalise inputs, check uniqueness, apply business rules
[ ] 7. Controller: LibraryController @RestController @RequestMapping("/api/v1/library")
       - @PreAuthorize on every method
       - return ResponseEntity<ApiResponse<T>>
[ ] 8. Tests: LibraryServiceImplTest (Mockito, no Spring context)
       - test happy path
       - test tenant context guard
       - test all business rule violations
[ ] 9. Update docs/API.md — add Library section
[  10. Update docs/PROJECT_TRACKER.md — mark task complete
```

---

> See [README.md](../README.md) for setup, configuration, and quick start.
> See [docs/API.md](API.md) for the complete HTTP API reference.
