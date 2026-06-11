package com.cloudcampus.portal.dashboard;

import com.cloudcampus.common.context.RequestContextResolver;
import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardSummaryController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final RequestContextResolver requestContextResolver;
    private final DashboardSummaryService dashboardSummaryService;

    public DashboardSummaryController(
            AuthenticatedUserResolver authenticatedUserResolver,
            RequestContextResolver requestContextResolver,
            DashboardSummaryService dashboardSummaryService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.requestContextResolver = requestContextResolver;
        this.dashboardSummaryService = dashboardSummaryService;
    }

    @GetMapping("/v1/super-admin/dashboard/summary")
    ResponseEntity<DashboardSummaryResponse> superAdmin(HttpServletRequest request) {
        return ResponseEntity.ok(dashboardSummaryService.superAdmin(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/tenant-admin/dashboard/summary")
    ResponseEntity<DashboardSummaryResponse> tenantAdmin(HttpServletRequest request) {
        return ResponseEntity.ok(dashboardSummaryService.tenantAdmin(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/school-admin/dashboard/summary")
    ResponseEntity<DashboardSummaryResponse> schoolAdmin(HttpServletRequest request) {
        return ResponseEntity.ok(dashboardSummaryService.schoolAdmin(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/teacher/dashboard/summary")
    ResponseEntity<DashboardSummaryResponse> teacher(HttpServletRequest request) {
        return ResponseEntity.ok(dashboardSummaryService.teacher(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/finance/dashboard/summary")
    ResponseEntity<DashboardSummaryResponse> finance(HttpServletRequest request) {
        return ResponseEntity.ok(dashboardSummaryService.finance(requestContextResolver.requireContext(request)));
    }

    @GetMapping("/v1/staff/dashboard/summary")
    ResponseEntity<DashboardSummaryResponse> staff(HttpServletRequest request) {
        return ResponseEntity.ok(dashboardSummaryService.staff(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/parent/dashboard/summary")
    ResponseEntity<DashboardSummaryResponse> parent(HttpServletRequest request) {
        return ResponseEntity.ok(dashboardSummaryService.parent(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/student/dashboard/summary")
    ResponseEntity<DashboardSummaryResponse> student(HttpServletRequest request) {
        return ResponseEntity.ok(dashboardSummaryService.student(authenticatedUserResolver.requireUser(request)));
    }
}
