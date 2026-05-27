package com.cloudcampus.people.parent;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.List;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLog;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
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
class ParentLeaveRequestFlowTest {

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
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void linkedParentCreatesLeaveRequestAndSchoolAdminApprovesIt() throws Exception {
        JsonNode onboarding = onboard("par-leave-a", "par-leave-school-a", "par-leave-admin-a@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        Student student = studentRepository.save(new Student(tenant, school, "LEAVE-100", "Leave Child"));
        JsonNode link = linkParent(schoolAdminToken, student.getId(), "leave-parent-a@example.com");
        acceptInvitation(link.at("/invitationToken").asText(), "ParentLeaveStrong123!", "Leave Parent");
        String parentToken = login("leave-parent-a@example.com", "ParentLeaveStrong123!").at("/accessToken").asText();

        JsonNode leaveRequest = jsonBody(mockMvc.perform(post("/v1/parent/children/{studentId}/leave-requests", student.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "startDate": "2026-06-01",
                                  "endDate": "2026-06-03",
                                  "reason": "Family travel"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenantId").value(tenant.getId()))
                .andExpect(jsonPath("$.schoolId").value(school.getId()))
                .andExpect(jsonPath("$.studentId").value(student.getId()))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn());

        mockMvc.perform(get("/v1/parent/children/{studentId}/leave-requests", student.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(leaveRequest.at("/id").asText()));

        mockMvc.perform(get("/v1/school-admin/parent-leave-requests")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(leaveRequest.at("/id").asText()))
                .andExpect(jsonPath("$[0].parentEmail").value("leave-parent-a@example.com"));

        mockMvc.perform(patch("/v1/school-admin/parent-leave-requests/{leaveRequestId}", leaveRequest.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "status": "APPROVED",
                                  "adminNote": "Approved by office"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.decidedByUserId").value(onboarding.at("/schoolAdminInvitation/userId").asText()));

        List<AuditLog> leaveAuditRows = auditLogRepository.findByTenantId(tenant.getId())
                .stream()
                .filter(auditLog -> leaveRequest.at("/id").asText().equals(auditLog.getEntityId()))
                .toList();
        assertThat(leaveAuditRows)
                .extracting(AuditLog::getAction)
                .contains(AuditAction.PARENT_LEAVE_REQUESTED, AuditAction.PARENT_LEAVE_DECIDED);
        assertThat(leaveAuditRows)
                .allSatisfy(auditLog -> assertThat(auditLog.getMetadataJson())
                        .doesNotContain("Family travel")
                        .doesNotContain("Approved by office"));
    }

    @Test
    void parentCannotCreateLeaveRequestForUnlinkedChild() throws Exception {
        JsonNode onboarding = onboard("par-leave-b", "par-leave-school-b", "par-leave-admin-b@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding);
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        Student linkedStudent = studentRepository.save(new Student(tenant, school, "LEAVE-200", "Linked Child"));
        Student unlinkedStudent = studentRepository.save(new Student(tenant, school, "LEAVE-201", "Unlinked Child"));
        JsonNode link = linkParent(schoolAdminToken, linkedStudent.getId(), "leave-parent-b@example.com");
        acceptInvitation(link.at("/invitationToken").asText(), "ParentLeaveStrong123!", "Leave Parent");
        String parentToken = login("leave-parent-b@example.com", "ParentLeaveStrong123!").at("/accessToken").asText();

        mockMvc.perform(post("/v1/parent/children/{studentId}/leave-requests", unlinkedStudent.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "startDate": "2026-06-01",
                                  "endDate": "2026-06-02",
                                  "reason": "Attempted cross-child request"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void schoolAdminCannotDecideLeaveRequestOutsideAssignedSchool() throws Exception {
        JsonNode firstTenant = onboard("par-leave-c1", "par-leave-school-c1", "par-leave-admin-c1@example.com");
        JsonNode secondTenant = onboard("par-leave-c2", "par-leave-school-c2", "par-leave-admin-c2@example.com");
        String firstAdminToken = activateSchoolAdmin(firstTenant);
        String secondAdminToken = activateSchoolAdmin(secondTenant);
        Tenant secondTenantEntity = tenantRepository.findById(secondTenant.at("/tenant/id").asText()).orElseThrow();
        School secondSchool = schoolRepository.findById(secondTenant.at("/school/id").asText()).orElseThrow();
        Student secondStudent = studentRepository.save(new Student(secondTenantEntity, secondSchool, "LEAVE-300", "Second Child"));
        JsonNode link = linkParent(secondAdminToken, secondStudent.getId(), "leave-parent-c@example.com");
        acceptInvitation(link.at("/invitationToken").asText(), "ParentLeaveStrong123!", "Leave Parent");
        String parentToken = login("leave-parent-c@example.com", "ParentLeaveStrong123!").at("/accessToken").asText();

        JsonNode leaveRequest = jsonBody(mockMvc.perform(post("/v1/parent/children/{studentId}/leave-requests", secondStudent.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "startDate": "2026-06-05",
                                  "endDate": "2026-06-05",
                                  "reason": "Medical appointment"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn());

        mockMvc.perform(patch("/v1/school-admin/parent-leave-requests/{leaveRequestId}", leaveRequest.at("/id").asText())
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "status": "REJECTED",
                                  "adminNote": "Spoofed decision"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    private JsonNode linkParent(String schoolAdminToken, String studentId, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/school-admin/parent-links")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "parentFullName": "Leave Parent",
                                  "parentEmail": "%s",
                                  "relationship": "Guardian",
                                  "primaryContact": true
                                }
                                """.formatted(studentId, email)))
                .andExpect(status().isCreated())
                .andReturn();
        return jsonBody(result);
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "Parent Leave Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Parent Leave School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Parent Leave Admin",
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
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), "SchoolAdminStrong123!", "Parent Leave Admin");
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
