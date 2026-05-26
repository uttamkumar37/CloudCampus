package com.cloudcampus.operations.finance;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.cloudcampus.people.student.Student;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "fee_demands")
public class FeeDemand {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 180)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amountDue;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private FeeDemandStatus status = FeeDemandStatus.OPEN;

    @Column(nullable = false)
    private Instant createdAt;

    protected FeeDemand() {
    }

    public FeeDemand(Tenant tenant, School school, Student student, String description, BigDecimal amountDue, LocalDate dueDate) {
        this.tenant = tenant;
        this.school = school;
        this.student = student;
        this.description = description;
        this.amountDue = amountDue;
        this.dueDate = dueDate;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public void recordPayment(BigDecimal amount) {
        amountPaid = amountPaid.add(amount);
        if (amountPaid.compareTo(amountDue) >= 0) {
            status = FeeDemandStatus.PAID;
        } else if (amountPaid.signum() > 0) {
            status = FeeDemandStatus.PARTIALLY_PAID;
        } else {
            status = FeeDemandStatus.OPEN;
        }
    }

    public BigDecimal outstandingAmount() {
        return amountDue.subtract(amountPaid).max(BigDecimal.ZERO);
    }

    public String getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public School getSchool() {
        return school;
    }

    public Student getStudent() {
        return student;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmountDue() {
        return amountDue;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public FeeDemandStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
