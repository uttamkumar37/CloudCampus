package com.cloudcampus.portal.dashboard;

import java.util.List;

public record DashboardSummaryResponse(
        List<DashboardMetricResponse> metrics,
        List<DashboardItemResponse> alerts,
        List<DashboardItemResponse> activity
) {
}
