package com.cloudcampus.platform.tenantadmin.school;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.subscription.TenantSchoolLimit;
import com.cloudcampus.platform.subscription.TenantSchoolLimitRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
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
class TenantAdminSchoolManagementFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private TenantSchoolLimitRepository tenantSchoolLimitRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserSchoolAccessRepository userSchoolAccessRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void tenantAdminCreatesAdditionalSchoolWithinSubscriptionLimitAndAuditUsesActor() throws Exception {
        TenantContext context = tenantWithAdmin("mul-school-a", "tenant-admin-a@example.com", 2);

        JsonNode created = createSchool(context.tenantAdminToken(), """
                {
                  "tenantId": "spoofed-tenant",
                  "code": "branch-east",
                  "name": "Branch East"
                }
                """);

        assertThat(created.at("/tenantId").asText()).isEqualTo(context.tenant().getId());
        assertThat(created.at("/code").asText()).isEqualTo("BRANCH-EAST");
        assertThat(created.at("/name").asText()).isEqualTo("Branch East");
        assertThat(created.at("/primarySchool").asBoolean()).isFalse();
        assertThat(created.at("/maxSchools").asInt()).isEqualTo(2);
        assertThat(created.at("/schoolsUsed").asLong()).isEqualTo(2);
        assertThat(schoolRepository.countByTenantId(context.tenant().getId())).isEqualTo(2);

        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.SCHOOL_CREATED)
                .anySatisfy(auditLog -> {
                    assertThat(auditLog.getActorId()).isEqualTo(context.tenantAdmin().getId());
                    assertThat(auditLog.getActorType()).isEqualTo("TENANT_ADMIN");
                    assertThat(auditLog.getSchoolId()).isEqualTo(created.at("/id").asText());
                    assertThat(auditLog.getMetadataJson()).contains("\"maxSchools\":2");
                    assertThat(auditLog.getMetadataJson()).contains("\"schoolsUsed\":2");
                    assertThat(auditLog.getMetadataJson()).doesNotContain("spoofed-tenant");
                });
    }

    @Test
    void tenantSchoolCreationEnforcesLimitReservedCodesDuplicatesAndRole() throws Exception {
        TenantContext context = tenantWithAdmin("mul-school-b", "tenant-admin-b@example.com", 1);

        mockMvc.perform(post("/v1/tenant-admin/schools")
                        .contentType("application/json")
                        .content("""
                                {
                                  "code": "branch",
                                  "name": "Branch"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mockMvc.perform(post("/v1/tenant-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "code": "branch",
                                  "name": "Branch"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        TenantContext openContext = tenantWithAdmin("mul-school-c", "tenant-admin-c@example.com", 3);
        mockMvc.perform(post("/v1/tenant-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(openContext.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "code": "MAIN",
                                  "name": "Reserved School"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));

        mockMvc.perform(post("/v1/tenant-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(openContext.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "code": "PRIMARY",
                                  "name": "Duplicate Primary"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        var schoolAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SCHOOL_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        mockMvc.perform(post("/v1/tenant-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdmin.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "code": "blocked",
                                  "name": "Blocked School"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void tenantHeaderCannotSpoofSchoolCreationTenant() throws Exception {
        TenantContext context = tenantWithAdmin("mul-school-d", "tenant-admin-d@example.com", 2);

        mockMvc.perform(post("/v1/tenant-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken()))
                        .header("X-Tenant-ID", "spoofed-tenant")
                        .contentType("application/json")
                        .content("""
                                {
                                  "code": "branch",
                                  "name": "Branch"
                                }
                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANT_CONTEXT_SPOOFING_BLOCKED"));
    }

    @Test
    void tenantAdminInvitesSchoolAdminAndGrantsAccessForTenantSchool() throws Exception {
        TenantContext context = tenantWithAdmin("mul-school-admin-a", "tenant-admin-school-a@example.com", 2);
        JsonNode createdSchool = createSchool(context.tenantAdminToken(), """
                {
                  "code": "branch-admin",
                  "name": "Branch Admin"
                }
                """);
        String schoolId = createdSchool.at("/id").asText();

        JsonNode invitation = inviteSchoolAdmin(context.tenantAdminToken(), schoolId, """
                {
                  "tenantId": "spoofed",
                  "role": "SUPER_ADMIN",
                  "fullName": "Branch Principal",
                  "email": "Principal@Example.com"
                }
                """);

        String userId = invitation.at("/userId").asText();
        String invitationId = invitation.at("/invitationId").asText();
        String rawToken = invitation.at("/invitationToken").asText();
        assertThat(invitation.at("/tenantId").asText()).isEqualTo(context.tenant().getId());
        assertThat(invitation.at("/schoolId").asText()).isEqualTo(schoolId);
        assertThat(invitation.at("/email").asText()).isEqualTo("principal@example.com");
        assertThat(invitation.at("/role").asText()).isEqualTo("SCHOOL_ADMIN");
        assertThat(invitation.at("/schoolAccessGranted").asBoolean()).isTrue();
        assertThat(invitation.at("/invitationCreated").asBoolean()).isTrue();
        assertThat(invitation.at("/invitationAcceptUrl").asText()).contains(rawToken);

        assertThat(userSchoolAccessRepository.findByUserIdAndSchoolId(userId, schoolId))
                .hasValueSatisfying(access -> {
                    assertThat(access.getTenant().getId()).isEqualTo(context.tenant().getId());
                    assertThat(access.getRole()).isEqualTo(UserRole.SCHOOL_ADMIN);
                    assertThat(access.isPrimaryAccess()).isTrue();
                });

        mockMvc.perform(post("/v1/invitations/accept")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "SchoolAdmin123!",
                                  "displayName": "Branch Principal"
                                }
                                """.formatted(rawToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.tenantId").value(context.tenant().getId()))
                .andExpect(jsonPath("$.schoolId").value(schoolId))
                .andExpect(jsonPath("$.role").value("SCHOOL_ADMIN"))
                .andExpect(jsonPath("$.schoolAccessGranted").value(true));

        assertThat(userAccountRepository.findById(userId))
                .hasValueSatisfying(user -> assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE));

        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.SCHOOL_ADMIN_INVITED)
                .anySatisfy(auditLog -> {
                    assertThat(auditLog.getActorId()).isEqualTo(context.tenantAdmin().getId());
                    assertThat(auditLog.getActorType()).isEqualTo("TENANT_ADMIN");
                    assertThat(auditLog.getSchoolId()).isEqualTo(schoolId);
                    assertThat(auditLog.getEntityId()).isEqualTo(invitationId);
                    assertThat(auditLog.getMetadataJson()).contains("\"role\":\"SCHOOL_ADMIN\"");
                    assertThat(auditLog.getMetadataJson()).doesNotContain(rawToken);
                    assertThat(auditLog.getMetadataJson()).doesNotContain("Principal@Example.com");
                });
        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.SCHOOL_ACCESS_GRANTED)
                .anySatisfy(auditLog -> {
                    assertThat(auditLog.getActorId()).isEqualTo(context.tenantAdmin().getId());
                    assertThat(auditLog.getActorType()).isEqualTo("TENANT_ADMIN");
                    assertThat(auditLog.getSchoolId()).isEqualTo(schoolId);
                    assertThat(auditLog.getMetadataJson()).contains(userId);
                    assertThat(auditLog.getMetadataJson()).contains("\"role\":\"SCHOOL_ADMIN\"");
                });
    }

    @Test
    void tenantAdminSchoolAdminInviteRejectsCrossTenantSchoolRoleSpoofingAndConflictingUsers() throws Exception {
        TenantContext first = tenantWithAdmin("mul-school-admin-b", "tenant-admin-school-b@example.com", 2);
        TenantContext second = tenantWithAdmin("mul-school-admin-c", "tenant-admin-school-c@example.com", 2);
        School foreignSchool = schoolRepository.save(new School(second.tenant(), "FOREIGN", "Foreign School", false));

        mockMvc.perform(post("/v1/tenant-admin/schools/{schoolId}/admins/invite", foreignSchool.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(first.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Foreign Principal",
                                  "email": "foreign-principal@example.com"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/tenant-admin/schools/{schoolId}/admins/invite", foreignSchool.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(first.tenantAdminToken()))
                        .header("X-Tenant-ID", second.tenant().getId())
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Spoofed Principal",
                                  "email": "spoofed-principal@example.com"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANT_CONTEXT_SPOOFING_BLOCKED"));

        var schoolAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SCHOOL_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        mockMvc.perform(post("/v1/tenant-admin/schools/{schoolId}/admins/invite", first.primarySchool().getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdmin.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Blocked Principal",
                                  "email": "blocked-principal@example.com"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        UserAccount conflictingUser = userAccountRepository.save(new UserAccount(
                first.tenant(),
                "conflict@example.com",
                "Teacher Conflict",
                UserRole.TEACHER
        ));
        conflictingUser.activate(passwordEncoder.encode("Teacher123!"), "Teacher Conflict", Instant.now());
        userAccountRepository.save(conflictingUser);

        mockMvc.perform(post("/v1/tenant-admin/schools/{schoolId}/admins/invite", first.primarySchool().getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(first.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Teacher Conflict",
                                  "email": "conflict@example.com"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    @Test
    void tenantAdminListsUpdatesAndDeactivatesOnlyOwnTenantSchools() throws Exception {
        TenantContext context = tenantWithAdmin("mul-school-manage-a", "tenant-admin-manage-a@example.com", 3);
        JsonNode createdSchool = createSchool(context.tenantAdminToken(), """
                {
                  "code": "branch-west",
                  "name": "Branch West"
                }
                """);
        String schoolId = createdSchool.at("/id").asText();

        mockMvc.perform(get("/v1/tenant-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == '%s')].name".formatted(context.primarySchool().getId()))
                        .value(hasItem("Primary School")))
                .andExpect(jsonPath("$[?(@.id == '%s')].name".formatted(schoolId))
                        .value(hasItem("Branch West")));

        mockMvc.perform(patch("/v1/tenant-admin/schools/{schoolId}", schoolId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed",
                                  "name": "Branch West Renamed"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(context.tenant().getId()))
                .andExpect(jsonPath("$.name").value("Branch West Renamed"))
                .andExpect(jsonPath("$.active").value(true));

        mockMvc.perform(post("/v1/tenant-admin/schools/{schoolId}/deactivate", schoolId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        assertThat(schoolRepository.findById(schoolId))
                .hasValueSatisfying(school -> {
                    assertThat(school.getName()).isEqualTo("Branch West Renamed");
                    assertThat(school.isActive()).isFalse();
                });
        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.SCHOOL_UPDATED)
                .anySatisfy(auditLog -> {
                    assertThat(auditLog.getActorId()).isEqualTo(context.tenantAdmin().getId());
                    assertThat(auditLog.getSchoolId()).isEqualTo(schoolId);
                    assertThat(auditLog.getMetadataJson()).contains("Branch West Renamed");
                    assertThat(auditLog.getMetadataJson()).doesNotContain("spoofed");
                });
        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.SCHOOL_DEACTIVATED)
                .anySatisfy(auditLog -> {
                    assertThat(auditLog.getActorType()).isEqualTo("TENANT_ADMIN");
                    assertThat(auditLog.getSchoolId()).isEqualTo(schoolId);
                });

        mockMvc.perform(post("/v1/tenant-admin/schools/{schoolId}/deactivate", context.primarySchool().getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        TenantContext foreign = tenantWithAdmin("mul-school-manage-b", "tenant-admin-manage-b@example.com", 2);
        mockMvc.perform(patch("/v1/tenant-admin/schools/{schoolId}", foreign.primarySchool().getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "Forbidden Rename"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/v1/tenant-admin/schools/{schoolId}/admins", foreign.primarySchool().getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void tenantAdminListsResendsAndRevokesSchoolAdminAccessWithAudit() throws Exception {
        TenantContext context = tenantWithAdmin("mul-school-manage-c", "tenant-admin-manage-c@example.com", 2);
        String schoolId = createSchool(context.tenantAdminToken(), """
                {
                  "code": "branch-admin-ops",
                  "name": "Branch Admin Ops"
                }
                """).at("/id").asText();

        JsonNode firstInvitation = inviteSchoolAdmin(context.tenantAdminToken(), schoolId, """
                {
                  "fullName": "First Principal",
                  "email": "first-principal@example.com"
                }
                """);
        String firstUserId = firstInvitation.at("/userId").asText();
        String firstToken = firstInvitation.at("/invitationToken").asText();

        mockMvc.perform(get("/v1/tenant-admin/schools/{schoolId}/admins", schoolId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(firstUserId))
                .andExpect(jsonPath("$[0].role").value("SCHOOL_ADMIN"))
                .andExpect(jsonPath("$[0].latestInvitationStatus").value("PENDING"));

        mockMvc.perform(delete("/v1/tenant-admin/schools/{schoolId}/admins/{userId}/access", schoolId, firstUserId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        JsonNode resentInvitation = resendInvitation(context.tenantAdminToken(), schoolId, firstUserId);
        String resentToken = resentInvitation.at("/invitationToken").asText();
        assertThat(resentInvitation.at("/invitationId").asText()).isNotEqualTo(firstInvitation.at("/invitationId").asText());
        assertThat(resentToken).isNotBlank();

        JsonNode secondInvitation = inviteSchoolAdmin(context.tenantAdminToken(), schoolId, """
                {
                  "fullName": "Second Principal",
                  "email": "second-principal@example.com"
                }
                """);
        String secondUserId = secondInvitation.at("/userId").asText();

        mockMvc.perform(delete("/v1/tenant-admin/schools/{schoolId}/admins/{userId}/access", schoolId, firstUserId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(context.tenant().getId()))
                .andExpect(jsonPath("$.accessRevoked").value(true))
                .andExpect(jsonPath("$.remainingSchoolAdmins").value(1));

        assertThat(userSchoolAccessRepository.findByUserIdAndSchoolId(firstUserId, schoolId)).isEmpty();
        assertThat(userSchoolAccessRepository.findByUserIdAndSchoolId(secondUserId, schoolId)).isPresent();

        mockMvc.perform(post("/v1/invitations/accept")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "SchoolAdmin123!",
                                  "displayName": "Second Principal"
                                }
                                """.formatted(secondInvitation.at("/invitationToken").asText())))
                .andExpect(status().isOk());

        mockMvc.perform(post("/v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation", schoolId, secondUserId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.SCHOOL_ADMIN_INVITATION_RESENT)
                .anySatisfy(auditLog -> {
                    assertThat(auditLog.getActorId()).isEqualTo(context.tenantAdmin().getId());
                    assertThat(auditLog.getSchoolId()).isEqualTo(schoolId);
                    assertThat(auditLog.getMetadataJson()).contains(firstUserId);
                    assertThat(auditLog.getMetadataJson()).doesNotContain(resentToken);
                    assertThat(auditLog.getMetadataJson()).doesNotContain(firstToken);
                });
        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.SCHOOL_ACCESS_REVOKED)
                .anySatisfy(auditLog -> {
                    assertThat(auditLog.getActorType()).isEqualTo("TENANT_ADMIN");
                    assertThat(auditLog.getSchoolId()).isEqualTo(schoolId);
                    assertThat(auditLog.getMetadataJson()).contains("\"remainingSchoolAdmins\":1");
                });
    }

    private JsonNode createSchool(String accessToken, String body) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/tenant-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private JsonNode inviteSchoolAdmin(String accessToken, String schoolId, String body) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/tenant-admin/schools/{schoolId}/admins/invite", schoolId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private JsonNode resendInvitation(String accessToken, String schoolId, String userId) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/tenant-admin/schools/{schoolId}/admins/{userId}/resend-invitation", schoolId, userId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private TenantContext tenantWithAdmin(String tenantCode, String adminEmail, int maxSchools) {
        Tenant tenant = tenantRepository.save(new Tenant(tenantCode.toUpperCase(), "Tenant " + tenantCode));
        School primarySchool = schoolRepository.save(new School(tenant, "PRIMARY", "Primary School", true));
        tenantSchoolLimitRepository.save(new TenantSchoolLimit(tenant.getId(), maxSchools));
        UserAccount tenantAdmin = new UserAccount(
                tenant,
                adminEmail,
                "Tenant Admin",
                UserRole.TENANT_ADMIN
        );
        tenantAdmin.activate(passwordEncoder.encode("TenantAdmin123!"), "Tenant Admin", Instant.now());
        userAccountRepository.save(tenantAdmin);
        String token = jwtAccessTokenService.issueToken(
                tenantAdmin.getId(),
                tenant.getId(),
                UserRole.TENANT_ADMIN,
                null
        );
        return new TenantContext(tenant, primarySchool, tenantAdmin, token);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private record TenantContext(Tenant tenant, School primarySchool, UserAccount tenantAdmin, String tenantAdminToken) {
    }
}
