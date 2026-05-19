package com.cloudcampus.student.profile.dto;

import java.time.Instant;

public record TimelineItemResponse(
        String id,
        String type,
        String title,
        String summary,
        Instant occurredAt,
        String visibility
) {}
