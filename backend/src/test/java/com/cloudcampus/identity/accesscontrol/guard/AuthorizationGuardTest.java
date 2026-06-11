package com.cloudcampus.identity.accesscontrol.guard;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.cloudcampus.academic.TeacherAssignmentRepository;
import com.cloudcampus.common.context.RequestContext;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.operations.finance.FeeDemand;
import com.cloudcampus.operations.finance.FeeDemandRepository;
import com.cloudcampus.operations.finance.FeePaymentRepository;
import com.cloudcampus.operations.report.ReportExportJob;
import com.cloudcampus.operations.report.ReportExportJobRepository;
import com.cloudcampus.operations.report.ReportType;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.people.student.StudentUserLinkRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AuthorizationGuardTest {

    private final UserSchoolAccessRepository userSchoolAccessRepository = mock(UserSchoolAccessRepository.class);
    private final ParentStudentLinkRepository parentStudentLinkRepository = mock(ParentStudentLinkRepository.class);
    private final StudentUserLinkRepository studentUserLinkRepository = mock(StudentUserLinkRepository.class);
    private final TeacherAssignmentRepository teacherAssignmentRepository = mock(TeacherAssignmentRepository.class);
    private final StudentRepository studentRepository = mock(StudentRepository.class);
    private final FeeDemandRepository feeDemandRepository = mock(FeeDemandRepository.class);
    private final FeePaymentRepository feePaymentRepository = mock(FeePaymentRepository.class);
    private final ReportExportJobRepository reportExportJobRepository = mock(ReportExportJobRepository.class);

    private AuthorizationGuard guard;

    @BeforeEach
    void setUp() {
        guard = new AuthorizationGuard(
                userSchoolAccessRepository,
                parentStudentLinkRepository,
                studentUserLinkRepository,
                teacherAssignmentRepository,
                studentRepository,
                feeDemandRepository,
                feePaymentRepository,
                reportExportJobRepository
        );
    }

    @Test
    void nullContextIsUnauthorized() {
        assertThatThrownBy(() -> guard.requireAuthenticated(null))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void wrongTenantScopeIsForbidden() {
        RequestContext context = context(Set.of("SCHOOL_ADMIN"), Set.of("MANAGE_SCHOOL"), UUID.randomUUID(), UUID.randomUUID(), false);

        assertThatThrownBy(() -> guard.requireTenantScope(context, UUID.randomUUID()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void wrongActiveSchoolScopeIsForbidden() {
        RequestContext context = context(Set.of("TEACHER"), Set.of("VIEW_ACADEMIC_DATA"), UUID.randomUUID(), UUID.randomUUID(), false);

        assertThatThrownBy(() -> guard.requireSchoolScope(context, UUID.randomUUID()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void schoolGrantAllowsTargetSchoolThatIsNotCurrentlyActive() {
        UUID activeSchoolId = UUID.randomUUID();
        UUID targetSchoolId = UUID.randomUUID();
        RequestContext context = context(Set.of("SCHOOL_ADMIN"), Set.of("MANAGE_SCHOOL"), UUID.randomUUID(), activeSchoolId, false);
        when(userSchoolAccessRepository.existsByUserIdAndSchoolId(context.userId().toString(), targetSchoolId.toString()))
                .thenReturn(true);

        assertThatCode(() -> guard.requireUserSchoolGrant(context, targetSchoolId))
                .doesNotThrowAnyException();
    }

    @Test
    void schoolGrantRejectsMissingGrant() {
        UUID targetSchoolId = UUID.randomUUID();
        RequestContext context = context(Set.of("SCHOOL_ADMIN"), Set.of("MANAGE_SCHOOL"), UUID.randomUUID(), UUID.randomUUID(), false);
        when(userSchoolAccessRepository.existsByUserIdAndSchoolId(context.userId().toString(), targetSchoolId.toString()))
                .thenReturn(false);

        assertThatThrownBy(() -> guard.requireUserSchoolGrant(context, targetSchoolId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void parentMustBeLinkedToStudent() {
        UUID studentId = UUID.randomUUID();
        RequestContext context = context(Set.of("PARENT"), Set.of("VIEW_CHILD_PROFILE"), UUID.randomUUID(), UUID.randomUUID(), false);
        when(parentStudentLinkRepository.existsByParentUserIdAndStudentId(context.userId().toString(), studentId.toString()))
                .thenReturn(false);

        assertThatThrownBy(() -> guard.requireParentLinkedToStudent(context, studentId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void studentMustBeLinkedToOwnRecord() {
        UUID studentId = UUID.randomUUID();
        RequestContext context = context(Set.of("STUDENT"), Set.of("VIEW_OWN_PROFILE"), UUID.randomUUID(), UUID.randomUUID(), false);
        when(studentUserLinkRepository.existsByUserIdAndStudentIdAndActiveTrue(context.userId().toString(), studentId.toString()))
                .thenReturn(false);

        assertThatThrownBy(() -> guard.requireStudentSelfAccess(context, studentId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void teacherMustBeAssignedToClassSection() {
        UUID classLevelId = UUID.randomUUID();
        UUID sectionId = UUID.randomUUID();
        RequestContext context = context(Set.of("TEACHER"), Set.of("VIEW_ACADEMIC_DATA"), UUID.randomUUID(), UUID.randomUUID(), false);
        when(teacherAssignmentRepository.existsByTeacherIdAndClassLevelIdAndSectionIdAndActiveTrue(
                context.userId().toString(),
                classLevelId.toString(),
                sectionId.toString()
        )).thenReturn(false);

        assertThatThrownBy(() -> guard.requireTeacherAssignedToClassSection(context, classLevelId, sectionId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void financeRecordRequiresFinancePermissionForFinanceStaff() {
        UUID tenantId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        UUID demandId = UUID.randomUUID();
        RequestContext context = context(Set.of("FINANCE_STAFF"), Set.of("VIEW_SCHOOL_DASHBOARD"), tenantId, schoolId, false);
        FeeDemand demand = feeDemand(tenantId, schoolId, studentId);
        when(feeDemandRepository.findById(demandId.toString())).thenReturn(Optional.of(demand));
        when(userSchoolAccessRepository.existsByUserIdAndSchoolId(context.userId().toString(), schoolId.toString()))
                .thenReturn(true);

        assertThatThrownBy(() -> guard.requireFeeDemandVisible(context, demandId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void financeRecordAllowsLinkedParentWithoutFinancePermission() {
        UUID tenantId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        UUID demandId = UUID.randomUUID();
        RequestContext context = context(Set.of("PARENT"), Set.of("VIEW_CHILD_FEES"), tenantId, schoolId, false);
        FeeDemand demand = feeDemand(tenantId, schoolId, studentId);
        when(feeDemandRepository.findById(demandId.toString())).thenReturn(Optional.of(demand));
        when(parentStudentLinkRepository.existsByParentUserIdAndStudentId(context.userId().toString(), studentId.toString()))
                .thenReturn(true);

        assertThatCode(() -> guard.requireFeeDemandVisible(context, demandId))
                .doesNotThrowAnyException();
    }

    @Test
    void financeDemandManageRequiresActiveSchoolScope() {
        UUID tenantId = UUID.randomUUID();
        UUID activeSchoolId = UUID.randomUUID();
        UUID otherSchoolId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        UUID demandId = UUID.randomUUID();
        RequestContext context = context(
                Set.of("FINANCE_STAFF"),
                Set.of("MANAGE_FEE_STRUCTURE", "RECORD_PAYMENTS"),
                tenantId,
                activeSchoolId,
                false
        );
        FeeDemand demand = feeDemand(tenantId, otherSchoolId, studentId);
        when(feeDemandRepository.findById(demandId.toString())).thenReturn(Optional.of(demand));

        assertThatThrownBy(() -> guard.requireFeeDemandManageAccess(context, demandId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void financeReportExportRejectsNonFinanceReportType() {
        UUID tenantId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        UUID exportId = UUID.randomUUID();
        RequestContext context = context(
                Set.of("FINANCE_STAFF"),
                Set.of("VIEW_FINANCE_REPORTS", "EXPORT_FINANCE_REPORTS"),
                tenantId,
                schoolId,
                false
        );
        ReportExportJob exportJob = reportExportJob(tenantId, schoolId, ReportType.STUDENT_DIRECTORY);
        when(reportExportJobRepository.findById(exportId.toString())).thenReturn(Optional.of(exportJob));

        assertThatThrownBy(() -> guard.requireFinanceReportExportVisible(context, exportId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void schoolReportExportRequiresActiveSchoolScope() {
        UUID tenantId = UUID.randomUUID();
        UUID activeSchoolId = UUID.randomUUID();
        UUID otherSchoolId = UUID.randomUUID();
        UUID exportId = UUID.randomUUID();
        RequestContext context = context(Set.of("SCHOOL_ADMIN"), Set.of("VIEW_REPORTS"), tenantId, activeSchoolId, false);
        ReportExportJob exportJob = reportExportJob(tenantId, otherSchoolId, ReportType.STUDENT_DIRECTORY);
        when(reportExportJobRepository.findById(exportId.toString())).thenReturn(Optional.of(exportJob));

        assertThatThrownBy(() -> guard.requireSchoolReportExportVisible(context, exportId))
                .isInstanceOf(ForbiddenException.class);
    }

    private RequestContext context(Set<String> roles, Set<String> permissions, UUID tenantId, UUID schoolId, boolean superAdmin) {
        return new RequestContext(
                UUID.randomUUID(),
                tenantId,
                schoolId,
                roles,
                permissions,
                "test-correlation",
                "unit-test",
                superAdmin
        );
    }

    private FeeDemand feeDemand(UUID tenantId, UUID schoolId, UUID studentId) {
        FeeDemand demand = mock(FeeDemand.class);
        Tenant tenant = mock(Tenant.class);
        School school = mock(School.class);
        Student student = mock(Student.class);
        when(tenant.getId()).thenReturn(tenantId.toString());
        when(school.getId()).thenReturn(schoolId.toString());
        when(student.getId()).thenReturn(studentId.toString());
        when(demand.getTenant()).thenReturn(tenant);
        when(demand.getSchool()).thenReturn(school);
        when(demand.getStudent()).thenReturn(student);
        return demand;
    }

    private ReportExportJob reportExportJob(UUID tenantId, UUID schoolId, ReportType reportType) {
        ReportExportJob exportJob = mock(ReportExportJob.class);
        Tenant tenant = mock(Tenant.class);
        School school = mock(School.class);
        when(tenant.getId()).thenReturn(tenantId.toString());
        when(school.getId()).thenReturn(schoolId.toString());
        when(exportJob.getTenant()).thenReturn(tenant);
        when(exportJob.getSchool()).thenReturn(school);
        when(exportJob.getReportType()).thenReturn(reportType);
        return exportJob;
    }
}
