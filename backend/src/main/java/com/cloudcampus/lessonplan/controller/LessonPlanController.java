package com.cloudcampus.lessonplan.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.lessonplan.dto.LessonPlanRequest;
import com.cloudcampus.lessonplan.dto.LessonPlanResponse;
import com.cloudcampus.lessonplan.service.LessonPlanService;
import com.cloudcampus.staff.repository.StaffRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Lesson Plans", description = "Teacher lesson planning — CC-0704")
public class LessonPlanController {

    private final LessonPlanService service;
    private final StaffRepository   staffRepository;

    public LessonPlanController(LessonPlanService service, StaffRepository staffRepository) {
        this.service         = service;
        this.staffRepository = staffRepository;
    }

    // ── Teacher endpoints ─────────────────────────────────────────────────────

    @Operation(summary = "List my lesson plans", description = "Teacher: list own lesson plans in a date range.")
    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/v1/teacher/lesson-plans")
    public ApiResponse<List<LessonPlanResponse>> myPlans(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        UUID staffId = resolveStaffId();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.listByStaff(staffId, from, to));
    }

    @Operation(summary = "Create lesson plan")
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/v1/teacher/lesson-plans")
    public ApiResponse<LessonPlanResponse> create(@Valid @RequestBody LessonPlanRequest req) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        com.cloudcampus.staff.entity.Staff staff = resolveStaff();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.create(tenantId, staff.getSchoolId(), staff.getId(), req));
    }

    @Operation(summary = "Update lesson plan")
    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping("/v1/teacher/lesson-plans/{planId}")
    public ApiResponse<LessonPlanResponse> update(
            @PathVariable UUID planId,
            @Valid @RequestBody LessonPlanRequest req
    ) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.update(tenantId, planId, req));
    }

    @Operation(summary = "Publish lesson plan")
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/v1/teacher/lesson-plans/{planId}/publish")
    public ApiResponse<LessonPlanResponse> publish(@PathVariable UUID planId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.publish(tenantId, planId));
    }

    @Operation(summary = "Delete lesson plan")
    @PreAuthorize("hasRole('TEACHER')")
    @DeleteMapping("/v1/teacher/lesson-plans/{planId}")
    public ResponseEntity<Void> delete(@PathVariable UUID planId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        service.delete(tenantId, planId);
        return ResponseEntity.noContent().build();
    }

    // ── School Admin endpoints ────────────────────────────────────────────────

    @Operation(summary = "List all lesson plans (school admin)")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @GetMapping("/v1/school-admin/lesson-plans")
    public ApiResponse<List<LessonPlanResponse>> listAll(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        UUID schoolId = UUID.fromString(RequestContext.getSchoolId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.listBySchool(schoolId, from, to));
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
