package com.cloudcampus.student.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.util.UUID;

/**
 * Links a student to one or more parent / guardian user accounts.
 *
 * Rules:
 * - (student_id, parent_user_id) is unique — a user can only be linked once
 *   per student.
 * - At most ONE link per student may have {@code isPrimary = true}; enforced
 *   by a partial unique index in V18.
 * - ON DELETE CASCADE from both students and users keeps data tidy.
 * - The service layer validates that the linked user has role PARENT before
 *   inserting.
 *
 * Maps to {@code student_parent_links} table (V18__create_student_parent_links.sql).
 */
@Entity
@Table(
        name = "student_parent_links",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_student_parent_link",
                columnNames = {"student_id", "parent_user_id"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class StudentParentLink {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(name = "parent_user_id", nullable = false, updatable = false)
    private UUID parentUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship", nullable = false, length = 30)
    private Relationship relationship;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected StudentParentLink() {}

    @PrePersist
    void onPersist() {
        if (id           == null) id           = UUID.randomUUID();
        if (relationship == null) relationship = Relationship.GUARDIAN;
        if (createdAt    == null) createdAt    = Instant.now();
    }

    // -------------------------------------------------------------------------
    // Factory
    // -------------------------------------------------------------------------

    public static StudentParentLink create(UUID tenantId, UUID studentId,
                                            UUID parentUserId,
                                            Relationship relationship,
                                            boolean isPrimary) {
        StudentParentLink link = new StudentParentLink();
        link.tenantId      = tenantId;
        link.studentId     = studentId;
        link.parentUserId  = parentUserId;
        link.relationship  = relationship;
        link.isPrimary     = isPrimary;
        return link;
    }

    // -------------------------------------------------------------------------
    // Setters
    // -------------------------------------------------------------------------

    public void setPrimary(boolean primary)             { this.isPrimary    = primary; }
    public void setRelationship(Relationship rel)       { this.relationship = rel; }

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    public UUID         getId()           { return id; }
    public UUID         getTenantId()     { return tenantId; }
    public UUID         getStudentId()    { return studentId; }
    public UUID         getParentUserId() { return parentUserId; }
    public Relationship getRelationship() { return relationship; }
    public boolean      isPrimary()       { return isPrimary; }
    public Instant      getCreatedAt()    { return createdAt; }
}
