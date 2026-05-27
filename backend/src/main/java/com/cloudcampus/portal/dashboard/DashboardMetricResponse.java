package com.cloudcampus.portal.dashboard;

public record DashboardMetricResponse(
        String label,
        String value,
        String detail
) {
}
