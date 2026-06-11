package com.cloudcampus.people.student;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLog;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.identity.auth.invitation.InvitationRepository;
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
class StudentLoginProvisioningFlowTest {

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
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserSchoolAccessRepository userSchoolAccessRepository;

    @Autowired
    private StudentUserLinkRepository studentUserLinkRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminInvitesStudentLoginAndStudentCanAccessOwnProfile() throws Exception {
        JsonNode onboarding = onboard("stu-login-a", "stu-school-a", "stu-login-admin-a@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        Student student = studentRepository.save(new Student(tenant, school, "STU-100", "Asha Student"));

        JsonNode invitation = jsonBody(mockMvc.perform(post(
                                "/v1/school-admin/students/{studentId}/login-invitation",
                                student.getId()
                        )
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenantId": "spoofed-tenant",
                                  "schoolId": "spoofed-school",
                                  "role": "SCHOOL_ADMIN",
                                  "email": "Asha.Student@Example.com"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(student.getId()))
                .andExpect(jsonPath("$.tenantId").value(tenant.getId()))
                .andExpect(jsonPath("$.schoolId").value(school.getId()))
                .andExpect(jsonPath("$.email").value("asha.student@example.com"))
                .andExpect(jsonPath("$.userStatus").value("INVITED"))
                .andExpect(jsonPath("$.schoolAccessGranted").value(true))
                .andExpect(jsonPath("$.invitationCreated").value(true))
                .andExpect(jsonPath("$.invitationToken").isNotEmpty())
                .andReturn());

        String studentUserId = invitation.at("/userId").asText();
        UserAccount studentUser = userAccountRepository.findById(studentUserId).orElseThrow();
        assertThat(studentUser.getRole()).isEqualTo(UserRole.STUDENT);
        assertThat(studentUser.getStatus()).isEqualTo(UserStatus.INVITED);
        assertThat(studentRepository.findById(student.getId())).get()
                .extracting(linked -> linked.getUser().getId())
                .isEqualTo(studentUserId);
        assertThat(userSchoolAccessRepository.findByUserIdAndSchoolId(studentUserId, school.getId()))
                .get()
                .extracting(access -> access.getRole())
                .isEqualTo(UserRole.STUDENT);
        StudentUserLink studentUserLink = studentUserLinkRepository
                .findByUserIdAndStudentId(studentUserId, student.getId())
                .orElseThrow();
        assertThat(studentUserLink.isActive()).isTrue();
        assertThat(invitationRepository.findById(invitation.at("/invitationId").asText())).isPresent();

        Map<AuditAction, AuditLog> auditByAction = auditLogRepository.findByTenantId(tenant.getId())
                .stream()
                .filter(auditLog -> auditLog.getEntityId().equals(student.getId())
                        || auditLog.getEntityId().equals(invitation.at("/invitationId").asText())
                        || auditLog.getMetadataJson().contains(student.getId()))
                .collect(Collectors.toMap(AuditLog::getAction, Function.identity(), (left, right) -> left));
        assertThat(auditByAction).containsKeys(
                AuditAction.STUDENT_LOGIN_INVITED,
                AuditAction.STUDENT_LOGIN_ENABLED,
                AuditAction.SCHOOL_ACCESS_GRANTED
        );
        assertThat(auditByAction.get(AuditAction.STUDENT_LOGIN_INVITED).getMetadataJson())
                .contains("a***@example.com")
                .doesNotContain(invitation.at("/invitationToken").asText())
                .doesNotContain("Asha.Student@Example.com");

        acceptInvitation(invitation.at("/invitationToken").asText(), "StudentStrong123!", "Asha Student");
        JsonNode studentLogin = login("asha.student@example.com", "StudentStrong123!");
        String studentToken = studentLogin.at("/accessToken").asText();

        mockMvc.perform(get("/v1/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.tenantId").value(tenant.getId()))
                .andExpect(jsonPath("$.activeSchool.schoolId").value(school.getId()))
                .andExpect(jsonPath("$.allowedSchools[0].role").value("STUDENT"));

        mockMvc.perform(get("/v1/student/profile")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(student.getId()))
                .andExpect(jsonPath("$.tenantId").value(tenant.getId()))
                .andExpect(jsonPath("$.schoolId").value(school.getId()))
                .andExpect(jsonPath("$.admissionNumber").value("STU-100"))
                .andExpect(jsonPath("$.fullName").value("Asha Student"));

        studentUserLink.deactivate(studentUser);
        studentUserLinkRepository.save(studentUserLink);
        mockMvc.perform(get("/v1/student/profile")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void schoolAdminCannotInviteStudentLoginForAnotherSchoolStudent() throws Exception {
        JsonNode firstTenant = onboard("stu-login-b1", "stu-school-b1", "stu-login-admin-b1@example.com");
        JsonNode secondTenant = onboard("stu-login-b2", "stu-school-b2", "stu-login-admin-b2@example.com");
        String firstAdminToken = activateSchoolAdmin(firstTenant);
        Tenant secondTenantEntity = tenantRepository.findById(secondTenant.at("/tenant/id").asText()).orElseThrow();
        School secondSchool = schoolRepository.findById(secondTenant.at("/school/id").asText()).orElseThrow();
        Student secondTenantStudent = studentRepository.save(new Student(
                secondTenantEntity,
                secondSchool,
                "STU-200",
                "Cross School Student"
        ));

        mockMvc.perform(post("/v1/school-admin/students/{studentId}/login-invitation", secondTenantStudent.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "cross-student@example.com"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(userAccountRepository.findByTenantIdAndEmail(
                firstTenant.at("/tenant/id").asText(),
                "cross-student@example.com"
        )).isEmpty();
    }

    @Test
    void studentLoginProvisioningRejectsWrongExistingRoleAndNonSchoolAdminCaller() throws Exception {
        JsonNode onboarding = onboard("stu-login-c", "stu-school-c", "stu-login-admin-c@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        Student student = studentRepository.save(new Student(tenant, school, "STU-300", "Role Conflict Student"));
        UserAccount parent = new UserAccount(tenant, "existing-parent@example.com", "Existing Parent", UserRole.PARENT);
        parent.activate(passwordEncoder.encode("ParentActive123!"), "Existing Parent", Instant.now());
        userAccountRepository.save(parent);

        mockMvc.perform(post("/v1/school-admin/students/{studentId}/login-invitation", student.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "existing-parent@example.com"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        JsonNode studentInvitation = jsonBody(mockMvc.perform(post(
                                "/v1/school-admin/students/{studentId}/login-invitation",
                                student.getId()
                        )
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "role-conflict-student@example.com"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn());
        acceptInvitation(studentInvitation.at("/invitationToken").asText(), "StudentStrong123!", "Role Conflict Student");
        String studentToken = login("role-conflict-student@example.com", "StudentStrong123!").at("/accessToken").asText();
        Student anotherStudent = studentRepository.save(new Student(tenant, school, "STU-301", "Another Student"));

        mockMvc.perform(post("/v1/school-admin/students/{studentId}/login-invitation", anotherStudent.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "another-student@example.com"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "Student Login Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Student Login School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Student Login Admin",
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
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "SchoolAdminStrong123!", "Student Login Admin");
        return login(email, "SchoolAdminStrong123!").at("/accessToken").asText();
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
}
