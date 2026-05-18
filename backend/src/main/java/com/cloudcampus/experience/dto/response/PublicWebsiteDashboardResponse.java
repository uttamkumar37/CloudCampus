package com.cloudcampus.experience.dto.response;

import java.util.List;
import java.util.Map;

public record PublicWebsiteDashboardResponse(
        long totalVisitors,
        long pageViews,
        long ctaClicks,
        long demoRequests,
        long investorVisits,
        int publishedPages,
        int seoCoverage,
        double conversionRate,
        List<Map<String, Object>> topPages,
        Map<String, Long> engagementMetrics
) {
}
