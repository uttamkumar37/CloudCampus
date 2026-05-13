package com.cloudcampus.school.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.Filter;
import com.cloudcampus.common.tenant.TenantFilter;

import java.time.Instant;
import java.util.UUID;

/**
 * A Section is a subdivision of a ClassRoom (e.g. Grade 5 / Section A).
 *
 * Rules:
 * - Section name is unique within a class (enforced by DB constraint).
 * - capacity controls maximum student enrollment; enforced at admission time.
 *
 * Maps to {@code sections} table (V13__create_sections.sql).
 */
@Entity
@Table(
        name = "sections",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_sections_class_name",
                columnNames = {"class_id", "name"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class Section {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "class_id", nullable = false, updatable = false)
    private UUID classId;

    // Typically a letter: "A", "B", "C" — or a theme: "Red", "Blue".
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    // Maximum number of students allowed in this section.
    @Column(name = "capacity", nullable = false)
    private short capacity;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Section() {}

    @PrePersist
    void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (capacity  == 0)   capacity   = 40;
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID    getId()        { return id; }
    public UUID    getTenantId()  { return tenantId; }
    public UUID    getSchoolId()  { return schoolId; }
    public UUID    getClassId()   { return classId; }
    public String  getName()      { return name; }
    public short   getCapacity()  { return capacity; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    // ── Mutators ──────────────────────────────────────────────────────────────

    public void setName(String name)       { this.name     = name; }
    public void setCapacity(short capacity){ this.capacity = capacity; }

    // ── Factory ───────────────────────────────────────────────────────────────

    public static Section create(UUID tenantId, UUID schoolId, UUID classId,
                                 String name, short capacity) {
        Section s = new Section();
        s.tenantId = tenantId;
        s.schoolId = schoolId;
        s.classId  = classId;
        s.name     = name;
        s.capacity = capacity;
        return s;
    }
}
