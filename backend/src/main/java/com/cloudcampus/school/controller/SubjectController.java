package com.cloudcampus.school.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.school.dto.SubjectRequest;
import com.cloudcampus.school.dto.SubjectResponse;
import com.cloudcampus.school.service.SubjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * School Admin API — Subjects.
 *
 * POST   /v1/school-admin/schools/{schoolId}/subjects                         — create
 * GET    /v1/school-admin/schools/{schoolId}/subjects?activeOnly=true|false    — list
 * GET    /v1/school-admin/subjects/{id}                                        — get one
 * PUT    /v1/school-admin/subjects/{id}                                        — update
 * PATCH  /v1/school-admin/subjects/{id}/deactivate                             — soft-disable
 * PATCH  /v1/school-admin/subjects/{id}/activate                               — re-enable
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN (SecurityConfig path rule).
 */
@RestController
@RequestMapping("/v1/school-admin")
@Tag(name = "School Admin — Subjects", description = "Manage academic subjects for a school")
public class SubjectController {

    private final SubjectService service;

    public SubjectController(SubjectService service) {
        this.service = service;
    }

    @Operation(summary = "Create subject")
    @PostMapping("/schools/{schoolId}/subjects")
    public ResponseEntity<ApiResponse<SubjectResponse>> create(
            @PathVariable UUID schoolId,
            @Valid @RequestBody SubjectRequest request) {
        SubjectResponse body = service.create(schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List subjects for a school",
               description = "Pass activeOnly=true (default) to get only active subjects; false for all.")
    @GetMapping("/schools/{schoolId}/subjects")
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> list(
            @PathVariable UUID schoolId,
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        List<SubjectResponse> body = activeOnly
                ? service.listActive(schoolId)
                : service.listBySchool(schoolId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "Get subject by ID")
    @GetMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<SubjectResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.getById(id)));
    }

    @Operation(summary = "Update subject")
    @PutMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<SubjectResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.update(id, request)));
    }

    @Operation(summary = "Deactivate subject",
               description = "Soft-disables the subject. Historical timetable data is retained.")
    @PatchMapping("/subjects/{id}/deactivate")
    public ResponseEntity<ApiResponse<SubjectResponse>> deactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.deactivate(id)));
    }

    @Operation(summary = "Activate subject", description = "Re-enables a previously deactivated subject.")
    @PatchMapping("/subjects/{id}/activate")
    public ResponseEntity<ApiResponse<SubjectResponse>> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.activate(id)));
    }
}
