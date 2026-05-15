package com.cloudcampus.school.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.finance.entity.FeeStatus;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.leave.entity.LeaveStatus;
import com.cloudcampus.leave.repository.LeaveRequestRepository;
import com.cloudcampus.notice.repository.SchoolNoticeRepository;
import com.cloudcampus.school.repository.ClassRoomRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.entity.StaffStatus;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.student.entity.StudentStatus;
import com.cloudcampus.student.repository.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * School Admin Dashboard summary (E37).
 *
 * GET /v1/school-admin/schools/{schoolId}/dashboard
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/dashboard")
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
@Tag(name = "School Admin — Dashboard", description = "School admin dashboard summary stats")
public class SchoolDashboardController {

    public record DashboardStats(
            long totalStudents,
            long totalStaff,
            long totalClasses,
            long pendingLeaveRequests,
            long pendingFeeRecords,
            long partialFeeRecords,
            long publishedNotices
    ) {}

    private final SchoolRepository          schoolRepo;
    private final StudentRepository         studentRepo;
    private final StaffRepository           staffRepo;
    private final ClassRoomRepository       classRoomRepo;
    private final LeaveRequestRepository    leaveRepo;
    private final StudentFeeRecordRepository feeRecordRepo;
    private final SchoolNoticeRepository    noticeRepo;

    public SchoolDashboardController(
            SchoolRepository          schoolRepo,
            StudentRepository         studentRepo,
            StaffRepository           staffRepo,
            ClassRoomRepository       classRoomRepo,
            LeaveRequestRepository    leaveRepo,
            StudentFeeRecordRepository feeRecordRepo,
            SchoolNoticeRepository    noticeRepo) {
        this.schoolRepo   = schoolRepo;
        this.studentRepo  = studentRepo;
        this.staffRepo    = staffRepo;
        this.classRoomRepo = classRoomRepo;
        this.leaveRepo    = leaveRepo;
        this.feeRecordRepo = feeRecordRepo;
        this.noticeRepo   = noticeRepo;
    }

    @Operation(summary = "School admin dashboard stats",
               description = "Returns aggregated counts for the school admin overview.")
    @GetMapping
    public ApiResponse<DashboardStats> dashboard(@PathVariable UUID schoolId) {
        validateSchool(schoolId);

        long students      = studentRepo.countBySchoolIdAndStatus(schoolId, StudentStatus.ACTIVE);
        long staff         = staffRepo.countBySchoolIdAndStatus(schoolId, StaffStatus.ACTIVE);
        long classes       = classRoomRepo.countBySchoolId(schoolId);
        long pendingLeave  = leaveRepo.countBySchoolIdAndStatus(schoolId, LeaveStatus.PENDING);
        long pendingFees   = feeRecordRepo.countBySchoolIdAndStatus(schoolId, FeeStatus.PENDING);
        long partialFees   = feeRecordRepo.countBySchoolIdAndStatus(schoolId, FeeStatus.PARTIAL);

        long notices = noticeRepo.countBySchoolIdAndPublished(schoolId, true);

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                new DashboardStats(students, staff, classes, pendingLeave,
                        pendingFees, partialFees, notices));
    }

    private void validateSchool(UUID schoolId) {
        schoolRepo.findById(schoolId)
                .orElseThrow(() -> new NotFoundException("School not found"));
    }
}
