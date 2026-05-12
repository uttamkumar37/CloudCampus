package com.cloudcampus.finance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * A single payment transaction against a {@link StudentFeeRecord}.
 * Immutable after creation — payments are never updated, only appended.
 *
 * receipt_number is set by the service layer at creation time (sequential within school).
 *
 * Maps to {@code fee_payments} (V24__create_fee_payments.sql).
 */
@Entity
@Table(name = "fee_payments")
public class FeePayment {

    @Id
    private UUID id;

    @Column(name = "student_fee_record_id", nullable = false, updatable = false)
    private UUID studentFeeRecordId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2, updatable = false)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false, updatable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 20, updatable = false)
    private PaymentMode paymentMode;

    @Column(name = "reference_number", length = 100, updatable = false)
    private String referenceNumber;

    @Column(name = "receipt_number", length = 50, unique = true, updatable = false)
    private String receiptNumber;

    @Column(name = "collected_by_staff_id", updatable = false)
    private UUID collectedByStaffId;

    @Column(name = "remarks", length = 300, updatable = false)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected FeePayment() {}

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    public static FeePayment create(UUID studentFeeRecordId,
                                    BigDecimal amount,
                                    LocalDate paymentDate,
                                    PaymentMode paymentMode,
                                    String referenceNumber,
                                    String receiptNumber,
                                    UUID collectedByStaffId,
                                    String remarks) {
        FeePayment p          = new FeePayment();
        p.studentFeeRecordId  = studentFeeRecordId;
        p.amount              = amount;
        p.paymentDate         = paymentDate == null ? LocalDate.now() : paymentDate;
        p.paymentMode         = paymentMode;
        p.referenceNumber     = referenceNumber;
        p.receiptNumber       = receiptNumber;
        p.collectedByStaffId  = collectedByStaffId;
        p.remarks             = remarks;
        return p;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        id        = UUID.randomUUID();
        createdAt = Instant.now();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    public UUID        getId()                  { return id; }
    public UUID        getStudentFeeRecordId()   { return studentFeeRecordId; }
    public BigDecimal  getAmount()               { return amount; }
    public LocalDate   getPaymentDate()          { return paymentDate; }
    public PaymentMode getPaymentMode()          { return paymentMode; }
    public String      getReferenceNumber()      { return referenceNumber; }
    public String      getReceiptNumber()        { return receiptNumber; }
    public UUID        getCollectedByStaffId()   { return collectedByStaffId; }
    public String      getRemarks()              { return remarks; }
    public Instant     getCreatedAt()            { return createdAt; }
}
