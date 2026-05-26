package com.cloudcampus.operations.finance;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "fee_payments")
public class FeePayment {

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
    @JoinColumn(name = "demand_id", nullable = false)
    private FeeDemand demand;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recorded_by_user_id", nullable = false)
    private UserAccount recordedBy;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 40)
    private String paymentMethod;

    @Column(length = 120)
    private String paymentReference;

    @Column(nullable = false, length = 80)
    private String receiptNumber;

    @Column(nullable = false)
    private Instant paidAt;

    protected FeePayment() {
    }

    public FeePayment(
            Tenant tenant,
            School school,
            FeeDemand demand,
            Student student,
            UserAccount recordedBy,
            BigDecimal amount,
            String paymentMethod,
            String paymentReference,
            String receiptNumber,
            Instant paidAt
    ) {
        this.tenant = tenant;
        this.school = school;
        this.demand = demand;
        this.student = student;
        this.recordedBy = recordedBy;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.paymentReference = paymentReference;
        this.receiptNumber = receiptNumber;
        this.paidAt = paidAt;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
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

    public FeeDemand getDemand() {
        return demand;
    }

    public Student getStudent() {
        return student;
    }

    public UserAccount getRecordedBy() {
        return recordedBy;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public Instant getPaidAt() {
        return paidAt;
    }
}
