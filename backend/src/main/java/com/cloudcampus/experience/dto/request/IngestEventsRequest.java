package com.cloudcampus.experience.dto.request;

import java.util.List;
import java.util.Map;

public record IngestEventsRequest(List<EventPayload> events) {

    public record EventPayload(
            String sessionId,
            String visitorId,
            String eventType,
            String pagePath,
            String utmSource,
            String utmMedium,
            String utmCampaign,
            String deviceType,
            Map<String, Object> data
    ) {}
}
