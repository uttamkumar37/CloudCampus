package com.cloudcampus.student.profile.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_behavior_records")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class StudentBehaviorRecord {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(nullable = false)
    private String category;

    private String severity;

    @Column(nullable = false)
    private String summary;

    @Column(name = "action_taken")
    private String actionTaken;

    @Column(name = "counselor_notes")
    private String counselorNotes;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected StudentBehaviorRecord() {}

    public static StudentBehaviorRecord create(UUID tenantId, UUID schoolId, UUID studentId) {
        StudentBehaviorRecord r = new StudentBehaviorRecord();
        r.tenantId = tenantId;
        r.schoolId = schoolId;
        r.studentId = studentId;
        return r;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (recordedAt == null) recordedAt = Instant.now();
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getCategory() { return category; }
    public String getSeverity() { return severity; }
    public String getSummary() { return summary; }
    public String getActionTaken() { return actionTaken; }
    public String getCounselorNotes() { return counselorNotes; }
    public Instant getRecordedAt() { return recordedAt; }

    public void setCategory(String category) { this.category = category; }
    public void setSeverity(String severity) { this.severity = severity; }
    public void setSummary(String summary) { this.summary = summary; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }
    public void setCounselorNotes(String counselorNotes) { this.counselorNotes = counselorNotes; }
}
