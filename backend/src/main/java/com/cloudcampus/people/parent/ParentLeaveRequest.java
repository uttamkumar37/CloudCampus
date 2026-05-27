package com.cloudcampus.people.parent;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.people.student.Student;
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
@Table(name = "parent_leave_requests")
public class ParentLeaveRequest {

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_student_link_id", nullable = false)
    private ParentStudentLink parentStudentLink;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ParentLeaveRequestStatus status = ParentLeaveRequestStatus.PENDING;

    @Column(length = 1000)
    private String adminNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by_user_id")
    private UserAccount decidedByUser;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant decidedAt;

    protected ParentLeaveRequest() {
    }

    public ParentLeaveRequest(
            ParentStudentLink link,
            LocalDate startDate,
            LocalDate endDate,
            String reason
    ) {
        this.tenant = link.getTenant();
        this.school = link.getSchool();
        this.student = link.getStudent();
        this.parentUser = link.getParentUser();
        this.parentStudentLink = link;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
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

    public void decide(ParentLeaveRequestStatus decision, String adminNote, UserAccount decider, Instant decidedAt) {
        this.status = decision;
        this.adminNote = adminNote;
        this.decidedByUser = decider;
        this.decidedAt = decidedAt;
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

    public ParentStudentLink getParentStudentLink() {
        return parentStudentLink;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public String getReason() {
        return reason;
    }

    public ParentLeaveRequestStatus getStatus() {
        return status;
    }

    public String getAdminNote() {
        return adminNote;
    }

    public UserAccount getDecidedByUser() {
        return decidedByUser;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getDecidedAt() {
        return decidedAt;
    }
}
