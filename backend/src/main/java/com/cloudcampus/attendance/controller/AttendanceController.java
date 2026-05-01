package com.cloudcampus.attendance.controller;

import com.cloudcampus.attendance.dto.AttendanceCreateRequest;
import com.cloudcampus.attendance.dto.AttendanceResponse;
import com.cloudcampus.attendance.service.AttendanceService;
import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.security.OwnershipChecker;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendances")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance APIs")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final OwnershipChecker ownershipChecker;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    @Operation(summary = "Mark attendance", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<AttendanceResponse>> markAttendance(@Valid @RequestBody AttendanceCreateRequest request) {
        AttendanceResponse response = attendanceService.markAttendance(request);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", response));
    }

    @GetMapping("/{attendanceId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')")
    @Operation(summary = "Get attendance by id", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<AttendanceResponse>> getAttendanceById(
            @PathVariable UUID attendanceId,
            @AuthenticationPrincipal CloudCampusUserDetails caller
    ) {
        Set<UUID> allowed = ownershipChecker.resolveAllowedStudentIds(caller).orElse(null);
        AttendanceResponse response = attendanceService.getAttendanceById(attendanceId, allowed);
        return ResponseEntity.ok(ApiResponse.success("Attendance record fetched successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')")
    @Operation(summary = "Get attendance by date", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal CloudCampusUserDetails caller
    ) {
        Set<UUID> allowed = ownershipChecker.resolveAllowedStudentIds(caller).orElse(null);
        List<AttendanceResponse> response = attendanceService.getAttendanceByDate(date, allowed);
        return ResponseEntity.ok(ApiResponse.success("Attendance records fetched successfully", response));
    }
}

