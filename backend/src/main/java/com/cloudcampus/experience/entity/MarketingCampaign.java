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
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_campaigns")
public class MarketingCampaign {

    @Id
    private UUID id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "campaign_type", nullable = false, length = 40)
    private String campaignType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "audience_filter", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> audienceFilter;

    @Column(name = "trigger_type", nullable = false, length = 40)
    private String triggerType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "trigger_config", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> triggerConfig;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MarketingCampaign() {}

    public static MarketingCampaign create(String name,
                                           String campaignType,
                                           Map<String, Object> audienceFilter,
                                           String triggerType,
                                           Map<String, Object> triggerConfig,
                                           UUID createdBy) {
        MarketingCampaign campaign = new MarketingCampaign();
        campaign.name = name;
        campaign.campaignType = campaignType;
        campaign.audienceFilter = audienceFilter;
        campaign.triggerType = triggerType;
        campaign.triggerConfig = triggerConfig;
        campaign.status = "DRAFT";
        campaign.createdBy = createdBy;
        return campaign;
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
                       String campaignType,
                       Map<String, Object> audienceFilter,
                       String triggerType,
                       Map<String, Object> triggerConfig) {
        this.name = name;
        this.campaignType = campaignType;
        this.audienceFilter = audienceFilter;
        this.triggerType = triggerType;
        this.triggerConfig = triggerConfig;
        this.status = "DRAFT";
    }

    public void publish() {
        this.status = "ACTIVE";
    }

    public void pause() {
        this.status = "PAUSED";
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getCampaignType() { return campaignType; }
    public Map<String, Object> getAudienceFilter() { return audienceFilter; }
    public String getTriggerType() { return triggerType; }
    public Map<String, Object> getTriggerConfig() { return triggerConfig; }
    public String getStatus() { return status; }
    public Instant getUpdatedAt() { return updatedAt; }
}
