package com.cloudcampus.operations.document;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.academic.ClassLevel;
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
@Table(name = "school_documents")
public class SchoolDocument {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_level_id")
    private ClassLevel classLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private UserAccount createdByUser;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 220)
    private String fileName;

    @Column(nullable = false, length = 500)
    private String storageKey;

    @Column(nullable = false)
    private Instant createdAt;

    protected SchoolDocument() {
    }

    public SchoolDocument(
            School school,
            ClassLevel classLevel,
            Student student,
            UserAccount createdByUser,
            String title,
            String fileName,
            String storageKey
    ) {
        this.tenant = school.getTenant();
        this.school = school;
        this.classLevel = classLevel;
        this.student = student;
        this.createdByUser = createdByUser;
        this.title = title;
        this.fileName = fileName;
        this.storageKey = storageKey;
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

    public Student getStudent() {
        return student;
    }

    public String getTitle() {
        return title;
    }

    public String getFileName() {
        return fileName;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
