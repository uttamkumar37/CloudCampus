package com.cloudcampus.school.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.school.dto.SectionRequest;
import com.cloudcampus.school.dto.SectionResponse;
import com.cloudcampus.school.service.SectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * School Admin API — Sections.
 *
 * POST   /v1/school-admin/schools/{schoolId}/sections        — create
 * GET    /v1/school-admin/classes/{classId}/sections         — list by class
 * GET    /v1/school-admin/sections/{id}                      — get one
 * PUT    /v1/school-admin/sections/{id}                      — update
 * DELETE /v1/school-admin/sections/{id}                      — delete
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN (SecurityConfig path rule).
 */
@RestController
@RequestMapping("/v1/school-admin")
@Tag(name = "School Admin — Sections", description = "Manage sections within a class")
public class SectionController {

    private final SectionService service;

    public SectionController(SectionService service) {
        this.service = service;
    }

    @Operation(summary = "Create section")
    @PostMapping("/schools/{schoolId}/sections")
    public ResponseEntity<ApiResponse<SectionResponse>> create(
            @PathVariable UUID schoolId,
            @Valid @RequestBody SectionRequest request) {
        SectionResponse body = service.create(schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List sections for a class")
    @GetMapping("/classes/{classId}/sections")
    public ResponseEntity<ApiResponse<List<SectionResponse>>> listByClass(
            @PathVariable UUID classId) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.listByClass(classId)));
    }

    @Operation(summary = "Get section by ID")
    @GetMapping("/sections/{id}")
    public ResponseEntity<ApiResponse<SectionResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.getById(id)));
    }

    @Operation(summary = "Update section")
    @PutMapping("/sections/{id}")
    public ResponseEntity<ApiResponse<SectionResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody SectionRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.update(id, request)));
    }

    @Operation(summary = "Delete section",
               description = "Permanently removes the section. Only safe when no students are enrolled.")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
