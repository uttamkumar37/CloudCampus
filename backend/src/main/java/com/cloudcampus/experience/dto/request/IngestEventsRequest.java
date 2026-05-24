package com.cloudcampus.experience.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public record IngestEventsRequest(
        @Size(max = 100) List<@Valid EventPayload> events
) {

    public record EventPayload(
            @NotBlank @Size(max = 120) String sessionId,
            @Size(max = 120) String visitorId,
            @NotBlank @Size(max = 80) String eventType,
            @Size(max = 500) String pagePath,
            @Size(max = 120) String utmSource,
            @Size(max = 120) String utmMedium,
            @Size(max = 120) String utmCampaign,
            @Size(max = 60) String deviceType,
            Map<String, Object> data
    ) {}
}
