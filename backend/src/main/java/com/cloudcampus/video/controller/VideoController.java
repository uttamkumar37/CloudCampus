package com.cloudcampus.video.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.video.dto.VideoResponse;
import com.cloudcampus.video.dto.VideoUploadRequest;
import com.cloudcampus.video.service.VideoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@Tag(name = "Video Resources", description = "Teacher video upload + student streaming via MinIO — CC-1202")
public class VideoController {

    private final VideoService    service;
    private final StaffRepository staffRepository;

    public VideoController(VideoService service, StaffRepository staffRepository) {
        this.service         = service;
        this.staffRepository = staffRepository;
    }

    // ── Teacher endpoints ─────────────────────────────────────────────────────

    @Operation(summary = "Initiate video upload",
               description = "Returns a pre-signed MinIO PUT URL. Client uploads the file directly to that URL, then calls /confirm.")
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/v1/teacher/videos/initiate")
    public ApiResponse<Map<String, Object>> initiate(@Valid @RequestBody VideoUploadRequest req) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        com.cloudcampus.staff.entity.Staff staff = resolveStaff();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.initiateUpload(tenantId, staff.getSchoolId(), staff.getId(), req));
    }

    @Operation(summary = "Confirm upload complete",
               description = "Call after the file has been PUT to the MinIO presigned URL. Marks the video as READY.")
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/v1/teacher/videos/{videoId}/confirm")
    public ApiResponse<VideoResponse> confirm(
            @PathVariable UUID videoId,
            @RequestBody Map<String, Object> body
    ) {
        UUID tenantId       = UUID.fromString(RequestContext.getTenantId());
        Long fileSizeBytes  = body.containsKey("fileSizeBytes") ? Long.valueOf(body.get("fileSizeBytes").toString()) : null;
        Integer durationSec = body.containsKey("durationSeconds") ? Integer.valueOf(body.get("durationSeconds").toString()) : null;
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.confirmUpload(tenantId, videoId, fileSizeBytes, durationSec));
    }

    @Operation(summary = "List my uploaded videos")
    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/v1/teacher/videos")
    public ApiResponse<List<VideoResponse>> myVideos() {
        UUID staffId = resolveStaffId();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.listByStaff(staffId));
    }

    @Operation(summary = "Delete video")
    @PreAuthorize("hasRole('TEACHER')")
    @DeleteMapping("/v1/teacher/videos/{videoId}")
    public ResponseEntity<Void> delete(@PathVariable UUID videoId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        service.delete(tenantId, videoId);
        return ResponseEntity.noContent().build();
    }

    // ── Student endpoints ─────────────────────────────────────────────────────

    @Operation(summary = "List videos for a subject")
    @PreAuthorize("hasRole('STUDENT') or hasRole('PARENT')")
    @GetMapping("/v1/student/videos")
    public ApiResponse<List<VideoResponse>> studentVideos(@RequestParam UUID subjectId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.listBySubject(subjectId, tenantId));
    }

    @Operation(summary = "Get video with streaming URL")
    @PreAuthorize("hasRole('STUDENT') or hasRole('PARENT') or hasRole('TEACHER')")
    @GetMapping("/v1/student/videos/{videoId}")
    public ApiResponse<VideoResponse> getVideo(@PathVariable UUID videoId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.getById(tenantId, videoId));
    }

    // ── School Admin endpoints ────────────────────────────────────────────────

    @Operation(summary = "List all videos for school")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @GetMapping("/v1/school-admin/videos")
    public ApiResponse<List<VideoResponse>> adminList() {
        UUID schoolId = UUID.fromString(RequestContext.getSchoolId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.listBySchool(schoolId));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private com.cloudcampus.staff.entity.Staff resolveStaff() {
        UUID userId = RequestContext.getUserId();
        return staffRepository.findByUserId(userId)
                .orElseThrow(() -> new com.cloudcampus.common.exception.NotFoundException("Staff record not found"));
    }

    private UUID resolveStaffId() {
        return resolveStaff().getId();
    }
}
