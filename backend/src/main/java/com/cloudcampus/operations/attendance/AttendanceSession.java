package com.cloudcampus.operations.attendance;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.Section;
import com.cloudcampus.academic.Subject;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
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
@Table(name = "attendance_sessions")
public class AttendanceSession {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submitted_by_user_id", nullable = false)
    private UserAccount submittedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private UserRole submittedByRole;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false)
    private Instant createdAt;

    protected AttendanceSession() {
    }

    public AttendanceSession(
            ClassLevel classLevel,
            Section section,
            Subject subject,
            UserAccount submittedBy,
            LocalDate attendanceDate
    ) {
        this.tenant = classLevel.getTenant();
        this.school = classLevel.getSchool();
        this.classLevel = classLevel;
        this.section = section;
        this.subject = subject;
        this.submittedBy = submittedBy;
        this.submittedByRole = submittedBy.getRole();
        this.attendanceDate = attendanceDate;
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

    public Section getSection() {
        return section;
    }

    public Subject getSubject() {
        return subject;
    }

    public UserAccount getSubmittedBy() {
        return submittedBy;
    }

    public UserRole getSubmittedByRole() {
        return submittedByRole;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
