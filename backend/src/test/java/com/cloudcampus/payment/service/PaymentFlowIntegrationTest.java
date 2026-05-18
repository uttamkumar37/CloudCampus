package com.cloudcampus.payment.service;

import com.cloudcampus.finance.dto.FeePaymentResponse;
import com.cloudcampus.finance.entity.PaymentMode;
import com.cloudcampus.finance.service.FeeService;
import com.cloudcampus.payment.dto.VerifyPaymentRequest;
import com.cloudcampus.payment.entity.PaymentOrder;
import com.cloudcampus.payment.entity.PaymentOrderStatus;
import com.cloudcampus.payment.repository.PaymentOrderRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
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
import static org.mockito.Mockito.when;

/**
 * L-18: Integration test for the Razorpay payment capture flow.
 *
 * Verifies that after a valid webhook verification call, the payment_orders
 * row transitions to SUCCESS in the real PostgreSQL DB.
 *
 * FeeService is mocked to isolate the payment capture path without needing
 * the full fee-ledger setup.
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "app.razorpay.enabled=true",
    "app.razorpay.key-id=rzp_test_key",
    "app.razorpay.key-secret=test_hmac_secret_32_chars_minimum!"
})
@DisplayName("Payment Flow — payment_order reaches SUCCESS after valid HMAC verification (L-18)")
class PaymentFlowIntegrationTest {

    private static final String KEY_SECRET   = "test_hmac_secret_32_chars_minimum!";
    private static final String RZP_ORDER_ID  = "order_IntegrationTest001";
    private static final String RZP_PAYMENT_ID = "pay_IntegrationTest001";

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

    @Autowired private PaymentService         paymentService;
    @Autowired private PaymentOrderRepository orderRepo;
    @Autowired private JdbcTemplate           jdbc;

    @MockitoBean private FeeService           feeService;

    // IDs set up in @BeforeEach and used across the test
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
        UUID studentId    = UUID.randomUUID();
        UUID yearId       = UUID.randomUUID();
        UUID categoryId   = UUID.randomUUID();
        UUID structureId  = UUID.randomUUID();
        feeRecordId = UUID.randomUUID();

        // 1. tenant
        jdbc.update("""
                INSERT INTO tenants (id, code, name, status, created_at)
                VALUES (?,'pay-test-' || ?,?,?,now())
                """,
                tenantId, tenantId.toString().substring(0, 8),
                "Payment Test Tenant", "ACTIVE");

        // 2. school
        jdbc.update("""
                INSERT INTO schools (id, tenant_id, name, code, status, created_at, updated_at)
                VALUES (?,?,'Pay Test School','PAY',?,now(),now())
                """, schoolId, tenantId, "ACTIVE");

        // 3. user (initiated_by FK)
        jdbc.update("""
                INSERT INTO users (id, tenant_id, username, password_hash, role, status,
                                   force_password_change, created_at, updated_at)
                VALUES (?,?,?,?,?,?,false,now(),now())
                """,
                userId, tenantId, "paytest-" + userId + "@test.com",
                "$2a$10$dummyhashfortest", "PARENT", "ACTIVE");

        // 4. academic_year
        jdbc.update("""
                INSERT INTO academic_years (id, tenant_id, school_id, name,
                                            start_date, end_date, is_current, status,
                                            created_at, updated_at)
                VALUES (?,?,?,'2025-26','2025-04-01','2026-03-31',true,'ACTIVE',now(),now())
                """, yearId, tenantId, schoolId);

        // 5. fee_category
        jdbc.update("""
                INSERT INTO fee_categories (id, tenant_id, school_id, name, is_active,
                                            created_at, updated_at)
                VALUES (?,?,?,'Tuition',true,now(),now())
                """, categoryId, tenantId, schoolId);

        // 6. fee_structure
        jdbc.update("""
                INSERT INTO fee_structures (id, tenant_id, school_id, academic_year_id,
                                            fee_category_id, amount, frequency,
                                            created_at, updated_at)
                VALUES (?,?,?,?,?,500.00,'ANNUAL',now(),now())
                """, structureId, tenantId, schoolId, yearId, categoryId);

        // 7. student
        jdbc.update("""
                INSERT INTO students (id, tenant_id, school_id, student_number,
                                      status, first_name, last_name,
                                      admission_date, created_at, updated_at)
                VALUES (?,?,?,'STU-001','ACTIVE','Test','Student',
                        current_date, now(), now())
                """, studentId, tenantId, schoolId);

        // 8. student_fee_record
        jdbc.update("""
                INSERT INTO student_fee_records (id, tenant_id, school_id, student_id,
                                                  fee_structure_id, academic_year_id,
                                                  amount_due, amount_paid, discount,
                                                  status, created_at, updated_at)
                VALUES (?,?,?,?,?,?,500.00,0.00,0.00,'PENDING',now(),now())
                """,
                feeRecordId, tenantId, schoolId, studentId,
                structureId, yearId);

        // 9. payment_order (PENDING) — insert via JPA so the ID is known
        PaymentOrder order = PaymentOrder.create(
                tenantId, schoolId, feeRecordId,
                studentId, userId,
                RZP_ORDER_ID, 50000L);
        order = orderRepo.save(order);
        paymentOrderId = order.getId();
    }

    @AfterEach
    void tearDown() {
        // Delete in reverse FK order
        jdbc.update("DELETE FROM payment_orders  WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM student_fee_records WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM fee_structures   WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM fee_categories   WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM academic_years   WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM students         WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM users            WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM schools          WHERE tenant_id = ?", tenantId);
        jdbc.update("DELETE FROM tenants          WHERE id = ?",        tenantId);
    }

    @Test
    @DisplayName("payment_orders.status is SUCCESS in DB after valid HMAC verification")
    void verifyAndCapture_withValidSignature_persists_SUCCESS_status() throws Exception {
        String validSig = computeHmac(KEY_SECRET, RZP_ORDER_ID + "|" + RZP_PAYMENT_ID);

        FeePaymentResponse stubResponse = new FeePaymentResponse(
                UUID.randomUUID(), feeRecordId,
                new BigDecimal("500.00"), LocalDate.now(),
                PaymentMode.ONLINE, RZP_PAYMENT_ID, "RCPT-PAY-001",
                null, "Razorpay online payment", java.time.Instant.now());

        when(feeService.recordPayment(eq(feeRecordId), any())).thenReturn(stubResponse);

        paymentService.verifyAndCapture(new VerifyPaymentRequest(
                paymentOrderId.toString(),
                RZP_ORDER_ID,
                RZP_PAYMENT_ID,
                validSig));

        PaymentOrder reloaded = orderRepo.findById(paymentOrderId).orElseThrow();
        assertThat(reloaded.getStatus())
                .as("payment_order must be SUCCESS in DB after successful HMAC verification")
                .isEqualTo(PaymentOrderStatus.SUCCESS);
        assertThat(reloaded.getGatewayPaymentId())
                .isEqualTo(RZP_PAYMENT_ID);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private static String computeHmac(String secret, String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    }
}
