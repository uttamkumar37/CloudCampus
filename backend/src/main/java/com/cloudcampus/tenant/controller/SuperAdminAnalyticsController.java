package com.cloudcampus.tenant.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.tenant.dto.PlatformAnalyticsResponse;
import com.cloudcampus.tenant.service.SuperAdminAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/super-admin/tenant-analytics")
@Tag(name = "Super Admin — Analytics", description = "Platform-wide analytics (Super Admin only)")
public class SuperAdminAnalyticsController {

    private final SuperAdminAnalyticsService analyticsService;

    public SuperAdminAnalyticsController(SuperAdminAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @Operation(
            summary = "Platform analytics",
            description = "Returns platform-wide totals (students, staff, schools, fees) with a per-tenant breakdown."
    )
    @GetMapping
    public ApiResponse<PlatformAnalyticsResponse> getAnalytics() {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), analyticsService.getPlatformAnalytics());
    }
}
