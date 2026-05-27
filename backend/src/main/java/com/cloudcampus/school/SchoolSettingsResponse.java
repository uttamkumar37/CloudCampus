package com.cloudcampus.school;

import java.time.Instant;

public record SchoolSettingsResponse(
        String tenantId,
        String schoolId,
        String code,
        String name,
        boolean primarySchool,
        boolean active,
        Instant createdAt
) {
}
