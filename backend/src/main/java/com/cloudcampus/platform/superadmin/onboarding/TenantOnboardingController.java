package com.cloudcampus.platform.superadmin.onboarding;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;

import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/super-admin/tenants")
public class TenantOnboardingController {

    private final TenantOnboardingService tenantOnboardingService;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    public TenantOnboardingController(
            TenantOnboardingService tenantOnboardingService,
            AuthenticatedUserResolver authenticatedUserResolver
    ) {
        this.tenantOnboardingService = tenantOnboardingService;
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    @PostMapping("/onboard")
    ResponseEntity<TenantOnboardingResponse> onboard(
            @Valid @RequestBody TenantOnboardingRequest request,
            HttpServletRequest servletRequest
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.requireUser(servletRequest);
        if (authenticatedUser.user().getRole() != UserRole.SUPER_ADMIN) {
            throw new ForbiddenException("Only SUPER_ADMIN can onboard tenants.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(tenantOnboardingService.onboard(request, authenticatedUser));
    }
}
