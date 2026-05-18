package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.StoryScene;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record StorySceneResponse(
        UUID id,
        String sceneKey,
        String title,
        String audienceType,
        String status,
        Map<String, Object> timeline,
        List<Object> proofPoints,
        Map<String, Object> animation,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static StorySceneResponse from(StoryScene scene) {
        return new StorySceneResponse(
                scene.getId(),
                scene.getSceneKey(),
                scene.getTitle(),
                scene.getAudienceType(),
                scene.getStatus(),
                scene.getTimelineJson(),
                scene.getProofPointsJson(),
                scene.getAnimationJson(),
                scene.isPublished(),
                scene.getPublishedAt(),
                scene.getUpdatedAt()
        );
    }
}
