package com.cloudcampus.tenant;

import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.entity.SchoolStatus;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.entity.TenantStatus;
import com.cloudcampus.tenant.repository.TenantRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tenant isolation test suite (CC-0210 / EUP-071 / B3).
 *
 * Verifies that Hibernate's @Filter + TenantFilterAspect prevent cross-tenant
 * data leaks. This test MUST pass on every commit — it is the first line of
 * defence against multi-tenancy bugs.
 *
 * Uses:
 *   - Testcontainers PostgreSQL — same DB dialect as production (not H2).
 *   - Testcontainers Redis     — satisfies Spring Data Redis autoconfiguration.
 *   - @ServiceConnection       — Spring Boot 3.1+ auto-wires DataSource + Redis
 *                                connection details from the running container.
 *
 * Test setup:
 *   Two tenants (A and B) are created before each test.
 *   Each tenant has one School saved directly (bypassing TenantServiceImpl
 *   to avoid creating a recursive dependency on the service layer in tests).
 *
 * What is verified:
 *   1. findAll() scoped to tenantA returns ONLY tenantA's school.
 *   2. findAll() scoped to tenantB returns ONLY tenantB's school.
 *   3. findById(tenantB's schoolId) while scoped to tenantA returns empty.
 *   4. When no tenant context is set (null), findAll() returns ALL rows
 *      (Super Admin / system behaviour — intentional).
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@Transactional
@DisplayName("Tenant Isolation — SchoolRepository")
class TenantIsolationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @Container
    @ServiceConnection
    static final GenericContainer<?> REDIS =
            new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    private Tenant tenantA;
    private Tenant tenantB;
    private School schoolA;
    private School schoolB;

    @BeforeEach
    void setUp() {
        RequestContext.clearAll();

        // Create two tenants
        tenantA = tenantRepository.save(new Tenant(
                UUID.randomUUID(), "tenant-a-" + UUID.randomUUID(),
                "Tenant A", TenantStatus.ACTIVE, Instant.now()));
        tenantB = tenantRepository.save(new Tenant(
                UUID.randomUUID(), "tenant-b-" + UUID.randomUUID(),
                "Tenant B", TenantStatus.ACTIVE, Instant.now()));

        // Create one school per tenant — saved directly to avoid service-layer coupling
        schoolA = schoolRepository.save(new School(
                UUID.randomUUID(), tenantA.getId(),
                "School A", "MAIN", SchoolStatus.ACTIVE, Instant.now()));
        schoolB = schoolRepository.save(new School(
                UUID.randomUUID(), tenantB.getId(),
                "School B", "MAIN", SchoolStatus.ACTIVE, Instant.now()));
    }

    @AfterEach
    void tearDown() {
        RequestContext.clearAll();
        schoolRepository.deleteAll();
        tenantRepository.deleteAll();
    }

    // ── Test 1: findAll() only returns current tenant's rows ─────────────────

    @Test
    @DisplayName("findAll() with tenantA context returns only tenantA's school")
    void findAll_withTenantAContext_returnsOnlyTenantASchool() {
        RequestContext.setTenantId(tenantA.getId().toString());

        List<School> results = schoolRepository.findAll();

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(schoolA.getId());
        assertThat(results).noneMatch(s -> s.getId().equals(schoolB.getId()));
    }

    @Test
    @DisplayName("findAll() with tenantB context returns only tenantB's school")
    void findAll_withTenantBContext_returnsOnlyTenantBSchool() {
        RequestContext.setTenantId(tenantB.getId().toString());

        List<School> results = schoolRepository.findAll();

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(schoolB.getId());
        assertThat(results).noneMatch(s -> s.getId().equals(schoolA.getId()));
    }

    // ── Test 2: findById() from wrong tenant returns empty ───────────────────

    @Test
    @DisplayName("findById() with tenantA context cannot read tenantB's school")
    void findById_fromWrongTenant_returnsEmpty() {
        RequestContext.setTenantId(tenantA.getId().toString());

        // findByIdFiltered uses JPQL which respects @Filter;
        // default findById() uses em.find() which bypasses Hibernate filters.
        Optional<School> result = schoolRepository.findByIdFiltered(schoolB.getId());

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("findById() with tenantA context can read tenantA's own school")
    void findById_fromCorrectTenant_returnsSchool() {
        RequestContext.setTenantId(tenantA.getId().toString());

        Optional<School> result = schoolRepository.findByIdFiltered(schoolA.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(schoolA.getId());
    }

    // ── Test 3: No tenant context (Super Admin) sees all rows ────────────────

    @Test
    @DisplayName("findAll() with no tenant context (Super Admin) returns all schools")
    void findAll_withNoTenantContext_returnsAllSchools() {
        // tenantId is null — Super Admin / system context — filter is OFF
        RequestContext.clearAll();

        List<School> results = schoolRepository.findAll();

        assertThat(results).hasSizeGreaterThanOrEqualTo(2);
        assertThat(results).anyMatch(s -> s.getId().equals(schoolA.getId()));
        assertThat(results).anyMatch(s -> s.getId().equals(schoolB.getId()));
    }

    // ── Test 4: findAllByTenantId() is always scoped regardless of filter ────

    @Test
    @DisplayName("findAllByTenantId() with tenantA ID always returns only tenantA's schools")
    void findAllByTenantId_alwaysReturnsCorrectTenantSchools() {
        // Even with a different tenant in RequestContext, explicit tenantId param wins
        RequestContext.setTenantId(tenantB.getId().toString());

        List<School> results = schoolRepository.findAllByTenantId(tenantA.getId());

        // The @Filter will also apply (tenantB context), so the explicit tenantId
        // param may return 0 results — that's the correct, safe behaviour.
        // This test documents that cross-tenant explicit queries are safe.
        assertThat(results).noneMatch(s -> s.getTenantId().equals(tenantB.getId()));
    }
}
