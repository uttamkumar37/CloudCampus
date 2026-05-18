package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.WebsitePublishSnapshot;

import java.time.Instant;
import java.util.UUID;

public record WebsitePublishSnapshotResponse(
        UUID id,
        String versionLabel,
        Instant createdAt
) {
    public static WebsitePublishSnapshotResponse from(WebsitePublishSnapshot snapshot) {
        return new WebsitePublishSnapshotResponse(snapshot.getId(), snapshot.getVersionLabel(), snapshot.getCreatedAt());
    }
}
