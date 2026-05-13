package com.cloudcampus.teacher.controller;

import com.cloudcampus.assignment.entity.SubmissionStatus;
import com.cloudcampus.assignment.repository.AssignmentRepository;
import com.cloudcampus.assignment.repository.SubmissionRepository;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.homework.repository.HomeworkRepository;
import com.cloudcampus.homework.repository.HomeworkSubmissionRepository;
import com.cloudcampus.school.entity.AcademicYear;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;
import com.cloudcampus.timetable.entity.DayOfWeek;
import com.cloudcampus.timetable.service.TimetableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Teacher dashboard summary (E35).
 *
 * GET /v1/teacher/dashboard — returns today's schedule + pending-review counts.
 */
@RestController
@RequestMapping("/v1/teacher/dashboard")
@PreAuthorize("hasRole('TEACHER')")
@Tag(name = "Teacher — Dashboard", description = "Teacher dashboard summary")
public class TeacherDashboardController {

    public record DashboardResponse(
            List<TimetableSlotResponse> todaySlots,
            long pendingHomeworkReview,
            long pendingAssignmentGrading,
            long totalHomeworkPosted,
            long totalAssignmentsPosted
    ) {}

    private final SchoolRepository             schoolRepo;
    private final AcademicYearRepository       academicYearRepo;
    private final StaffRepository              staffRepo;
    private final TimetableService             timetableService;
    private final HomeworkRepository           homeworkRepo;
    private final HomeworkSubmissionRepository hwSubmissionRepo;
    private final AssignmentRepository         assignmentRepo;
    private final SubmissionRepository         assignSubmissionRepo;

    public TeacherDashboardController(
            SchoolRepository             schoolRepo,
            AcademicYearRepository       academicYearRepo,
            StaffRepository              staffRepo,
            TimetableService             timetableService,
            HomeworkRepository           homeworkRepo,
            HomeworkSubmissionRepository hwSubmissionRepo,
            AssignmentRepository         assignmentRepo,
            SubmissionRepository         assignSubmissionRepo) {
        this.schoolRepo           = schoolRepo;
        this.academicYearRepo     = academicYearRepo;
        this.staffRepo            = staffRepo;
        this.timetableService     = timetableService;
        this.homeworkRepo         = homeworkRepo;
        this.hwSubmissionRepo     = hwSubmissionRepo;
        this.assignmentRepo       = assignmentRepo;
        this.assignSubmissionRepo = assignSubmissionRepo;
    }

    @Operation(summary = "Teacher dashboard summary",
               description = "Returns today's timetable slots and pending review/grading counts.")
    @GetMapping
    public ApiResponse<DashboardResponse> dashboard() {
        UUID userId   = RequestContext.getUserId();
        School school = resolveSchool();
        UUID schoolId = school.getId();

        // ── Today's timetable ─────────────────────────────────────────────────
        List<TimetableSlotResponse> todaySlots = List.of();
        AcademicYear activeYear = academicYearRepo
                .findBySchoolIdAndIsCurrent(schoolId, true)
                .orElse(null);

        if (activeYear != null) {
            Staff staff = staffRepo.findBySchoolIdAndUserId(schoolId, userId).orElse(null);
            if (staff != null) {
                DayOfWeek today = null;
                try {
                    today = DayOfWeek.valueOf(LocalDate.now().getDayOfWeek().name());
                } catch (IllegalArgumentException ignored) { /* SUNDAY not in school timetable */ }

                if (today != null) {
                    final DayOfWeek finalToday = today;
                    todaySlots = timetableService
                            .listSlotsByStaff(schoolId, activeYear.getId(), staff.getId())
                            .stream()
                            .filter(s -> s.dayOfWeek() == finalToday)
                            .toList();
                }
            }
        }

        // ── Pending review / grading counts ──────────────────────────────────
        long pendingHw = hwSubmissionRepo.countByTeacherAndStatus(
                schoolId, userId,
                com.cloudcampus.homework.entity.SubmissionStatus.SUBMITTED);

        long pendingAssign = assignSubmissionRepo.countByTeacherAndStatusIn(
                schoolId, userId,
                Set.of(SubmissionStatus.SUBMITTED, SubmissionStatus.LATE));

        // ── Total items posted by this teacher ────────────────────────────────
        long totalHw     = homeworkRepo.countBySchoolIdAndAssignedBy(schoolId, userId);
        long totalAssign = assignmentRepo.countBySchoolIdAndAssignedBy(schoolId, userId);

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                new DashboardResponse(todaySlots, pendingHw, pendingAssign, totalHw, totalAssign));
    }

    private School resolveSchool() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));
    }
}
