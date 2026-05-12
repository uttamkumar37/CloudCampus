package com.cloudcampus.reports.service;

import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.attendance.repository.AttendanceSessionRepository;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.finance.entity.StudentFeeRecord;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.reports.dto.AttendanceReportResponse;
import com.cloudcampus.reports.dto.FeeReportResponse;
import com.cloudcampus.reports.dto.PerformanceReportResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
class ReportServiceImpl implements ReportService {

    private final AttendanceSessionRepository sessionRepo;
    private final AttendanceRecordRepository  recordRepo;
    private final StudentFeeRecordRepository  feeRecordRepo;
    private final ExamResultRepository        examResultRepo;

    ReportServiceImpl(AttendanceSessionRepository sessionRepo,
                      AttendanceRecordRepository  recordRepo,
                      StudentFeeRecordRepository  feeRecordRepo,
                      ExamResultRepository        examResultRepo) {
        this.sessionRepo    = sessionRepo;
        this.recordRepo     = recordRepo;
        this.feeRecordRepo  = feeRecordRepo;
        this.examResultRepo = examResultRepo;
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

        List<AttendanceReportResponse.Row> rows = new ArrayList<>();
        for (Map.Entry<UUID, Map<AttendanceStatus, Long>> e : byStudent.entrySet()) {
            UUID sid   = e.getKey();
            var counts = e.getValue();
            long present = counts.getOrDefault(AttendanceStatus.PRESENT, 0L);
            long absent  = counts.getOrDefault(AttendanceStatus.ABSENT, 0L);
            long late    = counts.getOrDefault(AttendanceStatus.LATE, 0L);
            long excused = counts.getOrDefault(AttendanceStatus.EXCUSED, 0L);
            long total   = present + absent + late + excused;
            double pct   = total == 0 ? 0.0
                    : Math.round(((present + late) * 10_000.0 / total)) / 100.0;
            rows.add(new AttendanceReportResponse.Row(sid, total, present, absent, late, excused, pct));
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

        List<PerformanceReportResponse.Row> rows = results.stream()
                .map(r -> new PerformanceReportResponse.Row(
                        r.getStudentId(),
                        r.getTotalMarksObtained(),
                        r.getTotalMarksPossible(),
                        r.getPercentage(),
                        r.getGrade(),
                        r.getRank(),
                        r.isPassed()))
                .toList();

        return new PerformanceReportResponse(
                schoolId, examId, results.size(), passedCount, failedCount, classAverage, rows);
    }
}
