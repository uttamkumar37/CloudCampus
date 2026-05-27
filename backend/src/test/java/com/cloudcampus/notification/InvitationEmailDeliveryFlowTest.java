package com.cloudcampus.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.cloudcampus.events.outbox.OutboxEvent;
import com.cloudcampus.events.outbox.OutboxEventRepository;
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
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(properties = {
        "cloudcampus.notifications.email.mode=smtp",
        "cloudcampus.notifications.email.app-base-url=https://portal.cloudcampus.test",
        "cloudcampus.notifications.email.from=no-reply@test.cloudcampus"
})
@AutoConfigureMockMvc
class InvitationEmailDeliveryFlowTest {

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
    private NotificationDeliveryRepository notificationDeliveryRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @MockBean
    private JavaMailSender mailSender;

    @Test
    void onboardingSendsInvitationEmailAndKeepsRawTokenOutOfDeliveryPersistenceAndOutbox() throws Exception {
        JsonNode onboarding = onboard("email-onboard", "email-school", "email-admin@example.com");
        String tenantId = onboarding.at("/tenant/id").asText();
        String invitationId = onboarding.at("/schoolAdminInvitation/invitationId").asText();
        String rawToken = onboarding.at("/schoolAdminInvitation/token").asText();

        ArgumentCaptor<SimpleMailMessage> mailCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(mailCaptor.capture());
        SimpleMailMessage mail = mailCaptor.getValue();

        assertThat(mail.getFrom()).isEqualTo("no-reply@test.cloudcampus");
        assertThat(mail.getTo()).containsExactly("email-admin@example.com");
        assertThat(mail.getSubject()).isEqualTo("Set up your CloudCampus account");
        assertThat(mail.getText())
                .contains("https://portal.cloudcampus.test/invitations/accept?token=" + rawToken)
                .contains("SCHOOL_ADMIN")
                .contains("Email School");

        NotificationDelivery delivery = onlyDeliveryFor(invitationId);
        assertThat(delivery.getStatus()).isEqualTo(NotificationDeliveryStatus.SENT);
        assertThat(delivery.getProvider()).isEqualTo("SMTP");
        assertThat(delivery.getRecipientEmail()).isEqualTo("email-admin@example.com");
        assertThat(delivery.getRecipientRole()).isEqualTo("SCHOOL_ADMIN");
        assertThat(delivery.getSentAt()).isNotNull();
        assertThat(delivery.getLastError()).isNull();
        assertThat(delivery.getMaskedRecipient()).doesNotContain(rawToken);

        assertThat(outboxEventRepository.findByTenantId(tenantId))
                .extracting(OutboxEvent::getPayloadJson)
                .allSatisfy(payload -> assertThat(payload)
                        .doesNotContain(rawToken)
                        .doesNotContain("tokenHash")
                        .doesNotContain("/invitations/accept?token="));
        assertThat(outboxEventRepository.findByAggregateTypeAndAggregateId("NotificationDelivery", delivery.getId()))
                .singleElement()
                .satisfies(event -> assertThat(event.getPayloadJson())
                        .contains("\"invitationId\":\"" + invitationId + "\"")
                        .contains("\"maskedRecipient\":\"e***@example.com\"")
                        .doesNotContain(rawToken));
    }

