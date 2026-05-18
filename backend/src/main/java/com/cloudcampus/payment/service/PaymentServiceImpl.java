package com.cloudcampus.payment.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.finance.dto.FeePaymentResponse;
import com.cloudcampus.finance.dto.RecordPaymentRequest;
import com.cloudcampus.finance.entity.PaymentMode;
import com.cloudcampus.finance.entity.StudentFeeRecord;
import com.cloudcampus.finance.repository.FeePaymentRepository;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.finance.service.FeeService;
import com.cloudcampus.payment.config.RazorpayProperties;
import com.cloudcampus.payment.dto.CreatePaymentOrderResponse;
import com.cloudcampus.payment.dto.VerifyPaymentRequest;
import com.cloudcampus.payment.entity.PaymentOrder;
import com.cloudcampus.payment.entity.PaymentOrderStatus;
import com.cloudcampus.payment.repository.PaymentOrderRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

@Service
class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentOrderRepository    orderRepo;
    private final StudentFeeRecordRepository recordRepo;
    private final StudentRepository         studentRepo;
    private final FeePaymentRepository      paymentRepo;
    private final FeeService                feeService;
    private final RazorpayProperties        razorpay;
    private final JdbcTemplate              jdbcTemplate;
    private final String                    razorpayWebhookSecret;
    private final Duration                  orderExpiry;

    PaymentServiceImpl(PaymentOrderRepository    orderRepo,
                       StudentFeeRecordRepository recordRepo,
                       StudentRepository         studentRepo,
                       FeePaymentRepository      paymentRepo,
                       FeeService                feeService,
                       RazorpayProperties        razorpay,
                       JdbcTemplate              jdbcTemplate,
                       @Value("${app.razorpay.webhook-secret:}") String razorpayWebhookSecret,
                       @Value("${app.razorpay.order-expiry-minutes:30}") long orderExpiryMinutes) {
        this.orderRepo             = orderRepo;
        this.recordRepo            = recordRepo;
        this.studentRepo           = studentRepo;
        this.paymentRepo           = paymentRepo;
        this.feeService            = feeService;
        this.razorpay              = razorpay;
        this.jdbcTemplate          = jdbcTemplate;
        this.razorpayWebhookSecret = razorpayWebhookSecret != null ? razorpayWebhookSecret.trim() : "";
        this.orderExpiry           = Duration.ofMinutes(Math.max(1L, orderExpiryMinutes));
    }

    @Override
    @Transactional
    public CreatePaymentOrderResponse createOrder(UUID feeRecordId, UUID initiatedByUserId) {
        UUID tenantId = currentTenantId();
        StudentFeeRecord record = recordRepo.findByIdAndTenantId(feeRecordId, tenantId)
                .orElseThrow(() -> new NotFoundException("Fee record not found: " + feeRecordId));
        assertMayUseRecord(record, initiatedByUserId);

        BigDecimal balance = record.getAmountDue()
                .subtract(record.getDiscount())
                .subtract(record.getAmountPaid());

        if (balance.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("No balance due on this fee record");
        }

        // Amount in paise (1 INR = 100 paise)
        long amountPaise = balance.multiply(BigDecimal.valueOf(100)).longValue();

        String gatewayOrderId;
        if (razorpay.enabled()) {
            gatewayOrderId = createRazorpayOrder(amountPaise, feeRecordId);
        } else {
            // Dev/test mode — generate a mock order ID without hitting Razorpay
            gatewayOrderId = "mock_order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            log.debug("Razorpay disabled — using mock gateway order id: {}", gatewayOrderId);
        }

        PaymentOrder order = PaymentOrder.create(
                record.getTenantId(), record.getSchoolId(), feeRecordId,
                record.getStudentId(), initiatedByUserId,
                gatewayOrderId, amountPaise);
        orderRepo.save(order);

        // Prefill student contact details for the Razorpay modal
        Student student = studentRepo.findByIdAndTenantId(record.getStudentId(), tenantId).orElse(null);
        String prefillName    = student != null ? student.getFirstName() + " " + student.getLastName() : "";
        String prefillContact = student != null && student.getPhone() != null ? student.getPhone() : "";

        return new CreatePaymentOrderResponse(
                order.getId(),
                gatewayOrderId,
                amountPaise,
                "INR",
                razorpay.keyId(),
                prefillName,
                "",
                prefillContact);
    }

    @Override
    @Transactional
    public FeePaymentResponse verifyAndCapture(VerifyPaymentRequest request) {
        UUID paymentOrderId = UUID.fromString(request.paymentOrderId());
        UUID tenantId = currentTenantId();
        UUID userId = currentUserId();

        PaymentOrder order = orderRepo.findByIdAndTenantIdForUpdate(paymentOrderId, tenantId)
                .orElseThrow(() -> new NotFoundException("Payment order not found: " + paymentOrderId));
        assertMayVerifyOrder(order, userId);

        if (!order.getGatewayOrderId().equals(request.razorpayOrderId())) {
            throw new BadRequestException("Payment gateway order mismatch");
        }

        if (order.getStatus() == PaymentOrderStatus.SUCCESS) {
            if (!request.razorpayPaymentId().equals(order.getGatewayPaymentId()) || order.getFeePaymentId() == null) {
                throw new BadRequestException("Payment order is already captured");
            }
            return paymentRepo.findById(order.getFeePaymentId())
                    .map(FeePaymentResponse::from)
                    .orElseThrow(() -> new NotFoundException("Captured fee payment not found"));
        }

        if (order.getStatus() != PaymentOrderStatus.PENDING) {
            throw new BadRequestException("Payment order is already " + order.getStatus());
        }

        // Verify Razorpay HMAC-SHA256 signature (skipped in dev/test mode)
        if (razorpay.enabled()) {
            verifySignature(request.razorpayOrderId(), request.razorpayPaymentId(), request.razorpaySignature());
        } else {
            log.debug("Razorpay disabled — skipping signature verification for order {}", paymentOrderId);
        }

        return captureOrder(order, request.razorpayPaymentId(), request.razorpaySignature(), true);
    }

    @Override
    @Transactional
    public void handleRazorpayWebhook(String rawBody, String signature) {
        if (rawBody == null || rawBody.isBlank()) {
            throw new BadRequestException("Webhook body is required");
        }
        verifyWebhookSignature(rawBody, signature);

        JSONObject event = new JSONObject(rawBody);
        String eventType = event.optString("event", "");
        if (eventType.isBlank()) {
            throw new BadRequestException("Webhook event type is required");
        }

        JSONObject payload = event.optJSONObject("payload");
        JSONObject paymentWrapper = payload != null ? payload.optJSONObject("payment") : null;
        JSONObject payment = paymentWrapper != null ? paymentWrapper.optJSONObject("entity") : null;
        if (payment == null) {
            markGatewayEvent(eventId(event, rawBody), eventType, rawBody, "IGNORED", null);
            return;
        }

        String eventId = eventId(event, rawBody);
        if (!recordGatewayEvent(eventId, eventType, rawBody)) {
            log.info("Duplicate Razorpay webhook ignored [eventId={}, eventType={}]", eventId, eventType);
            return;
        }

        if (!"payment.captured".equals(eventType)) {
            markGatewayEvent(eventId, "IGNORED", null);
            return;
        }

        String gatewayOrderId = payment.optString("order_id", "");
        String gatewayPaymentId = payment.optString("id", "");
        long amountPaise = payment.optLong("amount", -1L);
        if (gatewayOrderId.isBlank() || gatewayPaymentId.isBlank()) {
            markGatewayEvent(eventId, "FAILED", "Missing payment/order id");
            throw new BadRequestException("Webhook payment/order id is required");
        }

        PaymentOrder order = orderRepo.findByGatewayOrderIdForUpdate(gatewayOrderId)
                .orElseThrow(() -> new NotFoundException("Payment order not found for gateway order: " + gatewayOrderId));
        if (amountPaise >= 0 && amountPaise != order.getAmountPaise()) {
            markGatewayEvent(eventId, "FAILED", "Gateway amount mismatch");
            throw new BadRequestException("Webhook payment amount mismatch");
        }

        String previousTenant = RequestContext.getTenantId();
        String previousSchool = RequestContext.getSchoolId();
        UUID previousUser = RequestContext.getUserId();
        try {
            RequestContext.setTenantId(order.getTenantId().toString());
            RequestContext.setSchoolId(order.getSchoolId().toString());
            RequestContext.setUserId(order.getInitiatedBy());
            captureOrder(order, gatewayPaymentId, signature, false);
            markGatewayEvent(eventId, "PROCESSED", null);
        } catch (RuntimeException e) {
            markGatewayEvent(eventId, "FAILED", e.getMessage());
            throw e;
        } finally {
            restoreRequestContext(previousTenant, previousSchool, previousUser);
        }
    }

    private FeePaymentResponse captureOrder(PaymentOrder order,
                                            String gatewayPaymentId,
                                            String gatewaySignature,
                                            boolean enforceExpiry) {
        if (order.getStatus() == PaymentOrderStatus.SUCCESS) {
            if (!gatewayPaymentId.equals(order.getGatewayPaymentId()) || order.getFeePaymentId() == null) {
                throw new BadRequestException("Payment order is already captured");
            }
            return paymentRepo.findById(order.getFeePaymentId())
                    .map(FeePaymentResponse::from)
                    .orElseThrow(() -> new NotFoundException("Captured fee payment not found"));
        }

        if (order.getStatus() != PaymentOrderStatus.PENDING) {
            throw new BadRequestException("Payment order is already " + order.getStatus());
        }
        if (enforceExpiry && isExpired(order)) {
            order.markExpired();
            orderRepo.save(order);
            throw new BadRequestException("Payment order has expired");
        }

        BigDecimal amount = BigDecimal.valueOf(order.getAmountPaise()).divide(BigDecimal.valueOf(100));
        RecordPaymentRequest paymentReq = new RecordPaymentRequest(
                amount,
                LocalDate.now(),
                PaymentMode.ONLINE,
                gatewayPaymentId,
                null,
                "Razorpay online payment");

        FeePaymentResponse paymentResponse = feeService.recordPayment(order.getFeeRecordId(), paymentReq);

        order.markSuccess(gatewayPaymentId, gatewaySignature, paymentResponse.id());
        orderRepo.save(order);

        log.info("Payment captured: paymentOrder={} razorpayPayment={} feeRecord={}",
                order.getId(), gatewayPaymentId, order.getFeeRecordId());

        return paymentResponse;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String createRazorpayOrder(long amountPaise, UUID feeRecordId) {
        try {
            RazorpayClient client = new RazorpayClient(razorpay.keyId(), razorpay.keySecret());
            JSONObject opts = new JSONObject();
            opts.put("amount",   amountPaise);
            opts.put("currency", "INR");
            opts.put("receipt",  "fee_" + feeRecordId.toString().substring(0, 8));
            Order rzpOrder = client.orders.create(opts);
            return rzpOrder.get("id");
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay order", e);
        }
    }

    private void verifySignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            if (!hmacMatches(payload, signature, razorpay.keySecret())) {
                throw new BadRequestException("Invalid payment signature — possible tampering detected");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Signature verification failed", e);
        }
    }

    private void verifyWebhookSignature(String rawBody, String signature) {
        String secret = !razorpayWebhookSecret.isBlank() ? razorpayWebhookSecret : razorpay.keySecret();
        if (secret == null || secret.isBlank() || !hmacMatches(rawBody, signature, secret)) {
            throw new BadRequestException("Invalid webhook signature");
        }
    }

    private boolean hmacMatches(String payload, String suppliedSignature, String secret) {
        if (payload == null || suppliedSignature == null || secret == null || secret.isBlank()) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            byte[] expected = computed.getBytes(StandardCharsets.UTF_8);
            byte[] supplied = suppliedSignature.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8);
            return MessageDigest.isEqual(expected, supplied);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean recordGatewayEvent(String eventId, String eventType, String rawBody) {
        int inserted = jdbcTemplate.update("""
                INSERT INTO payment_gateway_events (gateway, event_id, event_type, payload_hash, status)
                VALUES ('RAZORPAY', ?, ?, ?, 'RECEIVED')
                ON CONFLICT (gateway, event_id) DO NOTHING
                """, eventId, eventType, sha256(rawBody));
        return inserted == 1;
    }

    private void markGatewayEvent(String eventId, String status, String errorMessage) {
        jdbcTemplate.update("""
                UPDATE payment_gateway_events
                   SET status = ?,
                       error_message = ?,
                       processed_at = NOW()
                 WHERE gateway = 'RAZORPAY'
                   AND event_id = ?
                """, status, errorMessage, eventId);
    }

    private void markGatewayEvent(String eventId,
                                  String eventType,
                                  String rawBody,
                                  String status,
                                  String errorMessage) {
        recordGatewayEvent(eventId, eventType, rawBody);
        markGatewayEvent(eventId, status, errorMessage);
    }

    private String eventId(JSONObject event, String rawBody) {
        String eventId = event.optString("id", "");
        return !eventId.isBlank() ? eventId : "payload:" + sha256(rawBody);
    }

    private String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash webhook payload", e);
        }
    }

    private boolean isExpired(PaymentOrder order) {
        return order.getCreatedAt() != null
                && order.getCreatedAt().plus(orderExpiry).isBefore(Instant.now());
    }

    private UUID currentTenantId() {
        String tenantId = RequestContext.getTenantId();
        if (tenantId == null) {
            throw new ForbiddenException("Tenant context is required for payments");
        }
        return UUID.fromString(tenantId);
    }

    private UUID currentUserId() {
        UUID userId = RequestContext.getUserId();
        if (userId == null) {
            throw new ForbiddenException("Authenticated user is required for payments");
        }
        return userId;
    }

    private void assertMayUseRecord(StudentFeeRecord record, UUID initiatedByUserId) {
        if (hasRole("STUDENT")) {
            Student student = studentRepo.findByIdAndTenantId(record.getStudentId(), record.getTenantId())
                    .orElseThrow(() -> new NotFoundException("Student not found for fee record"));
            if (student.getUserId() == null || !student.getUserId().equals(initiatedByUserId)) {
                throw new ForbiddenException("Students can only pay their own fee records");
            }
            return;
        }

        if (hasRole("SCHOOL_ADMIN")) {
            UUID schoolId = currentSchoolId();
            if (!record.getSchoolId().equals(schoolId)) {
                throw new ForbiddenException("School admin cannot access this fee record");
            }
        }
    }

    private void assertMayVerifyOrder(PaymentOrder order, UUID userId) {
        if (hasRole("STUDENT")) {
            if (!order.getInitiatedBy().equals(userId)) {
                throw new ForbiddenException("Students can only verify their own payment orders");
            }
            return;
        }

        if (hasRole("SCHOOL_ADMIN")) {
            UUID schoolId = currentSchoolId();
            if (!order.getSchoolId().equals(schoolId)) {
                throw new ForbiddenException("School admin cannot access this payment order");
            }
        }
    }

    private UUID currentSchoolId() {
        String schoolId = RequestContext.getSchoolId();
        if (schoolId == null) {
            throw new ForbiddenException("School context is required for this payment operation");
        }
        return UUID.fromString(schoolId);
    }

    private void restoreRequestContext(String tenantId, String schoolId, UUID userId) {
        RequestContext.clearAll();
        if (tenantId != null) {
            RequestContext.setTenantId(tenantId);
        }
        if (schoolId != null) {
            RequestContext.setSchoolId(schoolId);
        }
        if (userId != null) {
            RequestContext.setUserId(userId);
        }
    }

    private boolean hasRole(String role) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        String authority = "ROLE_" + role;
        return auth.getAuthorities().stream()
                .anyMatch(a -> authority.equals(a.getAuthority()));
    }
}
