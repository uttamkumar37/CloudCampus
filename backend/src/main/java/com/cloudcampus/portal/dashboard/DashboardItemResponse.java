package com.cloudcampus.portal.dashboard;

import java.time.Instant;

public record DashboardItemResponse(
        String title,
        String detail,
        Instant occurredAt
) {
}
