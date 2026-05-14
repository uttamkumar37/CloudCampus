package com.cloudcampus.student.controller;

import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Student self-service attendance (E41 / CC-0801).
 *
 * GET /v1/student/attendance — summary counts + 60 most-recent session records.
 */
@RestController
@RequestMapping("/v1/student/attendance")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student — Attendance", description = "Student attendance self-view")
public class StudentAttendanceController {

    public record AttendanceRecord(LocalDate date, int period, AttendanceStatus status) {}

    public record MyAttendanceResponse(
            long                  totalSessions,
            long                  presentCount,
            long                  absentCount,
            long                  lateCount,
            long                  excusedCount,
            double                attendancePct,
            List<AttendanceRecord> recent
    ) {}

    private final SchoolRepository          schoolRepo;
    private final StudentRepository         studentRepo;
    private final AttendanceRecordRepository recordRepo;

    public StudentAttendanceController(
            SchoolRepository          schoolRepo,
            StudentRepository         studentRepo,
            AttendanceRecordRepository recordRepo) {
        this.schoolRepo  = schoolRepo;
        this.studentRepo = studentRepo;
        this.recordRepo  = recordRepo;
    }

    @Operation(summary = "My attendance",
               description = "Returns attendance summary counts and the 60 most-recent session records.")
    @GetMapping
    public ApiResponse<MyAttendanceResponse> myAttendance() {
        School  school  = resolveSchool();
        Student student = resolveStudent(school.getId());
        UUID    sid     = student.getId();

        long total   = recordRepo.countByStudentId(sid);
        long present = recordRepo.countByStudentIdAndStatus(sid, AttendanceStatus.PRESENT);
        long absent  = recordRepo.countByStudentIdAndStatus(sid, AttendanceStatus.ABSENT);
        long late    = recordRepo.countByStudentIdAndStatus(sid, AttendanceStatus.LATE);
        long excused = recordRepo.countByStudentIdAndStatus(sid, AttendanceStatus.EXCUSED);
        double pct   = total == 0 ? 0.0
                : Math.round((present + late) * 10_000.0 / total) / 100.0;

        List<Object[]> raw = recordRepo.findStudentHistory(sid, PageRequest.of(0, 60));
        List<AttendanceRecord> recent = raw.stream()
                .map(r -> new AttendanceRecord(
                        (LocalDate)       r[1],
                        ((Number)         r[2]).intValue(),
                        (AttendanceStatus) r[0]))
                .toList();

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                new MyAttendanceResponse(total, present, absent, late, excused, pct, recent));
    }

    private School resolveSchool() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));
    }

    private Student resolveStudent(UUID schoolId) {
        UUID userId = RequestContext.getUserId();
        return studentRepo.findBySchoolIdAndUserId(schoolId, userId)
                .orElseThrow(() -> new NotFoundException("Student profile not found"));
    }
}
