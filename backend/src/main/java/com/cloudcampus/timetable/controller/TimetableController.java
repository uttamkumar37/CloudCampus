package com.cloudcampus.timetable.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.timetable.dto.TimetableSlotRequest;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;
import com.cloudcampus.timetable.service.TimetableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/timetable")
@RequiredArgsConstructor
@Tag(name = "Timetable", description = "Class timetable slots")
public class TimetableController {

    private final TimetableService timetableService;

    @PostMapping("/slots")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER')")
    @Operation(summary = "Create timetable slot", parameters = {
            @Parameter(name = "X-Tenant-Slug", required = true),
            @Parameter(name = "Authorization", required = true)
    })
    public ResponseEntity<ApiResponse<TimetableSlotResponse>> create(@Valid @RequestBody TimetableSlotRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Slot created", timetableService.create(request)));
    }

    @GetMapping("/classes/{classId}/sections/{sectionId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')")
    @Operation(summary = "List slots for class & section", parameters = {
            @Parameter(name = "X-Tenant-Slug", required = true),
            @Parameter(name = "Authorization", required = true)
    })
    public ResponseEntity<ApiResponse<List<TimetableSlotResponse>>> list(
            @PathVariable UUID classId,
            @PathVariable UUID sectionId
    ) {
        return ResponseEntity.ok(ApiResponse.success("Timetable", timetableService.list(classId, sectionId)));
    }
}
