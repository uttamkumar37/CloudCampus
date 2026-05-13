package com.cloudcampus.timetable.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.timetable.dto.TimetableSlotCreateRequest;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;
import com.cloudcampus.timetable.service.TimetableService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * School Admin API — Timetable Management (CC-0701).
 *
 * POST   /v1/school-admin/schools/{schoolId}/timetable
 *        — add a slot (section-period + teacher; conflict-detected)
 *
 * GET    /v1/school-admin/schools/{schoolId}/timetable
 *        — list slots for a class+section in an academic year
 *
 * DELETE /v1/school-admin/schools/{schoolId}/timetable/{slotId}
 *        — remove a slot
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN.
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/timetable")
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN','SUPER_ADMIN')")
@Tag(name = "School Admin — Timetable", description = "Weekly class timetable management")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    @Operation(summary = "Add a timetable slot")
    @PostMapping
    public ResponseEntity<ApiResponse<TimetableSlotResponse>> addSlot(
            @PathVariable UUID schoolId,
            @Valid @RequestBody TimetableSlotCreateRequest request) {

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        TimetableSlotResponse body = timetableService.addSlot(tenantId, schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List timetable slots for a class/section")
    @GetMapping
    public ApiResponse<List<TimetableSlotResponse>> listSlots(
            @PathVariable UUID schoolId,
            @RequestParam UUID academicYearId,
            @RequestParam UUID classId,
            @RequestParam UUID sectionId) {

        List<TimetableSlotResponse> slots =
                timetableService.listSlots(schoolId, academicYearId, classId, sectionId);
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), slots);
    }

    @Operation(summary = "Delete a timetable slot")
    @DeleteMapping("/{slotId}")
    public ResponseEntity<Void> deleteSlot(
            @PathVariable UUID schoolId,
            @PathVariable UUID slotId) {

        timetableService.deleteSlot(schoolId, slotId);
        return ResponseEntity.noContent().build();
    }
}
