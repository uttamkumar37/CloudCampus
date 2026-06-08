package com.cloudcampus.platform.superadmin.control;

import java.util.List;

import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/super-admin")
public class SuperAdminAccessControlController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final SuperAdminAccessControlService accessControlService;

    public SuperAdminAccessControlController(
            AuthenticatedUserResolver authenticatedUserResolver,
            SuperAdminAccessControlService accessControlService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.accessControlService = accessControlService;
    }

    @GetMapping("/users")
    ResponseEntity<SuperAdminPageResponse<SuperAdminAccessControlUserResponse>> users(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.users(
                authenticatedUserResolver.requireUser(request),
                new AccessControlUserQuery(page, size, search, tenantId, schoolId, role, status)
        ));
    }

    @GetMapping("/users/{userId}")
    ResponseEntity<SuperAdminAccessControlUserResponse> user(
            @PathVariable String userId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.user(authenticatedUserResolver.requireUser(request), userId));
    }

    @GetMapping("/users/{userId}/roles")
    ResponseEntity<List<SuperAdminUserRoleAssignmentResponse>> userRoles(
            @PathVariable String userId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.roles(authenticatedUserResolver.requireUser(request), userId));
    }

    @PostMapping("/users/{userId}/roles")
    ResponseEntity<SuperAdminUserRoleAssignmentResponse> assignRole(
            @PathVariable String userId,
            @Valid @RequestBody RoleAssignmentRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.assignRole(authenticatedUserResolver.requireUser(request), userId, requestBody));
    }

    @PatchMapping("/users/{userId}/roles/{roleAssignmentId}")
    ResponseEntity<SuperAdminUserRoleAssignmentResponse> updateRole(
            @PathVariable String userId,
            @PathVariable String roleAssignmentId,
            @Valid @RequestBody RoleAssignmentUpdateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.updateRole(
                authenticatedUserResolver.requireUser(request),
                userId,
                roleAssignmentId,
                requestBody
        ));
    }

    @DeleteMapping("/users/{userId}/roles/{roleAssignmentId}")
    ResponseEntity<Void> deactivateRole(
            @PathVariable String userId,
            @PathVariable String roleAssignmentId,
            HttpServletRequest request
    ) {
        accessControlService.deactivateRole(authenticatedUserResolver.requireUser(request), userId, roleAssignmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/permissions")
    ResponseEntity<List<SuperAdminPermissionResponse>> permissions(HttpServletRequest request) {
        return ResponseEntity.ok(accessControlService.permissions(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/roles/{role}/permissions")
    ResponseEntity<List<SuperAdminPermissionResponse>> rolePermissions(
            @PathVariable UserRole role,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.rolePermissions(authenticatedUserResolver.requireUser(request), role));
    }

    @GetMapping("/users/{userId}/permission-overrides")
    ResponseEntity<List<SuperAdminPermissionOverrideResponse>> overrides(
            @PathVariable String userId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.overrides(authenticatedUserResolver.requireUser(request), userId));
    }

    @PostMapping("/users/{userId}/permission-overrides")
    ResponseEntity<SuperAdminPermissionOverrideResponse> createOverride(
            @PathVariable String userId,
            @Valid @RequestBody PermissionOverrideRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.createOverride(authenticatedUserResolver.requireUser(request), userId, requestBody));
    }

    @PatchMapping("/users/{userId}/permission-overrides/{overrideId}")
    ResponseEntity<SuperAdminPermissionOverrideResponse> updateOverride(
            @PathVariable String userId,
            @PathVariable String overrideId,
            @Valid @RequestBody PermissionOverrideUpdateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.updateOverride(
                authenticatedUserResolver.requireUser(request),
                userId,
                overrideId,
                requestBody
        ));
    }

    @DeleteMapping("/users/{userId}/permission-overrides/{overrideId}")
    ResponseEntity<Void> deactivateOverride(
            @PathVariable String userId,
            @PathVariable String overrideId,
            HttpServletRequest request
    ) {
        accessControlService.deactivateOverride(authenticatedUserResolver.requireUser(request), userId, overrideId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/students/{studentId}/guardians")
    ResponseEntity<SuperAdminStudentGuardianResponse> linkGuardian(
            @PathVariable String studentId,
            @Valid @RequestBody StudentGuardianRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.linkGuardian(authenticatedUserResolver.requireUser(request), studentId, requestBody));
    }

    @PatchMapping("/students/{studentId}/guardians/{guardianLinkId}")
    ResponseEntity<SuperAdminStudentGuardianResponse> updateGuardian(
            @PathVariable String studentId,
            @PathVariable String guardianLinkId,
            @Valid @RequestBody StudentGuardianUpdateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.updateGuardian(
                authenticatedUserResolver.requireUser(request),
                studentId,
                guardianLinkId,
                requestBody
        ));
    }

    @DeleteMapping("/students/{studentId}/guardians/{guardianLinkId}")
    ResponseEntity<Void> deactivateGuardian(
            @PathVariable String studentId,
            @PathVariable String guardianLinkId,
            HttpServletRequest request
    ) {
        accessControlService.deactivateGuardian(authenticatedUserResolver.requireUser(request), studentId, guardianLinkId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/teachers/{teacherUserId}/assignments")
    ResponseEntity<SuperAdminTeacherAssignmentResponse> createTeacherAssignment(
            @PathVariable String teacherUserId,
            @Valid @RequestBody TeacherAssignmentGovernanceRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.createTeacherAssignment(
                authenticatedUserResolver.requireUser(request),
                teacherUserId,
                requestBody
        ));
    }

    @PatchMapping("/teachers/{teacherUserId}/assignments/{assignmentId}")
    ResponseEntity<SuperAdminTeacherAssignmentResponse> updateTeacherAssignment(
            @PathVariable String teacherUserId,
            @PathVariable String assignmentId,
            @Valid @RequestBody TeacherAssignmentGovernanceRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(accessControlService.updateTeacherAssignment(
                authenticatedUserResolver.requireUser(request),
                teacherUserId,
                assignmentId,
                requestBody
        ));
    }

    @DeleteMapping("/teachers/{teacherUserId}/assignments/{assignmentId}")
    ResponseEntity<Void> deactivateTeacherAssignment(
            @PathVariable String teacherUserId,
            @PathVariable String assignmentId,
            HttpServletRequest request
    ) {
        accessControlService.deactivateTeacherAssignment(authenticatedUserResolver.requireUser(request), teacherUserId, assignmentId);
        return ResponseEntity.noContent().build();
    }
}
