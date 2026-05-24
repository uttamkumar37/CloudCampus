package com.cloudcampus.experience.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public record MarketingCampaignUpdateRequest(
        @Size(max = 180) String name,
        @Size(max = 80) String campaignType,
        Map<String, Object> audienceFilter,
        @Size(max = 80) String triggerType,
        Map<String, Object> triggerConfig,
        @Size(max = 20) List<@Valid MarketingCampaignStepRequest> steps
) {}
