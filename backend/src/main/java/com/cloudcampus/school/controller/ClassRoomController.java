package com.cloudcampus.school.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.school.dto.ClassRoomRequest;
import com.cloudcampus.school.dto.ClassRoomResponse;
import com.cloudcampus.school.service.ClassRoomService;
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
 * School Admin API — Classes (ClassRoom).
 *
 * POST   /v1/school-admin/schools/{schoolId}/classes                     — create
 * GET    /v1/school-admin/academic-years/{academicYearId}/classes         — list by year
 * GET    /v1/school-admin/classes/{id}                                    — get one
 * PUT    /v1/school-admin/classes/{id}                                    — update
 * DELETE /v1/school-admin/classes/{id}                                    — delete
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN (SecurityConfig path rule).
 */
@RestController
@RequestMapping("/v1/school-admin")
@Tag(name = "School Admin — Classes", description = "Manage class grades within an academic year")
public class ClassRoomController {

    private final ClassRoomService service;

    public ClassRoomController(ClassRoomService service) {
        this.service = service;
    }

    @Operation(summary = "Create class")
    @PostMapping("/schools/{schoolId}/classes")
    public ResponseEntity<ApiResponse<ClassRoomResponse>> create(
            @PathVariable UUID schoolId,
            @Valid @RequestBody ClassRoomRequest request) {
        ClassRoomResponse body = service.create(schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List classes for an academic year")
    @GetMapping("/academic-years/{academicYearId}/classes")
    public ResponseEntity<ApiResponse<List<ClassRoomResponse>>> listByYear(
            @PathVariable UUID academicYearId) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.listByAcademicYear(academicYearId)));
    }

    @Operation(summary = "Get class by ID")
    @GetMapping("/classes/{id}")
    public ResponseEntity<ApiResponse<ClassRoomResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.getById(id)));
    }

    @Operation(summary = "Update class")
    @PutMapping("/classes/{id}")
    public ResponseEntity<ApiResponse<ClassRoomResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ClassRoomRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.update(id, request)));
    }

    @Operation(summary = "Delete class",
               description = "Permanently removes the class. Only safe when no sections or students reference it.")
    @DeleteMapping("/classes/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
