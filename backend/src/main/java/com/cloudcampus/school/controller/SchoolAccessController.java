package com.cloudcampus.school.controller;

import com.cloudcampus.auth.security.JwtUtil;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.config.JwtProperties;
import com.cloudcampus.school.dto.GrantSchoolAccessRequest;
import com.cloudcampus.school.dto.SchoolAccessResponse;
import com.cloudcampus.school.dto.SwitchSchoolResponse;
import com.cloudcampus.school.service.UserSchoolAccessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Cross-school access management (CC-0214).
 *
 * User-facing:
 *   GET  /v1/me/schools                       — list schools the caller can access
 *   POST /v1/me/schools/{schoolId}/activate    — switch active school (new JWT returned)
 *
 * Super-admin:
 *   GET    /v1/super-admin/users/{userId}/school-access         — list user's grants
 *   POST   /v1/super-admin/users/{userId}/school-access         — grant access
 *   DELETE /v1/super-admin/users/{userId}/school-access/{schoolId} — revoke access
 */
@RestController
@Tag(name = "School Access", description = "Cross-school access grants and school switching")
public class SchoolAccessController {

    private final UserSchoolAccessService accessService;
    private final JwtUtil                 jwtUtil;
    private final JwtProperties           jwtProperties;

    public SchoolAccessController(UserSchoolAccessService accessService,
                                  JwtUtil jwtUtil,
                                  JwtProperties jwtProperties) {
        this.accessService = accessService;
        this.jwtUtil       = jwtUtil;
        this.jwtProperties = jwtProperties;
    }

    // ── User-facing ───────────────────────────────────────────────────────────

    @Operation(summary = "List schools the current user can access")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/v1/me/schools")
    public ResponseEntity<ApiResponse<List<SchoolAccessResponse>>> listMySchools() {
        UUID userId = RequestContext.getUserId();
        List<SchoolAccessResponse> schools = accessService.listForUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), schools));
    }

    @Operation(summary = "Switch active school — returns a new access token scoped to the target school")
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/v1/me/schools/{schoolId}/activate")
    public ResponseEntity<ApiResponse<SwitchSchoolResponse>> switchSchool(
            @PathVariable UUID schoolId
    ) {
        UUID userId   = RequestContext.getUserId();
        String tenantIdStr = RequestContext.getTenantId();
        UUID tenantId = tenantIdStr != null ? UUID.fromString(tenantIdStr) : null;

        if (!accessService.hasAccess(userId, schoolId)) {
            throw new ForbiddenException("You do not have access to this school");
        }

        // Issue a new short-lived access token with the updated school_id claim.
        // The existing refresh token is unchanged — the client keeps it.
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replaceFirst("^ROLE_", ""))
                .orElse("SCHOOL_ADMIN");
        String newToken = jwtUtil.generateAccessToken(userId, tenantId, schoolId, role);

        SwitchSchoolResponse body = new SwitchSchoolResponse(
                newToken, jwtProperties.accessTokenExpirySeconds(), schoolId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    // ── Super-admin ───────────────────────────────────────────────────────────

    @Operation(summary = "List school access grants for a user")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/v1/super-admin/users/{userId}/school-access")
    public ResponseEntity<ApiResponse<List<SchoolAccessResponse>>> listForUser(
            @PathVariable UUID userId
    ) {
        List<SchoolAccessResponse> schools = accessService.listForUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), schools));
    }

    @Operation(summary = "Grant a user access to a school")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/v1/super-admin/users/{userId}/school-access")
    public ResponseEntity<ApiResponse<Void>> grant(
            @PathVariable UUID userId,
            @Valid @RequestBody GrantSchoolAccessRequest request
    ) {
        UUID tenantIdStr = null; // super-admin has no tenant — derive from school
        UUID grantedBy   = RequestContext.getUserId();
        accessService.grant(userId, request.schoolId(), tenantIdStr, grantedBy, request.isPrimary());
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), null));
    }

    @Operation(summary = "Revoke a user's access to a school")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/v1/super-admin/users/{userId}/school-access/{schoolId}")
    public ResponseEntity<Void> revoke(
            @PathVariable UUID userId,
            @PathVariable UUID schoolId
    ) {
        accessService.revoke(userId, schoolId);
        return ResponseEntity.noContent().build();
    }
}
