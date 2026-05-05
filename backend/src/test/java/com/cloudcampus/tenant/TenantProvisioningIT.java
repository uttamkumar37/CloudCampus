package com.cloudcampus.tenant;

import com.cloudcampus.IntegrationTestBase;
import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.dto.TenantResponse;
import com.cloudcampus.tenant.service.TenantService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TenantProvisioningIT extends IntegrationTestBase {

    @Autowired
    private TenantService tenantService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void createTenant_persistsTenantRecord() {
        TenantCreateRequest request = new TenantCreateRequest(
                                "itschool1", null, "Integration Test School 1", "school_itschool1", null, "#10b981",
                                "IT School 1 Admin", "itschool1.admin", "itschool1.admin@example.com", "9000001001", "Admin@Test123");

        TenantResponse response = tenantService.createTenant(request);

        assertThat(response.tenantId()).isEqualTo("itschool1");
        assertThat(response.schemaName()).isEqualTo("school_itschool1");
        assertThat(response.schoolName()).isEqualTo("Integration Test School 1");
        assertThat(response.active()).isTrue();
    }

    @Test
    void createTenant_createsSchemaAndUsersTable() {
        TenantCreateRequest request = new TenantCreateRequest(
                                "itschool2", null, "Integration Test School 2", "school_itschool2", null, "#10b981",
                                "IT School 2 Admin", "itschool2.admin", "itschool2.admin@example.com", "9000001002", "Admin@Test123");

        tenantService.createTenant(request);

        // Verify schema exists
        Integer schemaCount = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM information_schema.schemata WHERE schema_name = 'school_itschool2'",
                Integer.class);
        assertThat(schemaCount).isEqualTo(1);

        // Verify core tables were created
        for (String table : new String[]{"users", "students", "teachers", "attendance_records",
                "fee_assignments", "fee_payments", "exams", "exam_results",
                "homework_assignments", "timetable_slots"}) {
            Integer tableCount = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM information_schema.tables " +
                    "WHERE table_schema = 'school_itschool2' AND table_name = ?",
                    Integer.class, table);
            assertThat(tableCount).as("table '%s' should exist", table).isEqualTo(1);
        }
    }

    @Test
    void createTenant_auditColumnsPresent() {
        TenantCreateRequest request = new TenantCreateRequest(
                                "itschool3", null, "Integration Test School 3", "school_itschool3", null, "#10b981",
                                "IT School 3 Admin", "itschool3.admin", "itschool3.admin@example.com", "9000001003", "Admin@Test123");

        tenantService.createTenant(request);

        // Spot-check audit columns on students table
        for (String column : new String[]{"created_at", "updated_at", "created_by", "updated_by"}) {
            Integer colCount = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM information_schema.columns " +
                    "WHERE table_schema = 'school_itschool3' AND table_name = 'students' AND column_name = ?",
                    Integer.class, column);
            assertThat(colCount).as("audit column '%s' should exist on students", column).isEqualTo(1);
        }
    }

    @Test
    void createTenant_softDeleteColumnPresent() {
        TenantCreateRequest request = new TenantCreateRequest(
                                "itschool4", null, "Integration Test School 4", "school_itschool4", null, "#10b981",
                                "IT School 4 Admin", "itschool4.admin", "itschool4.admin@example.com", "9000001004", "Admin@Test123");

        tenantService.createTenant(request);

        for (String table : new String[]{"users", "students", "teachers"}) {
            Integer colCount = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM information_schema.columns " +
                    "WHERE table_schema = 'school_itschool4' AND table_name = ? AND column_name = 'deleted_at'",
                    Integer.class, table);
            assertThat(colCount).as("deleted_at should exist on %s", table).isEqualTo(1);
        }
    }

    @Test
    void createTenant_throwsOnDuplicateTenantId() {
        TenantCreateRequest first = new TenantCreateRequest(
                "itschool5", null, "IT School 5", "school_itschool5", null, "#10b981",
                "IT School 5 Admin", "itschool5.admin", "itschool5.admin@example.com", "9000001005", "Admin@Test123");
        tenantService.createTenant(first);

        TenantCreateRequest duplicate = new TenantCreateRequest(
                "itschool5", null, "IT School 5 Duplicate", null, null, "#ffffff",
                "IT School 5 Admin Duplicate", "itschool5.duplicate", "itschool5.duplicate@example.com", "9000001099", "Admin@Test123");

        assertThatThrownBy(() -> tenantService.createTenant(duplicate))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant already exists");
    }
}
