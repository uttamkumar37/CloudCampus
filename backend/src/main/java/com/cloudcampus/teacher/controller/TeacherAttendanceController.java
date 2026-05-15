package com.cloudcampus.teacher.controller;

import com.cloudcampus.attendance.dto.AttendanceRecordEntry;
import com.cloudcampus.attendance.dto.AttendanceSessionResponse;
import com.cloudcampus.attendance.dto.CreateSessionRequest;
import com.cloudcampus.attendance.dto.MarkAttendanceRequest;
import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.service.AttendanceService;
import com.cloudcampus.attendance.service.QrAttendanceService;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.entity.StudentStatus;
import com.cloudcampus.student.repository.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
 * Teacher self-service attendance marking (E39).
 *
 * GET  /v1/teacher/attendance/students?classId=&sectionId= — active students for a class/section
 * POST /v1/teacher/attendance/sessions                     — create session + mark in one call
 */
@RestController
@RequestMapping("/v1/teacher/attendance")
@PreAuthorize("hasRole('TEACHER')")
@Tag(name = "Teacher — Attendance", description = "Teacher self-service attendance marking")
public class TeacherAttendanceController {

    public record StudentSummary(
            UUID   id,
            String studentNumber,
            String firstName,
            String lastName,
            UUID   classId,
            UUID   sectionId
    ) {
        static StudentSummary from(Student s) {
            return new StudentSummary(s.getId(), s.getStudentNumber(),
                    s.getFirstName(), s.getLastName(), s.getClassId(), s.getSectionId());
        }
    }

    public record StudentMark(
            @NotNull UUID             studentId,
            @NotNull AttendanceStatus status,
                     String           remarks
    ) {}

    public record TakeAttendanceRequest(
            @NotNull UUID                       classId,
                     UUID                       sectionId,
            @NotNull UUID                       academicYearId,
                     UUID                       subjectId,
            @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sessionDate,
                     int                        periodNumber,
            @NotNull List<@Valid @NotNull StudentMark> marks
    ) {}

    private final SchoolRepository    schoolRepo;
    private final StaffRepository     staffRepo;
    private final StudentRepository   studentRepo;
    private final AttendanceService   attendanceService;
    private final QrAttendanceService qrService;

    public TeacherAttendanceController(
            SchoolRepository    schoolRepo,
            StaffRepository     staffRepo,
            StudentRepository   studentRepo,
            AttendanceService   attendanceService,
            QrAttendanceService qrService) {
        this.schoolRepo        = schoolRepo;
        this.staffRepo         = staffRepo;
        this.studentRepo       = studentRepo;
        this.attendanceService = attendanceService;
        this.qrService         = qrService;
    }

    @Operation(summary = "List active students for attendance",
               description = "Returns ACTIVE students in the given class. "
                             + "Pass sectionId to narrow to a specific section.")
    @GetMapping("/students")
    public ApiResponse<List<StudentSummary>> students(
            @RequestParam UUID classId,
            @RequestParam(required = false) UUID sectionId) {

        List<Student> list = sectionId != null
                ? studentRepo.findAllBySectionIdAndStatusOrderByLastNameAscFirstNameAsc(
                        sectionId, StudentStatus.ACTIVE)
                : studentRepo.findAllByClassIdAndStatusOrderByLastNameAscFirstNameAsc(
                        classId, StudentStatus.ACTIVE);

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                list.stream().map(StudentSummary::from).toList());
    }

    @Operation(summary = "Take attendance",
               description = "Creates an attendance session for the teacher's class and immediately "
                             + "bulk-marks all students. Session is finalized (locked) on save.")
    @PostMapping("/sessions")
    public ApiResponse<AttendanceSessionResponse> takeAttendance(
            @Valid @RequestBody TakeAttendanceRequest req) {

        School school = resolveSchool();
        Staff  staff  = resolveStaff(school.getId());

        AttendanceSessionResponse session = attendanceService.openSession(
                school.getId(),
                new CreateSessionRequest(
                        req.classId(), req.sectionId(), req.academicYearId(),
                        req.subjectId(), staff.getId(),
                        req.sessionDate(), req.periodNumber()));

        List<AttendanceRecordEntry> entries = req.marks().stream()
                .map(m -> new AttendanceRecordEntry(m.studentId(), m.status(), m.remarks()))
                .toList();

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                attendanceService.markAttendance(session.id(),
                        new MarkAttendanceRequest(entries, true)));
    }

    @Operation(summary = "Generate QR code for a session",
               description = "Creates a short-lived token (5 min) and returns a base64 QR PNG "
                             + "that students scan to self-mark present (CC-0802).")
    @PostMapping("/sessions/{sessionId}/qr")
    public ApiResponse<QrAttendanceService.QrResponse> generateQr(
            @PathVariable UUID sessionId) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), qrService.generate(sessionId));
    }

    private School resolveSchool() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));
    }

    private Staff resolveStaff(UUID schoolId) {
        UUID userId = RequestContext.getUserId();
        return staffRepo.findBySchoolIdAndUserId(schoolId, userId)
                .orElseThrow(() -> new NotFoundException("Staff profile not found"));
    }
}
