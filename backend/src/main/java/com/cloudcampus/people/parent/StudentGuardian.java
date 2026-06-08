package com.cloudcampus.people.parent;

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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "student_guardians",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_student_guardians_guardian_student",
                columnNames = {"guardian_user_id", "student_id"}
        )
)
public class StudentGuardian {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "guardian_user_id", nullable = false)
    private UserAccount guardianUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false, length = 80)
    private String relation;

    @Column(length = 320)
    private String contactEmail;

    @Column(length = 40)
    private String contactMobile;

    @Column(nullable = false)
    private boolean primaryContact;

    @Column(nullable = false)
    private boolean canPickup;

    @Column(nullable = false)
    private boolean emergencyContact;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private UserAccount updatedBy;

    protected StudentGuardian() {
    }

    public StudentGuardian(
            Student student,
            UserAccount guardianUser,
            String relation,
            String contactEmail,
            String contactMobile,
            boolean primaryContact,
            boolean canPickup,
            boolean emergencyContact,
            UserAccount updatedBy
    ) {
        this.student = student;
        this.guardianUser = guardianUser;
        this.tenant = student.getTenant();
        this.school = student.getSchool();
        this.relation = relation;
        this.contactEmail = contactEmail;
        this.contactMobile = contactMobile;
        this.primaryContact = primaryContact;
        this.canPickup = canPickup;
        this.emergencyContact = emergencyContact;
        this.updatedBy = updatedBy;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void update(
            String relation,
            Boolean primaryContact,
            Boolean canPickup,
            Boolean emergencyContact,
            Boolean active,
            UserAccount actor
    ) {
        if (relation != null && !relation.isBlank()) {
            this.relation = relation.trim();
        }
        if (primaryContact != null) {
            this.primaryContact = primaryContact;
        }
        if (canPickup != null) {
            this.canPickup = canPickup;
        }
        if (emergencyContact != null) {
            this.emergencyContact = emergencyContact;
        }
        if (active != null) {
            this.active = active;
        }
        this.updatedBy = actor;
    }

    public void deactivate(UserAccount actor) {
        this.active = false;
        this.updatedBy = actor;
    }

    public String getId() {
        return id;
    }

    public Student getStudent() {
        return student;
    }

    public UserAccount getGuardianUser() {
        return guardianUser;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public School getSchool() {
        return school;
    }

    public String getRelation() {
        return relation;
    }

    public boolean isPrimaryContact() {
        return primaryContact;
    }

    public boolean isCanPickup() {
        return canPickup;
    }

    public boolean isEmergencyContact() {
        return emergencyContact;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
