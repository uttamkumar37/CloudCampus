package com.cloudcampus.student.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.student.dto.AdmitStudentRequest;
import com.cloudcampus.student.dto.BulkImportResult;
import com.cloudcampus.student.dto.BulkStudentRow;
import com.cloudcampus.student.dto.StudentResponse;
import com.cloudcampus.student.dto.StudentSummaryResponse;
import com.cloudcampus.student.dto.UpdateStudentRequest;
import com.cloudcampus.student.entity.StudentStatus;
import com.cloudcampus.student.service.StudentService;
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
 * School Admin API — Student Management (CC-0501 – CC-0504).
 *
 * POST   /v1/school-admin/schools/{schoolId}/students              — admit student
 * GET    /v1/school-admin/schools/{schoolId}/students              — list (filtered)
 * GET    /v1/school-admin/classes/{classId}/students               — roster by class
 * GET    /v1/school-admin/sections/{sectionId}/students            — roster by section
 * GET    /v1/school-admin/students/{id}                            — full profile
 * PUT    /v1/school-admin/students/{id}                            — update profile
 * PATCH  /v1/school-admin/students/{id}/graduate                   — graduate
 * PATCH  /v1/school-admin/students/{id}/transfer                   — transfer
 * PATCH  /v1/school-admin/students/{id}/suspend                    — suspend
 * PATCH  /v1/school-admin/students/{id}/reinstate                  — reinstate
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN (SecurityConfig path rule).
 */
@RestController
@RequestMapping("/v1/school-admin")
@Tag(name = "School Admin — Students", description = "Student admission, profile, and status management")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @Operation(summary = "Admit a new student",
               description = "Creates a student record. studentNumber is auto-generated if omitted.")
    @PostMapping("/schools/{schoolId}/students")
    public ResponseEntity<ApiResponse<StudentResponse>> admit(
            @PathVariable UUID schoolId,
            @Valid @RequestBody AdmitStudentRequest request) {
        StudentResponse body = service.admit(schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "Bulk import students from CSV-derived JSON (CC-0508)",
               description = "Accepts a list of student rows parsed from a CSV file. Each row is imported independently — failures are collected and returned without aborting the batch.")
    @PostMapping("/schools/{schoolId}/students/bulk")
    public ResponseEntity<ApiResponse<BulkImportResult>> bulkAdmit(
            @PathVariable UUID schoolId,
            @RequestBody List<BulkStudentRow> rows) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.bulkAdmit(schoolId, rows)));
    }

    @Operation(summary = "List students for a school",
               description = "Supports filtering by status and name search via query params.")
    @GetMapping("/schools/{schoolId}/students")
    public ResponseEntity<ApiResponse<List<StudentSummaryResponse>>> list(
            @PathVariable UUID schoolId,
            @RequestParam(required = false) StudentStatus status,
            @RequestParam(required = false) String search) {

        List<StudentSummaryResponse> body;
        if (search != null && !search.isBlank()) {
            body = service.search(schoolId, search);
        } else if (status != null) {
            body = service.listBySchoolAndStatus(schoolId, status);
        } else {
            body = service.listBySchool(schoolId);
        }
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List students in a class (CC-0504)")
    @GetMapping("/classes/{classId}/students")
    public ResponseEntity<ApiResponse<List<StudentSummaryResponse>>> listByClass(
            @PathVariable UUID classId) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.listByClass(classId)));
    }

    @Operation(summary = "List students in a section (CC-0504)")
    @GetMapping("/sections/{sectionId}/students")
    public ResponseEntity<ApiResponse<List<StudentSummaryResponse>>> listBySection(
            @PathVariable UUID sectionId) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.listBySection(sectionId)));
    }

    @Operation(summary = "Get full student profile (CC-0503)")
    @GetMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.getById(id)));
    }

    @Operation(summary = "Update student profile (CC-0503)")
    @PutMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStudentRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.update(id, request)));
    }

    @Operation(summary = "Mark student as graduated")
    @PatchMapping("/students/{id}/graduate")
    public ResponseEntity<ApiResponse<StudentResponse>> graduate(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.graduate(id)));
    }

    @Operation(summary = "Mark student as transferred to another school")
    @PatchMapping("/students/{id}/transfer")
    public ResponseEntity<ApiResponse<StudentResponse>> transfer(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.transfer(id)));
    }

    @Operation(summary = "Suspend student (disciplinary)")
    @PatchMapping("/students/{id}/suspend")
    public ResponseEntity<ApiResponse<StudentResponse>> suspend(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.suspend(id)));
    }

    @Operation(summary = "Reinstate suspended student")
    @PatchMapping("/students/{id}/reinstate")
    public ResponseEntity<ApiResponse<StudentResponse>> reinstate(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.reinstate(id)));
    }
}
