package com.cloudcampus.platform.tenantadmin.report;

import jakarta.servlet.http.HttpServletRequest;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/tenant-admin/reports")
public class TenantAdminReportController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final TenantAdminReportService tenantAdminReportService;

    public TenantAdminReportController(
            AuthenticatedUserResolver authenticatedUserResolver,
            TenantAdminReportService tenantAdminReportService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.tenantAdminReportService = tenantAdminReportService;
    }

    @GetMapping("/summary")
    ResponseEntity<TenantReportSummaryResponse> summary(HttpServletRequest request) {
        return ResponseEntity.ok(tenantAdminReportService.tenantSummary(
                authenticatedUserResolver.requireUser(request)
        ));
    }

    @GetMapping("/schools/{schoolId}/summary")
    ResponseEntity<TenantReportSummaryResponse> schoolSummary(
            @PathVariable String schoolId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(tenantAdminReportService.schoolDrilldown(
                authenticatedUserResolver.requireUser(request),
                schoolId
        ));
    }
}
