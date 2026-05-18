package com.cloudcampus.experience.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_stakeholder_journeys")
public class StakeholderJourney {

    @Id
    private UUID id;

    @Column(name = "stakeholder_type", nullable = false, length = 50)
    private String stakeholderType;

    @Column(name = "journey_key", nullable = false, length = 120)
    private String journeyKey;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "conversion_goal", length = 255)
    private String conversionGoal;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "narrative_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> narrativeJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "touchpoints_json", columnDefinition = "jsonb", nullable = false)
    private List<Object> touchpointsJson;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected StakeholderJourney() {}

    public static StakeholderJourney create(String stakeholderType,
                                            String journeyKey,
                                            String name,
                                            String conversionGoal,
                                            Map<String, Object> narrativeJson,
                                            List<Object> touchpointsJson,
                                            UUID createdBy) {
        StakeholderJourney journey = new StakeholderJourney();
        journey.stakeholderType = stakeholderType;
        journey.journeyKey = journeyKey;
        journey.name = name;
        journey.conversionGoal = conversionGoal;
        journey.status = "DRAFT";
        journey.narrativeJson = narrativeJson;
        journey.touchpointsJson = touchpointsJson;
        journey.published = false;
        journey.createdBy = createdBy;
        return journey;
    }

    @PrePersist
    void onPersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public void update(String name,
                       String conversionGoal,
                       Map<String, Object> narrativeJson,
                       List<Object> touchpointsJson) {
        this.name = name;
        this.conversionGoal = conversionGoal;
        this.narrativeJson = narrativeJson;
        this.touchpointsJson = touchpointsJson;
        this.status = "DRAFT";
        this.published = false;
        this.publishedAt = null;
    }

    public void publish() {
        this.status = "PUBLISHED";
        this.published = true;
        this.publishedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getStakeholderType() { return stakeholderType; }
    public String getJourneyKey() { return journeyKey; }
    public String getName() { return name; }
    public String getConversionGoal() { return conversionGoal; }
    public String getStatus() { return status; }
    public Map<String, Object> getNarrativeJson() { return narrativeJson; }
    public List<Object> getTouchpointsJson() { return touchpointsJson; }
    public boolean isPublished() { return published; }
    public Instant getPublishedAt() { return publishedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
