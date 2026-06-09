package com.cloudcampus.intelligence.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.people.parent.ParentStudentLink;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
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
    private AiRecommendationRepository aiRecommendationRepository;

    @Autowired
    private AutomationRuleRepository automationRuleRepository;

    @Autowired
    private AutomationRunRepository automationRunRepository;

    @Autowired
    private ParentStudentLinkRepository parentStudentLinkRepository;

    @Autowired
    private StudentRepository studentRepository;

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

    @Test
    void parentAiPortalIsApprovedLinkedChildReadOnlyAndNoAutomationOrUsageAudit() throws Exception {
        Tenant tenant = tenant("ai-parent-portal-a", "AI Parent Portal A");
        School school = school(tenant, "AI-PARENT-PORTAL", "AI Parent Portal School");
        UserAccount parent = user(tenant, "ai-parent-portal@example.com", UserRole.PARENT);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, parent, UserRole.PARENT, true));
        Student child = studentRepository.save(new Student(tenant, school, "AI-PAR-001", "AI Parent Child"));
        parentStudentLinkRepository.save(new ParentStudentLink(
                tenant,
                school,
                child,
                parent,
                "Guardian",
                parent.getEmail(),
                null,
                true
        ));
        String parentToken = jwtAccessTokenService.issueToken(
                parent.getId(),
                tenant.getId(),
                UserRole.PARENT,
                school.getId()
        );
        AiRecommendation approvedChild = aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                school,
                "STUDENT",
                child.getId(),
                AiRecommendationType.STUDENT_RISK_ATTENDANCE,
                "Approved child insight",
                "Approved child summary",
                "Linked child attendance trend.",
                new BigDecimal("0.80"),
                AiRecommendationRiskLevel.LOW,
                AiRecommendationStatus.APPROVED,
                "SYSTEM",
                "system",
                null,
                false,
                null,
                null,
                "{}"
        ));
        AiRecommendation pendingChild = aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                school,
                "STUDENT",
                child.getId(),
                AiRecommendationType.STUDENT_RISK_ACADEMIC,
                "Pending child insight",
                "Pending child summary",
                "Pending review should not be visible.",
                new BigDecimal("0.72"),
                AiRecommendationRiskLevel.MEDIUM,
                AiRecommendationStatus.PENDING_REVIEW,
                "SYSTEM",
                "system",
                null,
                true,
                null,
                null,
                "{}"
        ));
        AiRecommendation schoolWide = aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                school,
                "SCHOOL",
                school.getId(),
                AiRecommendationType.PLATFORM_HEALTH_INSIGHT,
                "School-wide insight",
                "School-wide summary",
                "Parents should not see school-wide AI recommendations.",
                new BigDecimal("0.90"),
                AiRecommendationRiskLevel.LOW,
                AiRecommendationStatus.APPROVED,
                "SYSTEM",
                "system",
                null,
                false,
                null,
                null,
                "{}"
        ));
        AutomationRule rule = automationRuleRepository.save(new AutomationRule(
                tenant,
                school,
                "PARENT_RULE_DENIED",
                "Parent denied rule",
                "Automation configuration is not parent-facing.",
                "EVENT",
                "{}",
                "ACTION",
                "{}",
                true,
                true,
                UserRole.SCHOOL_ADMIN,
                AiRecommendationRiskLevel.MEDIUM,
                parent
        ));
        automationRunRepository.save(new AutomationRun(
                rule,
                AutomationRunStatus.COMPLETED,
                "SYSTEM",
                "system",
                "{}"
        ));

        mockMvc.perform(get("/v1/ai/recommendations")
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].recommendationId").value(approvedChild.getId()))
                .andExpect(jsonPath("$.items[0].targetId").value(child.getId()));

        mockMvc.perform(get("/v1/ai/recommendations/{id}", pendingChild.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/recommendations/{id}", schoolWide.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(post("/v1/ai/recommendations/{id}/dismiss", pendingChild.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/automation-rules")
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/automation-runs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/entitlement")
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(post("/v1/ai/usage/audit")
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken))
                        .contentType("application/json")
                        .content(usagePayload("NOTICE_DRAFTING", 1, 1)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void officeStaffAiPortalIsApprovedActiveSchoolAdmissionFollowUpsOnlyAndNoAutomationOrUsageAudit() throws Exception {
        Tenant tenant = tenant("ai-office-portal-a", "AI Office Portal A");
        School school = school(tenant, "AI-OFFICE-A", "AI Office Portal School A");
        School otherSchool = school(tenant, "AI-OFFICE-B", "AI Office Portal School B");
        UserAccount officeStaff = user(tenant, "ai-office-portal@example.com", UserRole.OFFICE_STAFF);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, officeStaff, UserRole.OFFICE_STAFF, true));
        String officeToken = jwtAccessTokenService.issueToken(
                officeStaff.getId(),
                tenant.getId(),
                UserRole.OFFICE_STAFF,
                school.getId()
        );

        AiRecommendation approvedAdmission = aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                school,
                "ADMISSION",
                "admission-1",
                AiRecommendationType.ADMISSION_FOLLOW_UP,
                "Approved admission follow-up",
                "Approved admission summary",
                "Office staff can review approved admission follow-ups.",
                new BigDecimal("0.86"),
                AiRecommendationRiskLevel.LOW,
                AiRecommendationStatus.APPROVED,
                "SYSTEM",
                "system",
                null,
                false,
                null,
                null,
                "{}"
        ));
        AiRecommendation pendingAdmission = aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                school,
                "ADMISSION",
                "admission-2",
                AiRecommendationType.ADMISSION_FOLLOW_UP,
                "Pending admission follow-up",
                "Pending admission summary",
                "Pending follow-ups should not be visible to office staff.",
                new BigDecimal("0.78"),
                AiRecommendationRiskLevel.MEDIUM,
                AiRecommendationStatus.PENDING_REVIEW,
                "SYSTEM",
                "system",
                null,
                true,
                null,
                null,
                "{}"
        ));
        AiRecommendation financeSuggestion = aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                school,
                "SCHOOL",
                school.getId(),
                AiRecommendationType.FEE_REMINDER_SUGGESTION,
                "Fee reminder",
                "Finance summary",
                "Finance-only suggestions are not office follow-ups.",
                new BigDecimal("0.91"),
                AiRecommendationRiskLevel.LOW,
                AiRecommendationStatus.APPROVED,
                "SYSTEM",
                "system",
                null,
                false,
                null,
                null,
                "{}"
        ));
        aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                otherSchool,
                "ADMISSION",
                "admission-other-school",
                AiRecommendationType.ADMISSION_FOLLOW_UP,
                "Other school follow-up",
                "Other school summary",
                "Other school follow-ups are not visible.",
                new BigDecimal("0.82"),
                AiRecommendationRiskLevel.LOW,
                AiRecommendationStatus.APPROVED,
                "SYSTEM",
                "system",
                null,
                false,
                null,
                null,
                "{}"
        ));
        AutomationRule rule = automationRuleRepository.save(new AutomationRule(
                tenant,
                school,
                "OFFICE_RULE_DENIED",
                "Office denied rule",
                "Automation configuration is not office-facing.",
                "EVENT",
                "{}",
                "ACTION",
                "{}",
                true,
                true,
                UserRole.SCHOOL_ADMIN,
                AiRecommendationRiskLevel.MEDIUM,
                officeStaff
        ));
        automationRunRepository.save(new AutomationRun(
                rule,
                AutomationRunStatus.COMPLETED,
                "SYSTEM",
                "system",
                "{}"
        ));

        mockMvc.perform(get("/v1/ai/recommendations")
                        .header(HttpHeaders.AUTHORIZATION, bearer(officeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].recommendationId").value(approvedAdmission.getId()))
                .andExpect(jsonPath("$.items[0].recommendationType").value("ADMISSION_FOLLOW_UP"));

        mockMvc.perform(get("/v1/ai/recommendations/{id}", pendingAdmission.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(officeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/recommendations/{id}", financeSuggestion.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(officeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(post("/v1/ai/recommendations/{id}/dismiss", approvedAdmission.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(officeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/automation-rules")
                        .header(HttpHeaders.AUTHORIZATION, bearer(officeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/automation-runs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(officeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/entitlement")
                        .header(HttpHeaders.AUTHORIZATION, bearer(officeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(post("/v1/ai/usage/audit")
                        .header(HttpHeaders.AUTHORIZATION, bearer(officeToken))
                        .contentType("application/json")
                        .content(usagePayload("ADMISSION_ENQUIRY_ASSISTANT", 1, 1)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void financeStaffAiPortalIsActiveSchoolFeeSuggestionsOnlyAndNoAutomationOrUsageAudit() throws Exception {
        Tenant tenant = tenant("ai-finance-portal-a", "AI Finance Portal A");
        School school = school(tenant, "AI-FINANCE-A", "AI Finance Portal School A");
        School otherSchool = school(tenant, "AI-FINANCE-B", "AI Finance Portal School B");
        UserAccount financeStaff = user(tenant, "ai-finance-portal@example.com", UserRole.FINANCE_STAFF);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, financeStaff, UserRole.FINANCE_STAFF, true));
        String financeToken = jwtAccessTokenService.issueToken(
                financeStaff.getId(),
                tenant.getId(),
                UserRole.FINANCE_STAFF,
                school.getId()
        );

        AiRecommendation feePending = aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                school,
                "SCHOOL",
                school.getId(),
                AiRecommendationType.FEE_REMINDER_SUGGESTION,
                "Pending fee reminder",
                "Pending fee summary",
                "Finance staff can review active-school fee reminder suggestions.",
                new BigDecimal("0.91"),
                AiRecommendationRiskLevel.HIGH,
                AiRecommendationStatus.PENDING_REVIEW,
                "SYSTEM",
                "system",
                financeStaff,
                true,
                null,
                null,
                "{}"
        ));
        AiRecommendation feeApproved = aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                school,
                "SCHOOL",
                school.getId(),
                AiRecommendationType.FEE_REMINDER_SUGGESTION,
                "Approved fee reminder",
                "Approved fee summary",
                "Finance staff can dismiss active-school fee suggestions.",
                new BigDecimal("0.88"),
                AiRecommendationRiskLevel.LOW,
                AiRecommendationStatus.APPROVED,
                "SYSTEM",
                "system",
                financeStaff,
                false,
                null,
                null,
                "{}"
        ));
        AiRecommendation academicSuggestion = aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                school,
                "STUDENT",
                "student-should-not-leak",
                AiRecommendationType.STUDENT_RISK_ACADEMIC,
                "Academic suggestion",
                "Academic summary",
                "Finance staff should not see academic AI suggestions.",
                new BigDecimal("0.74"),
                AiRecommendationRiskLevel.MEDIUM,
                AiRecommendationStatus.APPROVED,
                "SYSTEM",
                "system",
                null,
                false,
                null,
                null,
                "{}"
        ));
        AiRecommendation otherSchoolFee = aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                otherSchool,
                "SCHOOL",
                otherSchool.getId(),
                AiRecommendationType.FEE_REMINDER_SUGGESTION,
                "Other school fee reminder",
                "Other school summary",
                "Other school finance suggestions are not visible.",
                new BigDecimal("0.82"),
                AiRecommendationRiskLevel.LOW,
                AiRecommendationStatus.APPROVED,
                "SYSTEM",
                "system",
                null,
                false,
                null,
                null,
                "{}"
        ));
        AutomationRule rule = automationRuleRepository.save(new AutomationRule(
                tenant,
                school,
                "FINANCE_RULE_DENIED",
                "Finance denied rule",
                "Automation configuration is not finance-staff-facing.",
                "EVENT",
                "{}",
                "ACTION",
                "{}",
                true,
                true,
                UserRole.SCHOOL_ADMIN,
                AiRecommendationRiskLevel.MEDIUM,
                financeStaff
        ));
        automationRunRepository.save(new AutomationRun(
                rule,
                AutomationRunStatus.COMPLETED,
                "SYSTEM",
                "system",
                "{}"
        ));

        mockMvc.perform(get("/v1/ai/recommendations")
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2));

        mockMvc.perform(get("/v1/ai/recommendations/{id}", academicSuggestion.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/recommendations/{id}", otherSchoolFee.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/ai/recommendations/{id}/approve", feePending.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
        mockMvc.perform(post("/v1/ai/recommendations/{id}/dismiss", feeApproved.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
        mockMvc.perform(post("/v1/ai/recommendations/{id}/execute", feePending.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/v1/ai/automation-rules")
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/automation-runs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/ai/entitlement")
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(post("/v1/ai/usage/audit")
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken))
                        .contentType("application/json")
                        .content(usagePayload("NOTICE_DRAFTING", 1, 1)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
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
