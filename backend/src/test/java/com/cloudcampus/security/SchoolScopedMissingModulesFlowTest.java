package com.cloudcampus.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.ClassLevelRepository;
import com.cloudcampus.academic.Section;
import com.cloudcampus.academic.SectionRepository;
import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
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
class SchoolScopedMissingModulesFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private ClassLevelRepository classLevelRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void timetableDocumentsAndWebsiteContentAreSchoolScopedAtRouteLevel() throws Exception {
        JsonNode first = onboard("missing-sec-a", "missing-school-a", "missing-admin-a@example.com");
        JsonNode second = onboard("missing-sec-b", "missing-school-b", "missing-admin-b@example.com");
        String firstAdminToken = activateSchoolAdmin(first);
        String secondAdminToken = activateSchoolAdmin(second);
        AcademicSetup firstSetup = academicSetup(firstAdminToken, "2026-2027", "Class A");
        AcademicSetup secondSetup = academicSetup(secondAdminToken, "2026-2027", "Class B");
        JsonNode firstSubject = createSubject(firstAdminToken, "math-a", "Mathematics A");
        JsonNode secondSubject = createSubject(secondAdminToken, "math-b", "Mathematics B");
        School secondSchool = schoolRepository.findById(second.at("/school/id").asText()).orElseThrow();
        Student secondStudent = studentRepository.save(new Student(
                secondSchool.getTenant(),
                secondSchool,
                "MISS-200",
                "Second School Student",
                secondSetup.classLevel(),
                secondSetup.section(),
                "1",
                null,
                null,
                null,
                null,
                null,
                Instant.now()
        ));

        JsonNode firstTimetable = createTimetableEntry(
                firstAdminToken,
                firstSetup.classLevelId(),
                firstSetup.sectionId(),
                firstSubject.at("/id").asText()
        );
        JsonNode secondTimetable = createTimetableEntry(
                secondAdminToken,
                secondSetup.classLevelId(),
                secondSetup.sectionId(),
                secondSubject.at("/id").asText()
        );
        assertThat(firstTimetable.at("/schoolId").asText()).isEqualTo(first.at("/school/id").asText());
        mockMvc.perform(post("/v1/school-admin/timetable")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content(timetableBody(
                                secondSetup.classLevelId(),
                                secondSetup.sectionId(),
                                secondSubject.at("/id").asText()
                        )))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/school-admin/timetable/{entryId}", secondTimetable.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        JsonNode firstDocument = createDocument(
                firstAdminToken,
                firstSetup.classLevelId(),
                null,
                "first-school-policy.pdf"
        );
        JsonNode secondDocument = createDocument(
                secondAdminToken,
                secondSetup.classLevelId(),
                secondStudent.getId(),
                "second-school-policy.pdf"
        );
        assertThat(firstDocument.at("/schoolId").asText()).isEqualTo(first.at("/school/id").asText());
        mockMvc.perform(post("/v1/school-admin/documents")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content(documentBody(
                                secondSetup.classLevelId(),
                                secondStudent.getId(),
                                "blocked.pdf"
                        )))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(get("/v1/school-admin/documents/{documentId}", secondDocument.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        JsonNode firstPage = createWebsitePage(firstAdminToken, "about-first", "About First School");
        JsonNode secondPage = createWebsitePage(secondAdminToken, "about-second", "About Second School");
        assertThat(firstPage.at("/schoolId").asText()).isEqualTo(first.at("/school/id").asText());
        mockMvc.perform(get("/v1/school-admin/website/pages/{pageId}", secondPage.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mockMvc.perform(post("/v1/school-admin/website/pages/{pageId}/publish", secondPage.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/v1/school-admin/timetable")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(firstTimetable.at("/id").asText()));
        mockMvc.perform(get("/v1/school-admin/documents")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(firstDocument.at("/id").asText()));
        mockMvc.perform(post("/v1/school-admin/website/pages/{pageId}/publish", firstPage.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        assertThat(auditLogRepository.findByTenantId(first.at("/tenant/id").asText()))
                .extracting(auditLog -> auditLog.getAction())
                .contains(
                        AuditAction.TIMETABLE_ENTRY_CREATED,
                        AuditAction.DOCUMENT_CREATED,
                        AuditAction.WEBSITE_PAGE_CREATED,
                        AuditAction.WEBSITE_PAGE_PUBLISHED
                );
    }

    private JsonNode createTimetableEntry(String token, String classLevelId, String sectionId, String subjectId) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/timetable")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content(timetableBody(classLevelId, sectionId, subjectId)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private String timetableBody(String classLevelId, String sectionId, String subjectId) {
        return """
                {
                  "tenantId": "spoofed",
                  "schoolId": "spoofed",
                  "classLevelId": "%s",
                  "sectionId": "%s",
                  "subjectId": "%s",
                  "weekday": "MONDAY",
                  "startTime": "09:00:00",
                  "endTime": "09:40:00",
                  "title": "Math period"
                }
                """.formatted(classLevelId, sectionId, subjectId);
    }

    private JsonNode createDocument(String token, String classLevelId, String studentId, String fileName) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/documents")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content(documentBody(classLevelId, studentId, fileName)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private String documentBody(String classLevelId, String studentId, String fileName) {
        return """
                {
                  "tenantId": "spoofed",
                  "schoolId": "spoofed",
                  "classLevelId": "%s",
                  "studentId": %s,
                  "title": "Policy document",
                  "fileName": "%s",
                  "storageKey": "school-documents/%s"
                }
                """.formatted(
                classLevelId,
                studentId == null ? "null" : "\"" + studentId + "\"",
                fileName,
                fileName
        );
    }

    private JsonNode createWebsitePage(String token, String slug, String title) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/website/pages")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed",
                                  "schoolId": "spoofed",
                                  "slug": "%s",
                                  "title": "%s",
                                  "body": "Public website content body."
                                }
                                """.formatted(slug, title)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private JsonNode createSubject(String token, String code, String name) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/subjects")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "code": "%s",
                                  "name": "%s"
                                }
                                """.formatted(code, name)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private AcademicSetup academicSetup(String token, String academicYearName, String className) throws Exception {
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
                                  "name": "A",
                                  "capacity": 40
                                }
                                """.formatted(classLevel.at("/id").asText())))
                .andExpect(status().isCreated())
                .andReturn());
        return new AcademicSetup(
                classLevel.at("/id").asText(),
                section.at("/id").asText(),
                classLevelRepository.findById(classLevel.at("/id").asText()).orElseThrow(),
                sectionRepository.findById(section.at("/id").asText()).orElseThrow()
        );
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "Missing Module Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Missing Module School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Missing Module Admin",
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
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "MissingStrong123!", "Missing Module Admin");
        return login(email, "MissingStrong123!").at("/accessToken").asText();
    }

    private void acceptInvitation(String token, String password, String displayName) throws Exception {
        mockMvc.perform(post("/v1/invitations/accept")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "%s",
                                  "displayName": "%s"
                                }
                                """.formatted(token, password, displayName)))
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
                                """.formatted(login.at("/mfaChallengeId").asText(), login.at("/mfaCode").asText())))
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

    private record AcademicSetup(String classLevelId, String sectionId, ClassLevel classLevel, Section section) {
    }
}
