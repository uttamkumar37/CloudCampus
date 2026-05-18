package com.cloudcampus.mobile.service;

import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.exam.dto.ExamResultResponse;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.finance.dto.StudentFeeRecordResponse;
import com.cloudcampus.finance.service.FeeService;
import com.cloudcampus.homework.dto.HomeworkResponse;
import com.cloudcampus.homework.repository.HomeworkRepository;
import com.cloudcampus.school.entity.AcademicYear;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentParentLinkRepository;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;
import com.cloudcampus.timetable.service.TimetableService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
class ParentPortalServiceImpl implements ParentPortalService {

    private final StudentParentLinkRepository linkRepo;
    private final StudentRepository           studentRepo;
    private final AttendanceRecordRepository  attendanceRepo;
    private final ExamResultRepository        resultRepo;
    private final HomeworkRepository          homeworkRepo;
    private final TimetableService            timetableService;
    private final AcademicYearRepository      academicYearRepo;
    private final SchoolRepository            schoolRepo;
    private final FeeService                  feeService;

    ParentPortalServiceImpl(
            StudentParentLinkRepository linkRepo,
            StudentRepository           studentRepo,
            AttendanceRecordRepository  attendanceRepo,
            ExamResultRepository        resultRepo,
            HomeworkRepository          homeworkRepo,
            TimetableService            timetableService,
            AcademicYearRepository      academicYearRepo,
            SchoolRepository            schoolRepo,
            FeeService                  feeService) {
        this.linkRepo         = linkRepo;
        this.studentRepo      = studentRepo;
        this.attendanceRepo   = attendanceRepo;
        this.resultRepo       = resultRepo;
        this.homeworkRepo     = homeworkRepo;
        this.timetableService = timetableService;
        this.academicYearRepo = academicYearRepo;
        this.schoolRepo       = schoolRepo;
        this.feeService       = feeService;
    }

    @Override
    public List<ChildSummary> getLinkedChildren() {
        UUID parentUserId = RequestContext.getUserId();
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return linkRepo
                .findAllByParentUserIdOrderByCreatedAtAsc(parentUserId)
                .stream()
                .map(link -> {
                    Student s = studentRepo.findByIdAndTenantId(link.getStudentId(), tenantId).orElse(null);
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
    }

    @Override
    public AttendanceSummary getChildAttendance(UUID studentId) {
        checkAccess(studentId);
        Student s = requireStudent(studentId);
        long total   = attendanceRepo.countByStudentId(studentId);
        long present = attendanceRepo.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
        long absent  = attendanceRepo.countByStudentIdAndStatus(studentId, AttendanceStatus.ABSENT);
        long late    = attendanceRepo.countByStudentIdAndStatus(studentId, AttendanceStatus.LATE);
        return new AttendanceSummary(
                s.getId(), s.getFirstName(), s.getLastName(),
                total, present, absent, late,
                total > 0 ? Math.round(present * 100.0 / total) : 0L
        );
    }

    @Override
    public List<ExamResultResponse> getChildResults(UUID studentId) {
        checkAccess(studentId);
        School school = resolveSchool();
        return resultRepo
                .findByStudentIdAndSchoolIdOrderByCreatedAtDesc(studentId, school.getId())
                .stream()
                .map(ExamResultResponse::from)
                .toList();
    }

    @Override
    public List<HomeworkResponse> getChildHomework(UUID studentId) {
        checkAccess(studentId);
        Student s = requireStudent(studentId);
        if (s.getClassId() == null) return List.of();
        return homeworkRepo
                .findPublishedForClass(s.getSchoolId(), s.getClassId(), s.getSectionId())
                .stream()
                .map(HomeworkResponse::from)
                .toList();
    }

    @Override
    public List<TimetableSlotResponse> getChildTimetable(UUID studentId, UUID academicYearId) {
        checkAccess(studentId);
        Student s = requireStudent(studentId);
        if (s.getClassId() == null) return List.of();
        School school = resolveSchool();
        UUID resolvedYearId = resolveAcademicYear(school.getId(), academicYearId);
        return timetableService.listSlots(school.getId(), resolvedYearId, s.getClassId(), s.getSectionId());
    }

    @Override
    public List<StudentFeeRecordResponse> getChildFees(UUID studentId) {
        checkAccess(studentId);
        return feeService.listRecordsByStudent(studentId, null);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void checkAccess(UUID studentId) {
        UUID parentUserId = RequestContext.getUserId();
        if (!linkRepo.existsByStudentIdAndParentUserId(studentId, parentUserId)) {
            throw new NotFoundException("Student not linked to this parent account");
        }
    }

    private Student requireStudent(UUID studentId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return studentRepo.findByIdAndTenantId(studentId, tenantId)
                .orElseThrow(() -> new NotFoundException("Student not found"));
    }

    private School resolveSchool() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));
    }

    private UUID resolveAcademicYear(UUID schoolId, UUID requested) {
        if (requested != null) return requested;
        return academicYearRepo.findBySchoolIdAndIsCurrent(schoolId, true)
                .map(AcademicYear::getId)
                .orElseThrow(() -> new NotFoundException(
                        "No current academic year — provide academicYearId"));
    }
}
