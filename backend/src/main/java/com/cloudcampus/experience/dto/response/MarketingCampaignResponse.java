package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.MarketingCampaign;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record MarketingCampaignResponse(
        UUID id,
        String name,
        String campaignType,
        Map<String, Object> audienceFilter,
        String triggerType,
        Map<String, Object> triggerConfig,
        String status,
        Instant updatedAt,
        List<MarketingCampaignStepResponse> steps
) {
    public static MarketingCampaignResponse from(MarketingCampaign campaign, List<MarketingCampaignStepResponse> steps) {
        return new MarketingCampaignResponse(
                campaign.getId(),
                campaign.getName(),
                campaign.getCampaignType(),
                campaign.getAudienceFilter(),
                campaign.getTriggerType(),
                campaign.getTriggerConfig(),
                campaign.getStatus(),
                campaign.getUpdatedAt(),
                steps
        );
    }
}
