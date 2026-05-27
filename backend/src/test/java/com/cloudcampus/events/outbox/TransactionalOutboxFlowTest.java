package com.cloudcampus.events.outbox;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.audit.AuditLogService;
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
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@SpringBootTest
@AutoConfigureMockMvc
class TransactionalOutboxFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private TransactionalOutboxService transactionalOutboxService;

    @Autowired
    private PlatformTransactionManager platformTransactionManager;

    @Test
    void auditRowsCreatePendingOutboxEventsInTheSameBusinessFlow() throws Exception {
        JsonNode onboarding = onboard("outbox-tenant-a", "outbox-school-a", "outbox-admin-a@example.com");
        String tenantId = onboarding.at("/tenant/id").asText();
        String rawInvitationToken = onboarding.at("/schoolAdminInvitation/token").asText();

        var auditLogs = auditLogRepository.findByTenantId(tenantId);
        var outboxEvents = outboxEventRepository.findByTenantId(tenantId);

        assertThat(auditLogs).hasSize(4);
        assertThat(outboxEvents)
                .filteredOn(event -> "AuditLogRecorded".equals(event.getEventType()))
                .hasSize(4)
                .allSatisfy(event -> {
                    assertThat(event.getStatus()).isEqualTo(OutboxEventStatus.PENDING);
                    assertThat(event.getEventType()).isEqualTo("AuditLogRecorded");
                    assertThat(event.getAggregateType()).isEqualTo("AuditLog");
                    assertThat(event.getEventKey()).isEqualTo("audit:" + event.getAggregateId());
                    assertThat(event.getPayloadJson())
                            .contains("\"auditLogId\":\"" + event.getAggregateId() + "\"")
                            .contains("\"tenantId\":\"" + tenantId + "\"")
                            .doesNotContain(rawInvitationToken)
                            .doesNotContain("tokenHash")
                            .doesNotContain("password");
                });
        assertThat(outboxEvents)
                .extracting(OutboxEvent::getPayloadJson)
                .anySatisfy(payload -> assertThat(payload).contains("\"action\":\"TENANT_CREATED\""))
                .anySatisfy(payload -> assertThat(payload).contains("\"action\":\"SCHOOL_CREATED\""))
                .anySatisfy(payload -> assertThat(payload).contains("\"action\":\"SCHOOL_ADMIN_INVITED\""))
                .anySatisfy(payload -> assertThat(payload).contains("\"action\":\"SCHOOL_ACCESS_GRANTED\""));
        assertThat(outboxEvents)
                .filteredOn(event -> "InvitationEmailDeliveryRequested".equals(event.getEventType()))
                .singleElement()
                .satisfies(event -> assertThat(event.getPayloadJson())
                        .contains("\"template\":\"ACCOUNT_INVITATION\"")
                        .doesNotContain(rawInvitationToken)
                        .doesNotContain("/invitations/accept?token="));
    }

    @Test
    void auditAndOutboxRowsRollBackTogether() {
        Tenant tenant = tenantRepository.save(new Tenant("OUTBOXROLLBACK", "Outbox Rollback"));

        TransactionTemplate transactionTemplate = new TransactionTemplate(platformTransactionManager);
        assertThatThrownBy(() -> transactionTemplate.execute(status -> {
            auditLogService.record(
                    tenant.getId(),
                    null,
                    "SYSTEM",
                    null,
                    AuditAction.PASSWORD_CHANGED,
                    "UserAccount",
                    "rolled-back-user",
                    "Rolled back audit",
                    Map.of("marker", "rolled-back-outbox")
            );
            throw new IllegalStateException("Force rollback");
        })).isInstanceOf(IllegalStateException.class);

        assertThat(auditLogRepository.findByTenantId(tenant.getId()))
                .noneSatisfy(auditLog -> assertThat(auditLog.getSummary()).isEqualTo("Rolled back audit"));
        assertThat(outboxEventRepository.findByTenantId(tenant.getId()))
                .noneSatisfy(event -> assertThat(event.getPayloadJson()).contains("rolled-back-outbox"));
    }

    @Test
    void outboxEventLifecycleSupportsIdempotentProducerKeysAndPublishState() {
        Tenant tenant = tenantRepository.save(new Tenant("OUTBOXLIFE", "Outbox Lifecycle"));
        OutboxEvent first = transactionalOutboxService.record(
                tenant.getId(),
                null,
                "Tenant",
                tenant.getId(),
                "TenantLifecycleEvent",
                "tenant-lifecycle:" + tenant.getId(),
                Map.of("tenantId", tenant.getId())
        );
        OutboxEvent duplicate = transactionalOutboxService.record(
                tenant.getId(),
                null,
                "Tenant",
                tenant.getId(),
                "TenantLifecycleEvent",
                "tenant-lifecycle:" + tenant.getId(),
                Map.of("tenantId", tenant.getId(), "ignored", true)
        );

        assertThat(duplicate.getId()).isEqualTo(first.getId());
        transactionalOutboxService.markProcessing(first.getId(), "test-worker");
        OutboxEvent processing = outboxEventRepository.findById(first.getId()).orElseThrow();
        assertThat(processing.getStatus()).isEqualTo(OutboxEventStatus.PROCESSING);
        assertThat(processing.getLockedBy()).isEqualTo("test-worker");

        transactionalOutboxService.markFailed(first.getId(), "temporary downstream error", Instant.now().plusSeconds(60));
        OutboxEvent failed = outboxEventRepository.findById(first.getId()).orElseThrow();
        assertThat(failed.getStatus()).isEqualTo(OutboxEventStatus.FAILED);
        assertThat(failed.getAttempts()).isEqualTo(1);
        assertThat(failed.getLastError()).contains("temporary downstream error");
        assertThat(failed.getNextAttemptAt()).isNotNull();

        transactionalOutboxService.markPublished(first.getId());
        OutboxEvent published = outboxEventRepository.findById(first.getId()).orElseThrow();
        assertThat(published.getStatus()).isEqualTo(OutboxEventStatus.PUBLISHED);
        assertThat(published.getPublishedAt()).isNotNull();
        assertThat(published.getLockedBy()).isNull();
        assertThat(published.getNextAttemptAt()).isNull();
    }

    private JsonNode onboard(String tenantCode, String schoolCode, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/super-admin/tenants/onboard")
                        .header(HttpHeaders.AUTHORIZATION, bearer(superAdminAccessToken()))
                        .contentType("application/json")
                        .content("""
                                {
                                  "tenant": {
                                    "code": "%s",
                                    "name": "Outbox Trust"
                                  },
                                  "firstSchool": {
                                    "code": "%s",
                                    "name": "Outbox School"
                                  },
                                  "primaryAdmin": {
                                    "fullName": "Outbox Admin",
                                    "email": "%s"
                                  }
                                }
                                """.formatted(tenantCode, schoolCode, email)))
                .andExpect(status().isCreated())
                .andReturn();
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
}
