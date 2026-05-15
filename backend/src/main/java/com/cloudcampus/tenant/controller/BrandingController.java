package com.cloudcampus.tenant.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.tenant.dto.BrandingResponse;
import com.cloudcampus.tenant.entity.TenantConfigKey;
import com.cloudcampus.tenant.repository.TenantConfigRepository;
import com.cloudcampus.tenant.repository.TenantRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

/**
 * Public branding endpoint — no authentication required (CC-0206).
 *
 * TenantContextFilter skips /v1/public/** so RequestContext is not populated.
 * This controller reads X-Tenant-Id directly and looks up branding config.
 * Returns defaults when the tenant is unknown or has no overrides.
 *
 * GET /v1/public/branding
 */
@RestController
@RequestMapping("/v1/public/branding")
@Tag(name = "Public — Branding", description = "Per-tenant branding config, no auth required")
public class BrandingController {

    private final TenantRepository       tenantRepo;
    private final TenantConfigRepository configRepo;

    public BrandingController(TenantRepository tenantRepo,
                              TenantConfigRepository configRepo) {
        this.tenantRepo = tenantRepo;
        this.configRepo = configRepo;
    }

    @Operation(summary = "Get tenant branding",
               description = "Returns logo URL, favicon URL, and brand colours for the tenant identified by X-Tenant-Id. Returns defaults when header is absent or tenant is unknown.")
    @GetMapping
    public ResponseEntity<ApiResponse<BrandingResponse>> getBranding(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader) {

        Map<TenantConfigKey, String> values = resolveValues(tenantIdHeader);
        BrandingResponse branding = new BrandingResponse(
                values.get(TenantConfigKey.LOGO_URL),
                values.get(TenantConfigKey.FAVICON_URL),
                values.get(TenantConfigKey.PRIMARY_COLOR),
                values.get(TenantConfigKey.SECONDARY_COLOR)
        );
        return ResponseEntity.ok(ApiResponse.ok(null, branding));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Map<TenantConfigKey, String> resolveValues(String tenantIdHeader) {
        Map<TenantConfigKey, String> defaults = brandingDefaults();

        if (tenantIdHeader == null || tenantIdHeader.isBlank()) {
            return defaults;
        }

        UUID tenantId;
        try {
            tenantId = UUID.fromString(tenantIdHeader.trim());
        } catch (IllegalArgumentException e) {
            return defaults;
        }

        if (!tenantRepo.existsById(tenantId)) {
            return defaults;
        }

        // Overlay stored overrides onto defaults.
        configRepo.findAllByTenantId(tenantId).forEach(row -> {
            if (defaults.containsKey(row.getConfigKey())) {
                defaults.put(row.getConfigKey(), row.getConfigValue());
            }
        });
        return defaults;
    }

    private static Map<TenantConfigKey, String> brandingDefaults() {
        // EnumMap variant that is mutable so resolveValues() can overlay overrides.
        return new java.util.EnumMap<>(Map.of(
                TenantConfigKey.LOGO_URL,        TenantConfigKey.LOGO_URL.getDefaultValue(),
                TenantConfigKey.FAVICON_URL,     TenantConfigKey.FAVICON_URL.getDefaultValue(),
                TenantConfigKey.PRIMARY_COLOR,   TenantConfigKey.PRIMARY_COLOR.getDefaultValue(),
                TenantConfigKey.SECONDARY_COLOR, TenantConfigKey.SECONDARY_COLOR.getDefaultValue()
        ));
    }
}
