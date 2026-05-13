package com.cloudcampus.mobile.controller;

import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.exam.dto.ExamResultResponse;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentParentLinkRepository;
import com.cloudcampus.student.repository.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Parent portal mobile API (CC-1101).
 *
 * GET /v1/parent/children                         — linked children with attendance summary
 * GET /v1/parent/children/{studentId}/attendance  — attendance summary for one child
 * GET /v1/parent/children/{studentId}/results     — recent exam results for one child
 *
 * Security: PARENT role only.
 */
@RestController
@RequestMapping("/v1/parent")
@PreAuthorize("hasRole('PARENT')")
@Tag(name = "Parent — Portal", description = "Parent mobile portal for child monitoring")
public class ParentController {

    // ── Lightweight response types ────────────────────────────────────────────

    public record ChildSummary(
            UUID   studentId,
            String firstName,
            String lastName,
            String studentNumber,
            String relationship,
            long   totalSessions,
            long   presentCount,
            long   attendancePct
    ) {}

    public record AttendanceSummary(
            UUID   studentId,
            String firstName,
            String lastName,
            long   totalSessions,
            long   present,
            long   absent,
            long   late,
            long   attendancePct
    ) {}

    // ── Dependencies ──────────────────────────────────────────────────────────

    private final StudentParentLinkRepository linkRepo;
    private final StudentRepository           studentRepo;
    private final AttendanceRecordRepository  attendanceRepo;
    private final ExamResultRepository        resultRepo;
    private final SchoolRepository            schoolRepo;

    public ParentController(
            StudentParentLinkRepository linkRepo,
            StudentRepository           studentRepo,
            AttendanceRecordRepository  attendanceRepo,
            ExamResultRepository        resultRepo,
            SchoolRepository            schoolRepo) {
        this.linkRepo       = linkRepo;
        this.studentRepo    = studentRepo;
        this.attendanceRepo = attendanceRepo;
        this.resultRepo     = resultRepo;
        this.schoolRepo     = schoolRepo;
    }

    @Operation(summary = "My children", description = "All linked children with a quick attendance summary")
    @GetMapping("/children")
    public ApiResponse<List<ChildSummary>> children() {
        UUID parentUserId = RequestContext.getUserId();

        List<ChildSummary> result = linkRepo
                .findAllByParentUserIdOrderByCreatedAtAsc(parentUserId)
                .stream()
                .map(link -> {
                    Student s = studentRepo.findById(link.getStudentId()).orElse(null);
                    if (s == null) return null;
                    long total   = attendanceRepo.countByStudentId(s.getId());
                    long present = attendanceRepo.countByStudentIdAndStatus(s.getId(), AttendanceStatus.PRESENT);
                    return new ChildSummary(
                            s.getId(), s.getFirstName(), s.getLastName(), s.getStudentNumber(),
                            link.getRelationship().name(),
                            total, present,
                            total > 0 ? Math.round(present * 100.0 / total) : 0L
                    );
                })
                .filter(Objects::nonNull)
                .toList();

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), result);
    }

    @Operation(summary = "Child attendance summary")
    @GetMapping("/children/{studentId}/attendance")
    public ApiResponse<AttendanceSummary> attendance(@PathVariable UUID studentId) {
        checkAccess(studentId);
        Student s = studentRepo.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        long total   = attendanceRepo.countByStudentId(studentId);
        long present = attendanceRepo.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
        long absent  = attendanceRepo.countByStudentIdAndStatus(studentId, AttendanceStatus.ABSENT);
        long late    = attendanceRepo.countByStudentIdAndStatus(studentId, AttendanceStatus.LATE);

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), new AttendanceSummary(
                s.getId(), s.getFirstName(), s.getLastName(),
                total, present, absent, late,
                total > 0 ? Math.round(present * 100.0 / total) : 0L
        ));
    }

    @Operation(summary = "Child exam results")
    @GetMapping("/children/{studentId}/results")
    public ApiResponse<List<ExamResultResponse>> results(@PathVariable UUID studentId) {
        checkAccess(studentId);
        School school = resolveSchool();

        List<ExamResultResponse> list = resultRepo
                .findByStudentIdAndSchoolIdOrderByCreatedAtDesc(studentId, school.getId())
                .stream()
                .map(ExamResultResponse::from)
                .toList();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), list);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void checkAccess(UUID studentId) {
        UUID parentUserId = RequestContext.getUserId();
        if (!linkRepo.existsByStudentIdAndParentUserId(studentId, parentUserId)) {
            throw new NotFoundException("Student not linked to this parent account");
        }
    }

    private School resolveSchool() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));
    }
}
