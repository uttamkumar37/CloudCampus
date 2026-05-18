package com.cloudcampus.experience.dto.request;

import java.util.Map;

public record MarketingCampaignStepRequest(
        int position,
        int delayMinutes,
        String actionType,
        Map<String, Object> actionConfig
) {}
