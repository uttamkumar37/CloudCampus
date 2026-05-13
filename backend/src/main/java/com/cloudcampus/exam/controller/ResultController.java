package com.cloudcampus.exam.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.exam.dto.ExamResultResponse;
import com.cloudcampus.exam.service.ResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * School Admin API — Result Generation (CC-1103) + Report Card (CC-1104).
 *
 * POST /v1/school-admin/schools/{schoolId}/exams/{examId}/results/generate
 *       — trigger result generation / re-generation for the exam
 *
 * GET  /v1/school-admin/schools/{schoolId}/exams/{examId}/results
 *       — ranked list of all student results for the exam
 *
 * GET  /v1/school-admin/schools/{schoolId}/exams/{examId}/results/students/{studentId}
 *       — individual student result + per-subject breakdown (report card)
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/exams/{examId}/results")
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN','SUPER_ADMIN')")
@Tag(name = "Exam Results", description = "CC-1103/CC-1104 — Result generation & report cards")
public class ResultController {

    private final ResultService  resultService;

    public ResultController(ResultService resultService) {
        this.resultService  = resultService;
    }

    // ─────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Generate (or re-generate) results for the exam")
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<ExamResultResponse>>> generate(
            @PathVariable UUID schoolId,
            @PathVariable UUID examId) {

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());

        List<ExamResultResponse> results = resultService.generate(tenantId, schoolId, examId);

        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), results));
    }

    @Operation(summary = "Get ranked results list for the exam")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExamResultResponse>>> listResults(
            @PathVariable UUID schoolId,
            @PathVariable UUID examId) {

        List<ExamResultResponse> results = resultService.listResults(schoolId, examId);

        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), results));
    }

    @Operation(summary = "Get individual student result with per-subject breakdown (report card)")
    @GetMapping("/students/{studentId}")
    public ResponseEntity<ApiResponse<ExamResultResponse>> getStudentResult(
            @PathVariable UUID schoolId,
            @PathVariable UUID examId,
            @PathVariable UUID studentId) {

        ExamResultResponse result = resultService.getStudentResult(schoolId, examId, studentId);

        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), result));
    }
}
