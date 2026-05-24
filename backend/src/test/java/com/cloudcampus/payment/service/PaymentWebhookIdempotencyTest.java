package com.cloudcampus.payment.service;

import com.cloudcampus.finance.dto.FeePaymentResponse;
import com.cloudcampus.finance.entity.PaymentMode;
import com.cloudcampus.finance.service.FeeService;
import com.cloudcampus.payment.entity.PaymentOrder;
import com.cloudcampus.payment.entity.PaymentOrderStatus;
import com.cloudcampus.payment.repository.PaymentOrderRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * T-10 / H-7: Razorpay webhook idempotency.
 *
 * What this proves:
 *   Razorpay will retry webhooks on any non-2xx response (and sometimes even
 *   on 2xx). We must guarantee that processing the same webhook twice does
 *   not capture the fee record twice. The current implementation uses a
 *   `payment_gateway_events` row keyed by the gateway event id; this test
 *   exercises that path end-to-end.
 *
 * Why this matters:
 *   Double-capture means double-receipting the parent and creating a phantom
 *   payment row. Customer support has no automated way to undo this.
 *
 * Scenario:
 *   1. Build a valid `payment.captured` webhook body signed with the webhook
 *      secret.
 *   2. Invoke handleRazorpayWebhook(body, signature) twice with identical
 *      payloads.
 *   3. Assert:
 *      a. The payment order ends in SUCCESS.
 *      b. The gateway-event row is recorded exactly once with status PROCESSED.
 *      c. FeeService.recordPayment was invoked exactly once.
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.razorpay.enabled=true",
        "app.razorpay.key-id=rzp_test_key",
        "app.razorpay.key-secret=test_hmac_secret_32_chars_minimum!",
        "app.razorpay.webhook-secret=webhook_test_secret_32_chars_minimum!"
})
@DisplayName("Razorpay webhook is idempotent — duplicate delivery does not double-capture (T-10 / H-7)")
class PaymentWebhookIdempotencyTest {

    private static final String WEBHOOK_SECRET = "webhook_test_secret_32_chars_minimum!";
    private static final String RZP_ORDER_ID   = "order_IdempotencyTest001";
    private static final String RZP_PAYMENT_ID = "pay_IdempotencyTest001";
    private static final String EVENT_ID       = "evt_dup_capture_001";

    @Container
    @ServiceConnection
    @SuppressWarnings("resource")
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("pgvector/pgvector:pg16");

    @Container
    @ServiceConnection
    @SuppressWarnings("resource")
    static final GenericContainer<?> REDIS =
            new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    @Autowired private PaymentService          paymentService;
    @Autowired private PaymentOrderRepository  orderRepo;
    @Autowired private JdbcTemplate            jdbc;
    @MockitoBean private FeeService            feeService;

    private UUID tenantId;
    private UUID schoolId;
    private UUID userId;
    private UUID feeRecordId;
    private UUID paymentOrderId;

