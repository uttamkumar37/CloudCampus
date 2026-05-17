package com.cloudcampus.domain.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.domain.dto.DomainRequest;
import com.cloudcampus.domain.dto.DomainResponse;
import com.cloudcampus.domain.service.CustomDomainService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Custom Domains", description = "DNS verification for custom domains (CC-0212)")
public class CustomDomainController {

    private final CustomDomainService service;

    public CustomDomainController(CustomDomainService service) {
        this.service = service;
    }

    // ── Super Admin endpoints ─────────────────────────────────────────────────

    @Operation(summary = "List domains for tenant", description = "Super admin: list all custom domains for a tenant.")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/v1/super-admin/tenants/{tenantId}/domains")
    public ApiResponse<List<DomainResponse>> listForTenant(@PathVariable UUID tenantId) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.list(tenantId));
    }

    @Operation(summary = "Register domain (super admin)", description = "Register a custom domain for a tenant.")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/v1/super-admin/tenants/{tenantId}/domains")
    public ApiResponse<DomainResponse> registerForTenant(
            @PathVariable UUID tenantId,
            @Valid @RequestBody DomainRequest request
    ) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.register(tenantId, request.domain()));
    }

    @Operation(summary = "Trigger DNS verification (super admin)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/v1/super-admin/tenants/{tenantId}/domains/{domainId}/verify")
    public ApiResponse<DomainResponse> verifyForTenant(
            @PathVariable UUID tenantId,
            @PathVariable UUID domainId
    ) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.verify(tenantId, domainId));
    }

    @Operation(summary = "Delete domain (super admin)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/v1/super-admin/tenants/{tenantId}/domains/{domainId}")
    public ResponseEntity<Void> deleteForTenant(
            @PathVariable UUID tenantId,
            @PathVariable UUID domainId
    ) {
        service.delete(tenantId, domainId);
        return ResponseEntity.noContent().build();
    }

    // ── School Admin endpoints ────────────────────────────────────────────────

    @Operation(summary = "List my tenant domains", description = "School admin: list custom domains for own tenant.")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @GetMapping("/v1/school-admin/domains")
    public ApiResponse<List<DomainResponse>> listMine() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.list(tenantId));
    }

    @Operation(summary = "Register custom domain", description = "School admin: register a custom domain for own tenant.")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @PostMapping("/v1/school-admin/domains")
    public ApiResponse<DomainResponse> registerMine(@Valid @RequestBody DomainRequest request) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.register(tenantId, request.domain()));
    }

    @Operation(summary = "Trigger DNS verification", description = "Checks _cloudcampus-verify.<domain> TXT record via live DNS lookup.")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @PostMapping("/v1/school-admin/domains/{domainId}/verify")
    public ApiResponse<DomainResponse> verifyMine(@PathVariable UUID domainId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.verify(tenantId, domainId));
    }

    @Operation(summary = "Delete custom domain")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @DeleteMapping("/v1/school-admin/domains/{domainId}")
    public ResponseEntity<Void> deleteMine(@PathVariable UUID domainId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        service.delete(tenantId, domainId);
        return ResponseEntity.noContent().build();
    }
}
