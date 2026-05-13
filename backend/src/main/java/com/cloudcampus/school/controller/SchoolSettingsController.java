package com.cloudcampus.school.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.school.dto.SchoolSettingsRequest;
import com.cloudcampus.school.dto.SchoolSettingsResponse;
import com.cloudcampus.school.service.SchoolSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * School Admin API — School Settings.
 *
 * GET  /v1/school-admin/schools/{schoolId}/settings  — retrieve current settings
 * PUT  /v1/school-admin/schools/{schoolId}/settings  — replace all configurable fields
 *
 * The settings row is initialised with defaults when the school is created
 * (via SchoolSettingsService.initDefaults). No POST endpoint is needed.
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN (SecurityConfig path rule).
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/settings")
@Tag(name = "School Admin — Settings", description = "Manage operational configuration for a school")
public class SchoolSettingsController {

    private final SchoolSettingsService service;

    public SchoolSettingsController(SchoolSettingsService service) {
        this.service = service;
    }

    @Operation(summary = "Get school settings")
    @GetMapping
    public ResponseEntity<ApiResponse<SchoolSettingsResponse>> get(@PathVariable UUID schoolId) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.get(schoolId)));
    }

    @Operation(summary = "Update school settings",
               description = "Full replacement of all configurable school-level settings.")
    @PutMapping
    public ResponseEntity<ApiResponse<SchoolSettingsResponse>> update(
            @PathVariable UUID schoolId,
            @Valid @RequestBody SchoolSettingsRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.update(schoolId, request)));
    }
}
