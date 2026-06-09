package com.cloudcampus.operations.finance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
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
    private UserSchoolAccessRepository userSchoolAccessRepository;

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

    @Test
    void financeStaffCanManageFeesWithoutAcademicAdminAccess() throws Exception {
        JsonNode onboarding = onboard("fee-life-d", "fee-school-d", "fee-admin-d@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding, "FeeAdminStrong123!");
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        Student student = studentRepository.save(new Student(tenant, school, "FEE-400", "Finance Student"));

        JsonNode financeStaff = provisionStaff(schoolAdminToken, """
                {
                  "fullName": "Finance One",
                  "email": "finance-one@example.com",
                  "role": "FINANCE_STAFF",
                  "employeeNumber": "F-100",
                  "department": "Finance",
                  "designation": "Accountant",
                  "portalLoginRequired": true
                }
        """);
        assertThat(financeStaff.at("/role").asText()).isEqualTo("FINANCE_STAFF");
        acceptInvitation(financeStaff.at("/invitationToken").asText(), "FinanceStrong123!", "Finance One");
        MvcResult financeLoginStart = mockMvc.perform(post("/v1/auth/login")
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "finance-one@example.com",
                                  "password": "FinanceStrong123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaRequired").value(true))
                .andExpect(jsonPath("$.mfaChallengeId").isNotEmpty())
                .andReturn();
        JsonNode financeChallenge = jsonBody(financeLoginStart);
        JsonNode financeLogin = jsonBody(mockMvc.perform(post("/v1/auth/mfa/verify")
                        .contentType("application/json")
                        .content("""
                                {
                                  "challengeId": "%s",
                                  "code": "%s"
                                }
                                """.formatted(
                                        financeChallenge.at("/mfaChallengeId").asText(),
                                        financeChallenge.at("/mfaCode").asText()
                                )))
                .andExpect(status().isOk())
                .andReturn());
        assertThat(financeLogin.at("/user/role").asText()).isEqualTo("FINANCE_STAFF");
        assertThat(financeLogin.at("/user/activeSchool/schoolId").asText()).isEqualTo(school.getId());
        String financeToken = financeLogin.at("/accessToken").asText();

        JsonNode demand = jsonBody(createFinanceDemand(financeToken, student.getId(), "Finance staff demand", "900.00"));
        String demandId = demand.at("/id").asText();
        mockMvc.perform(get("/v1/finance/fees/demands")
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(demandId));

        mockMvc.perform(post("/v1/finance/fees/demands/{demandId}/payments", demandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "amount": 900.00,
                                  "paymentMethod": "bank transfer",
                                  "paymentReference": "finance-counter-ref"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.payments[0].receiptNumber").isNotEmpty());

        mockMvc.perform(get("/v1/finance/receipts")
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].studentName").value("Finance Student"))
                .andExpect(jsonPath("$.items[0].amount").value(900.00))
                .andExpect(jsonPath("$.items[0].receiptNumber").isNotEmpty());

        mockMvc.perform(get("/v1/finance/reports/summary")
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDemanded").value(900.00))
                .andExpect(jsonPath("$.totalCollected").value(900.00))
                .andExpect(jsonPath("$.receiptCount").value(1));

        mockMvc.perform(get("/v1/finance/reports/collections")
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].receiptCount").value(1));

        mockMvc.perform(post("/v1/school-admin/academic-years")
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "2030-2031",
                                  "startDate": "2030-04-01",
                                  "endDate": "2031-03-31",
                                  "activate": true
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .filteredOn(auditLog -> auditLog.getAction() == AuditAction.FEE_PAYMENT_RECORDED)
                .anySatisfy(auditLog -> {
                    assertThat(auditLog.getActorType()).isEqualTo("FINANCE_STAFF");
                    assertThat(auditLog.getMetadataJson()).contains("\"actorRole\":\"FINANCE_STAFF\"");
                    assertThat(auditLog.getMetadataJson()).doesNotContain("finance-counter-ref");
                });
    }

    @Test
    void financeStaffCannotAccessAnotherSchoolsFeeDemand() throws Exception {
        JsonNode first = onboard("fee-life-e1", "fee-school-e1", "fee-admin-e1@example.com");
        JsonNode second = onboard("fee-life-e2", "fee-school-e2", "fee-admin-e2@example.com");
        String firstAdminToken = activateSchoolAdmin(first, "FeeAdminStrong123!");
        String secondAdminToken = activateSchoolAdmin(second, "FeeAdminStrong123!");
        String firstFinanceToken = financeStaffToken(firstAdminToken, "finance-e1@example.com");
        Tenant secondTenant = tenantRepository.findById(second.at("/tenant/id").asText()).orElseThrow();
        School secondSchool = schoolRepository.findById(second.at("/school/id").asText()).orElseThrow();
        Student secondStudent = studentRepository.save(new Student(secondTenant, secondSchool, "FEE-500", "Other Finance Student"));
        String secondDemandId = jsonBody(createDemand(secondAdminToken, secondStudent.getId(), "Other finance fee", "700.00"))
                .at("/id")
                .asText();

        mockMvc.perform(get("/v1/finance/fees/demands/{demandId}", secondDemandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstFinanceToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/finance/fees/demands/{demandId}/payments", secondDemandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstFinanceToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "amount": 50.00,
                                  "paymentMethod": "cash"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/finance/fees/demands")
                        .header(HttpHeaders.AUTHORIZATION, bearer(firstFinanceToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "description": "Blocked finance fee",
                                  "amount": 50.00,
                                  "dueDate": "2026-06-30"
                                }
                                """.formatted(secondStudent.getId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void financeStaffCannotUseDemandFromAllowedButNonActiveSchoolContext() throws Exception {
        JsonNode onboarding = onboard("fee-life-f", "fee-school-f", "fee-admin-f@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding, "FeeAdminStrong123!");
        String financeToken = financeStaffToken(schoolAdminToken, "finance-f@example.com");
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School activeSchool = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        School otherAllowedSchool = schoolRepository.save(new School(tenant, "FEE-ALT-F", "Finance Alternate School", false));
        UserAccount financeUser = userAccountRepository.findByEmailIgnoreCase("finance-f@example.com").getFirst();
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, otherAllowedSchool, financeUser, UserRole.FINANCE_STAFF, false));
        Student otherStudent = studentRepository.save(new Student(tenant, otherAllowedSchool, "FEE-600", "Allowed Other School Student"));
        FeeDemand otherDemand = feeDemandRepository.save(new FeeDemand(
                tenant,
                otherAllowedSchool,
                otherStudent,
                "Other active-school fee",
                new java.math.BigDecimal("250.00"),
                java.time.LocalDate.of(2026, 7, 1)
        ));

        assertThat(activeSchool.getId()).isNotEqualTo(otherAllowedSchool.getId());
        mockMvc.perform(get("/v1/finance/fees/demands/{demandId}", otherDemand.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(post("/v1/finance/fees/demands/{demandId}/payments", otherDemand.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "amount": 50.00,
                                  "paymentMethod": "cash"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void financePaymentValidationRejectsDuplicateReferenceAndUnsupportedMethod() throws Exception {
        JsonNode onboarding = onboard("fee-life-g", "fee-school-g", "fee-admin-g@example.com");
        String schoolAdminToken = activateSchoolAdmin(onboarding, "FeeAdminStrong123!");
        String financeToken = financeStaffToken(schoolAdminToken, "finance-g@example.com");
        Tenant tenant = tenantRepository.findById(onboarding.at("/tenant/id").asText()).orElseThrow();
        School school = schoolRepository.findById(onboarding.at("/school/id").asText()).orElseThrow();
        Student student = studentRepository.save(new Student(tenant, school, "FEE-700", "Finance Validation Student"));
        String demandId = jsonBody(createFinanceDemand(financeToken, student.getId(), "Validation fee", "300.00"))
                .at("/id")
                .asText();

        mockMvc.perform(post("/v1/finance/fees/demands/{demandId}/payments", demandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "amount": 100.00,
                                  "paymentMethod": "bank transfer",
                                  "paymentReference": "finance-duplicate-ref"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PARTIALLY_PAID"));

        mockMvc.perform(post("/v1/finance/fees/demands/{demandId}/payments", demandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "amount": 50.00,
                                  "paymentMethod": "bank transfer",
                                  "paymentReference": "FINANCE-DUPLICATE-REF"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        mockMvc.perform(post("/v1/finance/fees/demands/{demandId}/payments", demandId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(financeToken))
                        .contentType("application/json")
                        .content("""
                                {
                                  "amount": 50.00,
                                  "paymentMethod": "crypto"
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

    private MvcResult createFinanceDemand(String token, String studentId, String description, String amount) throws Exception {
        return mockMvc.perform(post("/v1/finance/fees/demands")
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

    private String financeStaffToken(String schoolAdminToken, String email) throws Exception {
        JsonNode financeStaff = provisionStaff(schoolAdminToken, """
                {
                  "fullName": "Finance Staff",
                  "email": "%s",
                  "role": "FINANCE_STAFF",
                  "portalLoginRequired": true
                }
                """.formatted(email));
        acceptInvitation(financeStaff.at("/invitationToken").asText(), "FinanceStrong123!", "Finance Staff");
        return login(email, "FinanceStrong123!").at("/accessToken").asText();
    }

    private JsonNode provisionStaff(String token, String body) throws Exception {
        return jsonBody(mockMvc.perform(post("/v1/school-admin/staff/provision")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn());
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
