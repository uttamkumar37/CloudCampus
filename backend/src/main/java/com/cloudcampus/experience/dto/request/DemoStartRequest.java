package com.cloudcampus.experience.dto.request;

public record DemoStartRequest(
        String scenarioSlug,
        String email,
        String utmSource,
        String utmMedium,
        String utmCampaign
) {}
