package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record MarketingCampaignStepRequest(
        @Min(0) int position,
        @Min(0) int delayMinutes,
        @NotBlank @Size(max = 80) String actionType,
        Map<String, Object> actionConfig
) {}
