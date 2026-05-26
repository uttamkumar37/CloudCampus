package com.cloudcampus.people.staff;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
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
class StaffProvisioningFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserSchoolAccessRepository userSchoolAccessRepository;

    @Autowired
    private StaffProfileRepository staffProfileRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminProvisionsTeacherInvitationAccessAndTeacherCanBeAssigned() throws Exception {
        JsonNode onboarding = onboard("staff-prov-a", "staff-school-a", "staff-admin-a@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        String tenantId = onboarding.at("/tenant/id").asText();
        String schoolId = onboarding.at("/school/id").asText();

        JsonNode provisionedTeacher = provisionStaff(schoolAdminToken, """
                {
                  "tenantId": "spoofed-tenant",
                  "schoolId": "spoofed-school",
                  "fullName": "Teacher Provisioned",
                  "email": "Teacher.Provisioned@Example.COM",
                  "role": "TEACHER",
                  "employeeNumber": "T-100",
                  "department": "Academics",
                  "designation": "Mathematics Teacher",
                  "portalLoginRequired": true
                }
                """);

        String teacherUserId = provisionedTeacher.at("/userId").asText();
        assertThat(provisionedTeacher.at("/tenantId").asText()).isEqualTo(tenantId);
        assertThat(provisionedTeacher.at("/schoolId").asText()).isEqualTo(schoolId);
        assertThat(provisionedTeacher.at("/email").asText()).isEqualTo("teacher.provisioned@example.com");
        assertThat(provisionedTeacher.at("/role").asText()).isEqualTo("TEACHER");
        assertThat(provisionedTeacher.at("/userStatus").asText()).isEqualTo("INVITED");
        assertThat(provisionedTeacher.at("/schoolAccessGranted").asBoolean()).isTrue();
        assertThat(provisionedTeacher.at("/invitationCreated").asBoolean()).isTrue();
        assertThat(provisionedTeacher.at("/invitationToken").asText()).isNotBlank();

        assertThat(userSchoolAccessRepository.findByUserIdAndSchoolId(teacherUserId, schoolId))
                .get()
                .extracting(access -> access.getRole())
                .isEqualTo(UserRole.TEACHER);
        assertThat(staffProfileRepository.findBySchoolIdAndUserId(schoolId, teacherUserId))
                .get()
                .extracting(StaffProfile::isPortalLoginRequired)
                .isEqualTo(true);

        acceptInvitation(
                provisionedTeacher.at("/invitationToken").asText(),
                "TeacherProvisioned123!",
                "Teacher Provisioned"
        );
        JsonNode teacherLogin = login("teacher.provisioned@example.com", "TeacherProvisioned123!");
        String teacherToken = teacherLogin.at("/accessToken").asText();
        mockMvc.perform(get("/v1/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("TEACHER"))
                .andExpect(jsonPath("$.tenantId").value(tenantId))
                .andExpect(jsonPath("$.activeSchool.schoolId").value(schoolId))
                .andExpect(jsonPath("$.allowedSchools[0].role").value("TEACHER"));

        AcademicSetup setup = academicSetup(schoolAdminToken);
        JsonNode subject = createSubject(schoolAdminToken);
        JsonNode classSubject = assignSubjectToClass(
                schoolAdminToken,
                setup.classLevelId(),
                subject.at("/id").asText()
        );
        mockMvc.perform(post("/v1/school-admin/teacher-assignments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "teacherUserId": "%s",
                                  "classSubjectAssignmentId": "%s"
                                }
                                """.formatted(teacherUserId, classSubject.at("/id").asText())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.teacherUserId").value(teacherUserId))
                .andExpect(jsonPath("$.classLevelId").value(setup.classLevelId()));

        mockMvc.perform(get("/v1/teacher/assignments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].teacherUserId").value(teacherUserId));

        assertThat(auditLogRepository.findByTenantId(tenantId))
                .extracting(auditLog -> auditLog.getAction())
                .contains(AuditAction.STAFF_INVITED, AuditAction.STAFF_PROFILE_CREATED, AuditAction.SCHOOL_ACCESS_GRANTED);
        assertThat(auditLogRepository.findByTenantId(tenantId))
                .extracting(auditLog -> auditLog.getMetadataJson() == null ? "" : auditLog.getMetadataJson())
                .noneMatch(metadata -> metadata.contains(provisionedTeacher.at("/invitationToken").asText()));
    }

    @Test
    void provisioningRejectsUnsafeRolesProfileOnlyRequestsAndNonSchoolAdmins() throws Exception {
        JsonNode onboarding = onboard("staff-prov-b", "staff-school-b", "staff-admin-b@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);

        mockMvc.perform(post("/v1/school-admin/staff/provision")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Bad Role",
                                  "email": "bad-role@example.com",
                                  "role": "SCHOOL_ADMIN",
                                  "portalLoginRequired": true
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));

        mockMvc.perform(post("/v1/school-admin/staff/provision")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Profile Only",
                                  "email": "profile-only@example.com",
                                  "role": "STAFF",
                                  "portalLoginRequired": false
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));

        JsonNode provisionedStaff = provisionStaff(schoolAdminToken, """
                {
                  "fullName": "Staff One",
                  "email": "staff-one@example.com",
                  "role": "STAFF",
                  "employeeNumber": "S-100",
                  "portalLoginRequired": true
                }
                """);
        acceptInvitation(provisionedStaff.at("/invitationToken").asText(), "StaffStrong123!", "Staff One");
        String staffToken = login("staff-one@example.com", "StaffStrong123!").at("/accessToken").asText();

        mockMvc.perform(post("/v1/school-admin/staff/provision")
                        .header(HttpHeaders.AUTHORIZATION, bearer(staffToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Blocked",
                                  "email": "blocked@example.com",
                                  "role": "TEACHER",
                                  "portalLoginRequired": true
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/school-admin/staff/provision")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Duplicate Staff",
                                  "email": "duplicate-staff@example.com",
                                  "role": "STAFF",
                                  "employeeNumber": "S-100",
                                  "portalLoginRequired": true
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    private JsonNode provisionStaff(String token, String body) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/staff/provision")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private AcademicSetup academicSetup(String token) throws Exception {
        JsonNode academicYear = jsonBody(mockMvc.perform(post("/v1/school-admin/academic-years")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "2028-2029",
                                  "startDate": "2028-04-01",
                                  "endDate": "2029-03-31",
                                  "activate": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn());
        JsonNode classLevel = jsonBody(mockMvc.perform(post("/v1/school-admin/classes")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "academicYearId": "%s",
                                  "name": "Class 3",
                                  "displayOrder": 3
                                }
                                """.formatted(academicYear.at("/id").asText())))
                .andExpect(status().isCreated())
                .andReturn());
        return new AcademicSetup(classLevel.at("/id").asText());
    }

    private JsonNode createSubject(String token) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/subjects")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "code": "phy",
                                  "name": "Physics"
                                }
                                """))
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

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "Staff Provisioning Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Staff Provisioning School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Staff Provisioning Admin",
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
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "StaffAdminStrong123!", "Staff Admin");
        return login(email, "StaffAdminStrong123!").at("/accessToken").asText();
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
