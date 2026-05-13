package com.cloudcampus.exam.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.exam.dto.ExamCreateRequest;
import com.cloudcampus.exam.dto.ExamResponse;
import com.cloudcampus.exam.dto.ExamStatusUpdateRequest;
import com.cloudcampus.exam.dto.ExamSubjectRequest;
import com.cloudcampus.exam.dto.ExamSubjectResponse;
import com.cloudcampus.exam.entity.ExamStatus;
import com.cloudcampus.exam.service.ExamService;
import com.cloudcampus.common.web.RequestContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
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

import java.util.UUID;

/**
 * School Admin API — Examination System (CC-1101).
 *
 * POST   /v1/school-admin/schools/{schoolId}/exams
 *        — create an exam (optionally with subject schedule inline)
 *
 * GET    /v1/school-admin/schools/{schoolId}/exams
 *        — paginated list; optional filters: academicYearId, status
 *
 * GET    /v1/school-admin/schools/{schoolId}/exams/{examId}
 *        — exam detail with full subject schedule
 *
 * PATCH  /v1/school-admin/schools/{schoolId}/exams/{examId}/status
 *        — transition exam status (DRAFT→SCHEDULED→ONGOING→COMPLETED|CANCELLED)
 *
 * POST   /v1/school-admin/schools/{schoolId}/exams/{examId}/subjects
 *        — add a subject paper to an existing exam
 *
 * DELETE /v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{entryId}
 *        — remove a subject paper from an exam
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN.
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/exams")
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN','SUPER_ADMIN')")
@Tag(name = "School Admin — Exams", description = "Examination creation and scheduling")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService    = examService;
    }

    @Operation(summary = "Create a new exam")
    @PostMapping
    public ResponseEntity<ApiResponse<ExamResponse>> create(
            @PathVariable UUID schoolId,
            @Valid @RequestBody ExamCreateRequest request) {

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        ExamResponse body = examService.create(tenantId, schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List exams for a school")
    @GetMapping
    public ApiResponse<PageResponse<ExamResponse>> list(
            @PathVariable UUID schoolId,
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) ExamStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ExamResponse> result = examService.list(schoolId, academicYearId, status, page, size);
        PageResponse<ExamResponse> pr = new PageResponse<>(
                result.getContent(),
                page * size,
                size,
                result.getTotalElements()
        );
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), pr);
    }

    @Operation(summary = "Get exam detail")
    @GetMapping("/{examId}")
    public ApiResponse<ExamResponse> getById(
            @PathVariable UUID schoolId,
            @PathVariable UUID examId) {

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                examService.getById(schoolId, examId));
    }

    @Operation(summary = "Update exam status")
    @PatchMapping("/{examId}/status")
    public ApiResponse<ExamResponse> updateStatus(
            @PathVariable UUID schoolId,
            @PathVariable UUID examId,
            @Valid @RequestBody ExamStatusUpdateRequest request) {

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                examService.updateStatus(schoolId, examId, request.status()));
    }

    @Operation(summary = "Add a subject paper to an exam")
    @PostMapping("/{examId}/subjects")
    public ResponseEntity<ApiResponse<ExamSubjectResponse>> addSubject(
            @PathVariable UUID schoolId,
            @PathVariable UUID examId,
            @Valid @RequestBody ExamSubjectRequest request) {

        ExamSubjectResponse body = examService.addSubject(schoolId, examId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "Remove a subject paper from an exam")
    @DeleteMapping("/{examId}/subjects/{entryId}")
    public ResponseEntity<Void> removeSubject(
            @PathVariable UUID schoolId,
            @PathVariable UUID examId,
            @PathVariable UUID entryId) {

        examService.removeSubject(schoolId, examId, entryId);
        return ResponseEntity.noContent().build();
    }
}
