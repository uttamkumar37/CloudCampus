package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.DemoScenario;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record DemoScenarioResponse(
        UUID id,
        String name,
        String slug,
        String description,
        Map<String, Object> schoolProfile,
        List<String> features,
        int sessionTtlMin,
        int displayOrder
) {
    public static DemoScenarioResponse from(DemoScenario s) {
        return new DemoScenarioResponse(
                s.getId(), s.getName(), s.getSlug(), s.getDescription(),
                s.getSchoolProfile(), s.getFeaturesJson(),
                s.getSessionTtlMin(), s.getDisplayOrder()
        );
    }
}
