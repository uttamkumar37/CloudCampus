package com.cloudcampus.platform.superadmin.control;

import java.time.Instant;

public record SchoolActivityAggregate(
        String schoolId,
        Instant lastActivityAt
) {
}
