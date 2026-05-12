package com.cloudcampus.notification.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.notification.dto.DeviceRegisterRequest;
import com.cloudcampus.notification.service.DeviceTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Device token registration endpoint.
 *
 * POST /v1/devices/register — registers or refreshes the FCM/APNs push token
 * for the authenticated user's device. Called on every login by the mobile app.
 *
 * Requires a valid JWT. The userId is extracted from the security principal
 * (set by JwtAuthenticationFilter) — never trusted from the request body.
 */
@RestController
@RequestMapping("/v1/devices")
@Tag(name = "Devices", description = "Push notification device management")
public class DeviceController {

    private final DeviceTokenService deviceTokenService;

    public DeviceController(DeviceTokenService deviceTokenService) {
        this.deviceTokenService = deviceTokenService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register or refresh a device push token")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody DeviceRegisterRequest request,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());
        deviceTokenService.registerToken(userId, request);

        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), null));
    }
}
