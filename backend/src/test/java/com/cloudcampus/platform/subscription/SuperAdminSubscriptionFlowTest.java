package com.cloudcampus.platform.subscription;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.auth.UserAccount;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SuperAdminSubscriptionFlowTest {

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
    private TenantSchoolLimitRepository tenantSchoolLimitRepository;

    @Autowired
    private TenantSubscriptionRepository tenantSubscriptionRepository;

    @Autowired
    private TenantInvoiceRepository tenantInvoiceRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void superAdminCreatesPlanAssignsTenantSubscriptionAndTenantAdminUsageReflectsPlan() throws Exception {
        var superAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        TenantContext tenantA = tenantWithAdmin("sub-flow-a", "tenant-admin-sub-flow-a@example.com");
        TenantContext tenantB = tenantWithAdmin("sub-flow-b", "tenant-admin-sub-flow-b@example.com");

        JsonNode plan = createPlan(superAdmin.accessToken(), "growth-sub-flow", 2, 499900, 4999000);

        JsonNode assignment = objectMapper.readTree(mockMvc.perform(put("/v1/super-admin/subscriptions/tenants/{tenantId}", tenantA.tenant().getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "%s",
                                  "role": "SUPER_ADMIN",
                                  "planCode": "growth-sub-flow",
                                  "billingCycle": "ANNUAL",
                                  "issueInvoice": true
                                }
                                """.formatted(tenantB.tenant().getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(tenantA.tenant().getId()))
                .andExpect(jsonPath("$.planCode").value("GROWTH-SUB-FLOW"))
                .andExpect(jsonPath("$.billingCycle").value("ANNUAL"))
                .andExpect(jsonPath("$.maxSchools").value(2))
                .andExpect(jsonPath("$.schoolsUsed").value(1))
                .andExpect(jsonPath("$.remainingSchools").value(1))
                .andExpect(jsonPath("$.invoice.amountCents").value(4999000))
                .andReturn().getResponse().getContentAsString());

        assertThat(assignment.at("/planId").asText()).isEqualTo(plan.at("/id").asText());
        assertThat(tenantSubscriptionRepository.findById(tenantA.tenant().getId()))
                .hasValueSatisfying(subscription -> {
                    assertThat(subscription.getPlan().getCode()).isEqualTo("GROWTH-SUB-FLOW");
                    assertThat(subscription.getBillingCycle()).isEqualTo(BillingCycle.ANNUAL);
                    assertThat(subscription.getAssignedBy().getId()).isEqualTo(superAdmin.userId());
                });
        assertThat(tenantSubscriptionRepository.findById(tenantB.tenant().getId())).isEmpty();
        assertThat(tenantSchoolLimitRepository.findById(tenantA.tenant().getId()))
                .hasValueSatisfying(limit -> assertThat(limit.getMaxSchools()).isEqualTo(2));
        assertThat(tenantInvoiceRepository.findByTenantIdOrderByIssuedAtDesc(tenantA.tenant().getId()))
                .singleElement()
                .satisfies(invoice -> {
                    assertThat(invoice.getInvoiceNumber()).startsWith("INV-SUB-FLOW-A-");
                    assertThat(invoice.getAmountCents()).isEqualTo(4999000);
                    assertThat(invoice.getCurrency()).isEqualTo("INR");
                });

        mockMvc.perform(get("/v1/super-admin/subscriptions/tenants/{tenantId}/invoices", tenantA.tenant().getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].planCode").value("GROWTH-SUB-FLOW"))
                .andExpect(jsonPath("$[0].billingCycle").value("ANNUAL"));

        mockMvc.perform(get("/v1/tenant-admin/subscription/usage")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tenantA.tenantAdminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planCode").value("GROWTH-SUB-FLOW"))
                .andExpect(jsonPath("$.maxSchools").value(2))
                .andExpect(jsonPath("$.remainingSchools").value(1));

        mockMvc.perform(post("/v1/tenant-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tenantA.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "code": "branch-two",
                                  "name": "Branch Two"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.maxSchools").value(2))
                .andExpect(jsonPath("$.schoolsUsed").value(2));

        mockMvc.perform(post("/v1/tenant-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tenantA.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "code": "branch-three",
                                  "name": "Branch Three"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        assertThat(auditLogRepository.findByTenantId(tenantA.tenant().getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.TENANT_SUBSCRIPTION_ASSIGNED)
                .singleElement()
                .satisfies(auditLog -> {
                    assertThat(auditLog.getActorId()).isEqualTo(superAdmin.userId());
                    assertThat(auditLog.getActorType()).isEqualTo("SUPER_ADMIN");
                    assertThat(auditLog.getMetadataJson()).contains("GROWTH-SUB-FLOW");
                    assertThat(auditLog.getMetadataJson()).doesNotContain(tenantB.tenant().getId());
                });
        assertThat(auditLogRepository.findByTenantId(tenantA.tenant().getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.TENANT_INVOICE_ISSUED)
                .singleElement()
                .satisfies(auditLog -> assertThat(auditLog.getMetadataJson()).contains("INV-SUB-FLOW-A-"));
    }

    @Test
    void subscriptionManagementRejectsWrongRolesSpoofingAndUnsafePlanLimits() throws Exception {
        var superAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        var schoolAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SCHOOL_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        TenantContext tenant = tenantWithAdmin("sub-flow-c", "tenant-admin-sub-flow-c@example.com");
        schoolRepository.save(new School(tenant.tenant(), "SECOND", "Second School", false));

        mockMvc.perform(post("/v1/super-admin/subscriptions/plans")
                        .contentType("application/json")
                        .content(planPayload("blocked-plan", 2, 1000, 10000)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mockMvc.perform(post("/v1/super-admin/subscriptions/plans")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdmin.accessToken()))
                        .contentType("application/json")
                        .content(planPayload("blocked-plan", 2, 1000, 10000)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/super-admin/subscriptions/plans")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken()))
                        .header("X-Tenant-ID", "spoofed-tenant")
                        .contentType("application/json")
                        .content(planPayload("spoofed-header-plan", 2, 1000, 10000)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANT_CONTEXT_SPOOFING_BLOCKED"));

        createPlan(superAdmin.accessToken(), "tiny-sub-flow", 1, 1000, 10000);
        mockMvc.perform(put("/v1/super-admin/subscriptions/tenants/{tenantId}", tenant.tenant().getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "planCode": "tiny-sub-flow",
                                  "billingCycle": "MONTHLY",
                                  "issueInvoice": false
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        mockMvc.perform(put("/v1/super-admin/subscriptions/tenants/{tenantId}", tenant.tenant().getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(tenant.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "role": "SUPER_ADMIN",
                                  "planCode": "tiny-sub-flow",
                                  "billingCycle": "MONTHLY",
                                  "issueInvoice": false
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(tenantSubscriptionRepository.findById(tenant.tenant().getId())).isEmpty();
    }

    private JsonNode createPlan(String superAdminToken, String code, int maxSchools, long monthlyPrice, long annualPrice) throws Exception {
        return objectMapper.readTree(mockMvc.perform(post("/v1/super-admin/subscriptions/plans")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminToken))
                        .contentType("application/json")
                        .content(planPayload(code, maxSchools, monthlyPrice, annualPrice)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(code.toUpperCase()))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.currency").value("INR"))
                .andReturn().getResponse().getContentAsString());
    }

    private String planPayload(String code, int maxSchools, long monthlyPrice, long annualPrice) {
        return """
                {
                  "code": "%s",
                  "name": "%s Plan",
                  "description": "Subscription test plan",
                  "maxSchools": %d,
                  "maxStudents": 5000,
                  "maxStaff": 500,
                  "monthlyPriceCents": %d,
                  "annualPriceCents": %d,
                  "currency": "inr"
                }
                """.formatted(code, code, maxSchools, monthlyPrice, annualPrice);
    }

    private TenantContext tenantWithAdmin(String tenantCode, String adminEmail) {
        Tenant tenant = tenantRepository.save(new Tenant(tenantCode.toUpperCase(), "Tenant " + tenantCode));
        School primarySchool = schoolRepository.save(new School(tenant, "PRIMARY", "Primary School", true));
        tenantSchoolLimitRepository.save(new TenantSchoolLimit(tenant.getId(), 1));
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
