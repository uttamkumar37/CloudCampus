package com.cloudcampus.experience.dto.response;

import java.util.Map;

public record ExperienceAnalyticsResponse(
        long totalPageViews,
        long totalCtaClicks,
        long totalDemoStarts,
        long totalInvestorViews,
        long totalEvents,
        Map<String, Long> eventsByType,
        String periodLabel
) {}
