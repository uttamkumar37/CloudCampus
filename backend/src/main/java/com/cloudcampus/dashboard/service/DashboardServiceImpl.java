package com.cloudcampus.dashboard.service;

import com.cloudcampus.academic.entity.SchoolClass;
import com.cloudcampus.academic.entity.Section;
import com.cloudcampus.academic.entity.Subject;
import com.cloudcampus.academic.repository.SchoolClassRepository;
import com.cloudcampus.academic.repository.SectionRepository;
import com.cloudcampus.academic.repository.SubjectRepository;
import com.cloudcampus.attendance.entity.AttendanceRecord;
import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.dashboard.dto.MetricPointResponse;
import com.cloudcampus.dashboard.dto.RecentActivityResponse;
import com.cloudcampus.dashboard.dto.StudentDashboardResponse;
import com.cloudcampus.dashboard.dto.SuperAdminDashboardSummaryResponse;
import com.cloudcampus.dashboard.dto.TeacherDashboardResponse;
import com.cloudcampus.dashboard.dto.TenantBrandingResponse;
import com.cloudcampus.dashboard.dto.TenantDashboardSummaryResponse;
import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.repository.ExamRepository;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.fees.entity.FeeAssignment;
import com.cloudcampus.fees.entity.FeePayment;
import com.cloudcampus.fees.entity.FeeStatus;
import com.cloudcampus.fees.repository.FeeAssignmentRepository;
import com.cloudcampus.fees.repository.FeePaymentRepository;
import com.cloudcampus.homework.repository.HomeworkAssignmentRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.teacher.entity.Teacher;
import com.cloudcampus.teacher.repository.TeacherRepository;
import com.cloudcampus.tenant.dto.TenantResponse;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.repository.TenantRepository;
import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.tenant.service.TenantService;
import com.cloudcampus.timetable.entity.TimetableSlot;
import com.cloudcampus.timetable.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final EnumSet<AttendanceStatus> PRESENT_STATUSES =
            EnumSet.of(AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.EXCUSED);

    private final TenantService tenantService;
    private final TenantRepository tenantRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final FeeAssignmentRepository feeAssignmentRepository;
    private final ExamResultRepository examResultRepository;
    private final ExamRepository examRepository;
    private final HomeworkAssignmentRepository homeworkAssignmentRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;

    @Override
    @Transactional(readOnly = true)
    public TenantDashboardSummaryResponse getTenantDashboardSummary() {
        validateTenantContext();

        TenantResponse tenant = tenantService.getCurrentTenant();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate attendanceWindowStart = today.minusDays(6);
        LocalDate feesWindowStart = today.withDayOfMonth(1).minusMonths(5);

        long totalAttendanceRecords = attendanceRecordRepository.countByAttendanceDateBetween(attendanceWindowStart, today);
        long presentAttendanceRecords = attendanceRecordRepository.countByAttendanceDateBetweenAndStatusIn(
                attendanceWindowStart,
                today,
                PRESENT_STATUSES
        );

        BigDecimal feesCollected = feePaymentRepository.findAllByPaymentDateBetween(feesWindowStart, today).stream()
                .map(FeePayment::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new TenantDashboardSummaryResponse(
                new TenantBrandingResponse(
                        tenant.tenantId(),
                        tenant.schoolName(),
                        tenant.logoUrl(),
                        tenant.primaryColor()
                ),
                studentRepository.countByActiveTrue(),
                teacherRepository.countByActiveTrue(),
                calculatePercentage(presentAttendanceRecords, totalAttendanceRecords),
                feesCollected,
                buildAttendanceTrend(attendanceWindowStart, today),
                buildMonthlyFeeCollection(YearMonth.from(today).minusMonths(5), YearMonth.from(today)),
                buildRecentActivity(),
                buildQuickInsights()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public SuperAdminDashboardSummaryResponse getSuperAdminDashboardSummary() {
        long totalTenants = tenantRepository.count();
        long activeTenants = tenantRepository.countByActiveTrue();
        Instant monthStart = LocalDate.now(ZoneOffset.UTC)
                .withDayOfMonth(1)
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);

        // FIXED: was findAll() twice (loads every tenant into memory).
        // Now uses paginated DB query + aggregate count — O(1) memory, O(log n) time.
        List<TenantResponse> newestTenants = tenantRepository
                .findAllByOrderByCreatedAtDesc(Pageable.ofSize(6)).stream()
                .map(this::mapTenant)
                .toList();

        long tenantsCreatedThisMonth = tenantRepository.countByCreatedAtAfter(monthStart);

        return new SuperAdminDashboardSummaryResponse(
                totalTenants,
                activeTenants,
                tenantsCreatedThisMonth,
                Math.max(0, totalTenants - activeTenants),
                newestTenants
        );
    }

    private List<MetricPointResponse> buildAttendanceTrend(LocalDate startDate, LocalDate endDate) {
        List<MetricPointResponse> trend = new ArrayList<>();
        for (LocalDate cursor = startDate; !cursor.isAfter(endDate); cursor = cursor.plusDays(1)) {
            List<AttendanceRecord> dailyRecords = attendanceRecordRepository.findAllByAttendanceDate(cursor);
            long attended = dailyRecords.stream()
                    .filter(record -> PRESENT_STATUSES.contains(record.getStatus()))
                    .count();
            trend.add(new MetricPointResponse(
                    cursor.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    calculatePercentage(attended, dailyRecords.size())
            ));
        }
        return trend;
    }

    private List<MetricPointResponse> buildMonthlyFeeCollection(YearMonth startMonth, YearMonth endMonth) {
        List<FeePayment> payments = feePaymentRepository.findAllByPaymentDateBetween(
                startMonth.atDay(1),
                endMonth.atEndOfMonth()
        );

        List<MetricPointResponse> points = new ArrayList<>();
        for (YearMonth month = startMonth; !month.isAfter(endMonth); month = month.plusMonths(1)) {
            YearMonth currentMonth = month;
            BigDecimal total = payments.stream()
                    .filter(payment -> YearMonth.from(payment.getPaymentDate()).equals(currentMonth))
                    .map(FeePayment::getAmountPaid)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            points.add(new MetricPointResponse(
                    month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    total.doubleValue()
            ));
        }
        return points;
    }

    private List<RecentActivityResponse> buildRecentActivity() {
        List<RecentActivityResponse> activity = new ArrayList<>();

        studentRepository.findTop5ByOrderByCreatedAtDesc().forEach(student -> activity.add(
                new RecentActivityResponse(
                        "New student enrolled",
                        student.getFirstName() + " " + student.getLastName() + " joined with admission no " + student.getAdmissionNo(),
                        "STUDENT",
                        student.getCreatedAt()
                )
        ));

        teacherRepository.findTop5ByOrderByCreatedAtDesc().forEach(teacher -> activity.add(
                new RecentActivityResponse(
                        "Teacher onboarded",
                        teacher.getFirstName() + " " + teacher.getLastName() + " added to the faculty roster",
                        "TEACHER",
                        teacher.getCreatedAt()
                )
        ));

        attendanceRecordRepository.findTop8ByOrderByCreatedAtDesc().forEach(record -> activity.add(
                new RecentActivityResponse(
                        "Attendance recorded",
                        "Attendance marked for " + record.getAttendanceDate(),
                        "ATTENDANCE",
                        record.getCreatedAt()
                )
        ));

        feePaymentRepository.findTop8ByOrderByCreatedAtDesc().forEach(payment -> activity.add(
                new RecentActivityResponse(
                        "Fee payment received",
                        "Collected " + payment.getAmountPaid() + " via " + payment.getPaymentMethod(),
                        "FEE",
                        payment.getCreatedAt()
                )
        ));

        return activity.stream()
                .filter(item -> item.occurredAt() != null)
                .sorted(Comparator.comparing(RecentActivityResponse::occurredAt).reversed())
                .limit(8)
                .toList();
    }

    private List<String> buildQuickInsights() {
        Instant last30Days = Instant.now().minusSeconds(30L * 24 * 60 * 60);
        return List.of(
                studentRepository.countByCreatedAtAfter(last30Days) + " new students joined in the last 30 days",
                teacherRepository.countByCreatedAtAfter(last30Days) + " teachers were onboarded this month",
                "Tenant theme color is " + tenantService.getCurrentTenant().primaryColor()
        );
    }

    private double calculatePercentage(long numerator, long denominator) {
        if (denominator == 0) {
            return 0.0;
        }
        return BigDecimal.valueOf((numerator * 100.0) / denominator)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private TenantResponse mapTenant(Tenant tenant) {
        return new TenantResponse(
                tenant.getTenantId(),
                                tenant.getSlug(),
                tenant.getSchoolName(),
                tenant.getSchemaName(),
                tenant.getLogoUrl(),
                tenant.getPrimaryColor(),
                tenant.isActive(),
                tenant.getCreatedAt()
        );
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required for tenant dashboard operations");
        }
    }

    // ─── Student Dashboard ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public StudentDashboardResponse getStudentDashboard() {
        validateTenantContext();
        CloudCampusUserDetails principal = currentPrincipal();
                Student student = resolveStudentProfile(principal);

        UUID studentId = student.getId();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        // Infer class/section from most recent attendance record
        Optional<AttendanceRecord> latestAttendance =
                attendanceRecordRepository.findTop1ByStudentIdOrderByAttendanceDateDesc(studentId);
        UUID classId = latestAttendance.map(AttendanceRecord::getClassId).orElse(null);
        UUID sectionId = latestAttendance.map(AttendanceRecord::getSectionId).orElse(null);

        return new StudentDashboardResponse(
                new StudentDashboardResponse.StudentProfileInfo(
                        student.getId(), student.getAdmissionNo(),
                        student.getFirstName(), student.getLastName(), student.getEmail()),
                buildStudentAttendance(studentId, today),
                buildStudentFees(studentId),
                buildStudentExamResults(studentId),
                buildStudentHomework(classId, today),
                buildStudentTimetableToday(classId, sectionId, today)
        );
    }

    private StudentDashboardResponse.AttendanceSummaryInfo buildStudentAttendance(UUID studentId, LocalDate today) {
        long total = attendanceRecordRepository.countByStudentId(studentId);
        long present = attendanceRecordRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT)
                + attendanceRecordRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.LATE)
                + attendanceRecordRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.EXCUSED);

        LocalDate sevenDaysAgo = today.minusDays(6);
        List<AttendanceRecord> lastWeek = attendanceRecordRepository
                .findAllByStudentIdAndAttendanceDateBetween(studentId, sevenDaysAgo, today);
        Map<LocalDate, AttendanceStatus> byDate = lastWeek.stream()
                .collect(Collectors.toMap(AttendanceRecord::getAttendanceDate, AttendanceRecord::getStatus,
                        (a, b) -> a));

        List<StudentDashboardResponse.AttendanceDay> days = new ArrayList<>();
        for (LocalDate d = sevenDaysAgo; !d.isAfter(today); d = d.plusDays(1)) {
            AttendanceStatus s = byDate.get(d);
            days.add(new StudentDashboardResponse.AttendanceDay(d, s == null ? "NO_RECORD" : s.name()));
        }

        return new StudentDashboardResponse.AttendanceSummaryInfo(
                total, present, calculatePercentage(present, total), days);
    }

    private StudentDashboardResponse.FeesSummaryInfo buildStudentFees(UUID studentId) {
        List<FeeAssignment> assignments = feeAssignmentRepository.findAllByStudentId(studentId);
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal paid = BigDecimal.ZERO;
        int pending = 0;
        for (FeeAssignment a : assignments) {
            total = total.add(a.getAmount());
            if (a.getStatus() == FeeStatus.PAID) {
                paid = paid.add(a.getAmount());
            } else {
                pending++;
            }
        }
        return new StudentDashboardResponse.FeesSummaryInfo(
                total, paid, total.subtract(paid), assignments.size(), pending);
    }

    private List<StudentDashboardResponse.ExamResultSummary> buildStudentExamResults(UUID studentId) {
        List<ExamResult> results = examResultRepository.findTop5ByStudentIdOrderByCreatedAtDesc(studentId);
        if (results.isEmpty()) return List.of();
        // FIXED: was one findById() per result (N+1). Now batch-loads all exams in one query.
        Set<UUID> examIds = results.stream().map(ExamResult::getExamId).collect(Collectors.toSet());
        Map<UUID, Exam> examMap = examRepository.findAllById(examIds).stream()
                .collect(Collectors.toMap(Exam::getId, e -> e));
        return results.stream()
                .filter(r -> examMap.containsKey(r.getExamId()))
                .map(r -> {
                    Exam exam = examMap.get(r.getExamId());
                    return new StudentDashboardResponse.ExamResultSummary(
                            exam.getTitle(), exam.getExamDate(),
                            r.getMarksObtained(), exam.getMaxMarks(), r.getGrade());
                })
                .toList();
    }

    private List<StudentDashboardResponse.HomeworkSummary> buildStudentHomework(UUID classId, LocalDate today) {
        if (classId == null) return List.of();
        return homeworkAssignmentRepository.findTop5ByClassIdOrderByCreatedAtDesc(classId).stream()
                .map(hw -> new StudentDashboardResponse.HomeworkSummary(
                        hw.getId(), hw.getTitle(), hw.getDueDate(),
                        hw.getDueDate() != null && hw.getDueDate().isBefore(today)))
                .toList();
    }

    private List<StudentDashboardResponse.TimetableSlotSummary> buildStudentTimetableToday(
            UUID classId, UUID sectionId, LocalDate today) {
        if (classId == null || sectionId == null) return List.of();
        short todayDow = (short) today.getDayOfWeek().getValue(); // 1=MON..7=SUN
        List<TimetableSlot> allSlots = timetableSlotRepository
                .findByClassIdAndSectionIdOrderByDayOfWeekAscStartTimeAsc(classId, sectionId);
        List<TimetableSlot> todaySlots = allSlots.stream()
                .filter(s -> s.getDayOfWeek() == todayDow)
                .toList();
        if (todaySlots.isEmpty()) return List.of();

        // FIXED: was one subjectRepository.findById() per slot (N+1).
        // Now batch-loads all referenced subjects in a single query.
        Set<UUID> subjectIds = todaySlots.stream()
                .map(TimetableSlot::getSubjectId)
                .collect(Collectors.toSet());
        Map<UUID, String> subjectNameMap = subjectRepository.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getId, Subject::getName));

        return todaySlots.stream()
                .map(s -> new StudentDashboardResponse.TimetableSlotSummary(
                        subjectNameMap.getOrDefault(s.getSubjectId(), "Unknown"),
                        s.getStartTime(), s.getEndTime(), s.getLabel()))
                .toList();
    }

    // ─── Teacher Dashboard ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public TeacherDashboardResponse getTeacherDashboard() {
        validateTenantContext();
        CloudCampusUserDetails principal = currentPrincipal();
                Teacher teacher = resolveTeacherProfile(principal);

        UUID teacherId = teacher.getId();
        UUID userId = principal.getUserId();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        short todayDow = (short) today.getDayOfWeek().getValue();

        List<TimetableSlot> allSlots = timetableSlotRepository
                .findByTeacherIdOrderByDayOfWeekAscStartTimeAsc(teacherId);

        // FIXED: was multiple findById() calls inside loops for class/section/subject (N+1).
        // Batch-load all referenced entities upfront in three queries total.
        Set<UUID> allClassIds   = allSlots.stream().map(TimetableSlot::getClassId).collect(Collectors.toSet());
        Set<UUID> allSectionIds = allSlots.stream().map(TimetableSlot::getSectionId).collect(Collectors.toSet());
        Set<UUID> allSubjectIds = allSlots.stream().map(TimetableSlot::getSubjectId).collect(Collectors.toSet());

        Map<UUID, String> classNameMap   = schoolClassRepository.findAllById(allClassIds).stream()
                .collect(Collectors.toMap(SchoolClass::getId, SchoolClass::getName));
        Map<UUID, String> sectionNameMap = sectionRepository.findAllById(allSectionIds).stream()
                .collect(Collectors.toMap(Section::getId, Section::getName));
        Map<UUID, String> subjectNameMap = subjectRepository.findAllById(allSubjectIds).stream()
                .collect(Collectors.toMap(Subject::getId, Subject::getName));

        // Unique class+section combos — now uses pre-loaded maps, zero extra queries
        Set<String> seen = new LinkedHashSet<>();
        List<TeacherDashboardResponse.AssignedClassInfo> assignedClasses = new ArrayList<>();
        for (TimetableSlot slot : allSlots) {
            String key = slot.getClassId() + ":" + slot.getSectionId();
            if (seen.add(key)) {
                assignedClasses.add(new TeacherDashboardResponse.AssignedClassInfo(
                        slot.getClassId(),
                        classNameMap.getOrDefault(slot.getClassId(), "Unknown"),
                        slot.getSectionId(),
                        sectionNameMap.getOrDefault(slot.getSectionId(), "Unknown")));
            }
        }

        // Today's timetable — uses pre-loaded maps, zero extra queries
        List<TeacherDashboardResponse.TimetableSlotSummary> todayTimetable = allSlots.stream()
                .filter(s -> s.getDayOfWeek() == todayDow)
                .map(s -> new TeacherDashboardResponse.TimetableSlotSummary(
                        subjectNameMap.getOrDefault(s.getSubjectId(), "Unknown"),
                        classNameMap.getOrDefault(s.getClassId(), "Unknown"),
                        sectionNameMap.getOrDefault(s.getSectionId(), "Unknown"),
                        s.getStartTime(), s.getEndTime(), s.getLabel()))
                .toList();

        // Recent homework — batch-load only the class IDs referenced by homework entries
        var hwList = homeworkAssignmentRepository.findTop5ByAssignedByUserIdOrderByCreatedAtDesc(userId);
        Set<UUID> hwClassIds = hwList.stream().map(hw -> hw.getClassId()).collect(Collectors.toSet());
        Map<UUID, String> hwClassNameMap = hwClassIds.isEmpty() ? Map.of() :
                schoolClassRepository.findAllById(hwClassIds).stream()
                        .collect(Collectors.toMap(SchoolClass::getId, SchoolClass::getName));
        List<TeacherDashboardResponse.HomeworkSummary> recentHomework = hwList.stream()
                .map(hw -> new TeacherDashboardResponse.HomeworkSummary(
                        hw.getId(), hw.getTitle(), hw.getDueDate(),
                        hwClassNameMap.getOrDefault(hw.getClassId(), "Unknown")))
                .toList();

        // Recent exams — classNameMap already covers all assigned-class IDs
        Set<UUID> classIds = assignedClasses.stream()
                .map(TeacherDashboardResponse.AssignedClassInfo::classId)
                .collect(Collectors.toSet());
        List<TeacherDashboardResponse.ExamSummary> recentExams = classIds.isEmpty() ? List.of() :
                examRepository.findTop5ByClassIdInOrderByExamDateDesc(classIds).stream()
                        .map(e -> new TeacherDashboardResponse.ExamSummary(
                                e.getId(), e.getTitle(), e.getExamDate(),
                                classNameMap.getOrDefault(e.getClassId(), "Unknown")))
                        .toList();

        return new TeacherDashboardResponse(
                new TeacherDashboardResponse.TeacherProfileInfo(
                        teacher.getId(), teacher.getEmployeeNo(),
                        teacher.getFirstName(), teacher.getLastName(), teacher.getEmail()),
                assignedClasses,
                recentHomework,
                recentExams,
                todayTimetable
        );
    }

    // ─── Shared helpers ───────────────────────────────────────────────────────

    private CloudCampusUserDetails currentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CloudCampusUserDetails details)) {
            throw new IllegalStateException("No authenticated user in SecurityContext");
        }
        return details;
    }

    private Student resolveStudentProfile(CloudCampusUserDetails principal) {
        UUID userId = principal.getUserId();
        Optional<Student> byLinkedUser = userId == null
                ? Optional.empty()
                : studentRepository.findByLinkedUser_Id(userId);
        Optional<Student> byName = extractNamePair(principal.getFullName())
                .flatMap(name -> studentRepository.findFirstByFirstNameIgnoreCaseAndLastNameIgnoreCase(name.firstName(), name.lastName()));

        return byLinkedUser
                .or(() -> studentRepository.findByEmailIgnoreCase(principal.getEmail()))
                .or(() -> byName)
                .orElseThrow(() -> new IllegalArgumentException("No student profile linked to this account"));
    }

    private Teacher resolveTeacherProfile(CloudCampusUserDetails principal) {
        UUID userId = principal.getUserId();
        Optional<Teacher> byLinkedUser = userId == null
                ? Optional.empty()
                : teacherRepository.findByLinkedUser_Id(userId);
        Optional<Teacher> byName = extractNamePair(principal.getFullName())
                .flatMap(name -> teacherRepository.findFirstByFirstNameIgnoreCaseAndLastNameIgnoreCase(name.firstName(), name.lastName()));

        return byLinkedUser
                .or(() -> teacherRepository.findByEmailIgnoreCase(principal.getEmail()))
                .or(() -> byName)
                .orElseThrow(() -> new IllegalArgumentException("No teacher profile linked to this account"));
    }

    private Optional<NamePair> extractNamePair(String fullName) {
        if (fullName == null) {
            return Optional.empty();
        }
        String normalized = fullName.trim();
        if (normalized.isEmpty()) {
            return Optional.empty();
        }
        String[] parts = normalized.split("\\s+");
        if (parts.length < 2) {
            return Optional.empty();
        }
        return Optional.of(new NamePair(parts[0], parts[parts.length - 1]));
    }

    private record NamePair(String firstName, String lastName) {}
}
