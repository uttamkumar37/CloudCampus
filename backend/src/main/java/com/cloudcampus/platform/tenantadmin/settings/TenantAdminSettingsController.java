package com.cloudcampus.platform.tenantadmin.settings;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/tenant-admin")
public class TenantAdminSettingsController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final TenantAdminSettingsService tenantAdminSettingsService;

    public TenantAdminSettingsController(
            AuthenticatedUserResolver authenticatedUserResolver,
            TenantAdminSettingsService tenantAdminSettingsService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.tenantAdminSettingsService = tenantAdminSettingsService;
    }

    @GetMapping("/settings")
    ResponseEntity<TenantSettingsResponse> settings(HttpServletRequest request) {
        return ResponseEntity.ok(tenantAdminSettingsService.settings(authenticatedUserResolver.requireUser(request)));
    }

    @PatchMapping("/settings")
    ResponseEntity<TenantSettingsResponse> updateSettings(
            @Valid @RequestBody TenantSettingsRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(tenantAdminSettingsService.updateSettings(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/subscription/usage")
    ResponseEntity<TenantUsageResponse> usage(HttpServletRequest request) {
        return ResponseEntity.ok(tenantAdminSettingsService.usage(authenticatedUserResolver.requireUser(request)));
    }
}
