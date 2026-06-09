package com.cloudcampus.operations.report;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.operations.bulk.BulkJobRepository;
import com.cloudcampus.operations.bulk.BulkJobStatus;
import com.cloudcampus.operations.finance.FeeDemand;
import com.cloudcampus.operations.finance.FeeDemandRepository;
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
class ReportExportFlowTest {

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
    private BulkJobRepository bulkJobRepository;

    @Autowired
    private ReportExportJobRepository reportExportJobRepository;

    @Autowired
    private ReportExportFileRepository reportExportFileRepository;

    @Autowired
    private ReportExportService reportExportService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminCanRequestProcessListAndDownloadDurableStudentDirectoryExport() throws Exception {
        SchoolUserContext context = schoolUserContext(UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_ADMIN);
        studentRepository.save(new Student(context.tenant(), context.school(), "REP-100", "Report Student One"));
        studentRepository.save(new Student(context.tenant(), context.school(), "REP-101", "Report Student Two"));

        JsonNode created = jsonBody(mockMvc.perform(post("/v1/school-admin/reports/exports")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed",
                                  "schoolId": "spoofed",
                                  "reportType": "STUDENT_DIRECTORY",
                                  "format": "CSV",
                                  "parameters": {
                                    "requestedFileName": "private-students.csv"
                                  }
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenantId").value(context.tenant().getId()))
                .andExpect(jsonPath("$.schoolId").value(context.school().getId()))
                .andExpect(jsonPath("$.reportType").value("STUDENT_DIRECTORY"))
                .andExpect(jsonPath("$.format").value("CSV"))
                .andExpect(jsonPath("$.status").value("QUEUED"))
                .andReturn());
        String exportId = created.at("/id").asText();
        String bulkJobId = created.at("/bulkJobId").asText();

        mockMvc.perform(get("/v1/school-admin/reports/exports/{exportId}/download", exportId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        reportExportService.processExport(exportId);

        mockMvc.perform(get("/v1/school-admin/reports/exports")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(exportId))
                .andExpect(jsonPath("$[0].status").value("COMPLETED"))
                .andExpect(jsonPath("$[0].fileName").exists());
        mockMvc.perform(get("/v1/school-admin/reports/exports/{exportId}", exportId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(exportId))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.sizeBytes").isNumber())
                .andExpect(jsonPath("$.checksumSha256").isString());

        MvcResult download = mockMvc.perform(get("/v1/school-admin/reports/exports/{exportId}/download", exportId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken())))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "text/csv"))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, org.hamcrest.Matchers.containsString("attachment")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("REP-100")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Report Student Two")))
                .andReturn();

        assertThat(download.getResponse().getContentAsString()).startsWith("admission_number,full_name,class,section,active");
        assertThat(reportExportJobRepository.findById(exportId)).isPresent();
        assertThat(reportExportFileRepository.findByReportExportJobId(exportId))
                .get()
                .satisfies(file -> {
                    assertThat(file.getSchool().getId()).isEqualTo(context.school().getId());
                    assertThat(file.getContent()).contains("REP-101");
                    assertThat(file.getSizeBytes()).isPositive();
                    assertThat(file.getChecksumSha256()).hasSize(64);
                });
        assertThat(bulkJobRepository.findById(bulkJobId))
                .get()
                .satisfies(job -> {
                    assertThat(job.getStatus()).isEqualTo(BulkJobStatus.COMPLETED);
                    assertThat(job.getProcessedRecords()).isEqualTo(2);
                    assertThat(job.getSuccessRecords()).isEqualTo(2);
                });
        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .extracting(auditLog -> auditLog.getAction())
                .contains(AuditAction.REPORT_EXPORT_REQUESTED, AuditAction.REPORT_EXPORT_COMPLETED);
        assertThat(auditLogRepository.findByTenantId(context.tenant().getId()))
                .extracting(auditLog -> auditLog.getMetadataJson() == null ? "" : auditLog.getMetadataJson())
                .noneMatch(metadata -> metadata.contains("Report Student One"))
                .noneMatch(metadata -> metadata.contains("private-students.csv"));
    }

    @Test
    void schoolAdminCanExportFeeDemandCsvWithoutRawFileMetadataInAudit() throws Exception {
        SchoolUserContext context = schoolUserContext(UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_ADMIN);
        Student student = studentRepository.save(new Student(context.tenant(), context.school(), "REP-FEE-100", "Fee Report Student"));
        feeDemandRepository.save(new FeeDemand(
                context.tenant(),
                context.school(),
                student,
                "Term fee",
                new java.math.BigDecimal("1200.00"),
                LocalDate.of(2026, 7, 1)
        ));

        JsonNode created = jsonBody(mockMvc.perform(post("/v1/school-admin/reports/exports")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "reportType": "FEE_DEMANDS",
                                  "format": "CSV"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn());
        String exportId = created.at("/id").asText();
        reportExportService.processExport(exportId);

        mockMvc.perform(get("/v1/school-admin/reports/exports/{exportId}/download", exportId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken())))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("admission_number,student_name,description")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("REP-FEE-100")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Term fee")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("1200")));
    }

    @Test
    void principalCanRequestAndListSchoolScopedReportExports() throws Exception {
        SchoolUserContext context = schoolUserContext(UserRole.PRINCIPAL, UserRole.PRINCIPAL);
        studentRepository.save(new Student(context.tenant(), context.school(), "REP-PRN-100", "Principal Report Student"));

        JsonNode created = jsonBody(mockMvc.perform(post("/v1/school-admin/reports/exports")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "reportType": "STUDENT_DIRECTORY",
                                  "format": "CSV"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenantId").value(context.tenant().getId()))
                .andExpect(jsonPath("$.schoolId").value(context.school().getId()))
                .andExpect(jsonPath("$.status").value("QUEUED"))
                .andReturn());
        String exportId = created.at("/id").asText();

        mockMvc.perform(get("/v1/school-admin/reports/exports")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(exportId));
    }

    @Test
    void schoolAdminCannotReadOrDownloadAnotherSchoolsReportExport() throws Exception {
        SchoolUserContext first = schoolUserContext(UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_ADMIN);
        SchoolUserContext second = schoolUserContext(UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_ADMIN);
        String secondExportId = jsonBody(mockMvc.perform(post("/v1/school-admin/reports/exports")
                        .header(HttpHeaders.AUTHORIZATION, bearer(second.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "reportType": "STUDENT_DIRECTORY",
                                  "format": "CSV"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()).at("/id").asText();
        reportExportService.processExport(secondExportId);

        mockMvc.perform(get("/v1/school-admin/reports/exports/{exportId}", secondExportId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(first.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/school-admin/reports/exports/{exportId}/download", secondExportId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(first.accessToken())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void nonSchoolAdminCannotRequestReportExportForGrantedSchool() throws Exception {
        SchoolUserContext teacher = schoolUserContext(UserRole.TEACHER, UserRole.TEACHER);

        mockMvc.perform(post("/v1/school-admin/reports/exports")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacher.accessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "reportType": "STUDENT_DIRECTORY",
                                  "format": "CSV"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(reportExportJobRepository.findBySchoolIdOrderByRequestedAtDesc(teacher.school().getId())).isEmpty();
    }

    private SchoolUserContext schoolUserContext(UserRole userRole, UserRole schoolAccessRole) {
        int suffix = SEQUENCE.incrementAndGet();
        Tenant tenant = tenantRepository.save(new Tenant(
                "REPORT-" + suffix,
                "Report Tenant " + suffix
        ));
        School school = schoolRepository.save(new School(
                tenant,
                "REPORT-SCHOOL-" + suffix,
                "Report School " + suffix,
                true
        ));
        UserAccount user = new UserAccount(
                tenant,
                "report-" + userRole.name().toLowerCase() + "-" + suffix + "@example.com",
                "Report " + userRole.name(),
                userRole
        );
        user.activate(passwordEncoder.encode("ReportPassword123!"), "Report " + userRole.name(), Instant.now());
        userAccountRepository.save(user);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, user, schoolAccessRole, true));
        String token = jwtAccessTokenService.issueToken(user.getId(), tenant.getId(), userRole, school.getId());
        return new SchoolUserContext(tenant, school, user, token);
    }

    private JsonNode jsonBody(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private record SchoolUserContext(Tenant tenant, School school, UserAccount user, String accessToken) {
    }
}
