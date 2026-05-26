package com.cloudcampus.operations.finance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import com.cloudcampus.audit.AuditAction;
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
class FeeLifecycleFlowTest {

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
    private FeeDemandRepository feeDemandRepository;

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void schoolAdminCreatesDemandParentPaysAndStudentSeesOwnFees() throws Exception {
        JsonNode onboarding = onboard("fee-life-a", "fee-school-a", "fee-admin-a@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding, "FeeAdminStrong123!");
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        Student student = studentRepository.save(new Student(tenant, school, "FEE-100", "Fee Student"));

        JsonNode demand = jsonBody(createDemand(schoolAdminToken, student.getId(), "Term 1 fee", "1200.00"));
        String demandId = demand.at("/id").asText();
        assertThat(demand.at("/tenantId").asText()).isEqualTo(tenant.getId());
        assertThat(demand.at("/schoolId").asText()).isEqualTo(school.getId());
        assertThat(demand.at("/studentId").asText()).isEqualTo(student.getId());
        assertThat(demand.at("/status").asText()).isEqualTo("OPEN");
        assertThat(demand.at("/amountDue").decimalValue()).isEqualByComparingTo("1200.00");
        assertThat(demand.at("/amountPaid").decimalValue()).isEqualByComparingTo("0.00");

        mockMvc.perform(get("/v1/school-admin/fees/demands")
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(demandId));

        JsonNode partialPayment = jsonBody(mockMvc.perform(post("/v1/school-admin/fees/demands/{demandId}/payments", demandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(schoolAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "amount": 400.00,
                                  "paymentMethod": "cash",
                                  "paymentReference": "cash-counter-1"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PARTIALLY_PAID"))
                .andExpect(jsonPath("$.amountPaid").value(400.00))
                .andExpect(jsonPath("$.payments[0].receiptNumber").isNotEmpty())
                .andReturn());
        assertThat(partialPayment.at("/payments/0/paymentMethod").asText()).isEqualTo("CASH");

        JsonNode parentLink = linkParent(schoolAdminToken, student.getId(), "fee-parent-a@example.com");
        acceptInvitation(parentLink.at("/invitationToken").asText(), "ParentFeeStrong123!", "Fee Parent");
        String parentToken = login("fee-parent-a@example.com", "ParentFeeStrong123!").at("/accessToken").asText();

        mockMvc.perform(get("/v1/parent/children/{studentId}/fees", student.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(demandId))
                .andExpect(jsonPath("$[0].status").value("PARTIALLY_PAID"));

        mockMvc.perform(post("/v1/parent/children/{studentId}/fees/{demandId}/payments", student.getId(), demandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "amount": 800.00,
                                  "paymentMethod": "online",
                                  "paymentReference": "gateway-ref-123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.amountPaid").value(1200.00))
                .andExpect(jsonPath("$.payments[1].receiptNumber").isNotEmpty());

        JsonNode studentInvitation = inviteStudentLogin(schoolAdminToken, student.getId(), "fee-student-a@example.com");
        acceptInvitation(studentInvitation.at("/invitationToken").asText(), "StudentFeeStrong123!", "Fee Student");
        String studentToken = login("fee-student-a@example.com", "StudentFeeStrong123!").at("/accessToken").asText();

        mockMvc.perform(get("/v1/student/fees")
                        .header(HttpHeaders.AUTHORIZATION, bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(demandId))
                .andExpect(jsonPath("$[0].status").value("PAID"))
                .andExpect(jsonPath("$[0].payments.length()").value(2));

        assertThat(feeDemandRepository.findById(demandId)).get()
                .extracting(FeeDemand::getStatus)
                .isEqualTo(FeeDemandStatus.PAID);
        assertThat(feePaymentRepository.findByDemandIdOrderByPaidAtAsc(demandId)).hasSize(2);
        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .extracting(auditLog -> auditLog.getAction())
                .contains(AuditAction.FEE_DEMAND_CREATED, AuditAction.FEE_PAYMENT_RECORDED, AuditAction.RECEIPT_ISSUED);
        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .extracting(auditLog -> auditLog.getMetadataJson() == null ? "" : auditLog.getMetadataJson())
                .noneMatch(metadata -> metadata.contains("gateway-ref-123"));
    }

    @Test
    void schoolAdminCannotCreateReadOrPayAnotherSchoolsFeeDemand() throws Exception {
        JsonNode first = onboard("fee-life-b1", "fee-school-b1", "fee-admin-b1@example.com");
        JsonNode second = onboard("fee-life-b2", "fee-school-b2", "fee-admin-b2@example.com");
        String firstAdminToken = activateSchoolAdmin(first, "FeeAdminStrong123!");
        String secondAdminToken = activateSchoolAdmin(second, "FeeAdminStrong123!");
        Tenant secondTenant = tenantRepository.findById(second.at("/tenant/id").asText()).orElseThrow();
        School secondSchool = schoolRepository.findById(second.at("/school/id").asText()).orElseThrow();
        Student secondStudent = studentRepository.save(new Student(secondTenant, secondSchool, "FEE-200", "Other Fee Student"));
        String secondDemandId = jsonBody(createDemand(secondAdminToken, secondStudent.getId(), "Other fee", "500.00"))
                .at("/id")
                .asText();

        mockMvc.perform(post("/v1/school-admin/fees/demands")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "description": "Blocked fee",
                                  "amount": 100.00,
                                  "dueDate": "2026-06-30"
                                }
                                """.formatted(secondStudent.getId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/v1/school-admin/fees/demands/{demandId}", secondDemandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/school-admin/fees/demands/{demandId}/payments", secondDemandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstAdminToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "amount": 100.00,
                                  "paymentMethod": "cash"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void parentCannotAccessUnlinkedChildOrPayMismatchedDemand() throws Exception {
        JsonNode onboarding = onboard("fee-life-c", "fee-school-c", "fee-admin-c@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding, "FeeAdminStrong123!");
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        Student linkedStudent = studentRepository.save(new Student(tenant, school, "FEE-300", "Linked Fee Student"));
        Student unlinkedStudent = studentRepository.save(new Student(tenant, school, "FEE-301", "Unlinked Fee Student"));
        String unlinkedDemandId = jsonBody(createDemand(schoolAdminToken, unlinkedStudent.getId(), "Unlinked fee", "300.00"))
                .at("/id")
                .asText();
        String linkedDemandId = jsonBody(createDemand(schoolAdminToken, linkedStudent.getId(), "Linked fee", "300.00"))
                .at("/id")
                .asText();

        JsonNode parentLink = linkParent(schoolAdminToken, linkedStudent.getId(), "fee-parent-c@example.com");
        acceptInvitation(parentLink.at("/invitationToken").asText(), "ParentFeeStrong123!", "Fee Parent");
        String parentToken = login("fee-parent-c@example.com", "ParentFeeStrong123!").at("/accessToken").asText();

        mockMvc.perform(get("/v1/parent/children/{studentId}/fees", unlinkedStudent.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/parent/children/{studentId}/fees/{demandId}/payments", linkedStudent.getId(), unlinkedDemandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "amount": 100.00,
                                  "paymentMethod": "online"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/parent/children/{studentId}/fees/{demandId}/payments", linkedStudent.getId(), linkedDemandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(parentToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "amount": 301.00,
                                  "paymentMethod": "online"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }

    private MvcResult createDemand(String token, String studentId, String description, String amount) throws Exception {
        return mockMvc.perform(post("/v1/school-admin/fees/demands")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType("application/json")
                .content("""
                        {
                          "studentId": "%s",
                          "description": "%s",
                          "amount": %s,
                          "dueDate": "2026-06-30"
                        }
                        """.formatted(studentId, description, amount)))
                .andExpect(status().isCreated())
                .andReturn();
    }

    private JsonNode linkParent(String token, String studentId, String parentEmail) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/parent-links")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "parentFullName": "Fee Parent",
                                  "parentEmail": "%s",
                                  "relationship": "Guardian",
                                  "primaryContact": true
                                }
                                """.formatted(studentId, parentEmail)))
                .andExpect(status().isCreated())
                .andReturn());
    }

    private JsonNode inviteStudentLogin(String token, String studentId, String email) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/students/{studentId}/login-invitation", studentId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "%s"
                                }
                                """.formatted(email)))
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
                                    "name": "Fee Lifecycle Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Fee Lifecycle School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Fee Admin",
                                    "email": "%s"
                                  }
                                }
                                """.formatted(tenantCode, schoolCode, email)))
                .andExpect(status().isCreated())
                .andReturn();
        return jsonBody(result);
    }

    private String activateSchoolAdmin(JsonNode onboarding, String password) throws Exception {
        String email = onboarding.at("/schoolAdminInvitation/email").asText();
        acceptInvitation(onboarding.at("/schoolAdminInvitation/token").asText(), password, "Fee Admin");
        return login(email, password).at("/accessToken").asText();
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
}