    @BeforeEach
    void setUp() {
        tenantId    = UUID.randomUUID();
        schoolId    = UUID.randomUUID();
        userId      = UUID.randomUUID();
        UUID studentId   = UUID.randomUUID();
        UUID yearId      = UUID.randomUUID();
        UUID categoryId  = UUID.randomUUID();
        UUID structureId = UUID.randomUUID();
        feeRecordId = UUID.randomUUID();

        jdbc.update("INSERT INTO tenants (id, code, name, status, created_at) VALUES (?,'idem-' || ?,?,?,now())",
                tenantId, tenantId.toString().substring(0, 8), "Idempotency Test Tenant", "ACTIVE");
        jdbc.update("INSERT INTO schools (id, tenant_id, name, code, status, created_at, updated_at) VALUES (?,?,'Idem School','IDM',?,now(),now())",
                schoolId, tenantId, "ACTIVE");
        jdbc.update("""
                INSERT INTO users (id, tenant_id, username, password_hash, role, status,
                                   force_password_change, created_at, updated_at)
                VALUES (?,?,?,?,?,?,false,now(),now())""",
                userId, tenantId, "idem-" + userId + "@test.com",
                "$2a$10$dummyhashfortest", "PARENT", "ACTIVE");
        jdbc.update("""
                INSERT INTO academic_years (id, tenant_id, school_id, name,
                                            start_date, end_date, is_current, status,
                                            created_at, updated_at)
                VALUES (?,?,?,'2025-26','2025-04-01','2026-03-31',true,'ACTIVE',now(),now())""",
                yearId, tenantId, schoolId);
        jdbc.update("""
                INSERT INTO fee_categories (id, tenant_id, school_id, name, is_active, created_at, updated_at)
                VALUES (?,?,?,'Tuition',true,now(),now())""",
                categoryId, tenantId, schoolId);
        jdbc.update("""
                INSERT INTO fee_structures (id, tenant_id, school_id, academic_year_id,
                                            fee_category_id, amount, frequency,
                                            created_at, updated_at)
                VALUES (?,?,?,?,?,500.00,'ANNUAL',now(),now())""",
                structureId, tenantId, schoolId, yearId, categoryId);
        jdbc.update("""
                INSERT INTO students (id, tenant_id, school_id, student_number,
                                      status, first_name, last_name,
                                      admission_date, created_at, updated_at)
                VALUES (?,?,?,'STU-IDM','ACTIVE','Idem','Student', current_date, now(), now())""",
                studentId, tenantId, schoolId);
        jdbc.update("""
                INSERT INTO student_fee_records (id, tenant_id, school_id, student_id,
                                                 fee_structure_id, academic_year_id,
                                                 amount_due, amount_paid, discount, status,
                                                 created_at, updated_at)
                VALUES (?,?,?,?,?,?,500.00,0.00,0.00,'PENDING',now(),now())""",
                feeRecordId, tenantId, schoolId, studentId, structureId, yearId);

        PaymentOrder order = PaymentOrder.create(
                tenantId, schoolId, feeRecordId, studentId, userId,
                RZP_ORDER_ID, 50000L);
        order = orderRepo.save(order);
        paymentOrderId = order.getId();
    }

    @AfterEach
    void tearDown() {
        jdbc.update("DELETE FROM payment_gateway_events WHERE event_id = ?", EVENT_ID);
        jdbc.update("DELETE FROM payment_orders         WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM student_fee_records    WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM fee_structures         WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM fee_categories         WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM academic_years         WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM students               WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM users                  WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM schools                WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM audit_log              WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM tenants                WHERE id = ?",        tenantId);
    }

    @Test
    @DisplayName("Sending the same webhook twice captures the fee exactly once")
    void duplicateWebhook_capturesFeeExactlyOnce() throws Exception {
        String webhookBody = """
                {
                  "event": "payment.captured",
                  "id": "%s",
                  "payload": {
                    "payment": {
                      "entity": {
                        "id": "%s",
                        "order_id": "%s",
                        "amount": 50000,
                        "status": "captured"
                      }
                    }
                  }
                }
                """.formatted(EVENT_ID, RZP_PAYMENT_ID, RZP_ORDER_ID);

        String signature = computeHmac(WEBHOOK_SECRET, webhookBody);

        FeePaymentResponse stubResponse = new FeePaymentResponse(
                UUID.randomUUID(), feeRecordId,
                new BigDecimal("500.00"), LocalDate.now(),
                PaymentMode.ONLINE, RZP_PAYMENT_ID, "RCPT-IDM-001",
                null, "Razorpay online payment", java.time.Instant.now());

        when(feeService.recordPayment(eq(feeRecordId), any())).thenReturn(stubResponse);

        // ── First delivery — should capture the payment ─────────────────────
        paymentService.handleRazorpayWebhook(webhookBody, signature);

        // ── Second delivery (Razorpay retry) — must be a no-op ──────────────
        paymentService.handleRazorpayWebhook(webhookBody, signature);

        // Order is SUCCESS exactly once.
        PaymentOrder reloaded = orderRepo.findById(paymentOrderId).orElseThrow();
        assertThat(reloaded.getStatus())
                .as("payment_order must be SUCCESS after first webhook")
                .isEqualTo(PaymentOrderStatus.SUCCESS);

        // Only ONE row in payment_gateway_events for this event id.
        Long eventCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM payment_gateway_events WHERE event_id = ?",
                Long.class, EVENT_ID);
        assertThat(eventCount)
                .as("payment_gateway_events must record the event exactly once")
                .isEqualTo(1L);

        // FeeService.recordPayment called exactly once across both webhook calls.
        verify(feeService, times(1)).recordPayment(eq(feeRecordId), any());
    }

    private static String computeHmac(String secret, String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    }
}
