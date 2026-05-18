package com.cloudcampus.staffattendance.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.staffattendance.dto.StaffAttendanceResponse;
import com.cloudcampus.staffattendance.entity.StaffAttendance;
import com.cloudcampus.staffattendance.entity.StaffAttendanceStatus;
import com.cloudcampus.staffattendance.repository.StaffAttendanceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.slf4j.MDC;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
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
 * Staff attendance management (CC-0603).
 *
 * POST /v1/school-admin/schools/{schoolId}/staff-attendance/mark   — bulk mark for a date
 * GET  /v1/school-admin/schools/{schoolId}/staff-attendance        — list all staff records for a date
 * GET  /v1/school-admin/schools/{schoolId}/staff/{staffId}/attendance — history for one staff member
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}")
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
@Tag(name = "Staff Attendance", description = "Daily staff attendance tracking")
public class StaffAttendanceController {

    public record AttendanceEntry(
            @NotNull UUID staffId,
            @NotNull StaffAttendanceStatus status,
            String notes
    ) {}

    public record BulkMarkRequest(
            @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @NotEmpty List<@Valid AttendanceEntry> entries
    ) {}

    public record StaffAttendanceRow(
            UUID   staffId,
            String firstName,
            String lastName,
            String employeeNumber,
            StaffAttendanceStatus status,
            String notes
    ) {}

    private final StaffAttendanceRepository attendanceRepo;
    private final StaffRepository           staffRepo;
    private final SchoolRepository          schoolRepo;

    public StaffAttendanceController(
            StaffAttendanceRepository attendanceRepo,
            StaffRepository           staffRepo,
            SchoolRepository          schoolRepo) {
        this.attendanceRepo = attendanceRepo;
        this.staffRepo      = staffRepo;
        this.schoolRepo     = schoolRepo;
    }

    @Operation(summary = "Bulk mark staff attendance for a date")
    @PostMapping("/staff-attendance/mark")
    public ApiResponse<List<StaffAttendanceResponse>> mark(
            @PathVariable UUID schoolId,
            @Valid @RequestBody BulkMarkRequest req) {

        validateSchool(schoolId);
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        UUID markedBy = RequestContext.getUserId();

        List<StaffAttendanceResponse> result = req.entries().stream().map(entry -> {
            var existing = attendanceRepo.findBySchoolIdAndStaffIdAndAttendanceDate(
                    schoolId, entry.staffId(), req.date());

            StaffAttendance sa;
            if (existing.isPresent()) {
                sa = existing.get();
                sa.updateStatus(entry.status(), entry.notes());
            } else {
                sa = StaffAttendance.create(
                        tenantId, schoolId, entry.staffId(),
                        req.date(), entry.status(), entry.notes(), markedBy);
            }
            return StaffAttendanceResponse.from(attendanceRepo.save(sa));
        }).toList();

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), result);
    }

    @Operation(summary = "List staff attendance for a date",
               description = "Returns all staff with their attendance status for the given date. Staff without a record appear as null status.")
    @GetMapping("/staff-attendance")
    public ApiResponse<List<StaffAttendanceRow>> listForDate(
            @PathVariable UUID schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        validateSchool(schoolId);

        var allStaff      = staffRepo.findAllBySchoolIdOrderByLastNameAscFirstNameAsc(schoolId);
        var recordsForDay = attendanceRepo.findAllBySchoolIdAndAttendanceDate(schoolId, date);
        var recordMap     = new java.util.HashMap<UUID, StaffAttendance>();
        recordsForDay.forEach(r -> recordMap.put(r.getStaffId(), r));

        List<StaffAttendanceRow> rows = allStaff.stream().map(s -> {
            var rec = recordMap.get(s.getId());
            return new StaffAttendanceRow(
                    s.getId(), s.getFirstName(), s.getLastName(), s.getEmployeeNumber(),
                    rec != null ? rec.getStatus() : null,
                    rec != null ? rec.getNotes()  : null
            );
        }).toList();

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), rows);
    }

    @Operation(summary = "Staff member attendance history")
    @GetMapping("/staff/{staffId}/attendance")
    public ApiResponse<List<StaffAttendanceResponse>> history(
            @PathVariable UUID schoolId,
            @PathVariable UUID staffId) {

        validateSchool(schoolId);
        ensureStaffBelongsToSchool(schoolId, staffId);

        List<StaffAttendanceResponse> list = attendanceRepo
                .findAllBySchoolIdAndStaffIdOrderByAttendanceDateDesc(schoolId, staffId)
                .stream()
                .map(StaffAttendanceResponse::from)
                .toList();

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), list);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateSchool(UUID schoolId) {
        schoolRepo.findByIdFiltered(schoolId)
                .orElseThrow(() -> new NotFoundException("School not found"));
    }

    private void ensureStaffBelongsToSchool(UUID schoolId, UUID staffId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        Staff s = staffRepo.findByIdAndTenantId(staffId, tenantId)
                .orElseThrow(() -> new NotFoundException("Staff not found"));
        if (!s.getSchoolId().equals(schoolId)) {
            throw new NotFoundException("Staff not in this school");
        }
    }
}
