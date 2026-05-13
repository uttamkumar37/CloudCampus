package com.cloudcampus.assignment.controller;

import com.cloudcampus.assignment.dto.AssignmentCreateRequest;
import com.cloudcampus.assignment.dto.AssignmentResponse;
import com.cloudcampus.assignment.dto.AssignmentStatusUpdateRequest;
import com.cloudcampus.assignment.dto.GradeSubmissionRequest;
import com.cloudcampus.assignment.dto.SubmissionResponse;
import com.cloudcampus.assignment.entity.AssignmentStatus;
import com.cloudcampus.assignment.service.AssignmentService;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.RequestContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * School Admin API — Assignment Engine (CC-0703).
 *
 * POST   /v1/school-admin/schools/{schoolId}/assignments
 * GET    /v1/school-admin/schools/{schoolId}/assignments
 * GET    /v1/school-admin/schools/{schoolId}/assignments/{id}
 * PATCH  /v1/school-admin/schools/{schoolId}/assignments/{id}/status
 * DELETE /v1/school-admin/schools/{schoolId}/assignments/{id}
 * GET    /v1/school-admin/schools/{schoolId}/assignments/{id}/submissions
 * PATCH  /v1/school-admin/schools/{schoolId}/assignments/{id}/submissions/{subId}/grade
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/assignments")
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN','SUPER_ADMIN')")
@Tag(name = "School Admin — Assignments", description = "Assignment creation, publishing and grading")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @Operation(summary = "Create an assignment")
    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentResponse>> create(
            @PathVariable UUID schoolId,
            @Valid @RequestBody AssignmentCreateRequest request) {

        UUID tenantId  = UUID.fromString(RequestContext.getTenantId());
        UUID assignedBy = RequestContext.getUserId();
        AssignmentResponse body = assignmentService.create(tenantId, schoolId, assignedBy, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List assignments")
    @GetMapping
    public ApiResponse<PageResponse<AssignmentResponse>> list(
            @PathVariable UUID schoolId,
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) UUID classId,
            @RequestParam(required = false) UUID sectionId,
            @RequestParam(required = false) AssignmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                assignmentService.list(schoolId, academicYearId, classId, sectionId, status, page, size));
    }

    @Operation(summary = "Get assignment detail")
    @GetMapping("/{assignmentId}")
    public ApiResponse<AssignmentResponse> getById(
            @PathVariable UUID schoolId,
            @PathVariable UUID assignmentId) {

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                assignmentService.getById(schoolId, assignmentId));
    }

    @Operation(summary = "Update assignment status")
    @PatchMapping("/{assignmentId}/status")
    public ApiResponse<AssignmentResponse> updateStatus(
            @PathVariable UUID schoolId,
            @PathVariable UUID assignmentId,
            @Valid @RequestBody AssignmentStatusUpdateRequest request) {

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                assignmentService.updateStatus(schoolId, assignmentId, request.status()));
    }

    @Operation(summary = "Delete a draft assignment")
    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID schoolId,
            @PathVariable UUID assignmentId) {

        assignmentService.delete(schoolId, assignmentId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "List submissions for an assignment")
    @GetMapping("/{assignmentId}/submissions")
    public ApiResponse<List<SubmissionResponse>> listSubmissions(
            @PathVariable UUID schoolId,
            @PathVariable UUID assignmentId) {

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                assignmentService.listSubmissions(schoolId, assignmentId));
    }

    @Operation(summary = "Grade a submission")
    @PatchMapping("/{assignmentId}/submissions/{submissionId}/grade")
    public ApiResponse<SubmissionResponse> grade(
            @PathVariable UUID schoolId,
            @PathVariable UUID assignmentId,
            @PathVariable UUID submissionId,
            @Valid @RequestBody GradeSubmissionRequest request) {

        UUID gradedBy = RequestContext.getUserId();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                assignmentService.gradeSubmission(schoolId, assignmentId, submissionId, gradedBy, request));
    }
}
