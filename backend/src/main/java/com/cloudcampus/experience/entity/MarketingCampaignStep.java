package com.cloudcampus.experience.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_campaign_steps")
public class MarketingCampaignStep {

    @Id
    private UUID id;

    @Column(name = "campaign_id", nullable = false)
    private UUID campaignId;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "delay_minutes", nullable = false)
    private int delayMinutes;

    @Column(name = "action_type", nullable = false, length = 40)
    private String actionType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "action_config", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> actionConfig;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected MarketingCampaignStep() {}

    public static MarketingCampaignStep create(UUID campaignId,
                                               int position,
                                               int delayMinutes,
                                               String actionType,
                                               Map<String, Object> actionConfig) {
        MarketingCampaignStep step = new MarketingCampaignStep();
        step.campaignId = campaignId;
        step.position = position;
        step.delayMinutes = delayMinutes;
        step.actionType = actionType;
        step.actionConfig = actionConfig;
        return step;
    }

    @PrePersist
    void onPersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getCampaignId() { return campaignId; }
    public int getPosition() { return position; }
    public int getDelayMinutes() { return delayMinutes; }
    public String getActionType() { return actionType; }
    public Map<String, Object> getActionConfig() { return actionConfig; }
}
