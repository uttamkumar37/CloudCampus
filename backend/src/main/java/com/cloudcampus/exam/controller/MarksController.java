package com.cloudcampus.exam.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.exam.dto.BulkMarksEntryRequest;
import com.cloudcampus.exam.dto.MarksEntryRequest;
import com.cloudcampus.exam.dto.StudentMarkResponse;
import com.cloudcampus.exam.service.MarksService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
 * School Admin API — Marks Entry System (CC-1102).
 *
 * POST /v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks/bulk
 *       — bulk upsert marks for all students in a paper
 *
 * GET  /v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks
 *       — list all mark records for a paper
 *
 * PUT  /v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks/{markId}
 *       — update a single mark entry
 *
 * DELETE /v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks/{markId}
 *       — remove a single mark entry
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/exams/{examId}/subjects/{subjectEntryId}/marks")
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN','SUPER_ADMIN')")
@Tag(name = "Marks Entry", description = "CC-1102 — Marks recording per student per exam paper")
public class MarksController {

    private final MarksService marksService;
    private final RequestContext requestContext;

    public MarksController(MarksService marksService, RequestContext requestContext) {
        this.marksService   = marksService;
        this.requestContext = requestContext;
    }

    // ─────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Bulk save/update marks for all students in a paper")
    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<StudentMarkResponse>>> bulkSave(
            @PathVariable UUID schoolId,
            @PathVariable UUID examId,
            @PathVariable UUID subjectEntryId,
            @Valid @RequestBody BulkMarksEntryRequest request) {

        UUID tenantId  = UUID.fromString(requestContext.getTenantId());
        UUID enteredBy = requestContext.getUserId();

        List<StudentMarkResponse> saved = marksService.bulkSave(
                tenantId, schoolId, examId, subjectEntryId, request, enteredBy);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), saved));
    }

    @Operation(summary = "List all marks for a specific exam paper")
    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentMarkResponse>>> list(
            @PathVariable UUID schoolId,
            @PathVariable UUID examId,
            @PathVariable UUID subjectEntryId) {

        List<StudentMarkResponse> marks =
                marksService.listBySubject(schoolId, examId, subjectEntryId);

        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), marks));
    }

    @Operation(summary = "Update a single mark entry")
    @PutMapping("/{markId}")
    public ResponseEntity<ApiResponse<StudentMarkResponse>> update(
            @PathVariable UUID schoolId,
            @PathVariable UUID examId,
            @PathVariable UUID subjectEntryId,
            @PathVariable UUID markId,
            @Valid @RequestBody MarksEntryRequest request) {

        UUID enteredBy = requestContext.getUserId();

        StudentMarkResponse updated = marksService.update(
                schoolId, examId, subjectEntryId, markId, request, enteredBy);

        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), updated));
    }

    @Operation(summary = "Delete a single mark entry")
    @DeleteMapping("/{markId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID schoolId,
            @PathVariable UUID examId,
            @PathVariable UUID subjectEntryId,
            @PathVariable UUID markId) {

        marksService.delete(schoolId, examId, subjectEntryId, markId);
        return ResponseEntity.noContent().build();
    }
}
