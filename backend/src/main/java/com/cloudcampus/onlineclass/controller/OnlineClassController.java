package com.cloudcampus.onlineclass.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.onlineclass.dto.OnlineClassRequest;
import com.cloudcampus.onlineclass.dto.OnlineClassResponse;
import com.cloudcampus.onlineclass.service.OnlineClassService;
import com.cloudcampus.staff.repository.StaffRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@Tag(name = "Online Classes", description = "Schedule and manage virtual class sessions — CC-1201")
public class OnlineClassController {

    private final OnlineClassService service;
    private final StaffRepository    staffRepository;

    public OnlineClassController(OnlineClassService service, StaffRepository staffRepository) {
        this.service         = service;
        this.staffRepository = staffRepository;
    }

    // ── Teacher endpoints ─────────────────────────────────────────────────────

    @Operation(summary = "Schedule an online class")
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/v1/teacher/online-classes")
    public ApiResponse<OnlineClassResponse> schedule(@Valid @RequestBody OnlineClassRequest req) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        com.cloudcampus.staff.entity.Staff staff = resolveStaff();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.schedule(tenantId, staff.getSchoolId(), staff.getId(), req));
    }

    @Operation(summary = "List my scheduled classes")
    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/v1/teacher/online-classes")
    public ApiResponse<List<OnlineClassResponse>> myClasses(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().toString()}") String from,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().plusDays(30).toString()}") String to
    ) {
        UUID staffId = resolveStaffId();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.listByStaff(staffId, parseDate(from), parseDate(to)));
    }

    @Operation(summary = "Update class status (start|end|cancel)")
    @PreAuthorize("hasRole('TEACHER')")
    @PatchMapping("/v1/teacher/online-classes/{classId}/status")
    public ApiResponse<OnlineClassResponse> updateStatus(
            @PathVariable UUID classId,
            @RequestBody Map<String, String> body
    ) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.updateStatus(tenantId, classId, body.getOrDefault("action", "")));
    }

    @Operation(summary = "Add recording URL after class ends")
    @PreAuthorize("hasRole('TEACHER')")
    @PatchMapping("/v1/teacher/online-classes/{classId}/recording")
    public ApiResponse<OnlineClassResponse> addRecording(
            @PathVariable UUID classId,
            @RequestBody Map<String, String> body
    ) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.addRecording(tenantId, classId, body.get("recordingUrl")));
    }

    @Operation(summary = "Delete online class")
    @PreAuthorize("hasRole('TEACHER')")
    @DeleteMapping("/v1/teacher/online-classes/{classId}")
    public ResponseEntity<Void> delete(@PathVariable UUID classId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        service.delete(tenantId, classId);
        return ResponseEntity.noContent().build();
    }

    // ── Student endpoints ─────────────────────────────────────────────────────

    @Operation(summary = "List upcoming classes for my section")
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/v1/student/online-classes")
    public ApiResponse<List<OnlineClassResponse>> studentClasses(
            @RequestParam UUID sectionId,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().toString()}") String from,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().plusDays(14).toString()}") String to
    ) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.listBySection(sectionId, parseDate(from), parseDate(to)));
    }

    // ── School Admin endpoints ────────────────────────────────────────────────

    @Operation(summary = "List all online classes for school")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @GetMapping("/v1/school-admin/online-classes")
    public ApiResponse<List<OnlineClassResponse>> adminList(
            @RequestParam String from,
            @RequestParam String to
    ) {
        UUID schoolId = UUID.fromString(RequestContext.getSchoolId());
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.listBySchool(schoolId, parseDate(from), parseDate(to)));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Instant parseDate(String date) {
        return LocalDate.parse(date).atStartOfDay().toInstant(ZoneOffset.UTC);
    }

    private com.cloudcampus.staff.entity.Staff resolveStaff() {
        UUID userId = RequestContext.getUserId();
        return staffRepository.findByUserId(userId)
                .orElseThrow(() -> new com.cloudcampus.common.exception.NotFoundException("Staff record not found"));
    }

    private UUID resolveStaffId() {
        return resolveStaff().getId();
    }
}
