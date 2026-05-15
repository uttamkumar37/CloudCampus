package com.cloudcampus.reports.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.ratelimit.RateLimit;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.reports.dto.PlatformAnalyticsResponse;
import com.cloudcampus.reports.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Platform-wide analytics for the Super Admin (CC-0309).
 *
 * GET /v1/super-admin/analytics — global totals + per-tenant breakdown
 */
@RestController
@RequestMapping("/v1/super-admin/analytics")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Super Admin — Analytics", description = "Platform-wide analytics dashboard")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    @RateLimit
    @Operation(summary = "Platform analytics",
               description = "Returns platform-wide totals (tenants, students, staff, schools, fee health) and a per-tenant breakdown sorted by active student count descending.")
    public ResponseEntity<ApiResponse<PlatformAnalyticsResponse>> platformAnalytics() {
        return ResponseEntity.ok(ApiResponse.ok(
                MDC.get(CorrelationId.MDC_KEY),
                analyticsService.platformAnalytics()));
    }
}
