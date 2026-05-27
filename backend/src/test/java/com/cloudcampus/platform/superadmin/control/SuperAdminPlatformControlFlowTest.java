package com.cloudcampus.platform.superadmin.control;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.notification.NotificationDelivery;
import com.cloudcampus.notification.NotificationDeliveryRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.platform.subscription.BillingCycle;
import com.cloudcampus.platform.subscription.SubscriptionPlan;
import com.cloudcampus.platform.subscription.SubscriptionPlanRepository;
import com.cloudcampus.platform.subscription.TenantInvoice;
import com.cloudcampus.platform.subscription.TenantInvoiceRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.platform.tenant.TenantStatus;
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
class SuperAdminPlatformControlFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private TenantInvoiceRepository tenantInvoiceRepository;

    @Autowired
    private NotificationDeliveryRepository notificationDeliveryRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void superAdminControlCenterReturnsRealPlatformDataAndAuditsTenantStatusMutation() throws Exception {
        var superAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        Tenant tenant = tenantRepository.save(new Tenant("SA-CTRL-A", "Super Admin Control Tenant"));
        School school = schoolRepository.save(new School(tenant, "CTRL-SCHOOL", "Control School", true));
        studentRepository.save(new Student(tenant, school, "ADM-1", "Control Student"));
        UserAccount schoolAdmin = new UserAccount(tenant, "principal-control@example.com", "Principal Control", UserRole.SCHOOL_ADMIN);
        schoolAdmin.activate(passwordEncoder.encode("Password123!"), "Principal Control", Instant.now());
        userAccountRepository.save(schoolAdmin);
        SubscriptionPlan plan = subscriptionPlanRepository.save(new SubscriptionPlan(
                "CTRL",
                "Control Plan",
                "Control center test plan",
                3,
                1000,
                100,
                250000,
                2500000,
                "USD"
        ));
        tenantInvoiceRepository.save(new TenantInvoice(
                tenant,
                plan,
                "INV-SA-CTRL-0001",
                BillingCycle.MONTHLY,
                250000,
                "USD",
                Instant.now().plusSeconds(86400)
        ));
        NotificationDelivery delivery = new NotificationDelivery(
                tenant.getId(),
                school.getId(),
                null,
                schoolAdmin.getId(),
                "EMAIL",
                "SCHOOL_ADMIN_INVITATION",
                "principal-control@example.com",
                "Principal Control",
                "SCHOOL_ADMIN",
                "Welcome",
                "p********@example.com"
        );
        delivery.markFailed("smtp", "safe failure", Instant.now());
        notificationDeliveryRepository.save(delivery);
        auditLogService.record(
                tenant.getId(),
                school.getId(),
                "SUPER_ADMIN",
                superAdmin.userId(),
                AuditAction.SCHOOL_CREATED,
                "School",
                school.getId(),
                "School created for test.",
                Map.of("token", "must-not-leak")
        );

        mockMvc.perform(get("/v1/super-admin/tenants")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[?(@.tenantId == '%s')].name".formatted(tenant.getId()))
                        .value(org.hamcrest.Matchers.hasItem("Super Admin Control Tenant")));

        mockMvc.perform(get("/v1/super-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[?(@.schoolId == '%s')].studentCount".formatted(school.getId()))
                        .value(org.hamcrest.Matchers.hasItem(1)));

        mockMvc.perform(get("/v1/super-admin/revenue/summary")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monthlyRecurringRevenueCents").value(0))
                .andExpect(jsonPath("$.totalInvoicedCents").value(250000));

        mockMvc.perform(get("/v1/super-admin/audit-logs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content()
                        .string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("must-not-leak"))));

        mockMvc.perform(get("/v1/super-admin/notifications/summary")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.failedDeliveries").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content()
                        .string(org.hamcrest.Matchers.containsString("p********@example.com")));

        mockMvc.perform(get("/v1/super-admin/platform-health")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.backendHealth").value("UP"))
                .andExpect(jsonPath("$.databaseStatus").value("CONNECTED"));

        mockMvc.perform(get("/v1/super-admin/settings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.runtime.jwtSecret").value("configured/hidden"));

        mockMvc.perform(patch("/v1/super-admin/tenants/{tenantId}/status", tenant.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken()))
                        .contentType("application/json")
                        .content("{\"status\":\"SUSPENDED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));

        assertThat(tenantRepository.findById(tenant.getId())).hasValueSatisfying(updated ->
                assertThat(updated.getStatus()).isEqualTo(TenantStatus.SUSPENDED)
        );
        assertThat(auditLogRepository.findAllByOrderByCreatedAtDesc())
                .anySatisfy(log -> {
                    assertThat(log.getAction()).isEqualTo(AuditAction.TENANT_STATUS_UPDATED);
                    assertThat(log.getActorId()).isEqualTo(superAdmin.userId());
                });
    }

    @Test
    void superAdminControlCenterRejectsUnauthenticatedWrongRoleAndSpoofedTenantHeaders() throws Exception {
        var schoolAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SCHOOL_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        var superAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );

        mockMvc.perform(get("/v1/super-admin/schools"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/v1/super-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdmin.accessToken())))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/v1/super-admin/schools")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken()))
                        .header("X-Tenant-ID", "spoofed"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANT_CONTEXT_SPOOFING_BLOCKED"));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
