package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.StakeholderJourney;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record StakeholderJourneyResponse(
        UUID id,
        String stakeholderType,
        String journeyKey,
        String name,
        String conversionGoal,
        String status,
        Map<String, Object> narrativeJson,
        List<Object> touchpointsJson,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static StakeholderJourneyResponse from(StakeholderJourney j) {
        return new StakeholderJourneyResponse(
                j.getId(),
                j.getStakeholderType(),
                j.getJourneyKey(),
                j.getName(),
                j.getConversionGoal(),
                j.getStatus(),
                j.getNarrativeJson(),
                j.getTouchpointsJson(),
                j.isPublished(),
                j.getPublishedAt(),
                j.getUpdatedAt()
        );
    }
}
