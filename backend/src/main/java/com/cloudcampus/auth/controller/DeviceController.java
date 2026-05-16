package com.cloudcampus.auth.controller;

import com.cloudcampus.auth.dto.DeviceSessionResponse;
import com.cloudcampus.auth.service.DeviceSessionService;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Device session management (CC-0110).
 *
 * GET    /v1/auth/devices       — list active sessions for the current user
 * DELETE /v1/auth/devices/{id}  — revoke a specific session
 */
@RestController
@RequestMapping("/v1/auth/devices")
@Tag(name = "Devices", description = "Manage authenticated device sessions")
public class DeviceController {

    private final DeviceSessionService deviceSessionService;

    public DeviceController(DeviceSessionService deviceSessionService) {
        this.deviceSessionService = deviceSessionService;
    }

    @Operation(summary = "List active device sessions")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DeviceSessionResponse>>> listDevices() {
        UUID userId = RequestContext.getUserId();
        List<DeviceSessionResponse> sessions = deviceSessionService.listActive(userId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), sessions));
    }

    @Operation(summary = "Revoke a device session")
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revokeDevice(@PathVariable UUID id) {
        UUID userId = RequestContext.getUserId();
        deviceSessionService.revoke(id, userId);
        return ResponseEntity.noContent().build();
    }
}
