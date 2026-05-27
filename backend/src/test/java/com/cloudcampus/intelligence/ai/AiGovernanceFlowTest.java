package com.cloudcampus.intelligence.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
import com.cloudcampus.testsupport.AuthTestSupport;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AiGovernanceFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserSchoolAccessRepository userSchoolAccessRepository;

    @Autowired
    private AiTenantEntitlementRepository aiTenantEntitlementRepository;

    @Autowired
    private AiRequestAuditRepository aiRequestAuditRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void superAdminConfiguresTenantAiEntitlementWithoutTrustingBodyTenant() throws Exception {
        var superAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        Tenant tenantA = tenant("ai-ent-a", "AI Entitlement A");
        Tenant tenantB = tenant("ai-ent-b", "AI Entitlement B");

        mockMvc.perform(put("/v1/super-admin/ai/tenants/{tenantId}/entitlement", tenantA.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "%s",
                                  "enabled": true,
                                  "monthlyUnitBudget": 2500,
                                  "enabledFeatures": ["NOTICE_DRAFTING", "REPORT_EXPLANATION"],
                                  "humanApprovalRequired": true,
                                  "retentionDays": 180
                                }
                                """.formatted(tenantB.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(tenantA.getId()))
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.monthlyUnitBudget").value(2500))
                .andExpect(jsonPath("$.enabledFeatures[0]").value("NOTICE_DRAFTING"))
                .andExpect(jsonPath("$.enabledFeatures[1]").value("REPORT_EXPLANATION"))
                .andExpect(jsonPath("$.humanApprovalRequired").value(true))
                .andExpect(jsonPath("$.retentionDays").value(180))
                .andExpect(jsonPath("$.updatedByUserId").value(superAdmin.userId()));

        assertThat(aiTenantEntitlementRepository.findById(tenantA.getId()))
                .hasValueSatisfying(entitlement -> {
                    assertThat(entitlement.isEnabled()).isTrue();
                    assertThat(entitlement.getMonthlyUnitBudget()).isEqualTo(2500);
                    assertThat(entitlement.getEnabledFeatures()).containsExactlyInAnyOrder(
                            AiFeature.NOTICE_DRAFTING,
                            AiFeature.REPORT_EXPLANATION
                    );
                });
        assertThat(aiTenantEntitlementRepository.findById(tenantB.getId())).isEmpty();
        assertThat(auditLogRepository.findByTenantId(tenantA.getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.AI_ENTITLEMENT_UPDATED)
                .singleElement()
                .satisfies(auditLog -> {
                    assertThat(auditLog.getActorId()).isEqualTo(superAdmin.userId());
                    assertThat(auditLog.getActorType()).isEqualTo("SUPER_ADMIN");
                    assertThat(auditLog.getMetadataJson()).contains("NOTICE_DRAFTING");
                    assertThat(auditLog.getMetadataJson()).doesNotContain(tenantB.getId());
                });

        mockMvc.perform(get("/v1/super-admin/ai/tenants/{tenantId}/entitlement", tenantA.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(tenantA.getId()))
                .andExpect(jsonPath("$.remainingUnitsThisMonth").value(2500));
    }

    @Test
    void aiUsageAuditUsesServerDerivedTenantSchoolAndDoesNotStoreRawPrompt() throws Exception {
        var superAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        Tenant tenantA = tenant("ai-usage-a", "AI Usage A");
        Tenant tenantB = tenant("ai-usage-b", "AI Usage B");
        School schoolA = school(tenantA, "AI-A", "AI School A");
        School schoolB = school(tenantB, "AI-B", "AI School B");
        UserAccount schoolAdmin = user(tenantA, "ai-school-admin@example.com", UserRole.SCHOOL_ADMIN);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenantA, schoolA, schoolAdmin, UserRole.SCHOOL_ADMIN, true));
        String schoolAdminToken = jwtAccessTokenService.issueToken(
                schoolAdmin.getId(),
                tenantA.getId(),
                UserRole.SCHOOL_ADMIN,
                schoolA.getId()
        );
        enableAi(superAdmin.accessToken(), tenantA, 100, "NOTICE_DRAFTING");

        String rawPrompt = "Draft a notice for Sensitive Student with unpaid fee 12345.";
        mockMvc.perform(post("/v1/ai/usage/audit")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "%s",
                                  "schoolId": "%s",
                                  "feature": "NOTICE_DRAFTING",
                                  "scopeType": "SCHOOL",
                                  "scopeId": "notice-board",
                                  "requestType": "draft_notice",
                                  "promptText": "%s",
                                  "estimatedInputUnits": 10,
                                  "estimatedOutputUnits": 15,
                                  "estimatedCostCents": 7
                                }
                                """.formatted(tenantB.getId(), schoolB.getId(), rawPrompt)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenantId").value(tenantA.getId()))
                .andExpect(jsonPath("$.schoolId").value(schoolA.getId()))
                .andExpect(jsonPath("$.userId").value(schoolAdmin.getId()))
                .andExpect(jsonPath("$.role").value("SCHOOL_ADMIN"))
                .andExpect(jsonPath("$.status").value("AUTHORIZED"))
                .andExpect(jsonPath("$.promptLength").value(rawPrompt.length()))
                .andExpect(jsonPath("$.promptSha256").isString());

        assertThat(aiRequestAuditRepository.findByTenantIdOrderByCreatedAtDesc(tenantA.getId()))
                .singleElement()
                .satisfies(audit -> {
                    assertThat(audit.getSchool().getId()).isEqualTo(schoolA.getId());
                    assertThat(audit.getUser().getId()).isEqualTo(schoolAdmin.getId());
                    assertThat(audit.getPromptSha256()).hasSize(64);
                    assertThat(audit.getPromptSha256()).doesNotContain("Sensitive");
                    assertThat(audit.getEstimatedInputUnits() + audit.getEstimatedOutputUnits()).isEqualTo(25);
                });
        assertThat(aiRequestAuditRepository.findByTenantIdOrderByCreatedAtDesc(tenantB.getId())).isEmpty();
        assertThat(auditLogRepository.findByTenantId(tenantA.getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.AI_USAGE_AUDITED)
                .singleElement()
                .satisfies(auditLog -> {
                    assertThat(auditLog.getMetadataJson()).contains("\"status\":\"AUTHORIZED\"");
                    assertThat(auditLog.getMetadataJson()).contains("promptSha256");
                    assertThat(auditLog.getMetadataJson()).doesNotContain(rawPrompt);
                    assertThat(auditLog.getMetadataJson()).doesNotContain(tenantB.getId());
                    assertThat(auditLog.getMetadataJson()).doesNotContain(schoolB.getId());
                });

        mockMvc.perform(get("/v1/ai/entitlement")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(tenantA.getId()))
                .andExpect(jsonPath("$.unitsUsedThisMonth").value(25))
                .andExpect(jsonPath("$.remainingUnitsThisMonth").value(75));
    }

    @Test
    void aiGovernanceRejectsWrongRolesSpoofingDisabledFeaturesAndBudgetOverage() throws Exception {
        var superAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        var tenantAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.TENANT_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        Tenant tenantA = tenant("ai-deny-a", "AI Deny A");
        School schoolA = school(tenantA, "AI-DENY", "AI Deny School");
        UserAccount schoolAdmin = user(tenantA, "ai-deny-school-admin@example.com", UserRole.SCHOOL_ADMIN);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenantA, schoolA, schoolAdmin, UserRole.SCHOOL_ADMIN, true));
        String schoolAdminToken = jwtAccessTokenService.issueToken(
                schoolAdmin.getId(),
                tenantA.getId(),
                UserRole.SCHOOL_ADMIN,
                schoolA.getId()
        );

        mockMvc.perform(put("/v1/super-admin/ai/tenants/{tenantId}/entitlement", tenantA.getId())
                        .contentType("application/json")
                        .content(entitlementPayload(10, "NOTICE_DRAFTING")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mockMvc.perform(put("/v1/super-admin/ai/tenants/{tenantId}/entitlement", tenantA.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(tenantAdmin.accessToken()))
                        .contentType("application/json")
                        .content(entitlementPayload(10, "NOTICE_DRAFTING")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(put("/v1/super-admin/ai/tenants/{tenantId}/entitlement", tenantA.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken()))
                        .header("X-Tenant-ID", "spoofed")
                        .contentType("application/json")
                        .content(entitlementPayload(10, "NOTICE_DRAFTING")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANT_CONTEXT_SPOOFING_BLOCKED"));

        mockMvc.perform(post("/v1/ai/usage/audit")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content(usagePayload("NOTICE_DRAFTING", 1, 1)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        assertThat(aiRequestAuditRepository.findByTenantIdOrderByCreatedAtDesc(tenantA.getId()))
                .singleElement()
                .satisfies(audit -> assertThat(audit.getStatus()).isEqualTo(AiUsageStatus.DENIED));

        enableAi(superAdmin.accessToken(), tenantA, 10, "NOTICE_DRAFTING");
        mockMvc.perform(post("/v1/ai/usage/audit")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content(usagePayload("HOMEWORK_DRAFTING", 1, 1)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/ai/usage/audit")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content(usagePayload("NOTICE_DRAFTING", 6, 5)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        assertThat(aiRequestAuditRepository.findByTenantIdOrderByCreatedAtDesc(tenantA.getId()))
                .filteredOn(audit -> audit.getStatus() == AiUsageStatus.DENIED)
                .hasSize(3);
        assertThat(auditLogRepository.findByTenantId(tenantA.getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.AI_USAGE_DENIED)
                .hasSize(3);
    }

    private void enableAi(String superAdminToken, Tenant tenant, long budget, String feature) throws Exception {
        mockMvc.perform(put("/v1/super-admin/ai/tenants/{tenantId}/entitlement", tenant.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminToken))
                        .contentType("application/json")
                        .content(entitlementPayload(budget, feature)))
                .andExpect(status().isOk());
    }

    private String entitlementPayload(long budget, String feature) {
        return """
                {
                  "enabled": true,
                  "monthlyUnitBudget": %d,
                  "enabledFeatures": ["%s"],
                  "humanApprovalRequired": true,
                  "retentionDays": 90
                }
                """.formatted(budget, feature);
    }

    private String usagePayload(String feature, long inputUnits, long outputUnits) {
        return """
                {
                  "feature": "%s",
                  "scopeType": "SCHOOL",
                  "scopeId": "scope-1",
                  "requestType": "draft",
                  "promptText": "Write a safe short draft.",
                  "estimatedInputUnits": %d,
                  "estimatedOutputUnits": %d,
                  "estimatedCostCents": 1
                }
                """.formatted(feature, inputUnits, outputUnits);
    }

    private Tenant tenant(String code, String name) {
        return tenantRepository.save(new Tenant(code, name));
    }

    private School school(Tenant tenant, String code, String name) {
        return schoolRepository.save(new School(tenant, code, name, true));
    }

    private UserAccount user(Tenant tenant, String email, UserRole role) {
        UserAccount user = new UserAccount(tenant, email, role.name() + " User", role);
        user.activate(passwordEncoder.encode("TestPassword123!"), role.name() + " User", Instant.now());
        return userAccountRepository.save(user);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
