package com.cloudcampus.staff.profile.dto;

import java.time.Instant;

public record StaffTimelineItemResponse(
        String id,
        String type,
        String title,
        String summary,
        Instant occurredAt,
        String visibility
) {}
