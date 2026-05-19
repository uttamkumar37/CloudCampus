package com.cloudcampus.student.profile.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "student_achievement_records")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class StudentAchievementRecord {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(nullable = false)
    private String title;

    private String category;
    private String description;

    @Column(name = "awarded_on")
    private LocalDate awardedOn;

    @Column(name = "evidence_url")
    private String evidenceUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected StudentAchievementRecord() {}

    public static StudentAchievementRecord create(UUID tenantId, UUID schoolId, UUID studentId) {
        StudentAchievementRecord r = new StudentAchievementRecord();
        r.tenantId = tenantId;
        r.schoolId = schoolId;
        r.studentId = studentId;
        return r;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public LocalDate getAwardedOn() { return awardedOn; }
    public String getEvidenceUrl() { return evidenceUrl; }
    public Instant getCreatedAt() { return createdAt; }

    public void setTitle(String title) { this.title = title; }
    public void setCategory(String category) { this.category = category; }
    public void setDescription(String description) { this.description = description; }
    public void setAwardedOn(LocalDate awardedOn) { this.awardedOn = awardedOn; }
    public void setEvidenceUrl(String evidenceUrl) { this.evidenceUrl = evidenceUrl; }
}
