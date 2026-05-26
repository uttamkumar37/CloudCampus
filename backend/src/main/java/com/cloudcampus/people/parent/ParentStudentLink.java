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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "parent_student_links",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_parent_links_parent_student",
                columnNames = {"parent_user_id", "student_id"}
        )
)
public class ParentStudentLink {

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_user_id", nullable = false)
    private UserAccount parentUser;

    @Column(nullable = false, length = 80)
    private String relationship;

    @Column(nullable = false, length = 320)
    private String contactEmail;

    @Column(length = 40)
    private String contactMobile;

    @Column(nullable = false)
    private boolean primaryContact;

    @Column(nullable = false)
    private Instant createdAt;

    protected ParentStudentLink() {
    }

    public ParentStudentLink(
            Tenant tenant,
            School school,
            Student student,
            UserAccount parentUser,
            String relationship,
            String contactEmail,
            String contactMobile,
            boolean primaryContact
    ) {
        this.tenant = tenant;
        this.school = school;
        this.student = student;
        this.parentUser = parentUser;
        this.relationship = relationship;
        this.contactEmail = contactEmail;
        this.contactMobile = contactMobile;
        this.primaryContact = primaryContact;
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

    public Student getStudent() {
        return student;
    }

    public UserAccount getParentUser() {
        return parentUser;
    }

    public String getRelationship() {
        return relationship;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public String getContactMobile() {
        return contactMobile;
    }

    public boolean isPrimaryContact() {
        return primaryContact;
    }
}
