package com.cloudcampus.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.testsupport.AuthTestSupport;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class TenantContextSpoofingTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void rejectsClientSuppliedTenantContextHeaderBeforeOnboardingMutation() throws Exception {
        long tenantsBefore = tenantRepository.count();

        mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header("X-Tenant-ID", "spoofed-tenant-id")
                        .contentType("application/json")
                        .content(onboardingPayload("spoof-header-tenant", "spoof-header-school")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANT_CONTEXT_SPOOFING_BLOCKED"));

        assertThat(tenantRepository.count()).isEqualTo(tenantsBefore);
    }

    @Test
    void rejectsClientSuppliedSchoolContextHeaderBeforeInvitationMutation() throws Exception {
        mockMvc.perform(post("/v1/invitations/accept")
                        .header("X-School-ID", "spoofed-school-id")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "fake-token",
                                  "password": "StrongerPass123!"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANT_CONTEXT_SPOOFING_BLOCKED"));
    }

    @Test
    void ignoresSpoofedTenantIdInBodyAndUsesServerGeneratedTenantId() throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed-body-tenant-id",
                                  "tenant": {
                                    "code": "body-spoof-tenant",
                                    "name": "Body Spoof Trust"
                                  },
                                  "firstSchool": {
                                    "code": "body-spoof-school",
                                    "name": "Body Spoof School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Body Spoof Admin",
                                    "email": "body-spoof@example.com"
                                  }
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenant.code").value("BODY-SPOOF-TENANT"))
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        String tenantId = body.at("/tenant/id").asText();

        assertThat(tenantId).isNotEqualTo("spoofed-body-tenant-id");
        assertThat(tenantRepository.findById("spoofed-body-tenant-id")).isEmpty();
        assertThat(tenantRepository.findById(tenantId)).isPresent();
    }

    private String onboardingPayload(String tenantCode, String schoolCode) {
        return """
                {
                  "tenant": {
                    "code": "%s",
                    "name": "Spoof Test Trust"
                  },
                  "firstSchool": {
                    "code": "%s",
                    "name": "Spoof Test School"
                  },
                  "primaryAdmin": {
                    "fullName": "Spoof Test Admin",
                    "email": "%s@example.com"
                  }
                }
                """.formatted(tenantCode, schoolCode, tenantCode);
    }

    private String superAdminAccessToken() {
        return AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        ).accessToken();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
