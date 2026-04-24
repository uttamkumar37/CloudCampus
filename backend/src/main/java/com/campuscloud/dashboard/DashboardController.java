package com.campuscloud.dashboard;

import com.campuscloud.tenant.entity.Tenant;
import com.campuscloud.tenant.repository.TenantRepository;
import com.campuscloud.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.HashMap;
import java.util.Map;

@RestController("tenantDashboardController")
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final TenantRepository tenantRepository;

    public DashboardController(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @GetMapping("/tenant-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> tenantSummary(
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantId) {
        Map<String, Object> result = new HashMap<>();

        Tenant tenant = null;
        if (tenantId != null) {
            tenant = tenantRepository.findByTenantId(tenantId).orElse(null);
        }

        Map<String, Object> branding = new HashMap<>();
        if (tenant != null) {
            branding.put("logoUrl", tenant.getLogoUrl());
            branding.put("primaryColor", tenant.getPrimaryColor());
            branding.put("schoolName", tenant.getSchoolName());
        }

        // Minimal summary data (counts could be implemented later)
        result.put("branding", branding);
        result.put("counts", Map.of("students", 0, "teachers", 0));

        return ResponseEntity.ok(new ApiResponse<>(true, "Tenant summary", result));
    }
}
