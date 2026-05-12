package com.cloudcampus.notice.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.notice.dto.NoticeCreateRequest;
import com.cloudcampus.notice.dto.NoticeResponse;
import com.cloudcampus.notice.entity.NoticeCategory;
import com.cloudcampus.notice.service.NoticeService;
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
 * School Admin Notice Board API (CC-2101).
 *
 * POST   /v1/school-admin/schools/{schoolId}/notices
 * GET    /v1/school-admin/schools/{schoolId}/notices
 * GET    /v1/school-admin/schools/{schoolId}/notices/{noticeId}
 * PATCH  /v1/school-admin/schools/{schoolId}/notices/{noticeId}/publish
 * DELETE /v1/school-admin/schools/{schoolId}/notices/{noticeId}
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/notices")
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
@Tag(name = "Notice Board", description = "School announcements and notice board")
public class NoticeController {

    private final NoticeService noticeService;

    NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @PostMapping
    @Operation(summary = "Create a notice")
    public ResponseEntity<ApiResponse<NoticeResponse>> create(
            @PathVariable UUID schoolId,
            @Valid @RequestBody NoticeCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                        noticeService.create(schoolId, req)));
    }

    @GetMapping
    @Operation(summary = "List notices with optional filters")
    public ResponseEntity<ApiResponse<PageResponse<NoticeResponse>>> list(
            @PathVariable UUID schoolId,
            @RequestParam(required = false) NoticeCategory category,
            @RequestParam(required = false) Boolean published,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                noticeService.list(schoolId, category, published, page, size)));
    }

    @GetMapping("/{noticeId}")
    @Operation(summary = "Get a notice by ID")
    public ResponseEntity<ApiResponse<NoticeResponse>> getById(
            @PathVariable UUID schoolId,
            @PathVariable UUID noticeId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                noticeService.getById(schoolId, noticeId)));
    }

    @PatchMapping("/{noticeId}/publish")
    @Operation(summary = "Publish a draft notice")
    public ResponseEntity<ApiResponse<NoticeResponse>> publish(
            @PathVariable UUID schoolId,
            @PathVariable UUID noticeId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                noticeService.publish(schoolId, noticeId)));
    }

    @DeleteMapping("/{noticeId}")
    @Operation(summary = "Delete a draft notice")
    public ResponseEntity<Void> delete(
            @PathVariable UUID schoolId,
            @PathVariable UUID noticeId) {
        noticeService.delete(schoolId, noticeId);
        return ResponseEntity.noContent().build();
    }
}
