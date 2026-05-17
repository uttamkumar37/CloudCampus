package com.cloudcampus.reports.service;

import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.reports.dto.PlatformAnalyticsResponse;
import com.cloudcampus.reports.dto.TenantAnalyticsSummary;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.entity.TenantStatus;
import com.cloudcampus.tenant.repository.TenantRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
class AnalyticsServiceImpl implements AnalyticsService {

    private final TenantRepository          tenantRepo;
    private final StudentRepository         studentRepo;
    private final StaffRepository           staffRepo;
    private final SchoolRepository          schoolRepo;
    private final StudentFeeRecordRepository feeRepo;

    AnalyticsServiceImpl(TenantRepository tenantRepo,
                         StudentRepository studentRepo,
                         StaffRepository staffRepo,
                         SchoolRepository schoolRepo,
                         StudentFeeRecordRepository feeRepo) {
        this.tenantRepo  = tenantRepo;
        this.studentRepo = studentRepo;
        this.staffRepo   = staffRepo;
        this.schoolRepo  = schoolRepo;
        this.feeRepo     = feeRepo;
    }

    // H-06: cap at 2 000 tenants to prevent OOM on a misconfigured instance.
    private static final int MAX_TENANTS_PER_ANALYTICS_PAGE = 2_000;

    @Override
    @Transactional(readOnly = true)
    public PlatformAnalyticsResponse platformAnalytics() {
        // Global counts (native queries — bypass Hibernate tenant filter).
        long totalStudents = studentRepo.countActiveGlobal();
        long totalStaff    = staffRepo.countActiveGlobal();
        long totalSchools  = schoolRepo.countActiveGlobal();

        BigDecimal totalDue  = nullSafe(feeRepo.sumAmountDueGlobal());
        BigDecimal totalPaid = nullSafe(feeRepo.sumAmountPaidGlobal());
        double globalRate    = collectionRate(totalDue, totalPaid);

        // Per-tenant maps from grouped native queries.
        Map<UUID, Long>       studentsByTenant = toCountMap(studentRepo.countActiveGroupedByTenant());
        Map<UUID, Long>       staffByTenant    = toCountMap(staffRepo.countActiveGroupedByTenant());
        Map<UUID, Long>       schoolsByTenant  = toCountMap(schoolRepo.countActiveGroupedByTenant());
        Map<UUID, BigDecimal[]> feesByTenant   = toFeeMap(feeRepo.sumAmountsGroupedByTenant());

        // H-06: DB-level counts avoid iterating the full list; paged load caps memory use.
        long totalTenants  = tenantRepo.count();
        long activeTenants = tenantRepo.countByStatus(TenantStatus.ACTIVE);

        List<Tenant> allTenants = tenantRepo.findAll(
                PageRequest.of(0, MAX_TENANTS_PER_ANALYTICS_PAGE, Sort.by("name"))
        ).getContent();

        List<TenantAnalyticsSummary> tenantRows = allTenants.stream()
                .map(t -> {
                    UUID id = t.getId();
                    BigDecimal due  = nullSafe(feesByTenant.getOrDefault(id, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO})[0]);
                    BigDecimal paid = nullSafe(feesByTenant.getOrDefault(id, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO})[1]);
                    return new TenantAnalyticsSummary(
                            id,
                            t.getName(),
                            t.getCode(),
                            t.getStatus().name(),
                            studentsByTenant.getOrDefault(id, 0L),
                            staffByTenant.getOrDefault(id, 0L),
                            schoolsByTenant.getOrDefault(id, 0L),
                            due,
                            paid,
                            collectionRate(due, paid)
                    );
                })
                .sorted((a, b) -> Long.compare(b.activeStudents(), a.activeStudents()))
                .toList();

        return new PlatformAnalyticsResponse(
                totalTenants,
                activeTenants,
                totalStudents,
                totalStaff,
                totalSchools,
                totalDue,
                totalPaid,
                globalRate,
                tenantRows
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Map<UUID, Long> toCountMap(List<Object[]> rows) {
        Map<UUID, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            UUID id    = UUID.fromString((String) row[0]);
            long count = ((Number) row[1]).longValue();
            map.put(id, count);
        }
        return map;
    }

    private static Map<UUID, BigDecimal[]> toFeeMap(List<Object[]> rows) {
        Map<UUID, BigDecimal[]> map = new HashMap<>();
        for (Object[] row : rows) {
            UUID       id   = UUID.fromString((String) row[0]);
            BigDecimal due  = nullSafe((BigDecimal) row[1]);
            BigDecimal paid = nullSafe((BigDecimal) row[2]);
            map.put(id, new BigDecimal[]{due, paid});
        }
        return map;
    }

    private static BigDecimal nullSafe(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static double collectionRate(BigDecimal due, BigDecimal paid) {
        if (due == null || due.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return paid.divide(due, 4, RoundingMode.HALF_UP)
                   .multiply(BigDecimal.valueOf(100))
                   .doubleValue();
    }
}
