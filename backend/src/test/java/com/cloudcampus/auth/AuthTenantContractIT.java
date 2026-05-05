package com.cloudcampus.auth;

import com.cloudcampus.IntegrationTestBase;
import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.service.TenantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class AuthTenantContractIT extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantService tenantService;

    private static final String TENANT_ID = "contract-school";
    private static final String TENANT_SLUG = "contract-school";
    private static final String TENANT_SCHEMA = "school_contract";
    private static boolean tenantSeeded = false;

    @BeforeEach
    void seedTenant() {
        if (tenantSeeded) {
            return;
        }

        tenantService.createTenant(new TenantCreateRequest(
                TENANT_ID,
                TENANT_SLUG,
                "Contract Test School",
                TENANT_SCHEMA,
                null,
            "#10b981",
            "Contract Admin",
            "contract.admin",
            "contract.admin@example.com",
            "9000003001",
            "Admin@Test123"
        ));
        tenantSeeded = true;
    }

    @Test
    void login_superAdmin_returnsStandardEnvelope_withoutInternalIdentifiers() throws Exception {
        String payload = """
                {
                  \"username\": \"superadmin\",
                  \"password\": \"superadmin-test-password\"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.role").value("SUPER_ADMIN"))
                .andExpect(jsonPath("$.data.userId").doesNotExist())
                .andExpect(jsonPath("$.data.tenantId").doesNotExist())
                .andExpect(jsonPath("$.data.tenantSlug").value(nullValue()))
                .andExpect(jsonPath("$.data.schoolName").value(nullValue()));
    }

    @Test
    void searchSchools_isPublic_and_returnsSlugBasedContract() throws Exception {
        mockMvc.perform(get("/api/v1/tenants/schools/search")
                        .param("query", "Contract Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].slug").value(TENANT_SLUG))
                .andExpect(jsonPath("$.data[0].schoolName").value("Contract Test School"))
                .andExpect(jsonPath("$.data[0].tenantId").doesNotExist())
                .andExpect(jsonPath("$.data[0].schemaName").doesNotExist());
    }

    @Test
    void getSchoolBySlug_isPublic_and_hidesInternalTenantFields() throws Exception {
        mockMvc.perform(get("/api/v1/tenants/schools/{tenantSlug}", TENANT_SLUG))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value(TENANT_SLUG))
                .andExpect(jsonPath("$.data.schoolName").value("Contract Test School"))
                .andExpect(jsonPath("$.data.tenantId").doesNotExist())
                .andExpect(jsonPath("$.data.schemaName").doesNotExist());
    }

    @Test
    void listTenants_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/tenants"))
                .andExpect(status().isUnauthorized());
    }
}
