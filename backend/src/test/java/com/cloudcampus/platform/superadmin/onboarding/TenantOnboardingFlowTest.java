package com.cloudcampus.platform.superadmin.onboarding;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLog;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.identity.auth.invitation.Invitation;
import com.cloudcampus.identity.auth.invitation.InvitationRepository;
import com.cloudcampus.identity.auth.invitation.InvitationStatus;
import com.cloudcampus.identity.auth.invitation.InvitationTokenService;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
import com.cloudcampus.testsupport.AuthTestSupport;
import com.cloudcampus.testsupport.AuthTestSupport.TestUser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class TenantOnboardingFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserSchoolAccessRepository userSchoolAccessRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private InvitationTokenService invitationTokenService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void onboardingCreatesRealFirstSchoolAdminInvitationAndSchoolAccess() throws Exception {
        TestUser superAdmin = testUser(UserRole.SUPER_ADMIN);
        JsonNode onboarding = onboardAs(superAdmin, "realflow1", "sunrise1", "admin1@sunrise.example");

        assertThat(onboarding.at("/tenant/code").asText()).isEqualTo("REALFLOW1");
        assertThat(onboarding.at("/school/code").asText()).isEqualTo("SUNRISE1");
        assertThat(onboarding.at("/school/primarySchool").asBoolean()).isTrue();
        assertThat(onboarding.at("/schoolAdminInvitation/role").asText()).isEqualTo("SCHOOL_ADMIN");
        assertThat(onboarding.at("/schoolAdminInvitation/token").asText()).isNotBlank();
        assertThat(onboarding.at("/schoolAccess/primaryAccess").asBoolean()).isTrue();

        String tenantId = onboarding.at("/tenant/id").asText();
        String schoolId = onboarding.at("/school/id").asText();
        String userId = onboarding.at("/schoolAdminInvitation/userId").asText();
        String token = onboarding.at("/schoolAdminInvitation/token").asText();
        String invitationId = onboarding.at("/schoolAdminInvitation/invitationId").asText();

        assertThat(tenantRepository.findById(tenantId)).isPresent();
        assertThat(schoolRepository.findById(schoolId)).isPresent();
        assertThat(userSchoolAccessRepository.existsByUserIdAndSchoolId(userId, schoolId)).isTrue();
        var access = userSchoolAccessRepository.findByUserIdAndSchoolId(userId, schoolId).orElseThrow();
        assertThat(invitationRepository.findAll())
                .anySatisfy(invitation -> {
                    assertThat(invitation.getUser().getId()).isEqualTo(userId);
                    assertThat(invitation.getSchool().getId()).isEqualTo(schoolId);
                    assertThat(invitation.getStatus()).isEqualTo(InvitationStatus.PENDING);
                });

        Map<AuditAction, AuditLog> auditByAction = auditLogRepository.findByTenantId(tenantId)
                .stream()
                .collect(Collectors.toMap(AuditLog::getAction, Function.identity()));

        assertThat(auditByAction).containsOnlyKeys(
                AuditAction.TENANT_CREATED,
                AuditAction.SCHOOL_CREATED,
                AuditAction.SCHOOL_ADMIN_INVITED,
                AuditAction.SCHOOL_ACCESS_GRANTED
        );
        assertThat(auditByAction.values()).allSatisfy(auditLog -> {
            assertThat(auditLog.getTenantId()).isEqualTo(tenantId);
            assertThat(auditLog.getActorType()).isEqualTo("SUPER_ADMIN");
            assertThat(auditLog.getActorId()).isEqualTo(superAdmin.userId());
            assertThat(auditLog.getMetadataJson())
                    .doesNotContain(token)
                    .doesNotContain("admin1@sunrise.example")
                    .contains("\"actorRole\":\"SUPER_ADMIN\"")
                    .contains(tenantId);
        });
        assertThat(auditByAction.get(AuditAction.TENANT_CREATED).getSchoolId()).isNull();
        assertThat(auditByAction.get(AuditAction.TENANT_CREATED).getEntityId()).isEqualTo(tenantId);
        assertThat(auditByAction.get(AuditAction.SCHOOL_CREATED).getSchoolId()).isEqualTo(schoolId);
        assertThat(auditByAction.get(AuditAction.SCHOOL_CREATED).getEntityId()).isEqualTo(schoolId);
        assertThat(auditByAction.get(AuditAction.SCHOOL_CREATED).getMetadataJson()).contains(schoolId);
        assertThat(auditByAction.get(AuditAction.SCHOOL_ADMIN_INVITED).getEntityId()).isEqualTo(invitationId);
        assertThat(auditByAction.get(AuditAction.SCHOOL_ADMIN_INVITED).getMetadataJson())
                .contains("\"maskedEmail\":\"a***@sunrise.example\"")
                .contains("\"invitationId\":\"" + invitationId + "\"");
        assertThat(auditByAction.get(AuditAction.SCHOOL_ACCESS_GRANTED).getEntityId()).isEqualTo(access.getId());
        assertThat(auditByAction.get(AuditAction.SCHOOL_ACCESS_GRANTED).getMetadataJson())
                .contains("\"accessGrantId\":\"" + access.getId() + "\"");

        mockMvc.perform(post("/v1/invitations/accept")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "StrongerPass123!",
                                  "displayName": "Sunrise Principal"
                                }
                                """.formatted(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.tenantId").value(tenantId))
                .andExpect(jsonPath("$.schoolId").value(schoolId))
                .andExpect(jsonPath("$.role").value("SCHOOL_ADMIN"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.schoolAccessGranted").value(true));

        var user = userAccountRepository.findById(userId).orElseThrow();
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(user.getDisplayName()).isEqualTo("Sunrise Principal");
        assertThat(passwordEncoder.matches("StrongerPass123!", user.getPasswordHash())).isTrue();
        assertThat(user.getPasswordHash()).isNotEqualTo("StrongerPass123!");
        assertThat(invitationRepository.findAll())
                .anySatisfy(invitation -> assertThat(invitation.getStatus()).isEqualTo(InvitationStatus.ACCEPTED));
    }

    @Test
    void unauthenticatedOnboardingRequestIsRejected() throws Exception {
        mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .contentType("application/json")
                        .content(onboardingPayload("unauth1", "unauthschool1", "unauth@example.com")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @ParameterizedTest
    @EnumSource(value = UserRole.class, names = {
            "TENANT_ADMIN",
            "SCHOOL_ADMIN",
            "TEACHER",
            "STAFF",
            "PARENT",
            "STUDENT"
    })
    void nonSuperAdminCannotCreateTenant(UserRole role) throws Exception {
        TestUser user = testUser(role);
        long tenantsBefore = tenantRepository.count();

        mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(user.accessToken()))
                        .contentType("application/json")
                        .content(onboardingPayload(
                                "blocked-" + role.name().toLowerCase().replace('_', '-'),
                                "blocked-school-" + role.name().toLowerCase().replace('_', '-'),
                                role.name().toLowerCase() + "@blocked.example"
                        )))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(tenantRepository.count()).isEqualTo(tenantsBefore);
    }

    @Test
    void spoofedRoleTenantAndUserContextCannotGrantSuperAdminAccess() throws Exception {
        TestUser schoolAdmin = testUser(UserRole.SCHOOL_ADMIN);
        long tenantsBefore = tenantRepository.count();

        mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdmin.accessToken()))
                        .header("X-Role", "SUPER_ADMIN")
                        .header("X-User-ID", "spoofed-super-admin")
                        .contentType("application/json")
                        .content("""
                                {
                                  "role": "SUPER_ADMIN",
                                  "tenantId": "spoofed-tenant",
                                  "userId": "spoofed-user",
                                  "tenant": {
                                    "code": "spoof-super-admin",
                                    "name": "Spoof Trust"
                                  },
                                  "firstSchool": {
                                    "code": "spoof-school",
                                    "name": "Spoof School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Spoof Admin",
                                    "email": "spoof-admin@example.com"
                                  }
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(tenantRepository.count()).isEqualTo(tenantsBefore);
        assertThat(tenantRepository.findById("spoofed-tenant")).isEmpty();
    }

    @Test
    void onboardingRejectsReservedMainSchoolCode() throws Exception {
        mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(testUser(UserRole.SUPER_ADMIN).accessToken()))
                        .contentType("application/json")
                        .content(onboardingPayload("reserved1", "MAIN", "reserved@example.com")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));

        assertThat(schoolRepository.findAll())
                .noneMatch(school -> "MAIN".equals(school.getCode()));
    }

    @Test
    void invitationCannotBeAcceptedTwice() throws Exception {
        JsonNode onboarding = onboard("twice1", "twiceschool1", "admin-twice@example.com");
        String token = onboarding.at("/schoolAdminInvitation/token").asText();

        acceptInvitation(token).andExpect(status().isOk());
        acceptInvitation(token)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }

    @Test
    void invalidInvitationTokenCannotBeAccepted() throws Exception {
        acceptInvitation("invalid-token-that-was-never-issued")
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void expiredInvitationCannotBeAcceptedOrActivateUser() throws Exception {
        Tenant tenant = tenantRepository.save(new Tenant("EXPIRED1", "Expired Invitation Trust"));
        School school = schoolRepository.save(new School(tenant, "EXPIRED-SCHOOL1", "Expired Invitation School", true));
        UserAccount user = userAccountRepository.save(new UserAccount(
                tenant,
                "expired-admin@example.com",
                "Expired Admin",
                UserRole.SCHOOL_ADMIN
        ));
        String rawToken = invitationTokenService.newRawToken();
        Invitation invitation = invitationRepository.save(new Invitation(
                tenant,
                school,
                user,
                UserRole.SCHOOL_ADMIN,
                invitationTokenService.hash(rawToken),
                Instant.now().minusSeconds(60)
        ));

        acceptInvitation(rawToken)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));

        assertThat(invitationRepository.findById(invitation.getId()).orElseThrow().getStatus())
                .isNotEqualTo(InvitationStatus.ACCEPTED);
        assertThat(userAccountRepository.findById(user.getId()).orElseThrow().getStatus())
                .isEqualTo(UserStatus.INVITED);
        assertThat(userAccountRepository.findById(user.getId()).orElseThrow().getPasswordHash()).isNull();
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        return onboardAs(testUser(UserRole.SUPER_ADMIN), tenantCode, schoolCode, email);
    }

    private JsonNode onboardAs(TestUser actor, String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(actor.accessToken()))
                        .contentType("application/json")
                        .content(onboardingPayload(tenantCode, schoolCode, email)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private org.springframework.test.web.servlet.ResultActions acceptInvitation(String token) throws Exception {
        return mockMvc.perform(post("/v1/invitations/accept")
                .contentType("application/json")
                .content("""
                        {
                          "token": "%s",
                          "password": "StrongerPass123!"
                        }
                        """.formatted(token)));
    }

    private String onboardingPayload(String tenantCode, String schoolCode, String email) {
        return """
                {
                  "tenant": {
                    "code": "%s",
                    "name": "Sunrise Education Trust"
                  },
                  "firstSchool": {
                    "code": "%s",
                    "name": "Sunrise Public School"
                  },
                  "primaryAdmin": {
                    "fullName": "Asha Mehta",
                    "email": "%s"
                  }
                }
                """.formatted(tenantCode, schoolCode, email);
    }

    private TestUser testUser(UserRole role) {
        return AuthTestSupport.issueAccessTokenForRole(
                role,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
