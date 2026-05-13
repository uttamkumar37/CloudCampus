package com.cloudcampus.school.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.school.dto.AcademicYearRequest;
import com.cloudcampus.school.dto.AcademicYearResponse;
import com.cloudcampus.school.service.AcademicYearService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * School Admin API — Academic Years.
 *
 * POST   /v1/school-admin/schools/{schoolId}/academic-years         — create
 * GET    /v1/school-admin/schools/{schoolId}/academic-years         — list all
 * GET    /v1/school-admin/academic-years/{id}                       — get one
 * PUT    /v1/school-admin/academic-years/{id}                       — update
 * PATCH  /v1/school-admin/academic-years/{id}/set-current           — make current
 * PATCH  /v1/school-admin/academic-years/{id}/close                 — close year
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN (enforced by SecurityConfig path rule).
 */
@RestController
@RequestMapping("/v1/school-admin")
@Tag(name = "School Admin — Academic Years", description = "Manage academic years for a school")
public class AcademicYearController {

    private final AcademicYearService service;

    public AcademicYearController(AcademicYearService service) {
        this.service = service;
    }

    @Operation(summary = "Create academic year")
    @PostMapping("/schools/{schoolId}/academic-years")
    public ResponseEntity<ApiResponse<AcademicYearResponse>> create(
            @PathVariable UUID schoolId,
            @Valid @RequestBody AcademicYearRequest request) {
        AcademicYearResponse body = service.create(schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List academic years for a school")
    @GetMapping("/schools/{schoolId}/academic-years")
    public ResponseEntity<ApiResponse<List<AcademicYearResponse>>> list(
            @PathVariable UUID schoolId) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.listBySchool(schoolId)));
    }

    @Operation(summary = "Get academic year by ID")
    @GetMapping("/academic-years/{id}")
    public ResponseEntity<ApiResponse<AcademicYearResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.getById(id)));
    }

    @Operation(summary = "Update academic year")
    @PutMapping("/academic-years/{id}")
    public ResponseEntity<ApiResponse<AcademicYearResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody AcademicYearRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.update(id, request)));
    }

    @Operation(summary = "Mark academic year as current",
               description = "Clears the current flag from all other years of the same school before setting this one.")
    @PatchMapping("/academic-years/{id}/set-current")
    public ResponseEntity<ApiResponse<AcademicYearResponse>> setCurrent(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.setAsCurrent(id)));
    }

    @Operation(summary = "Close academic year",
               description = "Marks the year as CLOSED. A closed year cannot be reopened.")
    @PatchMapping("/academic-years/{id}/close")
    public ResponseEntity<ApiResponse<Void>> close(@PathVariable UUID id) {
        service.close(id);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), null));
    }
}
