package com.cloudcampus.platform.tenantadmin.report;

import java.math.BigDecimal;
import java.util.List;

import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.operations.finance.FeeDemand;
import com.cloudcampus.operations.finance.FeeDemandRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantAdminReportService {

    private final SchoolRepository schoolRepository;
    private final StudentRepository studentRepository;
    private final FeeDemandRepository feeDemandRepository;
    private final TenantRepository tenantRepository;

    public TenantAdminReportService(
            SchoolRepository schoolRepository,
            StudentRepository studentRepository,
            FeeDemandRepository feeDemandRepository,
            TenantRepository tenantRepository
    ) {
        this.schoolRepository = schoolRepository;
        this.studentRepository = studentRepository;
        this.feeDemandRepository = feeDemandRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public TenantReportSummaryResponse tenantSummary(AuthenticatedUser authenticatedUser) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        List<TenantReportSchoolSummary> schools = schoolRepository.findByTenantIdOrderByNameAsc(actor.getTenant().getId())
                .stream()
                .map(this::schoolSummary)
                .toList();
        return response(actor, null, schools);
    }

    @Transactional(readOnly = true)
    public TenantReportSummaryResponse schoolDrilldown(AuthenticatedUser authenticatedUser, String schoolId) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new NotFoundException("School was not found."));
        if (!school.getTenant().getId().equals(actor.getTenant().getId())) {
            throw new ForbiddenException("Tenant Admin cannot access another tenant's school report.");
        }
        return response(actor, school, List.of(schoolSummary(school)));
    }

    private UserAccount requireTenantAdmin(AuthenticatedUser authenticatedUser) {
        UserAccount actor = authenticatedUser.user();
        if (actor.getRole() != UserRole.TENANT_ADMIN) {
            throw new ForbiddenException("Only TENANT_ADMIN can access tenant reports.");
        }
        return actor;
    }

    private TenantReportSummaryResponse response(
            UserAccount actor,
            School selectedSchool,
            List<TenantReportSchoolSummary> schools
    ) {
        TenantReportMetrics totals = schools.stream()
                .map(TenantReportSchoolSummary::metrics)
                .reduce(emptyMetrics(), this::add);
        Tenant tenant = tenantRepository.findById(actor.getTenant().getId())
                .orElseThrow(() -> new NotFoundException("Tenant was not found."));
        return new TenantReportSummaryResponse(
                tenant.getId(),
                tenant.getName(),
                selectedSchool == null ? null : selectedSchool.getId(),
                selectedSchool == null ? null : selectedSchool.getName(),
                schools.size(),
                schools.stream().filter(TenantReportSchoolSummary::active).count(),
                totals,
                schools
        );
    }

    private TenantReportSchoolSummary schoolSummary(School school) {
        return new TenantReportSchoolSummary(
                school.getId(),
                school.getCode(),
                school.getName(),
                school.isPrimarySchool(),
                school.isActive(),
                metricsForSchool(school)
        );
    }

    private TenantReportMetrics metricsForSchool(School school) {
        List<Student> students = studentRepository.findBySchoolIdOrderByAdmissionNumberAsc(school.getId());
        List<FeeDemand> feeDemands = feeDemandRepository.findBySchoolIdOrderByDueDateAscCreatedAtAsc(school.getId());
        BigDecimal amountDue = BigDecimal.ZERO;
        BigDecimal amountPaid = BigDecimal.ZERO;
        BigDecimal outstandingAmount = BigDecimal.ZERO;
        for (FeeDemand demand : feeDemands) {
            amountDue = amountDue.add(demand.getAmountDue());
            amountPaid = amountPaid.add(demand.getAmountPaid());
            outstandingAmount = outstandingAmount.add(demand.outstandingAmount());
        }
        return new TenantReportMetrics(
                students.size(),
                students.stream().filter(Student::isActive).count(),
                feeDemands.size(),
                amountDue,
                amountPaid,
                outstandingAmount
        );
    }

    private TenantReportMetrics add(TenantReportMetrics left, TenantReportMetrics right) {
        return new TenantReportMetrics(
                left.totalStudents() + right.totalStudents(),
                left.activeStudents() + right.activeStudents(),
                left.totalFeeDemands() + right.totalFeeDemands(),
                left.amountDue().add(right.amountDue()),
                left.amountPaid().add(right.amountPaid()),
                left.outstandingAmount().add(right.outstandingAmount())
        );
    }

    private TenantReportMetrics emptyMetrics() {
        return new TenantReportMetrics(
                0,
                0,
                0,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );
    }
}
