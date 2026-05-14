package com.cloudcampus.reports.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.ratelimit.RateLimit;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.reports.dto.ComparisonResponse;
import com.cloudcampus.reports.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Super Admin cross-school comparison report (CC-1404).
 *
 * GET /v1/super-admin/tenants/{tenantId}/comparison
 */
@RestController
@RequestMapping("/v1/super-admin/tenants")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Super Admin — Reports", description = "Cross-school comparison reports")
public class SuperAdminReportController {

    private final ReportService reportService;

    SuperAdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/{tenantId}/comparison")
    @RateLimit
    @Operation(summary = "Cross-school comparison for a tenant (CC-1404)")
    public ResponseEntity<ApiResponse<ComparisonResponse>> comparison(
            @PathVariable UUID tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(
                MDC.get(CorrelationId.MDC_KEY),
                reportService.comparisonReport(tenantId)));
    }
}
