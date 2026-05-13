package com.cloudcampus.finance.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.Filter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * An invoice — a specific fee owed by one student, derived from a {@link FeeStructure}.
 * Tracks how much has been paid and the current status.
 *
 * Maps to {@code student_fee_records} (V24__create_fee_payments.sql).
 */
@Entity
@Table(
        name = "student_fee_records",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_student_fee_record",
                columnNames = {"student_id", "fee_structure_id"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class StudentFeeRecord {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(name = "fee_structure_id", nullable = false, updatable = false)
    private UUID feeStructureId;

    @Column(name = "academic_year_id", nullable = false, updatable = false)
    private UUID academicYearId;

    @Column(name = "amount_due", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountDue;

    @Column(name = "amount_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "discount", nullable = false, precision = 12, scale = 2)
    private BigDecimal discount;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private FeeStatus status;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected StudentFeeRecord() {}

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    public static StudentFeeRecord create(UUID tenantId,
                                          UUID schoolId,
                                          UUID studentId,
                                          UUID feeStructureId,
                                          UUID academicYearId,
                                          BigDecimal amountDue,
                                          BigDecimal discount,
                                          LocalDate dueDate,
                                          String notes) {
        StudentFeeRecord r   = new StudentFeeRecord();
        r.tenantId           = tenantId;
        r.schoolId           = schoolId;
        r.studentId          = studentId;
        r.feeStructureId     = feeStructureId;
        r.academicYearId     = academicYearId;
        r.amountDue          = amountDue;
        r.amountPaid         = BigDecimal.ZERO;
        r.discount           = discount == null ? BigDecimal.ZERO : discount;
        r.dueDate            = dueDate;
        r.status             = FeeStatus.PENDING;
        r.notes              = notes;
        return r;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        id        = UUID.randomUUID();
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    private void preUpdate() {
        updatedAt = Instant.now();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Behaviour
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Apply a payment amount and recalculate status.
     *
     * @param paid amount being paid now (must be > 0)
     */
    public void applyPayment(BigDecimal paid) {
        this.amountPaid = this.amountPaid.add(paid);
        recalculateStatus();
    }

    /** Waive this record — no further payment required. */
    public void waive() {
        this.status = FeeStatus.WAIVED;
    }

    private void recalculateStatus() {
        BigDecimal netDue = this.amountDue.subtract(this.discount);
        if (this.amountPaid.compareTo(netDue) >= 0) {
            this.status = FeeStatus.PAID;
        } else if (this.amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            this.status = FeeStatus.PARTIAL;
        } else {
            this.status = FeeStatus.PENDING;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    public UUID       getId()             { return id; }
    public UUID       getTenantId()       { return tenantId; }
    public UUID       getSchoolId()       { return schoolId; }
    public UUID       getStudentId()      { return studentId; }
    public UUID       getFeeStructureId() { return feeStructureId; }
    public UUID       getAcademicYearId() { return academicYearId; }
    public BigDecimal getAmountDue()      { return amountDue; }
    public BigDecimal getAmountPaid()     { return amountPaid; }
    public BigDecimal getDiscount()       { return discount; }
    public LocalDate  getDueDate()        { return dueDate; }
    public FeeStatus  getStatus()         { return status; }
    public String     getNotes()          { return notes; }
    public Instant    getCreatedAt()      { return createdAt; }
    public Instant    getUpdatedAt()      { return updatedAt; }
}
