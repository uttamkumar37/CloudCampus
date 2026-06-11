package com.cloudcampus.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.Set;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLog;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.accesscontrol.RolePermissionRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.platform.tenant.TenantStatus;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
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
class AuthSessionFlowTest {

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
    private RolePermissionRepository rolePermissionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    void acceptedSchoolAdminCanLoginAndReceiveServerDerivedIdentityAndSchoolAccess() throws Exception {
        JsonNode onboarding = onboard("auth-login-a", "auth-school-a", "login-admin-a@example.com");
        String token = onboarding.at("/schoolAdminInvitation/token").asText();
        String tenantId = onboarding.at("/tenant/id").asText();
        String schoolId = onboarding.at("/school/id").asText();
        String userId = onboarding.at("/schoolAdminInvitation/userId").asText();

        acceptInvitation(token, "StrongerPass123!");

        MvcResult challengeResult = loginWithBody("""
                {
                  "email": "login-admin-a@example.com",
                  "password": "StrongerPass123!",
                  "tenantId": "spoofed-tenant",
                  "schoolId": "spoofed-school",
                  "role": "SUPER_ADMIN"
                }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaRequired").value(true))
                .andExpect(jsonPath("$.mfaChallengeId").isNotEmpty())
                .andExpect(jsonPath("$.mfaCode").isNotEmpty())
                .andExpect(jsonPath("$.accessToken").isEmpty())
                .andReturn();
        JsonNode challenge = jsonBody(challengeResult);

        MvcResult loginResult = verifyMfa(challenge)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.user.userId").value(userId))
                .andExpect(jsonPath("$.user.tenantId").value(tenantId))
                .andExpect(jsonPath("$.user.role").value("SCHOOL_ADMIN"))
                .andExpect(jsonPath("$.user.activeSchool.schoolId").value(schoolId))
                .andExpect(jsonPath("$.user.allowedSchools[0].schoolId").value(schoolId))
                .andReturn();
        JsonNode login = jsonBody(loginResult);

        assertThat(login.at("/user/tenantId").asText()).isNotEqualTo("spoofed-tenant");
        assertThat(login.at("/user/role").asText()).isNotEqualTo("SUPER_ADMIN");
        assertAuditAction(
                tenantId,
                AuditAction.INVITATION_ACCEPTED,
                "Invitation",
                userId,
                token,
                "StrongerPass123!"
        );
        assertAuditAction(tenantId, AuditAction.MFA_CHALLENGE_CREATED, "MfaChallenge", userId, challenge.at("/mfaCode").asText());
        assertAuditAction(tenantId, AuditAction.MFA_CHALLENGE_VERIFIED, "MfaChallenge", userId, challenge.at("/mfaCode").asText());
    }

    @Test
    void mfaWrongCodeIsRejectedBeforeSessionIsIssued() throws Exception {
        JsonNode onboarding = onboard("auth-mfa-a", "auth-mfa-school-a", "mfa-admin-a@example.com");
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");

        JsonNode challenge = beginLogin("mfa-admin-a@example.com", "StrongerPass123!");
        String wrongCode = challenge.at("/mfaCode").asText().equals("000000") ? "111111" : "000000";

        mockMvc.perform(post("/v1/auth/mfa/verify")
                        .contentType("application/json")
                        .content("""
                                {
                                  "challengeId": "%s",
                                  "code": "%s"
                                }
                                """.formatted(challenge.at("/mfaChallengeId").asText(), wrongCode)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void mfaCodeCannotBeReusedAfterSuccessfulVerification() throws Exception {
        JsonNode onboarding = onboard("auth-mfa-b", "auth-mfa-school-b", "mfa-admin-b@example.com");
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");

        JsonNode challenge = beginLogin("mfa-admin-b@example.com", "StrongerPass123!");
        verifyMfa(challenge)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());

        verifyMfa(challenge)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void principalRequiresMfaAndSystemActorsCannotLoginInteractively() throws Exception {
        Tenant tenant = tenantRepository.save(new Tenant("auth-role-policy-a", "Auth Role Policy"));
        activeUser(tenant, "auth-principal@example.com", "Auth Principal", UserRole.PRINCIPAL, "PrincipalStrong123!");
        activeUser(tenant, "auth-system@example.com", "Auth System", UserRole.SYSTEM, "SystemStrong123!");
        activeUser(tenant, "auth-ai-agent@example.com", "Auth AI Agent", UserRole.AI_AGENT, "AgentStrong123!");

        JsonNode principalChallenge = beginLogin("auth-principal@example.com", "PrincipalStrong123!");
        assertThat(principalChallenge.path("mfaRequired").asBoolean(false)).isTrue();
        assertThat(principalChallenge.at("/mfaChallengeId").asText()).isNotBlank();
        assertThat(principalChallenge.at("/mfaCode").asText()).isNotBlank();

        verifyMfa(principalChallenge)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("PRINCIPAL"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty());

        loginWithBody("""
                {
                  "email": "auth-system@example.com",
                  "password": "SystemStrong123!"
                }
                """)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        loginWithBody("""
                {
                  "email": "auth-ai-agent@example.com",
                  "password": "AgentStrong123!"
                }
                """)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/auth/forgot-password")
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "auth-ai-agent@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resetToken").isNotEmpty());
    }

    @Test
    void repeatedWrongPasswordsAreRateLimited() throws Exception {
        JsonNode onboarding = onboard("auth-rate-a", "auth-rate-school-a", "rate-admin-a@example.com");
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");

        for (int attempt = 0; attempt < 5; attempt += 1) {
            loginWithBody("""
                    {
                      "email": "rate-admin-a@example.com",
                      "password": "WrongPass123!"
                    }
                    """)
                    .andExpect(status().isUnauthorized());
        }

        loginWithBody("""
                {
                  "email": "rate-admin-a@example.com",
                  "password": "WrongPass123!"
                }
                """)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("TOO_MANY_REQUESTS"));
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        JsonNode onboarding = onboard("auth-login-b", "auth-school-b", "login-admin-b@example.com");
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");

        loginWithBody("""
                {
                  "email": "login-admin-b@example.com",
                  "password": "WrongPass123!"
                }
                """)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void guestHasNoInternalPermissionsAndProtectedApisDenyGuestOrMissingTokens() throws Exception {
        assertThat(rolePermissionRepository.existsByRoleInAndPermissionCode(
                Set.of(UserRole.GUEST),
                "MANAGE_ENQUIRIES"
        )).isFalse();

        var guest = AuthTestSupport.issueAccessTokenForRole(
                UserRole.GUEST,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );

        mockMvc.perform(get("/v1/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer(guest.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("GUEST"))
                .andExpect(jsonPath("$.allowedSchools").isEmpty());
        mockMvc.perform(get("/v1/me/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(guest.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/v1/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
        mockMvc.perform(get("/v1/finance/fees/demands"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
        mockMvc.perform(get("/v1/ai/recommendations"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mockMvc.perform(get("/v1/super-admin/tenants")
                        .header(HttpHeaders.AUTHORIZATION, bearer(guest.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/tenant-admin/reports/summary")
                        .header(HttpHeaders.AUTHORIZATION, bearer(guest.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/school-admin/students")
                        .header(HttpHeaders.AUTHORIZATION, bearer(guest.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/finance/fees/demands")
                        .header(HttpHeaders.AUTHORIZATION, bearer(guest.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/school-admin/reports/exports")
                        .header(HttpHeaders.AUTHORIZATION, bearer(guest.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/recommendations")
                        .header(HttpHeaders.AUTHORIZATION, bearer(guest.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(post("/v1/ai/knowledge/search")
                        .header(HttpHeaders.AUTHORIZATION, bearer(guest.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "query": "school fees"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void inactiveUserIsRejected() throws Exception {
        onboard("auth-login-c", "auth-school-c", "login-admin-c@example.com");

        loginWithBody("""
                {
                  "email": "login-admin-c@example.com",
                  "password": "StrongerPass123!"
                }
                """)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void suspendedTenantBlocksLoginAndAuthenticatedSessionHydration() throws Exception {
        Tenant tenant = tenantRepository.save(new Tenant("auth-suspended-a", "Suspended Auth Tenant"));
        UserAccount user = activeUser(tenant, "auth-suspended@example.com", "Suspended User", UserRole.GUEST, "GuestStrong123!");
        tenant.updateStatus(TenantStatus.SUSPENDED);
        tenantRepository.save(tenant);

        loginWithBody("""
                {
                  "email": "auth-suspended@example.com",
                  "password": "GuestStrong123!"
                }
                """)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        String suspendedToken = jwtAccessTokenService.issueToken(
                user.getId(),
                tenant.getId(),
                UserRole.GUEST,
                null
        );
        mockMvc.perform(get("/v1/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer(suspendedToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void forgotPasswordDoesNotRevealUnknownOrIneligibleAccounts() throws Exception {
        Tenant tenant = tenantRepository.save(new Tenant("auth-reset-safe-a", "Auth Reset Safe"));
        userAccountRepository.save(new UserAccount(
                tenant,
                "inactive-reset@example.com",
                "Inactive Reset",
                UserRole.SCHOOL_ADMIN
        ));
        long auditCountBefore = auditLogRepository.findByTenantId(tenant.getId()).stream()
                .filter(log -> log.getAction() == AuditAction.PASSWORD_RESET_REQUESTED)
                .count();

        JsonNode unknown = jsonBody(mockMvc.perform(post("/v1/auth/forgot-password")
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "unknown-reset@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resetToken").isNotEmpty())
                .andReturn());
        mockMvc.perform(post("/v1/auth/reset-password")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "UnusedStrong123!"
                                }
                                """.formatted(unknown.at("/resetToken").asText())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        JsonNode inactive = jsonBody(mockMvc.perform(post("/v1/auth/forgot-password")
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "inactive-reset@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resetToken").isNotEmpty())
                .andReturn());
        mockMvc.perform(post("/v1/auth/reset-password")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "UnusedStrong123!"
                                }
                                """.formatted(inactive.at("/resetToken").asText())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        long auditCountAfter = auditLogRepository.findByTenantId(tenant.getId()).stream()
                .filter(log -> log.getAction() == AuditAction.PASSWORD_RESET_REQUESTED)
                .count();
        assertThat(auditCountAfter).isEqualTo(auditCountBefore);
    }

    @Test
    void loginRejectsSpoofedTenantContextHeaderBeforeAuthentication() throws Exception {
        JsonNode onboarding = onboard("auth-login-d", "auth-school-d", "login-admin-d@example.com");
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");

        mockMvc.perform(post("/v1/auth/login")
                        .header("X-Tenant-ID", "spoofed-tenant")
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "login-admin-d@example.com",
                                  "password": "StrongerPass123!"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANT_CONTEXT_SPOOFING_BLOCKED"));
    }

    @Test
    void currentUserIgnoresSpoofedQueryContextAndReturnsServerDerivedIdentity() throws Exception {
        JsonNode onboarding = onboard("auth-login-e", "auth-school-e", "login-admin-e@example.com");
        String tenantId = onboarding.at("/tenant/id").asText();
        String token = onboarding.at("/schoolAdminInvitation/token").asText();
        acceptInvitation(token, "StrongerPass123!");
        String accessToken = login("login-admin-e@example.com", "StrongerPass123!").at("/accessToken").asText();

        mockMvc.perform(get("/v1/me?tenantId=spoofed-tenant&role=SUPER_ADMIN")
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(tenantId))
                .andExpect(jsonPath("$.role").value("SCHOOL_ADMIN"));
    }

    @Test
    void schoolListReturnsOnlyGrantedSchoolsForLoggedInUser() throws Exception {
        JsonNode onboarding = onboard("auth-login-f", "auth-school-f", "login-admin-f@example.com");
        String schoolId = onboarding.at("/school/id").asText();
        String token = onboarding.at("/schoolAdminInvitation/token").asText();
        acceptInvitation(token, "StrongerPass123!");
        String accessToken = login("login-admin-f@example.com", "StrongerPass123!").at("/accessToken").asText();

        mockMvc.perform(get("/v1/me/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].schoolId").value(schoolId))
                .andExpect(jsonPath("$[0].role").value("SCHOOL_ADMIN"));
    }

    @Test
    void userCannotActivateUnassignedSchoolInSameTenant() throws Exception {
        JsonNode onboarding = onboard("auth-login-g", "auth-school-g", "login-admin-g@example.com");
        String token = onboarding.at("/schoolAdminInvitation/token").asText();
        String tenantId = onboarding.at("/tenant/id").asText();
        acceptInvitation(token, "StrongerPass123!");
        String accessToken = login("login-admin-g@example.com", "StrongerPass123!").at("/accessToken").asText();

        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
        School unassignedSchool = schoolRepository.save(new School(
                tenant,
                "AUTH-UNASSIGNED",
                "Auth Unassigned School",
                false
        ));

        mockMvc.perform(post("/v1/me/schools/{schoolId}/activate", unassignedSchool.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void userCannotActivateInactiveSchoolWithStaleGrant() throws Exception {
        JsonNode onboarding = onboard("auth-inactive-school-a", "auth-inactive-primary-a", "inactive-admin-a@example.com");
        String tenantId = onboarding.at("/tenant/id").asText();
        String userId = onboarding.at("/schoolAdminInvitation/userId").asText();
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");

        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
        School inactiveSchool = schoolRepository.save(new School(
                tenant,
                "AUTH-INACTIVE-GRANT",
                "Auth Inactive Grant",
                false
        ));
        inactiveSchool.deactivate();
        schoolRepository.save(inactiveSchool);

        UserAccount user = userAccountRepository.findById(userId).orElseThrow();
        userSchoolAccessRepository.save(new UserSchoolAccess(
                tenant,
                inactiveSchool,
                user,
                UserRole.SCHOOL_ADMIN,
                false
        ));
        String accessToken = login("inactive-admin-a@example.com", "StrongerPass123!").at("/accessToken").asText();

        mockMvc.perform(post("/v1/me/schools/{schoolId}/activate", inactiveSchool.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void tenantAUserCannotUseUrlQueryOrBodyToActivateTenantBSchool() throws Exception {
        JsonNode firstTenant = onboard("auth-login-h1", "auth-school-h1", "login-admin-h1@example.com");
        JsonNode secondTenant = onboard("auth-login-h2", "auth-school-h2", "login-admin-h2@example.com");
        acceptInvitation(firstTenant.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");
        String accessToken = login("login-admin-h1@example.com", "StrongerPass123!").at("/accessToken").asText();

        mockMvc.perform(post("/v1/me/schools/{schoolId}/activate?tenantId={tenantId}",
                        secondTenant.at("/school/id").asText(),
                        secondTenant.at("/tenant/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "%s",
                                  "schoolId": "%s",
                                  "role": "SUPER_ADMIN"
                                }
                                """.formatted(
                                secondTenant.at("/tenant/id").asText(),
                                secondTenant.at("/school/id").asText()
                        )))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void signedTokenWithTenantBClaimIsRejectedForTenantAUser() throws Exception {
        JsonNode firstTenant = onboard("auth-token-tenant-a", "auth-token-school-a", "token-admin-a@example.com");
        JsonNode secondTenant = onboard("auth-token-tenant-b", "auth-token-school-b", "token-admin-b@example.com");
        acceptInvitation(firstTenant.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");

        String spoofedTenantToken = jwtAccessTokenService.issueToken(
                firstTenant.at("/schoolAdminInvitation/userId").asText(),
                secondTenant.at("/tenant/id").asText(),
                UserRole.SCHOOL_ADMIN,
                secondTenant.at("/school/id").asText()
        );

        mockMvc.perform(get("/v1/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer(spoofedTenantToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void currentUserSchoolContextDoesNotLeakMalformedCrossTenantSchoolGrant() throws Exception {
        JsonNode firstTenant = onboard("auth-grant-tenant-a", "auth-grant-school-a", "grant-admin-a@example.com");
        JsonNode secondTenant = onboard("auth-grant-tenant-b", "auth-grant-school-b", "grant-admin-b@example.com");
        acceptInvitation(firstTenant.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");

        Tenant tenantA = tenantRepository.findById(firstTenant.at("/tenant/id").asText()).orElseThrow();
        School schoolB = schoolRepository.findById(secondTenant.at("/school/id").asText()).orElseThrow();
        var tenantAUser = userAccountRepository.findById(firstTenant.at("/schoolAdminInvitation/userId").asText())
                .orElseThrow();
        userSchoolAccessRepository.save(new UserSchoolAccess(
                tenantA,
                schoolB,
                tenantAUser,
                UserRole.SCHOOL_ADMIN,
                true
        ));

        String tokenWithTenantBActiveSchool = jwtAccessTokenService.issueToken(
                tenantAUser.getId(),
                tenantA.getId(),
                UserRole.SCHOOL_ADMIN,
                schoolB.getId()
        );

        JsonNode currentUser = jsonBody(mockMvc.perform(get("/v1/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenWithTenantBActiveSchool)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(tenantA.getId()))
                .andExpect(jsonPath("$.activeSchool.schoolId").value(firstTenant.at("/school/id").asText()))
                .andReturn());

        assertThat(currentUser.at("/allowedSchools").findValuesAsText("schoolId"))
                .containsExactly(firstTenant.at("/school/id").asText())
                .doesNotContain(schoolB.getId());

        JsonNode schools = jsonBody(mockMvc.perform(get("/v1/me/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenWithTenantBActiveSchool)))
                .andExpect(status().isOk())
                .andReturn());
        assertThat(schools.findValuesAsText("schoolId"))
                .containsExactly(firstTenant.at("/school/id").asText())
                .doesNotContain(schoolB.getId());
    }

    @Test
    void userCanActivateGrantedSchoolAndReceiveUpdatedTokenContext() throws Exception {
        JsonNode onboarding = onboard("auth-login-i", "auth-school-i", "login-admin-i@example.com");
        String schoolId = onboarding.at("/school/id").asText();
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");
        String accessToken = login("login-admin-i@example.com", "StrongerPass123!").at("/accessToken").asText();

        JsonNode activation = jsonBody(mockMvc.perform(post("/v1/me/schools/{schoolId}/activate", schoolId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.activeSchool.schoolId").value(schoolId))
                .andReturn());
        assertAuditAction(
                onboarding.at("/tenant/id").asText(),
                AuditAction.SCHOOL_CONTEXT_ACTIVATED,
                "School",
                onboarding.at("/schoolAdminInvitation/userId").asText()
        );

        mockMvc.perform(get("/v1/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer(activation.at("/accessToken").asText())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeSchool.schoolId").value(schoolId));
    }

    @Test
    void multiSchoolUserCanSwitchActiveSchoolWithServerVerifiedGrant() throws Exception {
        JsonNode onboarding = onboard("auth-switch-a", "auth-switch-main-a", "switch-admin-a@example.com");
        String tenantId = onboarding.at("/tenant/id").asText();
        String primarySchoolId = onboarding.at("/school/id").asText();
        String userId = onboarding.at("/schoolAdminInvitation/userId").asText();
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");

        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
        School branchSchool = schoolRepository.save(new School(
                tenant,
                "AUTH-SWITCH-BRANCH",
                "Auth Switch Branch",
                false
        ));
        var user = userAccountRepository.findById(userId).orElseThrow();
        userSchoolAccessRepository.save(new UserSchoolAccess(
                tenant,
                branchSchool,
                user,
                UserRole.SCHOOL_ADMIN,
                false
        ));

        String accessToken = login("switch-admin-a@example.com", "StrongerPass123!").at("/accessToken").asText();

        JsonNode schools = jsonBody(mockMvc.perform(get("/v1/me/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
                .andExpect(status().isOk())
                .andReturn());
        assertThat(schools.findValuesAsText("schoolId"))
                .containsExactly(primarySchoolId, branchSchool.getId());

        JsonNode activation = jsonBody(mockMvc.perform(post("/v1/me/schools/{schoolId}/activate?tenantId=spoofed-tenant",
                        branchSchool.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed-tenant",
                                  "schoolId": "%s",
                                  "role": "SUPER_ADMIN"
                                }
                                """.formatted(primarySchoolId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.tenantId").value(tenantId))
                .andExpect(jsonPath("$.user.role").value("SCHOOL_ADMIN"))
                .andExpect(jsonPath("$.user.activeSchool.schoolId").value(branchSchool.getId()))
                .andReturn());

        String switchedToken = activation.at("/accessToken").asText();
        mockMvc.perform(get("/v1/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer(switchedToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeSchool.schoolId").value(branchSchool.getId()))
                .andExpect(jsonPath("$.allowedSchools[0].schoolId").value(primarySchoolId))
                .andExpect(jsonPath("$.allowedSchools[1].schoolId").value(branchSchool.getId()));

        AuditLog auditLog = auditLogRepository.findByTenantId(tenantId)
                .stream()
                .filter(log -> log.getAction() == AuditAction.SCHOOL_CONTEXT_ACTIVATED)
                .reduce((first, second) -> second)
                .orElseThrow();
        assertThat(auditLog.getActorId()).isEqualTo(userId);
        assertThat(auditLog.getSchoolId()).isEqualTo(branchSchool.getId());
        assertThat(auditLog.getMetadataJson())
                .contains(branchSchool.getId(), "\"role\":\"SCHOOL_ADMIN\"")
                .doesNotContain("spoofed-tenant", primarySchoolId, "SUPER_ADMIN");
    }

    @Test
    void loginDoesNotUseMalformedCrossTenantSchoolGrantAsInitialActiveSchool() throws Exception {
        Tenant tenantA = tenantRepository.save(new Tenant("auth-switch-tenant-a", "Auth Switch Tenant A"));
        Tenant tenantB = tenantRepository.save(new Tenant("auth-switch-tenant-b", "Auth Switch Tenant B"));
        School schoolB = schoolRepository.save(new School(
                tenantB,
                "AUTH-SWITCH-FOREIGN",
                "Auth Switch Foreign",
                true
        ));
        UserAccount user = new UserAccount(
                tenantA,
                "malformed-switch@example.com",
                "Malformed Switch",
                UserRole.TEACHER
        );
        user.activate(passwordEncoder.encode("StrongerPass123!"), "Malformed Switch", java.time.Instant.now());
        userAccountRepository.save(user);
        userSchoolAccessRepository.save(new UserSchoolAccess(
                tenantA,
                schoolB,
                user,
                UserRole.TEACHER,
                true
        ));

        JsonNode login = login("malformed-switch@example.com", "StrongerPass123!");
        assertThat(login.at("/user/tenantId").asText()).isEqualTo(tenantA.getId());
        assertThat(login.at("/user/activeSchool").isNull()).isTrue();
        assertThat(login.at("/user/allowedSchools")).isEmpty();

        mockMvc.perform(get("/v1/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer(login.at("/accessToken").asText())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(tenantA.getId()))
                .andExpect(jsonPath("$.activeSchool").doesNotExist())
                .andExpect(jsonPath("$.allowedSchools").isEmpty());
    }

    @Test
    void refreshTokenRotatesAndOldRefreshTokenCannotBeReused() throws Exception {
        JsonNode onboarding = onboard("auth-refresh-a", "auth-refresh-school-a", "refresh-admin-a@example.com");
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");
        JsonNode login = login("refresh-admin-a@example.com", "StrongerPass123!");
        String refreshToken = login.at("/refreshToken").asText();

        JsonNode refresh = jsonBody(mockMvc.perform(post("/v1/auth/refresh")
                        .contentType("application/json")
                        .content("""
                                {
                                  "refreshToken": "%s"
                                }
                                """.formatted(refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("refresh-admin-a@example.com"))
                .andReturn());

        assertThat(refresh.at("/refreshToken").asText()).isNotEqualTo(refreshToken);
        assertAuditAction(
                onboarding.at("/tenant/id").asText(),
                AuditAction.REFRESH_TOKEN_ROTATED,
                "RefreshToken",
                onboarding.at("/schoolAdminInvitation/userId").asText(),
                refreshToken,
                refresh.at("/refreshToken").asText()
        );

        mockMvc.perform(post("/v1/auth/refresh")
                        .contentType("application/json")
                        .content("""
                                {
                                  "refreshToken": "%s"
                                }
                                """.formatted(refreshToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void logoutRevokesCurrentAccessTokenAndRefreshToken() throws Exception {
        JsonNode onboarding = onboard("auth-logout-a", "auth-logout-school-a", "logout-admin-a@example.com");
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");
        JsonNode login = login("logout-admin-a@example.com", "StrongerPass123!");
        String accessToken = login.at("/accessToken").asText();
        String refreshToken = login.at("/refreshToken").asText();

        mockMvc.perform(post("/v1/me/logout")
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "refreshToken": "%s"
                                }
                                """.formatted(refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out."));

        mockMvc.perform(get("/v1/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mockMvc.perform(post("/v1/auth/refresh")
                        .contentType("application/json")
                        .content("""
                                {
                                  "refreshToken": "%s"
                                }
                                """.formatted(refreshToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
        assertAuditAction(
                onboarding.at("/tenant/id").asText(),
                AuditAction.USER_LOGGED_OUT,
                "UserAccount",
                onboarding.at("/schoolAdminInvitation/userId").asText(),
                accessToken,
                refreshToken
        );
    }

    @Test
    void forgotAndResetPasswordChangesLoginPasswordAndBlocksResetTokenReuse() throws Exception {
        JsonNode onboarding = onboard("auth-reset-a", "auth-reset-school-a", "reset-admin-a@example.com");
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");

        JsonNode forgot = jsonBody(mockMvc.perform(post("/v1/auth/forgot-password")
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "reset-admin-a@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resetToken").isNotEmpty())
                .andReturn());
        String resetToken = forgot.at("/resetToken").asText();
        assertAuditAction(
                onboarding.at("/tenant/id").asText(),
                AuditAction.PASSWORD_RESET_REQUESTED,
                "PasswordResetToken",
                onboarding.at("/schoolAdminInvitation/userId").asText(),
                resetToken
        );

        mockMvc.perform(post("/v1/auth/reset-password")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "NewStrongerPass123!"
                                }
                                """.formatted(resetToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset complete."));
        assertAuditAction(
                onboarding.at("/tenant/id").asText(),
                AuditAction.PASSWORD_RESET_COMPLETED,
                "PasswordResetToken",
                onboarding.at("/schoolAdminInvitation/userId").asText(),
                resetToken,
                "NewStrongerPass123!"
        );

        loginWithBody("""
                {
                  "email": "reset-admin-a@example.com",
                  "password": "StrongerPass123!"
                }
                """)
                .andExpect(status().isUnauthorized());

        loginWithBody("""
                {
                  "email": "reset-admin-a@example.com",
                  "password": "NewStrongerPass123!"
                }
                """)
                .andExpect(status().isOk());

        mockMvc.perform(post("/v1/auth/reset-password")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "AnotherStrongerPass123!"
                                }
                                """.formatted(resetToken)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }

    @Test
    void authenticatedUserCanChangePasswordWithCurrentPassword() throws Exception {
        JsonNode onboarding = onboard("auth-change-a", "auth-change-school-a", "change-admin-a@example.com");
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StrongerPass123!");
        String accessToken = login("change-admin-a@example.com", "StrongerPass123!").at("/accessToken").asText();

        mockMvc.perform(post("/v1/me/change-password")
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "currentPassword": "StrongerPass123!",
                                  "newPassword": "ChangedStrongerPass123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed."));
        assertAuditAction(
                onboarding.at("/tenant/id").asText(),
                AuditAction.PASSWORD_CHANGED,
                "UserAccount",
                onboarding.at("/schoolAdminInvitation/userId").asText(),
                "StrongerPass123!",
                "ChangedStrongerPass123!"
        );

        loginWithBody("""
                {
                  "email": "change-admin-a@example.com",
                  "password": "StrongerPass123!"
                }
                """)
                .andExpect(status().isUnauthorized());

        loginWithBody("""
                {
                  "email": "change-admin-a@example.com",
                  "password": "ChangedStrongerPass123!"
                }
                """)
                .andExpect(status().isOk());
    }

    private UserAccount activeUser(Tenant tenant, String email, String displayName, UserRole role, String password) {
        UserAccount user = new UserAccount(tenant, email, displayName, role);
        user.activate(passwordEncoder.encode(password), displayName, java.time.Instant.now());
        return userAccountRepository.save(user);
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "Auth Session Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Auth Session School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Auth Session Admin",
                                    "email": "%s"
                                  }
                                }
                                """.formatted(tenantCode, schoolCode, email)))
                .andExpect(status().isCreated())
                .andReturn();
        return jsonBody(result);
    }

    private void acceptInvitation(String token, String password) throws Exception {
        mockMvc.perform(post("/v1/invitations/accept")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "%s",
                                  "displayName": "Auth Session Admin"
                                }
                                """.formatted(token, password)))
                .andExpect(status().isOk());
    }

    private JsonNode login(String email, String password) throws Exception {
        JsonNode result = beginLogin(email, password);
        if (result.path("mfaRequired").asBoolean(false)) {
            MvcResult verified = verifyMfa(result)
                    .andExpect(status().isOk())
                    .andReturn();
            return jsonBody(verified);
        }
        return result;
    }

    private JsonNode beginLogin(String email, String password) throws Exception {
        MvcResult result = loginWithBody("""
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password))
                .andExpect(status().isOk())
                .andReturn();
        return jsonBody(result);
    }

    private org.springframework.test.web.servlet.ResultActions verifyMfa(JsonNode challenge) throws Exception {
        return mockMvc.perform(post("/v1/auth/mfa/verify")
                .contentType("application/json")
                .content("""
                        {
                          "challengeId": "%s",
                          "code": "%s"
                        }
                        """.formatted(
                        challenge.at("/mfaChallengeId").asText(),
                        challenge.at("/mfaCode").asText()
                )));
    }

    private org.springframework.test.web.servlet.ResultActions loginWithBody(String body) throws Exception {
        return mockMvc.perform(post("/v1/auth/login")
                .contentType("application/json")
                .content(body));
    }

    private void assertAuditAction(
            String tenantId,
            AuditAction action,
            String entityType,
            String actorId,
            String... forbiddenFragments
    ) {
        AuditLog auditLog = auditLogRepository.findByTenantId(tenantId)
                .stream()
                .filter(log -> log.getAction() == action)
                .reduce((first, second) -> second)
                .orElseThrow(() -> new AssertionError("Missing audit action " + action));

        assertThat(auditLog.getActorId()).isEqualTo(actorId);
        assertThat(auditLog.getEntityType()).isEqualTo(entityType);
        assertThat(auditLog.getMetadataJson()).contains("\"role\":\"SCHOOL_ADMIN\"");
        assertThat(auditLog.getMetadataJson()).doesNotContain("codeHash", "tokenHash");
        for (String forbiddenFragment : forbiddenFragments) {
            assertThat(auditLog.getMetadataJson()).doesNotContain(forbiddenFragment);
        }
    }

    private JsonNode jsonBody(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private String bearer(String token) {
        return "Bearer " + token;
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
}
