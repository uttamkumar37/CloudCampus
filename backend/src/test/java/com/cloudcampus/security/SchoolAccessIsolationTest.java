package com.cloudcampus.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
import com.cloudcampus.testsupport.AuthTestSupport;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class SchoolAccessIsolationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private SchoolAccessService schoolAccessService;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminCanAccessOnlyExplicitlyGrantedSchoolInsideSameTenant() throws Exception {
        JsonNode onboarding = onboard("same-tenant-guard", "same-tenant-main", "same-tenant-admin@example.com");
        String tenantId = onboarding.at("/tenant/id").asText();
        String grantedSchoolId = onboarding.at("/school/id").asText();
        String userId = onboarding.at("/schoolAdminInvitation/userId").asText();

        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
        School unassignedSchool = schoolRepository.save(new School(
                tenant,
                "SAME-TENANT-SECOND",
                "Same Tenant Second School",
                false
        ));

        var grant = schoolAccessService.requireSchoolAdminAccess(userId, grantedSchoolId);

        assertThat(grant.tenantId()).isEqualTo(tenantId);
        assertThat(grant.schoolId()).isEqualTo(grantedSchoolId);
        assertThat(grant.userId()).isEqualTo(userId);
        assertThat(grant.role()).isEqualTo(UserRole.SCHOOL_ADMIN);
        assertThat(grant.primaryAccess()).isTrue();

        assertThatThrownBy(() -> schoolAccessService.requireSchoolAdminAccess(userId, unassignedSchool.getId()))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("not allowed to access this school");
    }

    @Test
    void schoolAdminCannotAccessSchoolFromAnotherTenant() throws Exception {
        JsonNode firstTenant = onboard("cross-tenant-guard-a", "cross-tenant-school-a", "admin-a@example.com");
        JsonNode secondTenant = onboard("cross-tenant-guard-b", "cross-tenant-school-b", "admin-b@example.com");

        String firstAdminUserId = firstTenant.at("/schoolAdminInvitation/userId").asText();
        String secondTenantSchoolId = secondTenant.at("/school/id").asText();

        assertThatThrownBy(() -> schoolAccessService.requireSchoolAdminAccess(firstAdminUserId, secondTenantSchoolId))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("not allowed to access this school");
    }

    @ParameterizedTest(name = "School Admin cannot access another school's {0}")
    @ValueSource(strings = {
            "student",
            "staff",
            "fees",
            "payments",
            "attendance",
            "homework",
            "exams",
            "results",
            "notices",
            "timetable",
            "documents",
            "reports",
            "website content"
    })
    void schoolAdminCannotAccessSchoolScopedObjectsFromUnassignedSchool(String objectType) throws Exception {
        String safeObjectType = objectType.replace(" ", "-");
        JsonNode onboarding = onboard(
                "object-guard-" + safeObjectType,
                "object-school-" + safeObjectType,
                "object-guard-" + safeObjectType + "@example.com"
        );
        String tenantId = onboarding.at("/tenant/id").asText();
        String schoolAdminUserId = onboarding.at("/schoolAdminInvitation/userId").asText();

        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
        School otherSchool = schoolRepository.save(new School(
                tenant,
                ("OTHER-" + safeObjectType).toUpperCase(),
                "Other School For " + objectType,
                false
        ));

        assertThatThrownBy(() -> schoolAccessService.requireSchoolAdminAccess(schoolAdminUserId, otherSchool.getId()))
                .as("School Admin must not access another school's " + objectType + " by object school_id.")
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("not allowed to access this school");
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "School Guard Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "School Guard Campus"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "School Guard Admin",
                                    "email": "%s"
                                  }
                                }
                                """.formatted(tenantCode, schoolCode, email)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
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
