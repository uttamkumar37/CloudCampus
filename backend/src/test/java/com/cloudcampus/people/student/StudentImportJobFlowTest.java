package com.cloudcampus.people.student;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import com.cloudcampus.academic.ClassLevelRepository;
import com.cloudcampus.academic.SectionRepository;
import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.events.outbox.OutboxEventRepository;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.operations.bulk.BulkJobRepository;
import com.cloudcampus.operations.bulk.BulkJobStatus;
import com.cloudcampus.platform.tenant.TenantRepository;
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
class StudentImportJobFlowTest {

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
    private StudentRepository studentRepository;

    @Autowired
    private StudentImportJobRepository studentImportJobRepository;

    @Autowired
    private StudentImportService studentImportService;

    @Autowired
    private BulkJobRepository bulkJobRepository;

    @Autowired
    private ClassLevelRepository classLevelRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminQueuesStudentImportJobAndWorkerImportsStudents() throws Exception {
        JsonNode onboarding = onboard("stu-import-job-a", "stu-job-school-a", "stu-job-admin-a@example.com");
        String token = activateSchoolAdmin(onboarding);
        String tenantId = onboarding.at("/tenant/id").asText();
        String schoolId = onboarding.at("/school/id").asText();
        AcademicSetup academicSetup = academicSetup(token, "2026-2027", "Class 1", "A");

        JsonNode queued = jsonBody(mockMvc.perform(post("/v1/school-admin/students/import/jobs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content(validImportPayload(academicSetup.classLevelId(), academicSetup.sectionId())))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.tenantId").value(tenantId))
                .andExpect(jsonPath("$.schoolId").value(schoolId))
                .andExpect(jsonPath("$.status").value("QUEUED"))
                .andExpect(jsonPath("$.totalRecords").value(2))
                .andExpect(jsonPath("$.validationErrors").isEmpty())
                .andReturn());
        String bulkJobId = queued.at("/bulkJobId").asText();

        assertThat(studentRepository.findBySchoolIdOrderByAdmissionNumberAsc(schoolId)).isEmpty();
        assertThat(studentImportJobRepository.findByBulkJobId(bulkJobId))
                .get()
                .satisfies(importJob -> assertThat(importJob.getRowsJson()).contains("Anaya Rao"));

        StudentImportJobResponse processed = studentImportService.processQueuedImportJob(bulkJobId);
        assertThat(processed.status()).isEqualTo(BulkJobStatus.COMPLETED);
        assertThat(processed.processedRecords()).isEqualTo(2);
        assertThat(processed.successRecords()).isEqualTo(2);
        assertThat(processed.failedRecords()).isZero();
        assertThat(processed.validationErrors()).isEmpty();

        assertThat(studentRepository.findBySchoolIdOrderByAdmissionNumberAsc(schoolId))
                .extracting(Student::getAdmissionNumber)
                .containsExactly("ADM-1001", "ADM-1002");

        mockMvc.perform(get("/v1/school-admin/students/import/jobs/{bulkJobId}", bulkJobId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.successRecords").value(2));

        assertThat(auditLogRepository.findByTenantId(tenantId))
                .extracting(auditLog -> auditLog.getAction())
                .contains(AuditAction.STUDENT_IMPORT_JOB_QUEUED, AuditAction.STUDENT_IMPORTED);
        assertThat(auditLogRepository.findByTenantId(tenantId))
                .allSatisfy(auditLog -> assertThat(auditLog.getMetadataJson()).doesNotContain("Anaya"));
        assertThat(outboxEventRepository.findByAggregateTypeAndAggregateId("BulkJob", bulkJobId))
                .extracting(event -> event.getEventType())
                .contains("BulkJobCreated", "BulkJobStatusChanged");
    }

    @Test
    void studentImportJobCapturesValidationErrorsWithoutDroppingValidRows() throws Exception {
        JsonNode onboarding = onboard("stu-import-job-b", "stu-job-school-b", "stu-job-admin-b@example.com");
        String token = activateSchoolAdmin(onboarding);
        String tenantId = onboarding.at("/tenant/id").asText();
        String schoolId = onboarding.at("/school/id").asText();
        AcademicSetup academicSetup = academicSetup(token, "2026-2027", "Class 1", "A");
        studentRepository.save(new Student(
                tenantRepository.findById(tenantId).orElseThrow(),
                schoolRepository.findById(schoolId).orElseThrow(),
                "ADM-EXIST",
                "Existing Student"
        ));

        String bulkJobId = jsonBody(mockMvc.perform(post("/v1/school-admin/students/import/jobs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content(invalidImportPayload(academicSetup.classLevelId(), academicSetup.sectionId())))
                .andExpect(status().isAccepted())
                .andReturn()).at("/bulkJobId").asText();

        StudentImportJobResponse processed = studentImportService.processQueuedImportJob(bulkJobId);

        assertThat(processed.status()).isEqualTo(BulkJobStatus.PARTIALLY_COMPLETED);
        assertThat(processed.processedRecords()).isEqualTo(4);
        assertThat(processed.successRecords()).isEqualTo(1);
        assertThat(processed.failedRecords()).isEqualTo(3);
        assertThat(processed.errorFileReference()).isEqualTo("student-import-errors:" + bulkJobId);
        assertThat(processed.validationErrors())
                .extracting(StudentImportError::field)
                .contains("fullName", "dateOfBirth", "guardianEmail", "admissionNumber");

        assertThat(studentRepository.findBySchoolIdOrderByAdmissionNumberAsc(schoolId))
                .extracting(Student::getAdmissionNumber)
                .containsExactly("ADM-DUP", "ADM-EXIST");
        assertThat(bulkJobRepository.findById(bulkJobId))
                .get()
                .satisfies(job -> {
                    assertThat(job.getStatus()).isEqualTo(BulkJobStatus.PARTIALLY_COMPLETED);
                    assertThat(job.getErrorFileReference()).isEqualTo("student-import-errors:" + bulkJobId);
                });
    }

    @Test
    void schoolAdminCannotQueueStudentImportJobWithAnotherSchoolsClassOrSection() throws Exception {
        JsonNode firstOnboarding = onboard("stu-import-job-c1", "stu-job-school-c1", "stu-job-admin-c1@example.com");
        JsonNode secondOnboarding = onboard("stu-import-job-c2", "stu-job-school-c2", "stu-job-admin-c2@example.com");
        String firstToken = activateSchoolAdmin(firstOnboarding);
        String secondToken = activateSchoolAdmin(secondOnboarding);
        AcademicSetup secondAcademicSetup = academicSetup(secondToken, "2026-2027", "Class 2", "B");

        mockMvc.perform(post("/v1/school-admin/students/import/jobs")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstToken))
                        .contentType("application/json")
                        .content(validImportPayload(secondAcademicSetup.classLevelId(), secondAcademicSetup.sectionId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(studentImportJobRepository.findBySchoolIdOrderByCreatedAtDesc(firstOnboarding.at("/school/id").asText())).isEmpty();
        assertThat(bulkJobRepository.findBySchoolIdOrderByRequestedAtDesc(firstOnboarding.at("/school/id").asText())).isEmpty();
    }

    private String validImportPayload(String classLevelId, String sectionId) {
        return """
                {
                  "rows": [
                    {
                      "tenantId": "spoofed-tenant",
                      "schoolId": "spoofed-school",
                      "admissionNumber": "ADM-1001",
                      "fullName": "Anaya Rao",
                      "classLevelId": "%s",
                      "sectionId": "%s",
                      "rollNumber": "1",
                      "dateOfBirth": "2016-04-15",
                      "gender": "Female",
                      "guardianName": "Guardian One",
                      "guardianEmail": "Guardian.One@Example.com",
                      "guardianMobile": "+919876543210"
                    },
                    {
                      "admissionNumber": "ADM-1002",
                      "fullName": "Ishan Rao",
                      "classLevelId": "%s",
                      "sectionId": "%s",
                      "rollNumber": "2"
                    }
                  ]
                }
                """.formatted(classLevelId, sectionId, classLevelId, sectionId);
    }

    private String invalidImportPayload(String classLevelId, String sectionId) {
        return """
                {
                  "rows": [
                    {
                      "admissionNumber": "ADM-BAD",
                      "fullName": " ",
                      "classLevelId": "%s",
                      "sectionId": "%s",
                      "dateOfBirth": "15-04-2016",
                      "guardianEmail": "invalid-email"
                    },
                    {
                      "admissionNumber": "ADM-DUP",
                      "fullName": "Duplicate One",
                      "classLevelId": "%s",
                      "sectionId": "%s"
                    },
                    {
                      "admissionNumber": "ADM-DUP",
                      "fullName": "Duplicate Two",
                      "classLevelId": "%s",
                      "sectionId": "%s"
                    },
                    {
                      "admissionNumber": "ADM-EXIST",
                      "fullName": "Existing Again",
                      "classLevelId": "%s",
                      "sectionId": "%s"
                    }
                  ]
                }
                """.formatted(
                classLevelId,
                sectionId,
                classLevelId,
                sectionId,
                classLevelId,
                sectionId,
                classLevelId,
                sectionId
        );
    }

    private AcademicSetup academicSetup(String token, String academicYearName, String className, String sectionName) throws Exception {
        JsonNode academicYear = jsonBody(mockMvc.perform(post("/v1/school-admin/academic-years")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "%s",
                                  "startDate": "2026-04-01",
                                  "endDate": "2027-03-31",
                                  "activate": true
                                }
                                """.formatted(academicYearName)))
                .andExpect(status().isCreated())
                .andReturn());
        JsonNode classLevel = jsonBody(mockMvc.perform(post("/v1/school-admin/classes")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "academicYearId": "%s",
                                  "name": "%s",
                                  "displayOrder": 1
                                }
                                """.formatted(academicYear.at("/id").asText(), className)))
                .andExpect(status().isCreated())
                .andReturn());
        JsonNode section = jsonBody(mockMvc.perform(post("/v1/school-admin/sections")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "name": "%s",
                                  "capacity": 40
                                }
                                """.formatted(classLevel.at("/id").asText(), sectionName)))
                .andExpect(status().isCreated())
                .andReturn());
        assertThat(classLevelRepository.findById(classLevel.at("/id").asText())).isPresent();
        assertThat(sectionRepository.findById(section.at("/id").asText())).isPresent();
        return new AcademicSetup(classLevel.at("/id").asText(), section.at("/id").asText());
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "Student Import Job Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Student Import Job School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Student Import Job Admin",
                                    "email": "%s"
                                  }
                                }
                                """.formatted(tenantCode, schoolCode, email)))
                .andExpect(status().isCreated())
                .andReturn();
        return jsonBody(result);
    }

    private String activateSchoolAdmin(JsonNode onboarding) throws Exception {
        String email = onboarding.at("/schoolAdminInvitation/email").asText();
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StudentImportStrong123!");
        return login(email, "StudentImportStrong123!").at("/accessToken").asText();
    }

    private void acceptInvitation(String token, String password) throws Exception {
        mockMvc.perform(post("/v1/invitations/accept")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "%s",
                                  "displayName": "Student Import Job Admin"
                                }
                                """.formatted(token, password)))
                .andExpect(status().isOk());
    }

    private JsonNode login(String email, String password) throws Exception {
        MvcResult loginStart = mockMvc.perform(post("/v1/auth/login")
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode login = jsonBody(loginStart);
        if (!login.path("mfaRequired").asBoolean(false)) {
            return login;
        }
        MvcResult verified = mockMvc.perform(post("/v1/auth/mfa/verify")
                        .contentType("application/json")
                        .content("""
                                {
                                  "challengeId": "%s",
                                  "code": "%s"
                                }
                                """.formatted(
                                login.at("/mfaChallengeId").asText(),
                                login.at("/mfaCode").asText()
                        )))
                .andExpect(status().isOk())
                .andReturn();
        return jsonBody(verified);
    }

    private JsonNode jsonBody(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
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

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private record AcademicSetup(String classLevelId, String sectionId) {
    }
}
