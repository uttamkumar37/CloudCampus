package com.cloudcampus.payment.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.finance.dto.FeePaymentResponse;
import com.cloudcampus.payment.dto.CreatePaymentOrderResponse;
import com.cloudcampus.payment.dto.VerifyPaymentRequest;
import com.cloudcampus.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Online payment gateway integration (CC-0903).
 *
 * Flow:
 *   1. Client calls POST payment-order → gets Razorpay order details
 *   2. Client opens Razorpay checkout widget
 *   3. On success, client calls POST payment/verify → payment recorded, fee status updated
 *
 * Two variants of step 1: student self-pay and school-admin-initiated.
 * Step 3 is role-agnostic (any authenticated user can verify their own order).
 */
@RestController
@Tag(name = "Payments", description = "Online payment gateway (Razorpay) — CC-0903")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    // ── Student self-pay ──────────────────────────────────────────────────────

    @Operation(summary = "Create payment order (student)",
               description = "Student initiates online payment for their own outstanding fee record.")
    @PostMapping("/v1/student/fee-records/{recordId}/payment-order")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<CreatePaymentOrderResponse>> createOrderStudent(
            @PathVariable UUID recordId) {
        UUID userId = RequestContext.getUserId();
        CreatePaymentOrderResponse body = service.createOrder(recordId, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    // ── School-admin-initiated payment (e.g., on behalf of a student at the counter) ─

    @Operation(summary = "Create payment order (school admin)",
               description = "School admin initiates a Razorpay order for a student's fee record.")
    @PostMapping("/v1/school-admin/fee-records/{recordId}/payment-order")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<CreatePaymentOrderResponse>> createOrderAdmin(
            @PathVariable UUID recordId) {
        UUID userId = RequestContext.getUserId();
        CreatePaymentOrderResponse body = service.createOrder(recordId, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    // ── Verify + capture (any authenticated role) ─────────────────────────────

    @Operation(summary = "Verify payment and record it",
               description = "Verifies the Razorpay HMAC signature and records the payment "
                           + "against the fee record. Idempotent if already captured.")
    @PostMapping("/v1/payment/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FeePaymentResponse>> verify(
            @Valid @RequestBody VerifyPaymentRequest request) {
        FeePaymentResponse body = service.verifyAndCapture(request);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    // ── Gateway webhook (signed public endpoint) ─────────────────────────────

    @Operation(summary = "Razorpay payment webhook",
               description = "Processes signed Razorpay payment events idempotently.")
    @PostMapping("/v1/payment/webhooks/razorpay")
    public ResponseEntity<Void> razorpayWebhook(
            @RequestHeader("X-Razorpay-Signature") String signature,
            @RequestBody String rawBody) {
        service.handleRazorpayWebhook(rawBody, signature);
        return ResponseEntity.noContent().build();
    }
}
