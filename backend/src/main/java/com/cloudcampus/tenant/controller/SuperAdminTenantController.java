package com.cloudcampus.tenant.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.Pagination;
import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.dto.TenantResponse;
import com.cloudcampus.tenant.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.slf4j.MDC;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/v1/super-admin/tenants")
@Validated
@Tag(name = "Super Admin — Tenants", description = "Tenant lifecycle management (Super Admin only)")
public class SuperAdminTenantController {
    private final TenantService tenantService;

    public SuperAdminTenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @Operation(summary = "Create tenant", description = "Provision a new tenant. Auto-creates the default MAIN school.")
    @PostMapping
    public ApiResponse<TenantResponse> create(@Valid @RequestBody TenantCreateRequest request) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), tenantService.create(request));
    }

    @Operation(summary = "Get tenant", description = "Fetch a single tenant by ID.")
    @GetMapping("/{id}")
    public ApiResponse<TenantResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), tenantService.get(id));
    }

    @Operation(summary = "List tenants", description = "Paginated list of all tenants. Supports offset/limit.")
    @GetMapping
    public ApiResponse<PageResponse<TenantResponse>> list(
            @RequestParam(defaultValue = "0") @Min(0) int offset,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int limit
    ) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), tenantService.list(new Pagination(offset, limit)));
    }
}

