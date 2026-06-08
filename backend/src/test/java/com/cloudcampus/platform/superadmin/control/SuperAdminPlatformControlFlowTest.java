package com.cloudcampus.platform.superadmin.control;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.notification.NotificationDelivery;
import com.cloudcampus.notification.NotificationDeliveryRepository;
import com.cloudcampus.operations.report.ReportExportFileRepository;
import com.cloudcampus.operations.report.ReportExportJobRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.platform.subscription.BillingCycle;
import com.cloudcampus.platform.subscription.SubscriptionPlan;
import com.cloudcampus.platform.subscription.SubscriptionPlanRepository;
import com.cloudcampus.platform.subscription.TenantInvoice;
import com.cloudcampus.platform.subscription.TenantInvoiceRepository;
import com.cloudcampus.platform.subscription.TenantInvoiceStatus;
import com.cloudcampus.platform.subscription.TenantSubscriptionRepository;
import com.cloudcampus.platform.superadmin.stats.PlatformStatsReconciliationService;
import com.cloudcampus.platform.superadmin.stats.SchoolStatsRepository;
import com.cloudcampus.platform.superadmin.stats.TenantStatsRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.platform.tenant.TenantStatus;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
import com.cloudcampus.testsupport.AuthTestSupport;

import org.junit.jupiter.api.BeforeEach;
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
    private TenantSubscriptionRepository tenantSubscriptionRepository;

    @Autowired
    private NotificationDeliveryRepository notificationDeliveryRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private ReportExportJobRepository reportExportJobRepository;

    @Autowired
    private ReportExportFileRepository reportExportFileRepository;

    @Autowired
    private PlatformStatsReconciliationService platformStatsReconciliationService;

    @Autowired
    private SchoolStatsRepository schoolStatsRepository;

    @Autowired
    private TenantStatsRepository tenantStatsRepository;

    @Autowired
    private SuperAdminReportExportProcessor reportExportProcessor;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void clearGlobalRevenueState() {
        tenantInvoiceRepository.deleteAll();
        tenantSubscriptionRepository.deleteAll();
    }

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
    void statsReconciliationCreatesMissingTenantAndSchoolRows() {
        Tenant tenant = tenantRepository.save(new Tenant("SA-STATS-REC", "Stats Reconciliation Tenant"));
        School school = schoolRepository.save(new School(tenant, "STATS-SCHOOL", "Stats School", true));
        studentRepository.save(new Student(tenant, school, "STATS-001", "Stats Student"));
        schoolStatsRepository.deleteAll();
        tenantStatsRepository.deleteAll();

        platformStatsReconciliationService.reconcileAll();

        assertThat(schoolStatsRepository.findById(school.getId())).hasValueSatisfying(stats -> {
            assertThat(stats.getStudentCount()).isGreaterThanOrEqualTo(1);
            assertThat(stats.getActiveStudentCount()).isGreaterThanOrEqualTo(1);
        });
        assertThat(tenantStatsRepository.findById(tenant.getId())).hasValueSatisfying(stats -> {
            assertThat(stats.getSchoolCount()).isGreaterThanOrEqualTo(1);
            assertThat(stats.getActiveSchoolCount()).isGreaterThanOrEqualTo(1);
        });
    }

    @Test
    void auditLogsHandleTenantEventsWithoutSchoolScope() throws Exception {
        var superAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        Tenant tenant = tenantRepository.save(new Tenant("SA-AUDIT-NULL-SCHOOL", "Audit Null School Tenant"));
        auditLogRepository.deleteAll();
        auditLogService.record(
                tenant.getId(),
                null,
                "SUPER_ADMIN",
                superAdmin.userId(),
                AuditAction.MFA_CHALLENGE_CREATED,
                "MfaChallenge",
                "mfa-null-school",
                "MFA challenge created for test.",
                Map.of("source", "test")
        );

        mockMvc.perform(get("/v1/super-admin/audit-logs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].schoolId").doesNotExist())
                .andExpect(jsonPath("$.items[0].schoolName").doesNotExist())
                .andExpect(jsonPath("$.items[0].action").value("MFA_CHALLENGE_CREATED"));
    }

    @Test
    void aiRecommendationDetailAuditsSchoolScopedView() throws Exception {
        var superAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        Tenant tenant = tenantRepository.save(new Tenant("SA-AI-VIEW", "AI Recommendation View Tenant"));
        School school = schoolRepository.save(new School(tenant, "AI-VIEW-SCHOOL", "AI Recommendation View School", true));

        String content = mockMvc.perform(post("/v1/super-admin/ai/recommendations")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "%s",
                                  "schoolId": "%s",
                                  "targetType": "PLATFORM",
                                  "recommendationType": "PLATFORM_HEALTH_INSIGHT",
                                  "title": "Review platform health",
                                  "summary": "Validate the recommendation detail read path.",
                                  "riskLevel": "LOW",
                                  "status": "PENDING_REVIEW",
                                  "createdByActorType": "SYSTEM",
                                  "approvalRequired": true,
                                  "metadataJson": "{}"
                                }
                                """.formatted(tenant.getId(), school.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.schoolId").value(school.getId()))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String recommendationId = objectMapper.readTree(content).get("recommendationId").asText();

        mockMvc.perform(get("/v1/super-admin/ai/recommendations/{id}", recommendationId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recommendationId").value(recommendationId))
                .andExpect(jsonPath("$.schoolId").value(school.getId()));

        assertThat(auditLogRepository.findAllByOrderByCreatedAtDesc())
                .anySatisfy(log -> {
                    assertThat(log.getAction()).isEqualTo(AuditAction.AI_RECOMMENDATION_VIEWED);
                    assertThat(log.getSchoolId()).isEqualTo(school.getId());
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

    @Test
    void superAdminScaleEndpointsUsePaginationPersistSettingsAndCreateQueuedReportJobs() throws Exception {
        var superAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SUPER_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        Tenant tenant = tenantRepository.save(new Tenant("SA-SCALE-A", "Scale Alpha Trust"));
        Tenant otherTenant = tenantRepository.save(new Tenant("SA-SCALE-B", "Scale Beta Trust"));
        School school = schoolRepository.save(new School(tenant, "SCALE-SCHOOL", "Scale School", true));
        schoolRepository.save(new School(otherTenant, "BETA-SCHOOL", "Beta School", true));
        studentRepository.save(new Student(tenant, school, "SCALE-001", "Scale Student"));
        SubscriptionPlan plan = subscriptionPlanRepository.save(new SubscriptionPlan(
                "SCALE",
                "Scale Plan",
                "Scale readiness plan",
                10,
                1_000_000,
                50_000,
                100000,
                1000000,
                "USD"
        ));
        TenantInvoice paidInvoice = new TenantInvoice(
                tenant,
                plan,
                "INV-SA-SCALE-0001",
                BillingCycle.MONTHLY,
                100000,
                "USD",
                Instant.now().plusSeconds(86400)
        );
        paidInvoice.updateStatus(TenantInvoiceStatus.PAID);
        tenantInvoiceRepository.save(paidInvoice);

        mockMvc.perform(get("/v1/super-admin/tenants")
                        .param("page", "0")
                        .param("size", "1")
                        .param("search", "Scale")
                        .param("status", "ACTIVE")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(1))
                .andExpect(jsonPath("$.totalItems").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)));

        mockMvc.perform(get("/v1/super-admin/schools")
                        .param("tenantId", tenant.getId())
                        .param("search", "Scale")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].studentCount").value(1));

        mockMvc.perform(get("/v1/super-admin/platform-metrics")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalStudentCount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.paidInvoiceCount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));

        mockMvc.perform(get("/v1/super-admin/revenue/summary")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paidInvoiceCount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));

        mockMvc.perform(patch("/v1/super-admin/settings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "platformName": "CloudCampus Enterprise",
                                  "supportEmail": "support-enterprise@cloudcampus.dev",
                                  "defaultTimezone": "Asia/Kolkata",
                                  "maintenanceMode": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.platformName").value("CloudCampus Enterprise"))
                .andExpect(jsonPath("$.runtime.jwtSecret").value("configured/hidden"));

        mockMvc.perform(get("/v1/super-admin/settings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.platformName").value("CloudCampus Enterprise"))
                .andExpect(jsonPath("$.supportEmail").value("support-enterprise@cloudcampus.dev"))
                .andExpect(jsonPath("$.defaultTimezone").value("Asia/Kolkata"))
                .andExpect(jsonPath("$.maintenanceMode").value(true));

        mockMvc.perform(post("/v1/super-admin/reports/exports")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "reportType": "PLATFORM_SUMMARY",
                                  "format": "CSV"
                                }
                                """))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.reportType").value("PLATFORM_SUMMARY"))
                .andExpect(jsonPath("$.status").value("QUEUED"))
                .andExpect(jsonPath("$.schoolName").value("Platform-wide"));

        mockMvc.perform(get("/v1/super-admin/reports/exports")
                        .param("status", "QUEUED")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].status").value("QUEUED"));

        var queuedExport = reportExportJobRepository.findTop10ByOrderByRequestedAtDesc().getFirst();
        reportExportProcessor.processPlatformExport(queuedExport.getId());

        mockMvc.perform(get("/v1/super-admin/reports/exports/{jobId}", queuedExport.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.completedAt").exists());

        assertThat(reportExportFileRepository.findByReportExportJobId(queuedExport.getId()))
                .hasValueSatisfying(file -> {
                    assertThat(file.getSchool()).isNull();
                    assertThat(file.getFileName()).contains("platform_summary");
                    assertThat(file.getContent()).contains("totalTenantCount");
                });
        assertThat(auditLogRepository.findAllByOrderByCreatedAtDesc())
                .anySatisfy(log -> assertThat(log.getAction()).isEqualTo(AuditAction.REPORT_EXPORT_STARTED))
                .anySatisfy(log -> assertThat(log.getAction()).isEqualTo(AuditAction.REPORT_EXPORT_COMPLETED));

        mockMvc.perform(get("/v1/super-admin/search")
                        .param("q", "Scale")
                        .param("types", "tenant,school,invoice,audit")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdmin.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results").isArray())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content()
                        .string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("password"))));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
