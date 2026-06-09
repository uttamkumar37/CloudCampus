package com.cloudcampus.people.student;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

import com.cloudcampus.academic.ClassLevelRepository;
import com.cloudcampus.academic.SectionRepository;
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
class StudentImportFlowTest {

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
    private ClassLevelRepository classLevelRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminValidatesAndImportsStudentsForActiveSchoolClassAndSection() throws Exception {
        JsonNode onboarding = onboard("stu-import-a", "stu-school-a", "stu-admin-a@example.com");
        String token = activateSchoolAdmin(onboarding);
        String tenantId = onboarding.at("/tenant/id").asText();
        String schoolId = onboarding.at("/school/id").asText();
        AcademicSetup academicSetup = academicSetup(token, "2026-2027", "Class 1", "A");

        mockMvc.perform(get("/v1/school-admin/students/import/template")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiredColumns[0]").value("admissionNumber"))
                .andExpect(jsonPath("$.sampleRow.fullName").value("Student Name"));

        mockMvc.perform(post("/v1/school-admin/students/import/validate")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content(validImportPayload(academicSetup.classLevelId(), academicSetup.sectionId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.rowCount").value(2))
                .andExpect(jsonPath("$.errors").isEmpty());

        JsonNode importResult = jsonBody(mockMvc.perform(post("/v1/school-admin/students/import")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content(validImportPayload(academicSetup.classLevelId(), academicSetup.sectionId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.imported").value(true))
                .andExpect(jsonPath("$.importedCount").value(2))
                .andExpect(jsonPath("$.students[0].tenantId").value(tenantId))
                .andExpect(jsonPath("$.students[0].schoolId").value(schoolId))
                .andExpect(jsonPath("$.students[0].classLevelId").value(academicSetup.classLevelId()))
                .andExpect(jsonPath("$.students[0].sectionId").value(academicSetup.sectionId()))
                .andExpect(jsonPath("$.students[0].guardianEmail").value("guardian.one@example.com"))
                .andReturn());

        assertThat(studentRepository.findBySchoolIdAndAdmissionNumber(schoolId, "ADM-1001"))
                .get()
                .satisfies(student -> {
                    assertThat(student.getClassLevel().getId()).isEqualTo(academicSetup.classLevelId());
                    assertThat(student.getSection().getId()).isEqualTo(academicSetup.sectionId());
                    assertThat(student.getDateOfBirth()).hasToString("2016-04-15");
                    assertThat(student.getImportedAt()).isNotNull();
                });

        mockMvc.perform(get("/v1/school-admin/students")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].admissionNumber").value("ADM-1001"))
                .andExpect(jsonPath("$[1].admissionNumber").value("ADM-1002"));

        assertThat(auditLogRepository.findByTenantId(tenantId))
                .anySatisfy(auditLog -> {
                    assertThat(auditLog.getAction()).isEqualTo(AuditAction.STUDENT_IMPORTED);
                    assertThat(auditLog.getActorId()).isEqualTo(onboarding.at("/schoolAdminInvitation/userId").asText());
                    assertThat(auditLog.getMetadataJson()).contains("\"importedCount\":2");
                    assertThat(auditLog.getMetadataJson()).doesNotContain("Anaya");
                });
        assertThat(importResult.at("/students").size()).isEqualTo(2);
    }

    @Test
    void principalCanReadPaginatedStudentDirectoryWithoutImportAccess() throws Exception {
        JsonNode onboarding = onboard("stu-import-principal", "stu-school-principal", "stu-admin-principal@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        AcademicSetup academicSetup = academicSetup(schoolAdminToken, "2026-2027", "Class 1", "A");

        mockMvc.perform(post("/v1/school-admin/students/import")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content(validImportPayload(academicSetup.classLevelId(), academicSetup.sectionId())))
                .andExpect(status().isCreated());

        String principalToken = principalToken(onboarding);

        mockMvc.perform(get("/v1/school-admin/students?page=0&size=1")
                        .header(HttpHeaders.AUTHORIZATION, bearer(principalToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].admissionNumber").value("ADM-1001"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(1))
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.totalPages").value(2));

        mockMvc.perform(get("/v1/school-admin/students?page=0&size=10&search=anaya&status=active")
                        .header(HttpHeaders.AUTHORIZATION, bearer(principalToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].fullName").value("Anaya Rao"))
                .andExpect(jsonPath("$.totalItems").value(1));

        mockMvc.perform(post("/v1/school-admin/students/import")
                        .header(HttpHeaders.AUTHORIZATION, bearer(principalToken))
                        .contentType("application/json")
                        .content(validImportPayload(academicSetup.classLevelId(), academicSetup.sectionId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        String officeToken = officeStaffToken(onboarding);

        mockMvc.perform(get("/v1/school-admin/students?page=0&size=10&search=ishan&status=active")
                        .header(HttpHeaders.AUTHORIZATION, bearer(officeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].fullName").value("Ishan Rao"))
                .andExpect(jsonPath("$.totalItems").value(1));

        mockMvc.perform(post("/v1/school-admin/students/import")
                        .header(HttpHeaders.AUTHORIZATION, bearer(officeToken))
                        .contentType("application/json")
                        .content(validImportPayload(academicSetup.classLevelId(), academicSetup.sectionId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void studentImportValidationReportsTemplateErrorsWithoutPersistingRows() throws Exception {
        JsonNode onboarding = onboard("stu-import-b", "stu-school-b", "stu-admin-b@example.com");
        String token = activateSchoolAdmin(onboarding);
        String schoolId = onboarding.at("/school/id").asText();
        AcademicSetup academicSetup = academicSetup(token, "2026-2027", "Class 1", "A");
        studentRepository.save(new Student(
                tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow(),
                schoolRepository.findById(schoolId).orElseThrow(),
                "ADM-EXIST",
                "Existing Student"
        ));

        mockMvc.perform(post("/v1/school-admin/students/import/validate")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content(invalidImportPayload(academicSetup.classLevelId(), academicSetup.sectionId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.errors[?(@.field == 'fullName')]").exists())
                .andExpect(jsonPath("$.errors[?(@.field == 'dateOfBirth')]").exists())
                .andExpect(jsonPath("$.errors[?(@.field == 'guardianEmail')]").exists())
                .andExpect(jsonPath("$.errors[?(@.message == 'Duplicate admission number in import.')]").exists())
                .andExpect(jsonPath("$.errors[?(@.message == 'Admission number already exists for this school.')]").exists());

        mockMvc.perform(post("/v1/school-admin/students/import")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content(invalidImportPayload(academicSetup.classLevelId(), academicSetup.sectionId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.imported").value(false))
                .andExpect(jsonPath("$.importedCount").value(0));

        assertThat(studentRepository.findBySchoolIdOrderByAdmissionNumberAsc(schoolId))
                .extracting(Student::getAdmissionNumber)
                .containsExactly("ADM-EXIST");
    }

    @Test
    void schoolAdminCannotImportStudentsIntoAnotherSchoolsClassOrSection() throws Exception {
        JsonNode firstOnboarding = onboard("stu-import-c1", "stu-school-c1", "stu-admin-c1@example.com");
        JsonNode secondOnboarding = onboard("stu-import-c2", "stu-school-c2", "stu-admin-c2@example.com");
        String firstToken = activateSchoolAdmin(firstOnboarding);
        String secondToken = activateSchoolAdmin(secondOnboarding);
        AcademicSetup secondAcademicSetup = academicSetup(secondToken, "2026-2027", "Class 2", "B");

        mockMvc.perform(post("/v1/school-admin/students/import/validate")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstToken))
                        .contentType("application/json")
                        .content(validImportPayload(secondAcademicSetup.classLevelId(), secondAcademicSetup.sectionId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(studentRepository.findBySchoolIdOrderByAdmissionNumberAsc(firstOnboarding.at("/school/id").asText()))
                .isEmpty();
        assertThat(studentRepository.findBySchoolIdOrderByAdmissionNumberAsc(secondOnboarding.at("/school/id").asText()))
                .isEmpty();
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
                                    "name": "Student Import Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Student Import School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Student Import Admin",
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

    private String principalToken(JsonNode onboarding) {
        String tenantId = onboarding.at("/tenant/id").asText();
        String schoolId = onboarding.at("/school/id").asText();
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
        School school = schoolRepository.findById(schoolId).orElseThrow();
        UserAccount principal = new UserAccount(
                tenant,
                "principal-students-" + schoolId + "@example.com",
                "Student Review Principal",
                UserRole.PRINCIPAL
        );
        principal.activate(passwordEncoder.encode("StudentPrincipal123!"), "Student Review Principal", Instant.now());
        userAccountRepository.save(principal);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, principal, UserRole.PRINCIPAL, true));
        return jwtAccessTokenService.issueToken(principal.getId(), tenantId, UserRole.PRINCIPAL, schoolId);
    }

    private String officeStaffToken(JsonNode onboarding) {
        String tenantId = onboarding.at("/tenant/id").asText();
        String schoolId = onboarding.at("/school/id").asText();
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
        School school = schoolRepository.findById(schoolId).orElseThrow();
        UserAccount officeStaff = new UserAccount(
                tenant,
                "office-students-" + schoolId + "@example.com",
                "Student Records Office Staff",
                UserRole.OFFICE_STAFF
        );
        officeStaff.activate(passwordEncoder.encode("StudentOffice123!"), "Student Records Office Staff", Instant.now());
        userAccountRepository.save(officeStaff);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, officeStaff, UserRole.OFFICE_STAFF, true));
        return jwtAccessTokenService.issueToken(officeStaff.getId(), tenantId, UserRole.OFFICE_STAFF, schoolId);
    }

    private void acceptInvitation(String token, String password) throws Exception {
        mockMvc.perform(post("/v1/invitations/accept")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "%s",
                                  "displayName": "Student Import Admin"
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
