package com.cloudcampus.reports.service;

import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.attendance.repository.AttendanceSessionRepository;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.finance.entity.StudentFeeRecord;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.reports.dto.AttendanceReportResponse;
import com.cloudcampus.reports.dto.ComparisonResponse;
import com.cloudcampus.reports.dto.FeeReportResponse;
import com.cloudcampus.reports.dto.PerformanceReportResponse;
import com.cloudcampus.reports.dto.SchoolComparisonRow;
import com.cloudcampus.school.entity.AcademicYear;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.entity.StudentStatus;
import com.cloudcampus.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
class ReportServiceImpl implements ReportService {

    private final AttendanceSessionRepository sessionRepo;
    private final AttendanceRecordRepository  recordRepo;
    private final StudentFeeRecordRepository  feeRecordRepo;
    private final ExamResultRepository        examResultRepo;
    private final StudentRepository           studentRepo;
    private final SchoolRepository            schoolRepo;
    private final AcademicYearRepository      academicYearRepo;

    ReportServiceImpl(AttendanceSessionRepository sessionRepo,
                      AttendanceRecordRepository  recordRepo,
                      StudentFeeRecordRepository  feeRecordRepo,
                      ExamResultRepository        examResultRepo,
                      StudentRepository           studentRepo,
                      SchoolRepository            schoolRepo,
                      AcademicYearRepository      academicYearRepo) {
        this.sessionRepo      = sessionRepo;
        this.recordRepo       = recordRepo;
        this.feeRecordRepo    = feeRecordRepo;
        this.examResultRepo   = examResultRepo;
        this.studentRepo      = studentRepo;
        this.schoolRepo       = schoolRepo;
        this.academicYearRepo = academicYearRepo;
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceReportResponse attendanceReport(UUID schoolId, UUID academicYearId) {
        List<UUID> sessionIds = sessionRepo.findSessionIdsBySchoolAndYear(schoolId, academicYearId);
        long totalSessions = sessionIds.size();

        if (sessionIds.isEmpty()) {
            return new AttendanceReportResponse(schoolId, academicYearId, 0, List.of());
        }

        List<Object[]> raw = recordRepo.aggregateByStudentAndStatus(sessionIds);

        Map<UUID, Map<AttendanceStatus, Long>> byStudent = new HashMap<>();
        for (Object[] row : raw) {
            UUID studentId           = (UUID) row[0];
            AttendanceStatus status  = (AttendanceStatus) row[1];
            long count               = (Long) row[2];
            byStudent.computeIfAbsent(studentId, k -> new EnumMap<>(AttendanceStatus.class))
                     .put(status, count);
        }

        Map<UUID, Student> studentMap = studentRepo.findAllById(byStudent.keySet())
                .stream().collect(Collectors.toMap(Student::getId, Function.identity()));

        List<AttendanceReportResponse.Row> rows = new ArrayList<>();
        for (Map.Entry<UUID, Map<AttendanceStatus, Long>> e : byStudent.entrySet()) {
            UUID sid    = e.getKey();
            var counts  = e.getValue();
            Student stu = studentMap.get(sid);
            long present = counts.getOrDefault(AttendanceStatus.PRESENT, 0L);
            long absent  = counts.getOrDefault(AttendanceStatus.ABSENT, 0L);
            long late    = counts.getOrDefault(AttendanceStatus.LATE, 0L);
            long excused = counts.getOrDefault(AttendanceStatus.EXCUSED, 0L);
            long total   = present + absent + late + excused;
            double pct   = total == 0 ? 0.0
                    : Math.round(((present + late) * 10_000.0 / total)) / 100.0;
            rows.add(new AttendanceReportResponse.Row(
                    sid,
                    stu != null ? stu.getStudentNumber() : "",
                    stu != null ? stu.getFirstName()     : "",
                    stu != null ? stu.getLastName()      : "",
                    total, present, absent, late, excused, pct));
        }

        rows.sort((a, b) -> Double.compare(b.attendancePercentage(), a.attendancePercentage()));
        return new AttendanceReportResponse(schoolId, academicYearId, totalSessions, rows);
    }

    @Override
    @Transactional(readOnly = true)
    public FeeReportResponse feeReport(UUID schoolId, UUID academicYearId) {
        List<StudentFeeRecord> records = feeRecordRepo.findBySchoolIdAndAcademicYearId(schoolId, academicYearId);

        BigDecimal totalDue  = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;
        long pending = 0, partial = 0, paid = 0, waived = 0;

        for (StudentFeeRecord r : records) {
            totalDue  = totalDue.add(r.getAmountDue());
            totalPaid = totalPaid.add(r.getAmountPaid());
            switch (r.getStatus()) {
                case PENDING, OVERDUE -> pending++;
                case PARTIAL          -> partial++;
                case PAID             -> paid++;
                case WAIVED           -> waived++;
            }
        }

        double collectionRate = totalDue.compareTo(BigDecimal.ZERO) == 0 ? 0.0
                : totalPaid.divide(totalDue, 4, RoundingMode.HALF_UP)
                           .multiply(BigDecimal.valueOf(100))
                           .setScale(2, RoundingMode.HALF_UP)
                           .doubleValue();

        return new FeeReportResponse(
                schoolId, academicYearId, records.size(),
                totalDue, totalPaid,
                pending, partial, paid, waived,
                collectionRate);
    }

    @Override
    @Transactional(readOnly = true)
    public PerformanceReportResponse performanceReport(UUID schoolId, UUID examId) {
        List<ExamResult> results = examResultRepo.findBySchoolIdAndExamIdOrderByRankAsc(schoolId, examId);

        long passedCount = results.stream().filter(ExamResult::isPassed).count();
        long failedCount = results.size() - passedCount;

        BigDecimal classAverage = results.isEmpty() ? BigDecimal.ZERO
                : results.stream()
                         .map(ExamResult::getPercentage)
                         .reduce(BigDecimal.ZERO, BigDecimal::add)
                         .divide(BigDecimal.valueOf(results.size()), 2, RoundingMode.HALF_UP);

        Set<UUID> studentIds = results.stream()
                .map(ExamResult::getStudentId).collect(Collectors.toSet());
        Map<UUID, Student> studentMap = studentRepo.findAllById(studentIds)
                .stream().collect(Collectors.toMap(Student::getId, Function.identity()));

        List<PerformanceReportResponse.Row> rows = results.stream()
                .map(r -> {
                    Student stu = studentMap.get(r.getStudentId());
                    return new PerformanceReportResponse.Row(
                            r.getStudentId(),
                            stu != null ? stu.getStudentNumber() : "",
                            stu != null ? stu.getFirstName()     : "",
                            stu != null ? stu.getLastName()      : "",
                            r.getTotalMarksObtained(),
                            r.getTotalMarksPossible(),
                            r.getPercentage(),
                            r.getGrade(),
                            r.getRank(),
                            r.isPassed());
                })
                .toList();

        return new PerformanceReportResponse(
                schoolId, examId, results.size(), passedCount, failedCount, classAverage, rows);
    }

    @Override
    @Transactional(readOnly = true)
    public ComparisonResponse comparisonReport(UUID tenantId) {
        List<School> schools = schoolRepo.findAllByTenantId(tenantId);

        List<SchoolComparisonRow> rows = new ArrayList<>();
        for (School school : schools) {
            UUID schoolId = school.getId();

            Optional<AcademicYear> currentYear =
                    academicYearRepo.findBySchoolIdAndIsCurrent(schoolId, true);

            UUID        yearId   = currentYear.map(AcademicYear::getId).orElse(null);
            String      yearName = currentYear.map(AcademicYear::getName).orElse("—");
            long        students = studentRepo.countBySchoolIdAndStatus(schoolId, StudentStatus.ACTIVE);

            long   totalSessions    = 0;
            double attendanceRate   = 0.0;
            BigDecimal totalDue     = BigDecimal.ZERO;
            BigDecimal totalPaid    = BigDecimal.ZERO;
            double feeCollectionRate = 0.0;

            if (yearId != null) {
                List<UUID> sessionIds = sessionRepo.findSessionIdsBySchoolAndYear(schoolId, yearId);
                totalSessions = sessionIds.size();

                if (!sessionIds.isEmpty()) {
                    List<Object[]> statusCounts = recordRepo.countByStatusForSessions(sessionIds);
                    long present = 0, late = 0, total = 0;
                    for (Object[] row : statusCounts) {
                        AttendanceStatus status = (AttendanceStatus) row[0];
                        long count = (Long) row[1];
                        total += count;
                        if (status == AttendanceStatus.PRESENT) present += count;
                        if (status == AttendanceStatus.LATE)    late    += count;
                    }
                    if (total > 0) {
                        attendanceRate = Math.round(((present + late) * 10_000.0 / total)) / 100.0;
                    }
                }

                List<StudentFeeRecord> feeRecords =
                        feeRecordRepo.findBySchoolIdAndAcademicYearId(schoolId, yearId);
                for (StudentFeeRecord r : feeRecords) {
                    totalDue  = totalDue.add(r.getAmountDue());
                    totalPaid = totalPaid.add(r.getAmountPaid());
                }
                if (totalDue.compareTo(BigDecimal.ZERO) > 0) {
                    feeCollectionRate = totalPaid.divide(totalDue, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .setScale(2, RoundingMode.HALF_UP)
                            .doubleValue();
                }
            }

            rows.add(new SchoolComparisonRow(
                    schoolId, school.getName(), school.getCode(),
                    yearId, yearName,
                    students, totalSessions, attendanceRate,
                    totalDue, totalPaid, feeCollectionRate));
        }

        rows.sort((a, b) -> a.schoolName().compareToIgnoreCase(b.schoolName()));
        return new ComparisonResponse(tenantId, rows.size(), rows);
    }
}
