package com.cloudcampus.operations.attendance;

import java.time.Instant;
import java.util.UUID;

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
@Table(name = "attendance_records")
public class AttendanceRecord {

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
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AttendanceStatus status;

    @Column(length = 180)
    private String remark;

    @Column(nullable = false)
    private Instant createdAt;

    protected AttendanceRecord() {
    }

    public AttendanceRecord(AttendanceSession session, Student student, AttendanceStatus status, String remark) {
        this.tenant = session.getTenant();
        this.school = session.getSchool();
        this.session = session;
        this.student = student;
        this.status = status;
        this.remark = remark;
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

    public AttendanceSession getSession() {
        return session;
    }

    public Student getStudent() {
        return student;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public String getRemark() {
        return remark;
    }
}
