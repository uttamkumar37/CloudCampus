package com.cloudcampus.platform.tenantadmin.report;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.operations.finance.FeeDemand;
import com.cloudcampus.operations.finance.FeeDemandRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
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
class TenantAdminReportSummaryFlowTest {

    private static final AtomicInteger SEQUENCE = new AtomicInteger();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FeeDemandRepository feeDemandRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void tenantAdminCanViewCombinedTenantSummaryAndSchoolDrilldown() throws Exception {
        TenantAdminReportContext context = tenantAdminReportContext("tenant-report-a");
        School alpha = schoolRepository.save(new School(context.tenant(), "ALPHA", "Alpha School", true));
        School beta = schoolRepository.save(new School(context.tenant(), "BETA", "Beta School", false));
        Student alphaOne = studentRepository.save(new Student(context.tenant(), alpha, "TA-100", "Tenant Alpha One"));
        studentRepository.save(new Student(context.tenant(), alpha, "TA-101", "Tenant Alpha Two"));
        Student betaOne = studentRepository.save(new Student(context.tenant(), beta, "TB-100", "Tenant Beta One"));

        FeeDemand alphaDemand = new FeeDemand(
                context.tenant(),
                alpha,
                alphaOne,
                "Alpha fee",
                new BigDecimal("100.00"),
                LocalDate.of(2026, 7, 1)
        );
        alphaDemand.recordPayment(new BigDecimal("30.00"));
        feeDemandRepository.save(alphaDemand);
        FeeDemand betaDemand = new FeeDemand(
                context.tenant(),
                beta,
                betaOne,
                "Beta fee",
                new BigDecimal("250.00"),
                LocalDate.of(2026, 8, 1)
        );
        betaDemand.recordPayment(new BigDecimal("250.00"));
        feeDemandRepository.save(betaDemand);

        JsonNode summary = jsonBody(mockMvc.perform(get("/v1/tenant-admin/reports/summary?tenantId=spoofed")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(context.tenant().getId()))
                .andExpect(jsonPath("$.schoolId").doesNotExist())
                .andExpect(jsonPath("$.totalSchools").value(2))
                .andExpect(jsonPath("$.activeSchools").value(2))
                .andExpect(jsonPath("$.totals.totalStudents").value(3))
                .andExpect(jsonPath("$.totals.activeStudents").value(3))
                .andExpect(jsonPath("$.totals.totalFeeDemands").value(2))
                .andExpect(jsonPath("$.totals.amountDue").value(350.00))
                .andExpect(jsonPath("$.totals.amountPaid").value(280.00))
                .andExpect(jsonPath("$.totals.outstandingAmount").value(70.00))
                .andExpect(jsonPath("$.schools[0].schoolId").value(alpha.getId()))
                .andExpect(jsonPath("$.schools[1].schoolId").value(beta.getId()))
                .andReturn());

        assertThat(summary.at("/tenantId").asText()).isNotEqualTo("spoofed");

        mockMvc.perform(get("/v1/tenant-admin/reports/schools/{schoolId}/summary", beta.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(context.tenant().getId()))
                .andExpect(jsonPath("$.schoolId").value(beta.getId()))
                .andExpect(jsonPath("$.schoolName").value("Beta School"))
                .andExpect(jsonPath("$.totalSchools").value(1))
                .andExpect(jsonPath("$.totals.totalStudents").value(1))
                .andExpect(jsonPath("$.totals.amountDue").value(250.00))
                .andExpect(jsonPath("$.schools[0].code").value("BETA"));
    }

    @Test
    void tenantAdminCannotDrillIntoAnotherTenantSchool() throws Exception {
        TenantAdminReportContext first = tenantAdminReportContext("tenant-report-b");
        TenantAdminReportContext second = tenantAdminReportContext("tenant-report-c");
        School foreignSchool = schoolRepository.save(new School(second.tenant(), "FOREIGN", "Foreign School", true));

        mockMvc.perform(get("/v1/tenant-admin/reports/schools/{schoolId}/summary", foreignSchool.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(first.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void nonTenantAdminAndSpoofedHeadersCannotAccessTenantReports() throws Exception {
        TenantAdminReportContext context = tenantAdminReportContext("tenant-report-d");

        mockMvc.perform(get("/v1/tenant-admin/reports/summary"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        var schoolAdmin = AuthTestSupport.issueAccessTokenForRole(
                UserRole.SCHOOL_ADMIN,
                tenantRepository,
                userAccountRepository,
                passwordEncoder,
                jwtAccessTokenService
        );
        mockMvc.perform(get("/v1/tenant-admin/reports/summary")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdmin.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/v1/tenant-admin/reports/summary")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken()))
                        .header("X-Tenant-ID", "spoofed-tenant"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANT_CONTEXT_SPOOFING_BLOCKED"));
    }

    private TenantAdminReportContext tenantAdminReportContext(String tenantCode) {
        int suffix = SEQUENCE.incrementAndGet();
        Tenant tenant = tenantRepository.save(new Tenant(
                tenantCode.toUpperCase() + "-" + suffix,
                "Tenant Report " + suffix
        ));
        UserAccount tenantAdmin = new UserAccount(
                tenant,
                "tenant-report-admin-" + suffix + "@example.com",
                "Tenant Report Admin",
                UserRole.TENANT_ADMIN
        );
        tenantAdmin.activate(passwordEncoder.encode("TenantReport123!"), "Tenant Report Admin", Instant.now());
        userAccountRepository.save(tenantAdmin);
        String token = jwtAccessTokenService.issueToken(
                tenantAdmin.getId(),
                tenant.getId(),
                UserRole.TENANT_ADMIN,
                null
        );
        return new TenantAdminReportContext(tenant, tenantAdmin, token);
    }

    private JsonNode jsonBody(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private record TenantAdminReportContext(Tenant tenant, UserAccount tenantAdmin, String accessToken) {
    }
}
