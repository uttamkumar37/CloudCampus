package com.cloudcampus.academic;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
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
class AcademicAssignmentFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminAssignsSubjectToClassAndTeacherSeesOnlyAssignedClass() throws Exception {
        JsonNode onboarding = onboard("aca-assign-a", "aca-assign-school-a", "aca-assign-admin-a@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        String tenantId = onboarding.at("/tenant/id").asText();
        String schoolId = onboarding.at("/school/id").asText();
        AcademicSetup assignedClass = academicSetup(schoolAdminToken, "2026-2027", "Class 1");
        AcademicSetup unassignedClass = academicSetup(schoolAdminToken, "2027-2028", "Class 2");
        JsonNode subject = createSubject(schoolAdminToken, "math", "Mathematics");
        JsonNode classSubject = assignSubjectToClass(
                schoolAdminToken,
                assignedClass.classLevelId(),
                subject.at("/id").asText()
        );
        UserAccount teacher = createTeacher(
                tenantRepository.findById(tenantId).orElseThrow(),
                "teacher-a@example.com",
                "Teacher A"
        );

        JsonNode teacherAssignment = jsonBody(mockMvc.perform(post("/v1/school-admin/teacher-assignments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed-tenant",
                                  "schoolId": "spoofed-school",
                                  "teacherUserId": "%s",
                                  "classSubjectAssignmentId": "%s"
                                }
                                """.formatted(teacher.getId(), classSubject.at("/id").asText())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenantId").value(tenantId))
                .andExpect(jsonPath("$.schoolId").value(schoolId))
                .andExpect(jsonPath("$.teacherUserId").value(teacher.getId()))
                .andExpect(jsonPath("$.classLevelId").value(assignedClass.classLevelId()))
                .andExpect(jsonPath("$.subjectCode").value("MATH"))
                .andReturn());

        mockMvc.perform(get("/v1/school-admin/teacher-assignments")
                        .queryParam("classLevelId", assignedClass.classLevelId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(teacherAssignment.at("/id").asText()));

        String teacherToken = login("teacher-a@example.com", "TeacherStrong123!").at("/accessToken").asText();
        mockMvc.perform(get("/v1/teacher/assignments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].classLevelId").value(assignedClass.classLevelId()))
                .andExpect(jsonPath("$[0].subjectName").value("Mathematics"));

        mockMvc.perform(get("/v1/teacher/assignments")
                        .queryParam("classLevelId", assignedClass.classLevelId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(teacherAssignment.at("/id").asText()));

        mockMvc.perform(get("/v1/teacher/assignments")
                        .queryParam("classLevelId", unassignedClass.classLevelId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(auditLogRepository.findByTenantId(tenantId))
                .extracting(auditLog -> auditLog.getAction())
                .contains(
                        AuditAction.SUBJECT_CREATED,
                        AuditAction.CLASS_SUBJECT_ASSIGNED,
                        AuditAction.TEACHER_ASSIGNED
                );
    }

    @Test
    void schoolAdminCannotCreateCrossSchoolAssignmentsOrAssignNonTeacherUsers() throws Exception {
        JsonNode firstOnboarding = onboard("aca-assign-b1", "aca-assign-school-b1", "aca-assign-admin-b1@example.com");
        JsonNode secondOnboarding = onboard("aca-assign-b2", "aca-assign-school-b2", "aca-assign-admin-b2@example.com");
        String firstToken = activateSchoolAdmin(firstOnboarding);
        String secondToken = activateSchoolAdmin(secondOnboarding);
        AcademicSetup firstClass = academicSetup(firstToken, "2026-2027", "Class 1");
        AcademicSetup secondClass = academicSetup(secondToken, "2026-2027", "Class 2");
        JsonNode firstSubject = createSubject(firstToken, "eng", "English");
        JsonNode secondSubject = createSubject(secondToken, "sci", "Science");
        JsonNode secondClassSubject = assignSubjectToClass(
                secondToken,
                secondClass.classLevelId(),
                secondSubject.at("/id").asText()
        );
        UserAccount firstTenantTeacher = createTeacher(
                tenantRepository.findById(firstOnboarding.at("/tenant/id").asText()).orElseThrow(),
                "teacher-b1@example.com",
                "Teacher B1"
        );

        mockMvc.perform(post("/v1/school-admin/class-subjects")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "subjectId": "%s"
                                }
                                """.formatted(firstClass.classLevelId(), secondSubject.at("/id").asText())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        JsonNode firstClassSubject = assignSubjectToClass(
                firstToken,
                firstClass.classLevelId(),
                firstSubject.at("/id").asText()
        );

        mockMvc.perform(post("/v1/school-admin/teacher-assignments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "teacherUserId": "%s",
                                  "classSubjectAssignmentId": "%s"
                                }
                                """.formatted(firstTenantTeacher.getId(), secondClassSubject.at("/id").asText())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/school-admin/teacher-assignments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(secondToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "teacherUserId": "%s",
                                  "classSubjectAssignmentId": "%s"
                                }
                                """.formatted(firstTenantTeacher.getId(), secondClassSubject.at("/id").asText())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/school-admin/teacher-assignments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "teacherUserId": "%s",
                                  "classSubjectAssignmentId": "%s"
                                }
                                """.formatted(firstOnboarding.at("/schoolAdminInvitation/userId").asText(), firstClassSubject.at("/id").asText())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
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

    private JsonNode assignSubjectToClass(String token, String classLevelId, String subjectId) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/class-subjects")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "classLevelId": "%s",
                                  "subjectId": "%s"
                                }
                                """.formatted(classLevelId, subjectId)))
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
        return new AcademicSetup(classLevel.at("/id").asText());
    }

    private UserAccount createTeacher(Tenant tenant, String email, String displayName) {
        UserAccount teacher = new UserAccount(tenant, email, displayName, UserRole.TEACHER);
        teacher.activate(passwordEncoder.encode("TeacherStrong123!"), displayName, Instant.now());
        return userAccountRepository.save(teacher);
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "Academic Assignment Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Academic Assignment School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Academic Assignment Admin",
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
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "AcademicAssignStrong123!");
        return login(email, "AcademicAssignStrong123!").at("/accessToken").asText();
    }

    private void acceptInvitation(String token, String password) throws Exception {
        mockMvc.perform(post("/v1/invitations/accept")
                        .contentType("application/json")
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "%s",
                                  "displayName": "Academic Assignment Admin"
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

    private record AcademicSetup(String classLevelId) {
    }
}
