package com.cloudcampus.storage;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.storage.dto.StorageQuotaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/v1")
@Tag(name = "Storage Quota", description = "Tenant storage quota usage")
public class StorageQuotaController {

    private final StorageQuotaService quotaService;

    public StorageQuotaController(StorageQuotaService quotaService) {
        this.quotaService = quotaService;
    }

    @Operation(summary = "Get current tenant storage quota usage")
    @GetMapping("/school-admin/storage/quota")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN','SCHOOL_ADMIN')")
    public ApiResponse<StorageQuotaResponse> currentTenantQuota() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), quotaService.getUsage(tenantId));
    }

    @Operation(summary = "Get storage quota usage for a tenant")
    @GetMapping("/super-admin/tenants/{tenantId}/storage/quota")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<StorageQuotaResponse> tenantQuota(@PathVariable UUID tenantId) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), quotaService.getUsage(tenantId));
    }
}
