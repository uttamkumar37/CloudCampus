package com.cloudcampus.feature.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.feature.dto.FeatureResponse;
import com.cloudcampus.feature.dto.TenantFeatureResponse;
import com.cloudcampus.feature.repository.FeatureRepository;
import com.cloudcampus.feature.repository.TenantFeatureRepository;
import com.cloudcampus.feature.service.FeatureFlagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Super Admin API for managing the feature catalog and per-tenant feature flags.
 *
 * All endpoints are secured to SUPER_ADMIN only via Spring Security path rules.
 *
 * GET  /v1/super-admin/features                                 — list all features
 * GET  /v1/super-admin/tenants/{tenantId}/features              — list tenant's feature flags
 * POST /v1/super-admin/tenants/{tenantId}/features/{key}/enable — enable feature for tenant
 * DELETE /v1/super-admin/tenants/{tenantId}/features/{key}      — disable feature for tenant
 */
@RestController
@RequestMapping("/v1/super-admin")
@Tag(name = "Super Admin — Features", description = "Platform feature catalog and per-tenant feature flag management")
public class FeatureAdminController {

    private final FeatureRepository       featureRepository;
    private final TenantFeatureRepository tenantFeatureRepository;
    private final FeatureFlagService      featureFlagService;

    public FeatureAdminController(
            FeatureRepository featureRepository,
            TenantFeatureRepository tenantFeatureRepository,
            FeatureFlagService featureFlagService) {
        this.featureRepository       = featureRepository;
        this.tenantFeatureRepository = tenantFeatureRepository;
        this.featureFlagService      = featureFlagService;
    }

    /** Returns the full platform feature catalog. */
    @Operation(summary = "List features", description = "Returns all features in the platform catalog (CORE, OPTIONAL, PREMIUM, BETA).")
    @GetMapping("/features")
    public ResponseEntity<ApiResponse<List<FeatureResponse>>> listFeatures() {
        List<FeatureResponse> features = featureRepository.findAll()
                .stream()
                .map(FeatureResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(null, features));
    }

    /** Returns all feature flags (and their enablement state) for a specific tenant. */
    @Operation(summary = "List tenant feature flags", description = "Returns the enablement state of all features for a given tenant.")
    @GetMapping("/tenants/{tenantId}/features")
    public ResponseEntity<ApiResponse<List<TenantFeatureResponse>>> listTenantFeatures(
            @PathVariable UUID tenantId) {
        List<TenantFeatureResponse> flags = tenantFeatureRepository.findAllByIdTenantId(tenantId)
                .stream()
                .map(TenantFeatureResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(null, flags));
    }

    /** Enables a feature for a tenant. */
    @Operation(summary = "Enable feature", description = "Enable a feature flag for a tenant. Creates the row if absent.")
    @PostMapping("/tenants/{tenantId}/features/{featureKey}/enable")
    public ResponseEntity<ApiResponse<Void>> enable(
            @PathVariable UUID tenantId,
            @PathVariable String featureKey) {
        featureFlagService.enable(tenantId, featureKey);
        return ResponseEntity.ok(ApiResponse.ok(null, null));
    }

    /** Disables a feature for a tenant. CORE features cannot be disabled. */
    @Operation(summary = "Disable feature", description = "Disable a feature flag for a tenant. CORE features cannot be disabled (returns 400).")
    @DeleteMapping("/tenants/{tenantId}/features/{featureKey}")
    public ResponseEntity<ApiResponse<Void>> disable(
            @PathVariable UUID tenantId,
            @PathVariable String featureKey) {
        featureFlagService.disable(tenantId, featureKey);
        return ResponseEntity.ok(ApiResponse.ok(null, null));
    }
}
