package com.cloudcampus.tenant.service;

import com.cloudcampus.tenant.dto.ComparisonResponse;
import com.cloudcampus.tenant.dto.PlatformAnalyticsResponse;

import java.util.UUID;

public interface SuperAdminAnalyticsService {
    PlatformAnalyticsResponse getPlatformAnalytics();
    ComparisonResponse getComparisonReport(UUID tenantId);
}
