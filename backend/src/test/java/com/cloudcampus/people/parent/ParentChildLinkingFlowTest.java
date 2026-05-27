package com.cloudcampus.people.parent;

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
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.identity.auth.invitation.InvitationRepository;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
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
class ParentChildLinkingFlowTest {

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
    private InvitationRepository invitationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminLinksNewParentAndParentCanSeeOnlyLinkedChild() throws Exception {
        JsonNode onboarding = onboard("par-link-a", "par-school-a", "par-admin-a@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        Student linkedStudent = studentRepository.save(new Student(tenant, school, "PAR-100", "Meera Sharma"));
        Student unlinkedStudent = studentRepository.save(new Student(tenant, school, "PAR-101", "Nikhil Sharma"));

        JsonNode link = jsonBody(mockMvc.perform(post("/v1/school-admin/parent-links")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "tenantId": "spoofed-tenant",
                                  "schoolId": "spoofed-school",
                                  "parentFullName": "Riya Sharma",
                                  "parentEmail": "Riya.Parent@Example.com",
                                  "parentMobile": "+919876543210",
                                  "relationship": "Mother",
                                  "primaryContact": true
                                }
                                """.formatted(linkedStudent.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(linkedStudent.getId()))
                .andExpect(jsonPath("$.schoolId").value(school.getId()))
                .andExpect(jsonPath("$.parentEmail").value("riya.parent@example.com"))
                .andExpect(jsonPath("$.invitationCreated").value(true))
                .andExpect(jsonPath("$.invitationToken").isNotEmpty())
                .andReturn());

        UserAccount parent = userAccountRepository.findByTenantIdAndEmail(tenant.getId(), "riya.parent@example.com")
                .orElseThrow();
        assertThat(parent.getRole()).isEqualTo(UserRole.PARENT);
        assertThat(parent.getStatus()).isEqualTo(UserStatus.INVITED);
        assertThat(invitationRepository.findById(link.at("/invitationId").asText())).isPresent();

        mockMvc.perform(get("/v1/school-admin/parents")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].parentEmail").value("riya.parent@example.com"))
                .andExpect(jsonPath("$.items[0].studentId").value(linkedStudent.getId()))
                .andExpect(jsonPath("$.items[0].relationship").value("Mother"));

        Map<AuditAction, AuditLog> auditByAction = auditLogRepository.findByTenantId(tenant.getId())
                .stream()
                .filter(auditLog -> auditLog.getEntityId().equals(link.at("/linkId").asText())
                        || auditLog.getEntityId().equals(link.at("/invitationId").asText()))
                .collect(Collectors.toMap(AuditLog::getAction, Function.identity()));
        assertThat(auditByAction).containsKeys(AuditAction.PARENT_INVITED, AuditAction.PARENT_LINKED);
        assertThat(auditByAction.get(AuditAction.PARENT_LINKED).getActorId())
                .isEqualTo(onboarding.at("/schoolAdminInvitation/userId").asText());
        assertThat(auditByAction.get(AuditAction.PARENT_INVITED).getMetadataJson())
                .contains("r***@Example.com".toLowerCase())
                .doesNotContain(link.at("/invitationToken").asText());

        acceptInvitation(link.at("/invitationToken").asText(), "ParentStrongPass123!", "Riya Sharma");
        String parentToken = login("riya.parent@example.com", "ParentStrongPass123!").at("/accessToken").asText();

        mockMvc.perform(get("/v1/parent/children")
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentId").value(linkedStudent.getId()))
                .andExpect(jsonPath("$[0].studentName").value("Meera Sharma"))
                .andExpect(jsonPath("$[0].relationship").value("Mother"));

        mockMvc.perform(get("/v1/parent/children/{studentId}", linkedStudent.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value(linkedStudent.getId()));

        mockMvc.perform(get("/v1/parent/children/{studentId}", unlinkedStudent.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void schoolAdminCannotLinkParentToStudentOutsideAssignedSchool() throws Exception {
        JsonNode firstTenant = onboard("par-link-b1", "par-school-b1", "par-admin-b1@example.com");
        JsonNode secondTenant = onboard("par-link-b2", "par-school-b2", "par-admin-b2@example.com");
        String firstAdminToken = activateSchoolAdmin(firstTenant);
        Tenant secondTenantEntity = tenantRepository.findById(secondTenant.at("/tenant/id").asText()).orElseThrow();
        School secondSchool = schoolRepository.findById(secondTenant.at("/school/id").asText()).orElseThrow();
        Student secondTenantStudent = studentRepository.save(new Student(
                secondTenantEntity,
                secondSchool,
                "PAR-200",
                "Cross Tenant Child"
        ));

        mockMvc.perform(post("/v1/school-admin/parent-links")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "parentFullName": "Cross Parent",
                                  "parentEmail": "cross-parent@example.com",
                                  "relationship": "Father",
                                  "primaryContact": true
                                }
                                """.formatted(secondTenantStudent.getId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(userAccountRepository.findByTenantIdAndEmail(
                firstTenant.at("/tenant/id").asText(),
                "cross-parent@example.com"
        )).isEmpty();
    }

    @Test
    void existingActiveParentIsLinkedWithoutCreatingNewInvitation() throws Exception {
        JsonNode onboarding = onboard("par-link-c", "par-school-c", "par-admin-c@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        Student student = studentRepository.save(new Student(tenant, school, "PAR-300", "Existing Parent Child"));
        UserAccount parent = new UserAccount(tenant, "active-parent@example.com", "Active Parent", UserRole.PARENT);
        parent.activate(passwordEncoder.encode("AlreadyActive123!"), "Active Parent", Instant.now());
        userAccountRepository.save(parent);

        mockMvc.perform(post("/v1/school-admin/parent-links")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "parentFullName": "Ignored Name",
                                  "parentEmail": "active-parent@example.com",
                                  "relationship": "Guardian",
                                  "primaryContact": false
                                }
                                """.formatted(student.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.parentUserId").value(parent.getId()))
                .andExpect(jsonPath("$.invitationCreated").value(false))
                .andExpect(jsonPath("$.invitationToken").isEmpty());
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "Parent Link Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Parent Link School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Parent Link Admin",
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
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "SchoolAdminStrong123!", "Parent Link Admin");
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
