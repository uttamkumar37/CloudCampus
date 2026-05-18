package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.MarketingCampaignStep;

import java.util.Map;
import java.util.UUID;

public record MarketingCampaignStepResponse(
        UUID id,
        int position,
        int delayMinutes,
        String actionType,
        Map<String, Object> actionConfig
) {
    public static MarketingCampaignStepResponse from(MarketingCampaignStep step) {
        return new MarketingCampaignStepResponse(
                step.getId(),
                step.getPosition(),
                step.getDelayMinutes(),
                step.getActionType(),
                step.getActionConfig()
        );
    }
}
