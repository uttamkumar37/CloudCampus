package com.cloudcampus.operations.exam;

import java.math.BigDecimal;
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
        name = "exam_results",
        uniqueConstraints = @UniqueConstraint(name = "uk_exam_results_exam_student", columnNames = {"exam_id", "student_id"})
)
public class ExamResult {

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
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recorded_by_user_id", nullable = false)
    private UserAccount recordedByUser;

    @Column(nullable = false, precision = 7, scale = 2)
    private BigDecimal marksObtained;

    @Column(nullable = false)
    private Instant recordedAt;

    protected ExamResult() {
    }

    public ExamResult(Exam exam, Student student, UserAccount recordedByUser, BigDecimal marksObtained) {
        this.tenant = exam.getTenant();
        this.school = exam.getSchool();
        this.exam = exam;
        this.student = student;
        this.recordedByUser = recordedByUser;
        this.marksObtained = marksObtained;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (recordedAt == null) {
            recordedAt = Instant.now();
        }
    }

    public void updateMarks(UserAccount actor, BigDecimal marksObtained) {
        this.recordedByUser = actor;
        this.marksObtained = marksObtained;
        this.recordedAt = Instant.now();
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

    public Exam getExam() {
        return exam;
    }

    public Student getStudent() {
        return student;
    }

    public UserAccount getRecordedByUser() {
        return recordedByUser;
    }

    public BigDecimal getMarksObtained() {
        return marksObtained;
    }

    public Instant getRecordedAt() {
        return recordedAt;
    }
}
