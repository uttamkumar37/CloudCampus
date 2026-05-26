package com.cloudcampus.platform.tenantadmin.school;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.List;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/tenant-admin/schools")
public class TenantAdminSchoolController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final TenantAdminSchoolService tenantAdminSchoolService;

    public TenantAdminSchoolController(
            AuthenticatedUserResolver authenticatedUserResolver,
            TenantAdminSchoolService tenantAdminSchoolService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.tenantAdminSchoolService = tenantAdminSchoolService;
    }

    @GetMapping
    ResponseEntity<List<TenantAdminSchoolResponse>> schools(HttpServletRequest request) {
        return ResponseEntity.ok(tenantAdminSchoolService.schools(authenticatedUserResolver.requireUser(request)));
    }

    @PostMapping
    ResponseEntity<TenantAdminSchoolResponse> createSchool(
            @Valid @RequestBody TenantAdminSchoolRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tenantAdminSchoolService.createSchool(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @PatchMapping("/{schoolId}")
    ResponseEntity<TenantAdminSchoolResponse> updateSchool(
            @PathVariable String schoolId,
            @Valid @RequestBody TenantAdminSchoolUpdateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(tenantAdminSchoolService.updateSchool(
                authenticatedUserResolver.requireUser(request),
                schoolId,
                requestBody
        ));
    }

    @PostMapping("/{schoolId}/deactivate")
    ResponseEntity<TenantAdminSchoolResponse> deactivateSchool(
            @PathVariable String schoolId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(tenantAdminSchoolService.deactivateSchool(
                authenticatedUserResolver.requireUser(request),
                schoolId
        ));
    }

    @PostMapping("/{schoolId}/admins/invite")
    ResponseEntity<TenantSchoolAdminInviteResponse> inviteSchoolAdmin(
            @PathVariable String schoolId,
            @Valid @RequestBody TenantSchoolAdminInviteRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tenantAdminSchoolService.inviteSchoolAdmin(
                authenticatedUserResolver.requireUser(request),
                schoolId,
                requestBody
        ));
    }

    @GetMapping("/{schoolId}/admins")
    ResponseEntity<List<TenantSchoolAdminSummaryResponse>> schoolAdmins(
            @PathVariable String schoolId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(tenantAdminSchoolService.schoolAdmins(
                authenticatedUserResolver.requireUser(request),
                schoolId
        ));
    }

    @PostMapping("/{schoolId}/admins/{userId}/resend-invitation")
    ResponseEntity<TenantSchoolAdminInviteResponse> resendSchoolAdminInvitation(
            @PathVariable String schoolId,
            @PathVariable String userId,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tenantAdminSchoolService.resendSchoolAdminInvitation(
                authenticatedUserResolver.requireUser(request),
                schoolId,
                userId
        ));
    }

    @DeleteMapping("/{schoolId}/admins/{userId}/access")
    ResponseEntity<TenantSchoolAdminAccessRevokeResponse> revokeSchoolAdminAccess(
            @PathVariable String schoolId,
            @PathVariable String userId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(tenantAdminSchoolService.revokeSchoolAdminAccess(
                authenticatedUserResolver.requireUser(request),
                schoolId,
                userId
        ));
    }
}
