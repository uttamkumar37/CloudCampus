package com.cloudcampus.platform.superadmin.control;

public record SchoolAggregateCount(
        String schoolId,
        long totalCount,
        long activeCount
) {
}
