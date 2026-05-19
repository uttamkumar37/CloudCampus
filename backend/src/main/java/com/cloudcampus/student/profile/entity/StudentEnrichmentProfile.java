package com.cloudcampus.student.profile.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_enrichment_profiles")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class StudentEnrichmentProfile {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    private String interests;
    private String hobbies;
    private String likes;
    private String dislikes;
    private String skills;

    @Column(name = "career_goals")
    private String careerGoals;

    @Column(name = "learning_style")
    private String learningStyle;

    @Column(name = "counseling_summary")
    private String counselingSummary;

    @Column(name = "ai_risk_level")
    private String aiRiskLevel;

    @Column(name = "ai_insights")
    private String aiInsights;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected StudentEnrichmentProfile() {}

    public static StudentEnrichmentProfile create(UUID tenantId, UUID schoolId, UUID studentId) {
        StudentEnrichmentProfile p = new StudentEnrichmentProfile();
        p.tenantId = tenantId;
        p.schoolId = schoolId;
        p.studentId = studentId;
        return p;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public String getInterests() { return interests; }
    public String getHobbies() { return hobbies; }
    public String getLikes() { return likes; }
    public String getDislikes() { return dislikes; }
    public String getSkills() { return skills; }
    public String getCareerGoals() { return careerGoals; }
    public String getLearningStyle() { return learningStyle; }
    public String getCounselingSummary() { return counselingSummary; }
    public String getAiRiskLevel() { return aiRiskLevel; }
    public String getAiInsights() { return aiInsights; }

    public void setInterests(String interests) { this.interests = interests; }
    public void setHobbies(String hobbies) { this.hobbies = hobbies; }
    public void setLikes(String likes) { this.likes = likes; }
    public void setDislikes(String dislikes) { this.dislikes = dislikes; }
    public void setSkills(String skills) { this.skills = skills; }
    public void setCareerGoals(String careerGoals) { this.careerGoals = careerGoals; }
    public void setLearningStyle(String learningStyle) { this.learningStyle = learningStyle; }
    public void setCounselingSummary(String counselingSummary) { this.counselingSummary = counselingSummary; }
    public void setAiRiskLevel(String aiRiskLevel) { this.aiRiskLevel = aiRiskLevel; }
    public void setAiInsights(String aiInsights) { this.aiInsights = aiInsights; }
}
