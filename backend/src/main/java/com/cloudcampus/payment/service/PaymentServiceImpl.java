package com.cloudcampus.payment.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.finance.dto.FeePaymentResponse;
import com.cloudcampus.finance.dto.RecordPaymentRequest;
import com.cloudcampus.finance.entity.PaymentMode;
import com.cloudcampus.finance.entity.StudentFeeRecord;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.finance.service.FeeService;
import com.cloudcampus.payment.config.RazorpayProperties;
import com.cloudcampus.payment.dto.CreatePaymentOrderResponse;
import com.cloudcampus.payment.dto.VerifyPaymentRequest;
import com.cloudcampus.payment.entity.PaymentOrder;
import com.cloudcampus.payment.repository.PaymentOrderRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.UUID;

@Service
class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentOrderRepository    orderRepo;
    private final StudentFeeRecordRepository recordRepo;
    private final StudentRepository         studentRepo;
    private final FeeService                feeService;
    private final RazorpayProperties        razorpay;

    PaymentServiceImpl(PaymentOrderRepository    orderRepo,
                       StudentFeeRecordRepository recordRepo,
                       StudentRepository         studentRepo,
                       FeeService                feeService,
                       RazorpayProperties        razorpay) {
        this.orderRepo   = orderRepo;
        this.recordRepo  = recordRepo;
        this.studentRepo = studentRepo;
        this.feeService  = feeService;
        this.razorpay    = razorpay;
    }

    @Override
    @Transactional
    public CreatePaymentOrderResponse createOrder(UUID feeRecordId, UUID initiatedByUserId) {
        StudentFeeRecord record = recordRepo.findById(feeRecordId)
                .orElseThrow(() -> new NotFoundException("Fee record not found: " + feeRecordId));

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
        Student student = studentRepo.findById(record.getStudentId()).orElse(null);
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

        PaymentOrder order = orderRepo.findById(paymentOrderId)
                .orElseThrow(() -> new NotFoundException("Payment order not found: " + paymentOrderId));

        if (order.getStatus() != com.cloudcampus.payment.entity.PaymentOrderStatus.PENDING) {
            throw new BadRequestException("Payment order is already " + order.getStatus());
        }

        // Verify Razorpay HMAC-SHA256 signature (skipped in dev/test mode)
        if (razorpay.enabled()) {
            verifySignature(request.razorpayOrderId(), request.razorpayPaymentId(), request.razorpaySignature());
        } else {
            log.debug("Razorpay disabled — skipping signature verification for order {}", paymentOrderId);
        }

        // Record the payment via existing FeeService — auto-updates the fee record status
        BigDecimal amount = BigDecimal.valueOf(order.getAmountPaise()).divide(BigDecimal.valueOf(100));
        RecordPaymentRequest paymentReq = new RecordPaymentRequest(
                amount,
                LocalDate.now(),
                PaymentMode.ONLINE,
                request.razorpayPaymentId(),
                null,
                "Razorpay online payment");

        FeePaymentResponse paymentResponse = feeService.recordPayment(order.getFeeRecordId(), paymentReq);

        order.markSuccess(request.razorpayPaymentId(), request.razorpaySignature(),
                paymentResponse.id());
        orderRepo.save(order);

        log.info("Payment captured: paymentOrder={} razorpayPayment={} feeRecord={}",
                paymentOrderId, request.razorpayPaymentId(), order.getFeeRecordId());

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
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpay.keySecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            if (!computed.equalsIgnoreCase(signature)) {
                throw new BadRequestException("Invalid payment signature — possible tampering detected");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Signature verification failed", e);
        }
    }
}
