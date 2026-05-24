package com.cloudcampus.experience.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public record MarketingCampaignCreateRequest(
        @NotBlank @Size(max = 180) String name,
        @NotBlank @Size(max = 80) String campaignType,
        Map<String, Object> audienceFilter,
        @NotBlank @Size(max = 80) String triggerType,
        Map<String, Object> triggerConfig,
        @NotEmpty @Size(max = 20) List<@Valid MarketingCampaignStepRequest> steps
) {}
