package com.cloudcampus.payment.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.finance.dto.FeePaymentResponse;
import com.cloudcampus.finance.entity.PaymentMode;
import com.cloudcampus.finance.service.FeeService;
import com.cloudcampus.payment.config.RazorpayProperties;
import com.cloudcampus.payment.dto.VerifyPaymentRequest;
import com.cloudcampus.payment.entity.PaymentOrder;
import com.cloudcampus.payment.entity.PaymentOrderStatus;
import com.cloudcampus.payment.repository.PaymentOrderRepository;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.student.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock PaymentOrderRepository     orderRepo;
    @Mock StudentFeeRecordRepository recordRepo;
    @Mock StudentRepository          studentRepo;
    @Mock FeeService                 feeService;

    private static final String TEST_KEY_ID     = "rzp_test_key";
    private static final String TEST_KEY_SECRET = "test_hmac_secret_32_chars_minimum!";

    private PaymentServiceImpl service;

    private static final String RZP_ORDER_ID   = "order_Abc123XyzTest";
    private static final String RZP_PAYMENT_ID = "pay_Def456UvwTest";

    @BeforeEach
    void setUp() {
        // RazorpayProperties is a record — construct with enabled=true for these tests.
        RazorpayProperties props = new RazorpayProperties(TEST_KEY_ID, TEST_KEY_SECRET, true);
        service = new PaymentServiceImpl(orderRepo, recordRepo, studentRepo, feeService, props);
    }

    // ── H-28: HMAC-SHA256 signature verification ──────────────────────────────

    @Test
    void verifyAndCapture_whenSignatureValid_capturesPayment() throws Exception {
        UUID orderId   = UUID.randomUUID();
        UUID feeRecId  = UUID.randomUUID();
        PaymentOrder order = buildPendingOrder(orderId, feeRecId);

        String validSignature = computeHmac(TEST_KEY_SECRET, RZP_ORDER_ID + "|" + RZP_PAYMENT_ID);

        when(orderRepo.findById(orderId)).thenReturn(Optional.of(order));
        when(feeService.recordPayment(eq(feeRecId), any())).thenReturn(stubbedPaymentResponse(feeRecId));
        when(orderRepo.save(any())).thenReturn(order);

        var response = service.verifyAndCapture(new VerifyPaymentRequest(
                orderId.toString(), RZP_ORDER_ID, RZP_PAYMENT_ID, validSignature));

        assertThat(response).isNotNull();
        assertThat(order.getStatus()).isEqualTo(PaymentOrderStatus.SUCCESS);
    }

    @Test
    void verifyAndCapture_whenSignatureTampered_throwsBadRequest() {
        UUID orderId  = UUID.randomUUID();
        UUID feeRecId = UUID.randomUUID();
        PaymentOrder order = buildPendingOrder(orderId, feeRecId);

        when(orderRepo.findById(orderId)).thenReturn(Optional.of(order));

        String tamperedSignature = "0000000000000000000000000000000000000000000000000000000000000000";

        assertThatThrownBy(() -> service.verifyAndCapture(new VerifyPaymentRequest(
                orderId.toString(), RZP_ORDER_ID, RZP_PAYMENT_ID, tamperedSignature)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("signature");
    }

    @Test
    void verifyAndCapture_whenSignatureComputedWithWrongKey_throwsBadRequest() throws Exception {
        UUID orderId  = UUID.randomUUID();
        UUID feeRecId = UUID.randomUUID();
        PaymentOrder order = buildPendingOrder(orderId, feeRecId);

        when(orderRepo.findById(orderId)).thenReturn(Optional.of(order));

        // Signature valid for a different secret — simulates an attacker with a stolen key ID
        String wrongKeySignature = computeHmac("wrong_secret", RZP_ORDER_ID + "|" + RZP_PAYMENT_ID);

        assertThatThrownBy(() -> service.verifyAndCapture(new VerifyPaymentRequest(
                orderId.toString(), RZP_ORDER_ID, RZP_PAYMENT_ID, wrongKeySignature)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("signature");
    }

    @Test
    void verifyAndCapture_whenOrderAlreadyCaptured_throwsBadRequest() {
        UUID orderId   = UUID.randomUUID();
        UUID feeRecId  = UUID.randomUUID();
        PaymentOrder order = buildPendingOrder(orderId, feeRecId);
        order.markSuccess("pay_old", "sig_old", UUID.randomUUID());  // already SUCCESS

        when(orderRepo.findById(orderId)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.verifyAndCapture(new VerifyPaymentRequest(
                orderId.toString(), RZP_ORDER_ID, RZP_PAYMENT_ID, "any")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private PaymentOrder buildPendingOrder(UUID orderId, UUID feeRecordId) {
        PaymentOrder order = PaymentOrder.create(
                UUID.randomUUID(), UUID.randomUUID(), feeRecordId,
                UUID.randomUUID(), UUID.randomUUID(),
                RZP_ORDER_ID, 500_00L
        );
        ReflectionTestUtils.setField(order, "id", orderId);
        return order;
    }

    private static String computeHmac(String secret, String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    }

    private static FeePaymentResponse stubbedPaymentResponse(UUID feeRecordId) {
        return new FeePaymentResponse(
                UUID.randomUUID(), feeRecordId,
                new BigDecimal("500.00"), LocalDate.now(),
                PaymentMode.ONLINE, RZP_PAYMENT_ID, "RCPT-001",
                null, "Razorpay online payment", Instant.now()
        );
    }
}
