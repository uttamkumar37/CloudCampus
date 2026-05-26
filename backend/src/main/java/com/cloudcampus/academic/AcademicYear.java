package com.cloudcampus.academic;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "academic_years",
        uniqueConstraints = @UniqueConstraint(name = "uk_academic_years_school_name", columnNames = {"school_id", "name"})
)
public class AcademicYear {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private AcademicYearStatus status = AcademicYearStatus.UPCOMING;

    @Column(nullable = false)
    private Instant createdAt;

    protected AcademicYear() {
    }

    public AcademicYear(Tenant tenant, School school, String name, LocalDate startDate, LocalDate endDate) {
        this.tenant = tenant;
        this.school = school;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
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

    public void activate() {
        this.status = AcademicYearStatus.ACTIVE;
    }

    public void close() {
        this.status = AcademicYearStatus.CLOSED;
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

    public String getName() {
        return name;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public AcademicYearStatus getStatus() {
        return status;
    }
}
