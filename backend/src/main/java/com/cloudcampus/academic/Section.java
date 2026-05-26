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
        name = "sections",
        uniqueConstraints = @UniqueConstraint(name = "uk_sections_class_name", columnNames = {"class_level_id", "name"})
)
public class Section {

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
    @JoinColumn(name = "class_level_id", nullable = false)
    private ClassLevel classLevel;

    @Column(nullable = false, length = 80)
    private String name;

    private Integer capacity;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Instant createdAt;

    protected Section() {
    }

    public Section(ClassLevel classLevel, String name, Integer capacity) {
        this.tenant = classLevel.getTenant();
        this.school = classLevel.getSchool();
        this.classLevel = classLevel;
        this.name = name;
        this.capacity = capacity;
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

    public ClassLevel getClassLevel() {
        return classLevel;
    }

    public String getName() {
        return name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public boolean isActive() {
        return active;
    }
}
