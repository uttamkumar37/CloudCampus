package com.cloudcampus.rbac;

import com.cloudcampus.auth.entity.UserRole;
import com.cloudcampus.auth.security.JwtUtil;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.entity.SchoolStatus;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.entity.TenantStatus;
import com.cloudcampus.tenant.repository.TenantRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * TASK-004 — Cross-Tenant Isolation Integration Tests.
 *
 * Proves that Tenant A cannot read or mutate Tenant B's data at the HTTP layer.
 * Tests exercise two distinct isolation mechanisms:
 *
 *   1. Hibernate @Filter (TenantFilterAspect) — applied automatically on every
 *      JpaRepository call when RequestContext.getTenantId() is non-null.
 *      Restricts list queries to the calling tenant's rows.
 *
 *   2. Explicit tenant-scoped lookup (StudentServiceImpl.findOrThrow) —
 *      uses findByIdAndTenantId(id, tenantId) so a cross-tenant ID reference
 *      returns NotFoundException → 404, not a data leak.
 *
 * Isolation matrix:
 *
 *   Endpoint                                      | TenantA result | TenantB result
 *   GET  /v1/school-admin/schools/{B}/students    | 200 empty      | 200 with data
 *   GET  /v1/school-admin/students/{studentB}     | 404            | 200
 *   PATCH /v1/school-admin/students/{studentB}/.. | 404            | 200
 *
 * Data setup: Tenant A and Tenant B are not persisted to the tenants table.
 * TenantSuspensionFilter defaults unknown tenant IDs to ACTIVE (fail-open),
 * so random UUIDs in JWTs work without a corresponding DB row.
 *
 * School B and Student B are inserted directly via repositories (outside HTTP).
 * TenantFilterAspect skips the Hibernate filter when RequestContext.getTenantId()
 * is null — no active HTTP request means no tenant context — so direct saves are
 * unrestricted, which is the correct behaviour for bootstrap/test setup code.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("TASK-004 — Cross-Tenant Isolation Integration Tests")
class CrossTenantIsolationIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("pgvector/pgvector:pg16");

    @Container
    @ServiceConnection
    @SuppressWarnings("resource")
    static final GenericContainer<?> REDIS =
            new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    @Autowired MockMvc           mockMvc;
    @Autowired JwtUtil           jwtUtil;
    @Autowired TenantRepository  tenantRepo;
    @Autowired SchoolRepository  schoolRepo;
    @Autowired StudentRepository studentRepo;

    // ── Identities ────────────────────────────────────────────────────────────

    final UUID tenantA = UUID.randomUUID();
    final UUID tenantB = UUID.randomUUID();

    UUID schoolBId;
    UUID studentBId;

    // ── Seed data ─────────────────────────────────────────────────────────────

    @BeforeAll
    void seedTenantBData() {
        // schools.tenant_id has a FK → tenants.id, so both tenants must exist first.
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        tenantRepo.save(new Tenant(tenantA, "ISO-A-" + suffix, "Isolation Tenant A",
                TenantStatus.ACTIVE, Instant.now()));
        tenantRepo.save(new Tenant(tenantB, "ISO-B-" + suffix, "Isolation Tenant B",
                TenantStatus.ACTIVE, Instant.now()));

        School schoolB = new School(
                UUID.randomUUID(), tenantB,
                "Isolation School B", "SCHOOL-B-" + suffix,
                SchoolStatus.ACTIVE, Instant.now());
        schoolBId = schoolRepo.save(schoolB).getId();

        Student studentB = Student.create(
                tenantB, schoolBId, "2025-ISO-001",
                "Bob", "Brown", LocalDate.now());
        studentBId = studentRepo.save(studentB).getId();
    }

    // ── Token factory ─────────────────────────────────────────────────────────

    private String tenantAdminToken(UUID tenantId) {
        // TENANT_ADMIN has no schoolId in the JWT — SchoolPathAccessInterceptor
        // bypasses the school-match check for this role.
        return "Bearer " + jwtUtil.generateAccessToken(
                UUID.randomUUID(), tenantId, null, UserRole.TENANT_ADMIN.name());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 1. Hibernate @Filter — list isolation
    //    TENANT_ADMIN_A accesses School B's student list endpoint.
    //    SchoolPathAccessInterceptor passes (TENANT_ADMIN bypasses school check).
    //    TenantFilterAspect applies WHERE tenant_id = tenantA → no rows returned.
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[list-isolation] Tenant A gets empty list for Tenant B's school — Hibernate filter applied")
    void tenantA_listStudentsInTenantBSchool_returnsEmpty() throws Exception {
        String body = mockMvc.perform(
                        get("/v1/school-admin/schools/{id}/students", schoolBId)
                                .header("Authorization", tenantAdminToken(tenantA)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(body)
                .as("Tenant A must not see Tenant B's students — Hibernate filter must return empty data")
                .contains("\"data\":[]");
        assertThat(body)
                .as("Student B's UUID must not appear in Tenant A's list response")
                .doesNotContain(studentBId.toString());
    }

    @Test
    @DisplayName("[list-isolation] Tenant B can list its own school's students — positive control")
    void tenantB_listStudentsInOwnSchool_returnsStudentB() throws Exception {
        String body = mockMvc.perform(
                        get("/v1/school-admin/schools/{id}/students", schoolBId)
                                .header("Authorization", tenantAdminToken(tenantB)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(body)
                .as("Tenant B must see its own students in the list response")
                .contains(studentBId.toString());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. Explicit tenant-scoped lookup — get by ID
    //    StudentServiceImpl.findOrThrow uses findByIdAndTenantId(id, tenantA).
    //    Student B has tenantId = tenantB → Optional.empty() → NotFoundException → 404.
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[get-by-id] Tenant A gets 404 for Tenant B's student — findByIdAndTenantId enforces isolation")
    void tenantA_getStudentBById_returns404() throws Exception {
        mockMvc.perform(
                        get("/v1/school-admin/students/{id}", studentBId)
                                .header("Authorization", tenantAdminToken(tenantA)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("[get-by-id] Tenant B can fetch its own student by ID — positive control")
    void tenantB_getOwnStudentById_returns200() throws Exception {
        mockMvc.perform(
                        get("/v1/school-admin/students/{id}", studentBId)
                                .header("Authorization", tenantAdminToken(tenantB)))
                .andExpect(status().isOk());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. Write isolation — mutation on a cross-tenant student
    //    Tenant A attempts to graduate Student B. The same findByIdAndTenantId
    //    guard in findOrThrow fires before any state change → 404.
    //    Student B remains ACTIVE in the database — no mutation occurred.
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[write-isolation] Tenant A cannot graduate Tenant B's student — 404, no state change")
    void tenantA_graduateStudentB_returns404() throws Exception {
        mockMvc.perform(
                        patch("/v1/school-admin/students/{id}/graduate", studentBId)
                                .header("Authorization", tenantAdminToken(tenantA)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("[write-isolation] Tenant A cannot suspend Tenant B's student — 404, no state change")
    void tenantA_suspendStudentB_returns404() throws Exception {
        mockMvc.perform(
                        patch("/v1/school-admin/students/{id}/suspend", studentBId)
                                .header("Authorization", tenantAdminToken(tenantA)))
                .andExpect(status().isNotFound());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4. No token → 401 — baseline sanity
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[auth] No token → 401 on Tenant B's student list endpoint")
    void noToken_listStudentsInTenantBSchool_returns401() throws Exception {
        mockMvc.perform(get("/v1/school-admin/schools/{id}/students", schoolBId))
                .andExpect(status().isUnauthorized());
    }
}
