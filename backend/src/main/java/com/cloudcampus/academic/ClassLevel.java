package com.cloudcampus.academic;

import java.time.Instant;
import java.util.UUID;

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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "class_levels",
        uniqueConstraints = @UniqueConstraint(name = "uk_class_levels_year_name", columnNames = {"academic_year_id", "name"})
)
public class ClassLevel {

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
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Instant createdAt;

    protected ClassLevel() {
    }

    public ClassLevel(AcademicYear academicYear, String name, int displayOrder) {
        this.tenant = academicYear.getTenant();
        this.school = academicYear.getSchool();
        this.academicYear = academicYear;
        this.name = name;
        this.displayOrder = displayOrder;
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

    public String getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public School getSchool() {
        return school;
    }

    public AcademicYear getAcademicYear() {
        return academicYear;
    }

    public String getName() {
        return name;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public boolean isActive() {
        return active;
    }
}
