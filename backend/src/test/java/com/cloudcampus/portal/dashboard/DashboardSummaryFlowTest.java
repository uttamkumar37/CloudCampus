package com.cloudcampus.portal.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicInteger;

import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.operations.finance.FeeDemand;
import com.cloudcampus.operations.finance.FeeDemandRepository;
import com.cloudcampus.people.parent.ParentStudentLink;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
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
class DashboardSummaryFlowTest {

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
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserSchoolAccessRepository userSchoolAccessRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FeeDemandRepository feeDemandRepository;

    @Autowired
    private ParentStudentLinkRepository parentStudentLinkRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminDashboardReturnsRealSchoolScopedMetrics() throws Exception {
        Fixture fixture = fixture("dash-school", UserRole.SCHOOL_ADMIN, true);
        Student student = studentRepository.save(new Student(fixture.tenant(), fixture.school(), "DASH-100", "Dashboard Student"));
        feeDemandRepository.save(new FeeDemand(
                fixture.tenant(),
                fixture.school(),
                student,
                "Term fee",
                new BigDecimal("1200.00"),
                LocalDate.now().plusDays(15)
        ));

        JsonNode body = jsonBody(mockMvc.perform(get("/v1/school-admin/dashboard/summary")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.token())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.metrics").isArray())
                .andReturn());

        assertMetric(body, "Students", "1");
        assertMetric(body, "Fee due", "1200");
        assertMetric(body, "Attendance sessions", "0");
    }

    @Test
    void principalCanReadSchoolScopedDashboardSummary() throws Exception {
        Fixture fixture = fixture("dash-principal", UserRole.PRINCIPAL, true);
        studentRepository.save(new Student(fixture.tenant(), fixture.school(), "DASH-PRN-100", "Principal Dashboard Student"));

        JsonNode body = jsonBody(mockMvc.perform(get("/v1/school-admin/dashboard/summary")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.token())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.metrics").isArray())
                .andReturn());

        assertMetric(body, "Students", "1");
    }

    @Test
    void allRoleDashboardSummaryEndpointsReturnFrontendContract() throws Exception {
        Fixture superAdmin = fixture("dash-super", UserRole.SUPER_ADMIN, false);
        Fixture tenantAdmin = fixture("dash-tenant", UserRole.TENANT_ADMIN, false);
        Fixture teacher = fixture("dash-teacher", UserRole.TEACHER, true);
        Fixture finance = fixture("dash-finance", UserRole.FINANCE_STAFF, true);
        Fixture office = fixture("dash-office", UserRole.OFFICE_STAFF, true);
        Fixture staff = fixture("dash-staff", UserRole.STAFF, true);
        Fixture parent = fixture("dash-parent", UserRole.PARENT, true);
        Fixture studentUser = fixture("dash-student", UserRole.STUDENT, true);
        Student student = new Student(studentUser.tenant(), studentUser.school(), "DASH-STU", "Student Dashboard");
        student.attachUser(studentUser.user());
        studentRepository.save(student);
        parentStudentLinkRepository.save(new ParentStudentLink(
                parent.tenant(),
                parent.school(),
                student,
                parent.user(),
                "Guardian",
                parent.user().getEmail(),
                null,
                true
        ));

        assertSummaryEndpoint("/v1/super-admin/dashboard/summary", superAdmin.token(), "Total tenants");
        assertSummaryEndpoint("/v1/tenant-admin/dashboard/summary", tenantAdmin.token(), "Active schools");
        assertSummaryEndpoint("/v1/teacher/dashboard/summary", teacher.token(), "Assigned classes");
        assertSummaryEndpoint("/v1/finance/dashboard/summary", finance.token(), "Fee demands");
        assertSummaryEndpoint("/v1/staff/dashboard/summary", office.token(), "Active school");
        assertSummaryEndpoint("/v1/staff/dashboard/summary", staff.token(), "Active school");
        assertSummaryEndpoint("/v1/parent/dashboard/summary", parent.token(), "Linked children");
        assertSummaryEndpoint("/v1/student/dashboard/summary", studentUser.token(), "Profile");
    }

    @Test
    void wrongRoleCannotReadPrivilegedDashboardSummary() throws Exception {
        Fixture schoolAdmin = fixture("dash-forbidden", UserRole.SCHOOL_ADMIN, true);

        mockMvc.perform(get("/v1/super-admin/dashboard/summary")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdmin.token())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void schoolScopedDashboardRequiresActiveSchoolContext() throws Exception {
        Fixture schoolAdmin = fixture("dash-no-school", UserRole.SCHOOL_ADMIN, false);

        mockMvc.perform(get("/v1/school-admin/dashboard/summary")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdmin.token())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    private void assertSummaryEndpoint(String endpoint, String token, String expectedMetricLabel) throws Exception {
        mockMvc.perform(get(endpoint)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.metrics").isArray())
                .andExpect(jsonPath("$.alerts").isArray())
                .andExpect(jsonPath("$.activity").isArray())
                .andExpect(jsonPath("$.metrics[0].label").value(expectedMetricLabel));
    }

    private Fixture fixture(String prefix, UserRole role, boolean withSchoolAccess) {
        int suffix = SEQUENCE.incrementAndGet();
        Tenant tenant = tenantRepository.save(new Tenant(prefix + "-tenant-" + suffix, "Dashboard Tenant " + suffix));
        School school = schoolRepository.save(new School(tenant, prefix + "-school-" + suffix, "Dashboard School " + suffix, true));
        String roleSlug = role.name().toLowerCase(Locale.ROOT).replace('_', '-');
        UserAccount user = new UserAccount(
                tenant,
                roleSlug + "-" + suffix + "@dashboard.example",
                "Dashboard " + role.name(),
                role
        );
        user.activate(passwordEncoder.encode("DashboardStrong123!"), user.getDisplayName(), Instant.now());
        userAccountRepository.save(user);
        if (withSchoolAccess) {
            userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, user, role, true));
        }
        String activeSchoolId = withSchoolAccess ? school.getId() : null;
        String token = jwtAccessTokenService.issueToken(user.getId(), tenant.getId(), role, activeSchoolId);
        return new Fixture(tenant, school, user, token);
    }

    private JsonNode jsonBody(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private void assertMetric(JsonNode body, String label, String value) {
        for (JsonNode metric : body.path("metrics")) {
            if (label.equals(metric.path("label").asText())) {
                assertThat(metric.path("value").asText()).isEqualTo(value);
                return;
            }
        }
        throw new AssertionError("Metric was not found: " + label);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private record Fixture(
            Tenant tenant,
            School school,
            UserAccount user,
            String token
    ) {
    }
}
