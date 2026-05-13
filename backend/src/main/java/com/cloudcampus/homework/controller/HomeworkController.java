package com.cloudcampus.homework.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.homework.dto.HomeworkCreateRequest;
import com.cloudcampus.homework.dto.HomeworkResponse;
import com.cloudcampus.homework.dto.HomeworkStatusUpdateRequest;
import com.cloudcampus.homework.entity.HomeworkStatus;
import com.cloudcampus.homework.service.HomeworkService;
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

import java.util.UUID;

/**
 * School Admin API — Homework Management (CC-0702).
 *
 * POST   /v1/school-admin/schools/{schoolId}/homework
 *        — create a homework assignment (draft or publish immediately)
 *
 * GET    /v1/school-admin/schools/{schoolId}/homework
 *        — paginated list; optional filters: academicYearId, classId, sectionId, status
 *
 * GET    /v1/school-admin/schools/{schoolId}/homework/{homeworkId}
 *        — assignment detail
 *
 * PATCH  /v1/school-admin/schools/{schoolId}/homework/{homeworkId}/status
 *        — transition status (DRAFT→PUBLISHED, PUBLISHED→CLOSED)
 *
 * DELETE /v1/school-admin/schools/{schoolId}/homework/{homeworkId}
 *        — delete a DRAFT assignment
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN.
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/homework")
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN','SUPER_ADMIN')")
@Tag(name = "School Admin — Homework", description = "Homework assignment management")
public class HomeworkController {

    private final HomeworkService homeworkService;

    public HomeworkController(HomeworkService homeworkService) {
        this.homeworkService = homeworkService;
    }

    @Operation(summary = "Create a homework assignment")
    @PostMapping
    public ResponseEntity<ApiResponse<HomeworkResponse>> create(
            @PathVariable UUID schoolId,
            @Valid @RequestBody HomeworkCreateRequest request) {

        UUID tenantId  = UUID.fromString(RequestContext.getTenantId());
        UUID assignedBy = RequestContext.getUserId();
        HomeworkResponse body = homeworkService.create(tenantId, schoolId, assignedBy, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List homework assignments")
    @GetMapping
    public ApiResponse<PageResponse<HomeworkResponse>> list(
            @PathVariable UUID schoolId,
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) UUID classId,
            @RequestParam(required = false) UUID sectionId,
            @RequestParam(required = false) HomeworkStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                homeworkService.list(schoolId, academicYearId, classId, sectionId, status, page, size));
    }

    @Operation(summary = "Get homework assignment detail")
    @GetMapping("/{homeworkId}")
    public ApiResponse<HomeworkResponse> getById(
            @PathVariable UUID schoolId,
            @PathVariable UUID homeworkId) {

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                homeworkService.getById(schoolId, homeworkId));
    }

    @Operation(summary = "Update homework status")
    @PatchMapping("/{homeworkId}/status")
    public ApiResponse<HomeworkResponse> updateStatus(
            @PathVariable UUID schoolId,
            @PathVariable UUID homeworkId,
            @Valid @RequestBody HomeworkStatusUpdateRequest request) {

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                homeworkService.updateStatus(schoolId, homeworkId, request.status()));
    }

    @Operation(summary = "Delete a draft homework assignment")
    @DeleteMapping("/{homeworkId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID schoolId,
            @PathVariable UUID homeworkId) {

        homeworkService.delete(schoolId, homeworkId);
        return ResponseEntity.noContent().build();
    }
}
