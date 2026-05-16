package com.cloudcampus.payment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Tracks each Razorpay payment order lifecycle (CC-0903).
 *
 * Lifecycle: PENDING → SUCCESS or FAILED.
 * A new row is created for each checkout attempt — retries are separate rows.
 */
@Entity
@Table(name = "payment_orders")
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "fee_record_id", nullable = false, updatable = false)
    private UUID feeRecordId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(name = "initiated_by", nullable = false, updatable = false)
    private UUID initiatedBy;

    @Column(name = "gateway", nullable = false, updatable = false, length = 20)
    private String gateway = "RAZORPAY";

    @Column(name = "gateway_order_id", nullable = false, updatable = false, unique = true, length = 100)
    private String gatewayOrderId;

    @Column(name = "amount_paise", nullable = false, updatable = false)
    private long amountPaise;

    @Column(name = "currency", nullable = false, updatable = false, length = 3)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentOrderStatus status = PaymentOrderStatus.PENDING;

    @Column(name = "gateway_payment_id", length = 100)
    private String gatewayPaymentId;

    @Column(name = "gateway_signature", length = 300)
    private String gatewaySignature;

    @Column(name = "fee_payment_id")
    private UUID feePaymentId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected PaymentOrder() {}

    @PreUpdate
    void onUpdate() { updatedAt = Instant.now(); }

    // ── Factory ───────────────────────────────────────────────────────────────

    public static PaymentOrder create(UUID tenantId, UUID schoolId, UUID feeRecordId,
                                      UUID studentId, UUID initiatedBy,
                                      String gatewayOrderId, long amountPaise) {
        PaymentOrder o = new PaymentOrder();
        o.tenantId       = tenantId;
        o.schoolId       = schoolId;
        o.feeRecordId    = feeRecordId;
        o.studentId      = studentId;
        o.initiatedBy    = initiatedBy;
        o.gatewayOrderId = gatewayOrderId;
        o.amountPaise    = amountPaise;
        return o;
    }

    // ── State transitions ─────────────────────────────────────────────────────

    public void markSuccess(String gatewayPaymentId, String gatewaySignature, UUID feePaymentId) {
        this.status           = PaymentOrderStatus.SUCCESS;
        this.gatewayPaymentId = gatewayPaymentId;
        this.gatewaySignature = gatewaySignature;
        this.feePaymentId     = feePaymentId;
    }

    public void markFailed() {
        this.status = PaymentOrderStatus.FAILED;
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID              getId()             { return id; }
    public UUID              getTenantId()       { return tenantId; }
    public UUID              getSchoolId()       { return schoolId; }
    public UUID              getFeeRecordId()    { return feeRecordId; }
    public UUID              getStudentId()      { return studentId; }
    public UUID              getInitiatedBy()    { return initiatedBy; }
    public String            getGateway()        { return gateway; }
    public String            getGatewayOrderId() { return gatewayOrderId; }
    public long              getAmountPaise()    { return amountPaise; }
    public String            getCurrency()       { return currency; }
    public PaymentOrderStatus getStatus()        { return status; }
    public String            getGatewayPaymentId(){ return gatewayPaymentId; }
    public String            getGatewaySignature(){ return gatewaySignature; }
    public UUID              getFeePaymentId()   { return feePaymentId; }
    public Instant           getCreatedAt()      { return createdAt; }
    public Instant           getUpdatedAt()      { return updatedAt; }
}