    @Test
    void tenantAdminParentStaffAndStudentInvitationSourcesQueueEmailDeliveries() throws Exception {
        clearInvocations(mailSender);
        TestContext context = createSchoolAdminContext();

        JsonNode tenantAdminInvite = json(mockMvc.perform(post(
                                "/v1/tenant-admin/schools/{schoolId}/admins/invite",
                                context.school().getId()
                        )
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.tenantAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Tenant Invited Admin",
                                  "email": "tenant-invited-admin@example.com"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn());

        JsonNode parentInvite = json(mockMvc.perform(post("/v1/school-admin/parent-links")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.schoolAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "studentId": "%s",
                                  "parentFullName": "Parent Delivery",
                                  "parentEmail": "parent-delivery@example.com",
                                  "parentMobile": "9999999999",
                                  "relationship": "Mother",
                                  "primaryContact": true
                                }
                                """.formatted(context.student().getId())))
                .andExpect(status().isCreated())
                .andReturn());

        JsonNode staffInvite = json(mockMvc.perform(post("/v1/school-admin/staff/provision")
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.schoolAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Teacher Delivery",
                                  "email": "teacher-delivery@example.com",
                                  "role": "TEACHER",
                                  "employeeNumber": "EMP-DELIVERY",
                                  "department": "Academics",
                                  "designation": "Teacher",
                                  "portalLoginRequired": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn());

        JsonNode studentInvite = json(mockMvc.perform(post(
                                "/v1/school-admin/students/{studentId}/login-invitation",
                                context.student().getId()
                        )
                        .header(HttpHeaders.AUTHORIZATION, bearer(context.schoolAdminToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "student-delivery@example.com"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn());

        verify(mailSender, times(4)).send(any(SimpleMailMessage.class));
        List<String> rawTokens = List.of(
                tenantAdminInvite.at("/invitationToken").asText(),
                parentInvite.at("/invitationToken").asText(),
                staffInvite.at("/invitationToken").asText(),
                studentInvite.at("/invitationToken").asText()
        );

        assertThat(notificationDeliveryRepository.findByTenantId(context.tenant().getId()))
                .filteredOn(delivery -> delivery.getStatus() == NotificationDeliveryStatus.SENT)
                .extracting(NotificationDelivery::getRecipientRole)
                .contains("SCHOOL_ADMIN", "PARENT", "TEACHER", "STUDENT");
        assertThat(outboxEventRepository.findByTenantId(context.tenant().getId()))
                .extracting(OutboxEvent::getPayloadJson)
                .allSatisfy(payload -> rawTokens.forEach(token -> assertThat(payload).doesNotContain(token)));
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s-%s",
                                    "name": "Email Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s-%s",
                                    "name": "Email School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Email Admin",
                                    "email": "%s"
                                  }
                                }
                                """.formatted(tenantCode, suffix(), schoolCode, suffix(), email)))
                .andExpect(status().isCreated())
                .andReturn();
        return json(result);
    }

    private TestContext createSchoolAdminContext() {
        String suffix = suffix();
        Tenant tenant = tenantRepository.save(new Tenant("DELIVERY-" + suffix, "Delivery Trust"));
        School school = schoolRepository.save(new School(tenant, "DELIVERY-" + suffix, "Delivery School", true));
        UserAccount schoolAdmin = new UserAccount(
                tenant,
                "delivery-school-admin-" + suffix + "@example.com",
                "Delivery School Admin",
                UserRole.SCHOOL_ADMIN
        );
        schoolAdmin.activate(passwordEncoder.encode("SchoolAdminStrong123!"), "Delivery School Admin", Instant.now());
        userAccountRepository.save(schoolAdmin);
        userSchoolAccessRepository.save(new UserSchoolAccess(
                tenant,
                school,
                schoolAdmin,
                UserRole.SCHOOL_ADMIN,
                true
        ));

        UserAccount tenantAdmin = new UserAccount(
                tenant,
                "delivery-tenant-admin-" + suffix + "@example.com",
                "Delivery Tenant Admin",
                UserRole.TENANT_ADMIN
        );
        tenantAdmin.activate(passwordEncoder.encode("TenantAdminStrong123!"), "Delivery Tenant Admin", Instant.now());
        userAccountRepository.save(tenantAdmin);

        Student student = studentRepository.save(new Student(tenant, school, "ADM-" + suffix, "Delivery Student"));
        return new TestContext(
                tenant,
                school,
                student,
                jwtAccessTokenService.issueToken(schoolAdmin.getId(), tenant.getId(), UserRole.SCHOOL_ADMIN, school.getId()),
                jwtAccessTokenService.issueToken(tenantAdmin.getId(), tenant.getId(), UserRole.TENANT_ADMIN, null)
        );
    }

    private NotificationDelivery onlyDeliveryFor(String invitationId) {
        return notificationDeliveryRepository.findByInvitationId(invitationId)
                .stream()
                .findFirst()
                .orElseThrow();
    }

    private JsonNode json(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private String bearer(String token) {
        return "Bearer " + token;
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

    private String suffix() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private record TestContext(
            Tenant tenant,
            School school,
            Student student,
            String schoolAdminToken,
            String tenantAdminToken
    ) {
    }
}
