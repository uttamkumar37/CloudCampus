package com.cloudcampus.tenant.service;

import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.attendance.repository.AttendanceSessionRepository;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.student.entity.StudentStatus;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.dto.ComparisonResponse;
import com.cloudcampus.tenant.dto.PlatformAnalyticsResponse;
import com.cloudcampus.tenant.dto.SchoolComparisonRow;
import com.cloudcampus.tenant.dto.TenantAnalyticsSummary;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.entity.TenantStatus;
import com.cloudcampus.tenant.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class SuperAdminAnalyticsServiceImpl implements SuperAdminAnalyticsService {

    private final TenantRepository            tenantRepo;
    private final StudentRepository           studentRepo;
    private final StaffRepository             staffRepo;
    private final SchoolRepository            schoolRepo;
    private final AcademicYearRepository      academicYearRepo;
    private final AttendanceSessionRepository sessionRepo;
    private final AttendanceRecordRepository  recordRepo;
    private final StudentFeeRecordRepository  feeRepo;

    public SuperAdminAnalyticsServiceImpl(
            TenantRepository tenantRepo,
            StudentRepository studentRepo,
            StaffRepository staffRepo,
            SchoolRepository schoolRepo,
            AcademicYearRepository academicYearRepo,
            AttendanceSessionRepository sessionRepo,
            AttendanceRecordRepository recordRepo,
            StudentFeeRecordRepository feeRepo) {
        this.tenantRepo       = tenantRepo;
        this.studentRepo      = studentRepo;
        this.staffRepo        = staffRepo;
        this.schoolRepo       = schoolRepo;
        this.academicYearRepo = academicYearRepo;
        this.sessionRepo      = sessionRepo;
        this.recordRepo       = recordRepo;
        this.feeRepo          = feeRepo;
    }

    // ── Platform analytics ────────────────────────────────────────────────────

    @Override
    public PlatformAnalyticsResponse getPlatformAnalytics() {
        List<Tenant> tenants = tenantRepo.findAll();

        // Per-tenant aggregates (native queries bypass Hibernate tenant filter)
        Map<String, Long>         studentsByTenant = toLongMap(studentRepo.countActiveGroupedByTenant());
        Map<String, Long>         staffByTenant    = toLongMap(staffRepo.countActiveGroupedByTenant());
        Map<String, Long>         schoolsByTenant  = toLongMap(schoolRepo.countActiveGroupedByTenant());
        Map<String, BigDecimal[]> feesByTenant     = toFeeMap(feeRepo.sumAmountsGroupedByTenant());

        BigDecimal totalFeeDue  = feeRepo.sumAmountDueGlobal();
        BigDecimal totalFeePaid = feeRepo.sumAmountPaidGlobal();

        List<TenantAnalyticsSummary> summaries = tenants.stream()
                .map(t -> {
                    String id          = t.getId().toString();
                    BigDecimal[] fees  = feesByTenant.getOrDefault(id,
                            new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
                    return new TenantAnalyticsSummary(
                            id,
                            t.getName(),
                            t.getCode(),
                            t.getStatus().name(),
                            studentsByTenant.getOrDefault(id, 0L),
                            staffByTenant.getOrDefault(id, 0L),
                            schoolsByTenant.getOrDefault(id, 0L),
                            fees[0],
                            fees[1],
                            collectionRate(fees[1], fees[0])
                    );
                })
                .toList();

        return new PlatformAnalyticsResponse(
                tenants.size(),
                tenants.stream().filter(t -> t.getStatus() == TenantStatus.ACTIVE).count(),
                studentRepo.countActiveGlobal(),
                staffRepo.countActiveGlobal(),
                schoolRepo.countActiveGlobal(),
                totalFeeDue,
                totalFeePaid,
                collectionRate(totalFeePaid, totalFeeDue),
                summaries
        );
    }

    // ── Comparison report ─────────────────────────────────────────────────────

    @Override
    public ComparisonResponse getComparisonReport(UUID tenantId) {
        tenantRepo.findById(tenantId)
                .orElseThrow(() -> new NotFoundException("Tenant not found"));

        List<School> schools = schoolRepo.findAllByTenantId(tenantId);
        List<SchoolComparisonRow> rows = schools.stream()
                .map(this::buildRow)
                .toList();

        return new ComparisonResponse(tenantId.toString(), schools.size(), rows);
    }

    private SchoolComparisonRow buildRow(School school) {
        UUID schoolId = school.getId();

        var activeYear  = academicYearRepo.findBySchoolIdAndIsCurrent(schoolId, true).orElse(null);
        String yearId   = activeYear != null ? activeYear.getId().toString() : null;
        String yearName = activeYear != null ? activeYear.getName() : "N/A";

        long activeStudents = studentRepo.countBySchoolIdAndStatus(schoolId, StudentStatus.ACTIVE);
        long totalSessions  = sessionRepo.countBySchoolId(schoolId);

        Object[] attendanceCounts = recordRepo.countTotalAndPresentBySchool(schoolId);
        long totalRecords   = toLong(attendanceCounts[0]);
        long presentRecords = toLong(attendanceCounts[1]);
        double attendanceRate = totalRecords == 0 ? 0.0
                : round2(100.0 * presentRecords / totalRecords);

        Object[] fees     = feeRepo.sumAmountsBySchool(schoolId);
        BigDecimal due    = toBigDecimal(fees[0]);
        BigDecimal paid   = toBigDecimal(fees[1]);

        return new SchoolComparisonRow(
                schoolId.toString(),
                school.getName(),
                school.getCode(),
                yearId,
                yearName,
                activeStudents,
                totalSessions,
                attendanceRate,
                due,
                paid,
                collectionRate(paid, due)
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Map<String, Long> toLongMap(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((String) row[0], ((Number) row[1]).longValue());
        }
        return map;
    }

    private static Map<String, BigDecimal[]> toFeeMap(List<Object[]> rows) {
        Map<String, BigDecimal[]> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((String) row[0], new BigDecimal[]{toBigDecimal(row[1]), toBigDecimal(row[2])});
        }
        return map;
    }

    private static long toLong(Object val) {
        return val == null ? 0L : ((Number) val).longValue();
    }

    private static BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal bd) return bd;
        return new BigDecimal(val.toString());
    }

    private static double collectionRate(BigDecimal paid, BigDecimal due) {
        if (due == null || due.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return round2(paid.multiply(BigDecimal.valueOf(100))
                         .divide(due, 4, RoundingMode.HALF_UP)
                         .doubleValue());
    }

    private static double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
