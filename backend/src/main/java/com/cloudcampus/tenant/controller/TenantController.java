package com.cloudcampus.tenant.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.tenant.dto.SchoolSearchResponse;
import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.dto.TenantResponse;
import com.cloudcampus.tenant.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenant", description = "Tenant management APIs")
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a tenant", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<TenantResponse>> createTenant(@Valid @RequestBody TenantCreateRequest request) {
        TenantResponse response = tenantService.createTenant(request);
        return ResponseEntity.ok(ApiResponse.success("Tenant created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "List tenants", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<List<TenantResponse>>> getTenants() {
        List<TenantResponse> tenants = tenantService.getAllTenants();
        return ResponseEntity.ok(ApiResponse.success("Tenants fetched successfully", tenants));
    }

    @GetMapping("/schools/search")
    @Operation(summary = "Search active schools for tenant selection")
    public ResponseEntity<ApiResponse<List<SchoolSearchResponse>>> searchSchools(
            @RequestParam String query) {
        List<SchoolSearchResponse> schools = tenantService.searchSchools(query);
        return ResponseEntity.ok(ApiResponse.success("Schools fetched successfully", schools));
    }

    @GetMapping("/schools/{tenantSlug}")
    @Operation(summary = "Get one active school by slug for subdomain-based selection")
    public ResponseEntity<ApiResponse<SchoolSearchResponse>> getSchoolBySlug(
            @PathVariable String tenantSlug) {
        SchoolSearchResponse school = tenantService.getSchoolBySlug(tenantSlug);
        return ResponseEntity.ok(ApiResponse.success("School fetched successfully", school));
    }

    @GetMapping("/{tenantId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get tenant by tenantId", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<TenantResponse>> getTenant(@PathVariable String tenantId) {
        TenantResponse tenant = tenantService.getTenantByTenantId(tenantId);
        return ResponseEntity.ok(ApiResponse.success("Tenant fetched successfully", tenant));
    }
}
