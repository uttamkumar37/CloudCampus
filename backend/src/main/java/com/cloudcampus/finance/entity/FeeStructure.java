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
 * Defines the fee amount for a specific category in an academic year,
 * optionally scoped to a class (null class_id = school-wide).
 *
 * Maps to {@code fee_structures} (V23__create_fee_structures.sql).
 */
@Entity
@Table(
        name = "fee_structures",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_fee_structure",
                columnNames = {"school_id", "academic_year_id", "class_id", "fee_category_id"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class FeeStructure {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "academic_year_id", nullable = false, updatable = false)
    private UUID academicYearId;

    /** Null means this structure applies to all classes in the school. */
    @Column(name = "class_id")
    private UUID classId;

    @Column(name = "fee_category_id", nullable = false, updatable = false)
    private UUID feeCategoryId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false, length = 20)
    private FeeFrequency frequency;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected FeeStructure() {}

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    public static FeeStructure create(UUID tenantId,
                                      UUID schoolId,
                                      UUID academicYearId,
                                      UUID classId,
                                      UUID feeCategoryId,
                                      BigDecimal amount,
                                      LocalDate dueDate,
                                      FeeFrequency frequency) {
        FeeStructure s       = new FeeStructure();
        s.tenantId           = tenantId;
        s.schoolId           = schoolId;
        s.academicYearId     = academicYearId;
        s.classId            = classId;
        s.feeCategoryId      = feeCategoryId;
        s.amount             = amount;
        s.dueDate            = dueDate;
        s.frequency          = frequency == null ? FeeFrequency.ANNUAL : frequency;
        return s;
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

    public void updateAmount(BigDecimal amount, LocalDate dueDate) {
        this.amount  = amount;
        this.dueDate = dueDate;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    public UUID         getId()             { return id; }
    public UUID         getTenantId()       { return tenantId; }
    public UUID         getSchoolId()       { return schoolId; }
    public UUID         getAcademicYearId() { return academicYearId; }
    public UUID         getClassId()        { return classId; }
    public UUID         getFeeCategoryId()  { return feeCategoryId; }
    public BigDecimal   getAmount()         { return amount; }
    public LocalDate    getDueDate()        { return dueDate; }
    public FeeFrequency getFrequency()      { return frequency; }
    public Instant      getCreatedAt()      { return createdAt; }
    public Instant      getUpdatedAt()      { return updatedAt; }
}
