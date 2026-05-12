package com.cloudcampus.attendance.controller;

import com.cloudcampus.attendance.dto.AttendanceSessionResponse;
import com.cloudcampus.attendance.dto.AttendanceSessionSummaryResponse;
import com.cloudcampus.attendance.dto.CreateSessionRequest;
import com.cloudcampus.attendance.dto.MarkAttendanceRequest;
import com.cloudcampus.attendance.dto.StudentAttendanceReport;
import com.cloudcampus.attendance.service.AttendanceService;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.slf4j.MDC;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * School Admin API — Manual Attendance (CC-0801 / CC-0805).
 *
 * POST  /v1/school-admin/schools/{schoolId}/attendance/sessions
 *       — open a new attendance session
 *
 * POST  /v1/school-admin/attendance/sessions/{sessionId}/mark
 *       — bulk-mark (upsert) student attendance; optionally finalize
 *
 * GET   /v1/school-admin/attendance/sessions/{sessionId}
 *       — full session detail with all attendance records
 *
 * GET   /v1/school-admin/schools/{schoolId}/attendance/sessions?date=
 *       — all sessions for a school on a given date
 *
 * GET   /v1/school-admin/classes/{classId}/attendance/sessions?from=&to=[&sectionId=]
 *       — sessions for a class/section over a date range
 *
 * GET   /v1/school-admin/students/{studentId}/attendance/report?from=&to=
 *       — attendance report for a student (CC-0805)
 *
 * GET   /v1/school-admin/classes/{classId}/attendance/report?from=&to=[&sectionId=]
 *       — class attendance report — per-student totals (CC-0805)
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN (SecurityConfig path rule).
 */
@RestController
@RequestMapping("/v1/school-admin")
@Tag(name = "School Admin — Attendance",
     description = "Manual attendance session management and reporting")
public class AttendanceController {

    private final AttendanceService service;

    public AttendanceController(AttendanceService service) {
        this.service = service;
    }

    // ── Session management ───────────────────────────────────────────────────

    @Operation(summary = "Open a new attendance session",
               description = "Creates a session for a class/section on a given date and period. "
                             + "Rejects duplicates (same class/section/date/period).")
    @PostMapping("/schools/{schoolId}/attendance/sessions")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> openSession(
            @PathVariable UUID schoolId,
            @Valid @RequestBody CreateSessionRequest request) {
        AttendanceSessionResponse body = service.openSession(schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "Bulk-mark attendance for a session",
               description = "Each entry is an upsert — existing records are updated. "
                             + "Set lockSession=true to lock the session.")
    @PostMapping("/attendance/sessions/{sessionId}/mark")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> markAttendance(
            @PathVariable UUID sessionId,
            @Valid @RequestBody MarkAttendanceRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                               service.markAttendance(sessionId, request)));
    }

    @Operation(summary = "Get full session detail (including all attendance records)")
    @GetMapping("/attendance/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> getSession(
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                               service.getSession(sessionId)));
    }

    // ── Listing ──────────────────────────────────────────────────────────────

    @Operation(summary = "List all attendance sessions for a school on a date")
    @GetMapping("/schools/{schoolId}/attendance/sessions")
    public ResponseEntity<ApiResponse<List<AttendanceSessionSummaryResponse>>> listBySchoolAndDate(
            @PathVariable UUID schoolId,
            @NotNull @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                               service.listBySchoolAndDate(schoolId, date)));
    }

    @Operation(summary = "List sessions for a class over a date range",
               description = "Optionally filter by sectionId.")
    @GetMapping("/classes/{classId}/attendance/sessions")
    public ResponseEntity<ApiResponse<List<AttendanceSessionSummaryResponse>>> listByClassAndDateRange(
            @PathVariable UUID classId,
            @RequestParam(required = false) UUID sectionId,
            @NotNull @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @NotNull @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                               service.listByClassAndDateRange(classId, sectionId, from, to)));
    }

    // ── Reports (CC-0805) ─────────────────────────────────────────────────────

    @Operation(summary = "Attendance report for a student over a date range",
               description = "Returns counts by status and attendance percentage. "
                             + "LATE marks count toward presence.")
    @GetMapping("/students/{studentId}/attendance/report")
    public ResponseEntity<ApiResponse<StudentAttendanceReport>> studentReport(
            @PathVariable UUID studentId,
            @NotNull @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @NotNull @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                               service.getStudentReport(studentId, from, to)));
    }

    @Operation(summary = "Class attendance report — per-student totals over a date range",
               description = "Optionally filter by sectionId. Returns one summary per student.")
    @GetMapping("/classes/{classId}/attendance/report")
    public ResponseEntity<ApiResponse<List<StudentAttendanceReport>>> classReport(
            @PathVariable UUID classId,
            @RequestParam(required = false) UUID sectionId,
            @NotNull @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @NotNull @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                               service.getClassReport(classId, sectionId, from, to)));
    }
}
