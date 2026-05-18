package com.cloudcampus.rbac;

import com.cloudcampus.auth.entity.UserRole;
import com.cloudcampus.auth.security.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * TASK-002 — Role Matrix Integration Tests.
 *
 * Locks down Spring Security route-level and method-level RBAC across all 7 roles.
 * Uses real JWTs (via JwtUtil) against Testcontainers PostgreSQL + Redis — same
 * infrastructure as production.
 *
 * Role matrix covered:
 *
 *   Route family                          | SA | TA | SchA | T  | St | Par | Stf
 *   /v1/super-admin/**   (route-level)    | ✓  | ✗  |  ✗   | ✗  | ✗  |  ✗  |  ✗
 *   /v1/admin/**         (route-level)    | ✓  | ✓  |  ✗   | ✗  | ✗  |  ✗  |  ✗
 *   /v1/school-admin/**  (route-level)    | ✗  | ✓  |  ✓   | ✗  | ✗  |  ✗  |  ✗
 *   /v1/teacher/dashboard(@PreAuthorize)  | ✗  | ✗  |  ✗   | ✓  | ✗  |  ✗  |  ✗
 *   anyRequest().authenticated()          | ✓  | ✓  |  ✓   | ✓  | ✓  |  ✓  |  ✓
 *   public (/actuator/health, /v1/auth/…) | ✓  | ✓  |  ✓   | ✓  | ✓  |  ✓  |  ✓
 *
 * SA=SUPER_ADMIN, TA=TENANT_ADMIN, SchA=SCHOOL_ADMIN, T=TEACHER,
 * St=STUDENT, Par=PARENT, Stf=STAFF
 *
 * NOTE: SUPER_ADMIN is intentionally absent from /v1/school-admin/** — super-admin
 * operations use /v1/super-admin/** routes. This is documented as a known gap in
 * TASK-001 findings and tested explicitly here so any accidental regression is caught.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
@DisplayName("TASK-002 — Role Matrix Integration Tests")
class RoleMatrixIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("pgvector/pgvector:pg16");

    @Container
    @ServiceConnection
    static final GenericContainer<?> REDIS =
            new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    @Autowired MockMvc  mockMvc;
    @Autowired JwtUtil  jwtUtil;

    // ── Token factory ─────────────────────────────────────────────────────────

    /**
     * Mints a valid signed JWT for the given role with random UUIDs.
     * SUPER_ADMIN has no tenantId (system-level). School-scoped roles carry a schoolId.
     */
    private String bearerToken(UserRole role) {
        UUID tenantId = (role == UserRole.SUPER_ADMIN) ? null : UUID.randomUUID();
        UUID schoolId = switch (role) {
            case SCHOOL_ADMIN, TEACHER, STAFF, PARENT, STUDENT -> UUID.randomUUID();
            default -> null;
        };
        String token = jwtUtil.generateAccessToken(
                UUID.randomUUID(), tenantId, schoolId, role.name());
        return "Bearer " + token;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 1. /v1/super-admin/** — SUPER_ADMIN only (route-level)
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[super-admin] SUPER_ADMIN → 200 on GET /v1/super-admin/tenants")
    void superAdmin_allowedForSuperAdmin() throws Exception {
        mockMvc.perform(get("/v1/super-admin/tenants")
                        .header("Authorization", bearerToken(UserRole.SUPER_ADMIN)))
                .andExpect(status().isOk());
    }

    @ParameterizedTest(name = "[super-admin] {0} → 403")
    @EnumSource(value = UserRole.class,
                names = {"TENANT_ADMIN", "SCHOOL_ADMIN", "TEACHER", "STAFF", "PARENT", "STUDENT"})
    @DisplayName("[super-admin] All non-SUPER_ADMIN roles are forbidden by route security")
    void superAdmin_forbiddenForAllOtherRoles(UserRole role) throws Exception {
        mockMvc.perform(get("/v1/super-admin/tenants")
                        .header("Authorization", bearerToken(role)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("[super-admin] No token → 401")
    void superAdmin_unauthorizedWithNoToken() throws Exception {
        mockMvc.perform(get("/v1/super-admin/tenants"))
                .andExpect(status().isUnauthorized());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. /v1/admin/** — TENANT_ADMIN, SUPER_ADMIN (route-level)
    // ══════════════════════════════════════════════════════════════════════════

    @ParameterizedTest(name = "[admin] {0} → passes route security")
    @EnumSource(value = UserRole.class, names = {"TENANT_ADMIN", "SUPER_ADMIN"})
    @DisplayName("[admin] TENANT_ADMIN and SUPER_ADMIN pass route-level security on /v1/admin/**")
    void admin_allowedRolesPassRouteSecurity(UserRole role) throws Exception {
        // No controller handles /v1/admin/rbac-probe — DispatcherServlet returns 404,
        // proving Spring Security passed the request (not 401 or 403).
        int httpStatus = mockMvc.perform(get("/v1/admin/rbac-probe")
                        .header("Authorization", bearerToken(role)))
                .andReturn().getResponse().getStatus();
        assertThat(httpStatus)
                .as("Role %s must pass Spring Security route check on /v1/admin/** (not 401/403)", role)
                .isNotEqualTo(401)
                .isNotEqualTo(403);
    }

    @ParameterizedTest(name = "[admin] {0} → 403")
    @EnumSource(value = UserRole.class,
                names = {"SCHOOL_ADMIN", "TEACHER", "STAFF", "PARENT", "STUDENT"})
    @DisplayName("[admin] Non-admin roles are forbidden by route security on /v1/admin/**")
    void admin_forbiddenRoles(UserRole role) throws Exception {
        mockMvc.perform(get("/v1/admin/rbac-probe")
                        .header("Authorization", bearerToken(role)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("[admin] No token → 401")
    void admin_unauthorizedWithNoToken() throws Exception {
        mockMvc.perform(get("/v1/admin/rbac-probe"))
                .andExpect(status().isUnauthorized());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. /v1/school-admin/** — SCHOOL_ADMIN, TENANT_ADMIN (route-level)
    // ══════════════════════════════════════════════════════════════════════════

    @ParameterizedTest(name = "[school-admin] {0} → passes route security")
    @EnumSource(value = UserRole.class, names = {"SCHOOL_ADMIN", "TENANT_ADMIN"})
    @DisplayName("[school-admin] SCHOOL_ADMIN and TENANT_ADMIN pass route-level RBAC")
    void schoolAdmin_allowedRolesPassRouteSecurity(UserRole role) throws Exception {
        UUID schoolId = UUID.randomUUID();
        // SCHOOL_ADMIN: SchoolPathAccessInterceptor requires jwtSchoolId == path schoolId.
        // TENANT_ADMIN: interceptor bypasses the school-match check entirely.
        String authorization = (role == UserRole.SCHOOL_ADMIN)
                ? "Bearer " + jwtUtil.generateAccessToken(UUID.randomUUID(), UUID.randomUUID(), schoolId, role.name())
                : bearerToken(role);
        int httpStatus = mockMvc.perform(
                        get("/v1/school-admin/schools/{id}/students", schoolId)
                                .header("Authorization", authorization))
                .andReturn().getResponse().getStatus();
        assertThat(httpStatus)
                .as("Role %s must pass Spring Security route check on /v1/school-admin/** (not 401/403)", role)
                .isNotEqualTo(401)
                .isNotEqualTo(403);
    }

    @ParameterizedTest(name = "[school-admin] {0} → 403")
    @EnumSource(value = UserRole.class,
                names = {"SUPER_ADMIN", "TEACHER", "STAFF", "PARENT", "STUDENT"})
    @DisplayName("[school-admin] SUPER_ADMIN and non-admin roles are forbidden (SUPER_ADMIN gap documented)")
    void schoolAdmin_forbiddenRoles(UserRole role) throws Exception {
        // SUPER_ADMIN gets 403 here — SecurityConfig does not include SUPER_ADMIN in
        // hasAnyRole("SCHOOL_ADMIN","TENANT_ADMIN"). This is the current intended model:
        // super-admin operations go through /v1/super-admin/** routes.
        mockMvc.perform(
                        get("/v1/school-admin/schools/{id}/students", UUID.randomUUID())
                                .header("Authorization", bearerToken(role)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("[school-admin] No token → 401")
    void schoolAdmin_unauthorizedWithNoToken() throws Exception {
        mockMvc.perform(get("/v1/school-admin/schools/{id}/students", UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4. /v1/teacher/dashboard — @PreAuthorize("hasRole('TEACHER')") (method-level)
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[teacher-dashboard] TEACHER → passes method-level @PreAuthorize")
    void teacherDashboard_allowedForTeacher() throws Exception {
        int httpStatus = mockMvc.perform(get("/v1/teacher/dashboard")
                        .header("Authorization", bearerToken(UserRole.TEACHER)))
                .andReturn().getResponse().getStatus();
        assertThat(httpStatus)
                .as("TEACHER must pass @PreAuthorize(\"hasRole('TEACHER')\") — not 401/403")
                .isNotEqualTo(401)
                .isNotEqualTo(403);
    }

    @ParameterizedTest(name = "[teacher-dashboard] {0} → 403")
    @EnumSource(value = UserRole.class,
                names = {"SUPER_ADMIN", "TENANT_ADMIN", "SCHOOL_ADMIN", "STAFF", "PARENT", "STUDENT"})
    @DisplayName("[teacher-dashboard] Non-TEACHER roles are forbidden by @PreAuthorize")
    void teacherDashboard_forbiddenForNonTeacher(UserRole role) throws Exception {
        mockMvc.perform(get("/v1/teacher/dashboard")
                        .header("Authorization", bearerToken(role)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("[teacher-dashboard] No token → 401")
    void teacherDashboard_unauthorizedWithNoToken() throws Exception {
        mockMvc.perform(get("/v1/teacher/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5. anyRequest().authenticated() — every valid JWT passes, no token → 401
    // ══════════════════════════════════════════════════════════════════════════

    @ParameterizedTest(name = "[authenticated] {0} → not rejected by Spring Security")
    @EnumSource(UserRole.class)
    @DisplayName("[authenticated] All 7 roles pass Spring Security on anyRequest() paths")
    void authenticatedRoute_allRolesCanAccess(UserRole role) throws Exception {
        // /v1/rbac-probe-nonexistent has no controller → DispatcherServlet returns 404
        // (or 403 from a @ControllerAdvice), but never 401 from Spring Security.
        int httpStatus = mockMvc.perform(get("/v1/rbac-probe-nonexistent")
                        .header("Authorization", bearerToken(role)))
                .andReturn().getResponse().getStatus();
        assertThat(httpStatus)
                .as("Role %s must not be rejected by Spring Security auth on anyRequest() path", role)
                .isNotEqualTo(401);
    }

    @Test
    @DisplayName("[authenticated] No token → 401 on anyRequest() path")
    void authenticatedRoute_unauthorizedWithNoToken() throws Exception {
        mockMvc.perform(get("/v1/rbac-probe-nonexistent"))
                .andExpect(status().isUnauthorized());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6. Public routes — no token required
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[public] GET /actuator/health is accessible without authentication")
    void publicRoute_healthEndpoint() throws Exception {
        // May return 503 when MinIO/DB health indicators are DOWN in the test environment.
        // The key assertion is that it's public (no 401 from Spring Security).
        int httpStatus = mockMvc.perform(get("/actuator/health"))
                .andReturn().getResponse().getStatus();
        assertThat(httpStatus)
                .as("/actuator/health must not require authentication — no 401")
                .isNotEqualTo(401);
    }

    @Test
    @DisplayName("[public] POST /v1/auth/login is accessible without authentication")
    void publicRoute_authLoginEndpoint() throws Exception {
        // Empty/invalid body → 400 (validation) or similar, never 401.
        // Proves the route is public and doesn't require a JWT.
        int httpStatus = mockMvc.perform(post("/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andReturn().getResponse().getStatus();
        assertThat(httpStatus)
                .as("/v1/auth/login must be publicly accessible — no 401 for missing token")
                .isNotEqualTo(401);
    }

    @Test
    @DisplayName("[public] GET /v1/experience/public/** is accessible without authentication")
    void publicRoute_experiencePublicEndpoint() throws Exception {
        int httpStatus = mockMvc.perform(get("/v1/experience/public/showcase"))
                .andReturn().getResponse().getStatus();
        assertThat(httpStatus)
                .as("/v1/experience/public/** must be publicly accessible — no 401 for missing token")
                .isNotEqualTo(401);
    }
}
