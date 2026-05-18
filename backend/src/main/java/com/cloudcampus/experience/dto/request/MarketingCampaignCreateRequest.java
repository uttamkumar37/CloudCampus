package com.cloudcampus.experience.dto.request;

import java.util.List;
import java.util.Map;

public record MarketingCampaignCreateRequest(
        String name,
        String campaignType,
        Map<String, Object> audienceFilter,
        String triggerType,
        Map<String, Object> triggerConfig,
        List<MarketingCampaignStepRequest> steps
) {}
