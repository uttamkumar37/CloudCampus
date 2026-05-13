package com.cloudcampus.school.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.school.dto.DepartmentRequest;
import com.cloudcampus.school.dto.DepartmentResponse;
import com.cloudcampus.school.service.DepartmentService;
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
 * School Admin API — Departments.
 *
 * POST   /v1/school-admin/schools/{schoolId}/departments                       — create
 * GET    /v1/school-admin/schools/{schoolId}/departments?activeOnly=true|false  — list
 * GET    /v1/school-admin/departments/{id}                                      — get one
 * PUT    /v1/school-admin/departments/{id}                                      — update
 * PATCH  /v1/school-admin/departments/{id}/deactivate                           — soft-disable
 * PATCH  /v1/school-admin/departments/{id}/activate                             — re-enable
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN (SecurityConfig path rule).
 */
@RestController
@RequestMapping("/v1/school-admin")
@Tag(name = "School Admin — Departments", description = "Manage academic and administrative departments")
public class DepartmentController {

    private final DepartmentService service;

    public DepartmentController(DepartmentService service) {
        this.service = service;
    }

    @Operation(summary = "Create department")
    @PostMapping("/schools/{schoolId}/departments")
    public ResponseEntity<ApiResponse<DepartmentResponse>> create(
            @PathVariable UUID schoolId,
            @Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse body = service.create(schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List departments for a school",
               description = "Pass activeOnly=true (default) for active only; false for all.")
    @GetMapping("/schools/{schoolId}/departments")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> list(
            @PathVariable UUID schoolId,
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        List<DepartmentResponse> body = activeOnly
                ? service.listActive(schoolId)
                : service.listBySchool(schoolId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "Get department by ID")
    @GetMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.getById(id)));
    }

    @Operation(summary = "Update department")
    @PutMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.update(id, request)));
    }

    @Operation(summary = "Deactivate department",
               description = "Soft-disables the department. Staff assignments are retained.")
    @PatchMapping("/departments/{id}/deactivate")
    public ResponseEntity<ApiResponse<DepartmentResponse>> deactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.deactivate(id)));
    }

    @Operation(summary = "Activate department", description = "Re-enables a previously deactivated department.")
    @PatchMapping("/departments/{id}/activate")
    public ResponseEntity<ApiResponse<DepartmentResponse>> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.activate(id)));
    }
}
