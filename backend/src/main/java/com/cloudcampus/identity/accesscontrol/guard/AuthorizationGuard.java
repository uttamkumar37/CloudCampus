package com.cloudcampus.identity.accesscontrol.guard;

import java.util.Arrays;
import java.util.Locale;
import java.util.UUID;

import com.cloudcampus.academic.TeacherAssignmentRepository;
import com.cloudcampus.common.context.RequestContext;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.operations.finance.FeeDemand;
import com.cloudcampus.operations.finance.FeeDemandRepository;
import com.cloudcampus.operations.finance.FeePayment;
import com.cloudcampus.operations.finance.FeePaymentRepository;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.people.student.StudentUserLinkRepository;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AuthorizationGuard {

    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final StudentUserLinkRepository studentUserLinkRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StudentRepository studentRepository;
    private final FeeDemandRepository feeDemandRepository;
    private final FeePaymentRepository feePaymentRepository;

    public AuthorizationGuard(
            UserSchoolAccessRepository userSchoolAccessRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            StudentUserLinkRepository studentUserLinkRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            StudentRepository studentRepository,
            FeeDemandRepository feeDemandRepository,
            FeePaymentRepository feePaymentRepository
    ) {
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.studentUserLinkRepository = studentUserLinkRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.studentRepository = studentRepository;
        this.feeDemandRepository = feeDemandRepository;
        this.feePaymentRepository = feePaymentRepository;
    }

    public RequestContext requireAuthenticated(RequestContext context) {
        if (context == null || context.userId() == null) {
            throw new UnauthorizedException("Authenticated request context is required.");
        }
        return context;
    }

    public void requireRole(RequestContext context, String role) {
        requireAuthenticated(context);
        if (!context.superAdmin() && !context.hasRole(normalize(role))) {
            throw new ForbiddenException("Role " + normalize(role) + " is required.");
        }
    }

    public void requireAnyRole(RequestContext context, String... roles) {
        requireAuthenticated(context);
        if (context.superAdmin()) {
            return;
        }
        if (Arrays.stream(roles).map(this::normalize).noneMatch(context::hasRole)) {
            throw new ForbiddenException("One of the required roles is missing.");
        }
    }

    public void requirePermission(RequestContext context, String permission) {
        requireAuthenticated(context);
        if (!context.superAdmin() && !context.hasPermission(normalize(permission))) {
            throw new ForbiddenException("Permission " + normalize(permission) + " is required.");
        }
    }

    public void requireAnyPermission(RequestContext context, String... permissions) {
        requireAuthenticated(context);
        if (context.superAdmin()) {
            return;
        }
        if (Arrays.stream(permissions).map(this::normalize).noneMatch(context::hasPermission)) {
            throw new ForbiddenException("One of the required permissions is missing.");
        }
    }

    public void requireTenantScope(RequestContext context, UUID tenantId) {
        requireAuthenticated(context);
        if (tenantId == null) {
            throw new ForbiddenException("Tenant scope is required.");
        }
        if (!context.superAdmin() && !context.isTenantScopedTo(tenantId)) {
            throw new ForbiddenException("Request is outside the authenticated tenant scope.");
        }
    }

    public UUID requireActiveSchool(RequestContext context) {
        requireAuthenticated(context);
        if (!context.hasActiveSchool()) {
            throw new ForbiddenException("An active school is required.");
        }
        return context.activeSchoolId();
    }

    public void requireSchoolScope(RequestContext context, UUID schoolId) {
        requireAuthenticated(context);
        if (schoolId == null) {
            throw new ForbiddenException("School scope is required.");
        }
        if (!context.superAdmin() && !context.isSchoolScopedTo(schoolId)) {
            throw new ForbiddenException("Request is outside the active school scope.");
        }
    }

    @Transactional(readOnly = true)
    public void requireUserSchoolAccess(RequestContext context, UUID schoolId) {
        requireSchoolScope(context, schoolId);
        if (context.superAdmin()) {
            return;
        }
        if (!userSchoolAccessRepository.existsByUserIdAndSchoolId(id(context.userId()), id(schoolId))) {
            throw new ForbiddenException("User is not allowed to access this school.");
        }
    }

    @Transactional(readOnly = true)
    public void requireUserSchoolGrant(RequestContext context, UUID schoolId) {
        requireAuthenticated(context);
        if (schoolId == null) {
            throw new ForbiddenException("School scope is required.");
        }
        if (!userSchoolAccessRepository.existsByUserIdAndSchoolId(id(context.userId()), id(schoolId))) {
            throw new ForbiddenException("User is not assigned to this school.");
        }
    }

    @Transactional(readOnly = true)
    public void requireParentLinkedToStudent(RequestContext context, UUID studentId) {
        requireAuthenticated(context);
        requireRole(context, "PARENT");
        if (!parentStudentLinkRepository.existsByParentUserIdAndStudentId(id(context.userId()), id(studentId))) {
            throw new ForbiddenException("Parent is not linked to this student.");
        }
    }

    @Transactional(readOnly = true)
    public void requireParentLinkedToStudent(RequestContext context, String studentId) {
        requireParentLinkedToStudent(context, uuid(studentId));
    }

    @Transactional(readOnly = true)
    public void requireStudentSelfAccess(RequestContext context, UUID studentId) {
        requireAuthenticated(context);
        requireRole(context, "STUDENT");
        if (!studentUserLinkRepository.existsByUserIdAndStudentIdAndActiveTrue(id(context.userId()), id(studentId))) {
            throw new ForbiddenException("Student is not linked to this record.");
        }
    }

    @Transactional(readOnly = true)
    public void requireStudentSelfAccess(RequestContext context, String studentId) {
        requireStudentSelfAccess(context, uuid(studentId));
    }

    @Transactional(readOnly = true)
    public void requireTeacherAssignedToClass(RequestContext context, UUID classLevelId) {
        requireAuthenticated(context);
        requireRole(context, "TEACHER");
        if (!teacherAssignmentRepository.existsByTeacherIdAndClassLevelIdAndActiveTrue(id(context.userId()), id(classLevelId))) {
            throw new ForbiddenException("Teacher is not assigned to this class.");
        }
    }

    @Transactional(readOnly = true)
    public void requireTeacherAssignedToClassSection(RequestContext context, UUID classLevelId, UUID sectionId) {
        requireAuthenticated(context);
        requireRole(context, "TEACHER");
        boolean assigned = sectionId == null
                ? teacherAssignmentRepository.existsByTeacherIdAndClassLevelIdAndActiveTrue(id(context.userId()), id(classLevelId))
                : teacherAssignmentRepository.existsByTeacherIdAndClassLevelIdAndSectionIdAndActiveTrue(
                        id(context.userId()),
                        id(classLevelId),
                        id(sectionId)
                );
        if (!assigned) {
            throw new ForbiddenException("Teacher is not assigned to this class section.");
        }
    }

    @Transactional(readOnly = true)
    public void requireTeacherAssignedToScope(
            RequestContext context,
            UUID tenantId,
            UUID schoolId,
            UUID classLevelId,
            UUID sectionId,
            UUID subjectId
    ) {
        requireAuthenticated(context);
        requireRole(context, "TEACHER");
        requireTenantScope(context, tenantId);
        requireUserSchoolAccess(context, schoolId);
        boolean assigned = sectionId == null
                ? teacherAssignmentRepository.existsByTeacherIdAndSchoolIdAndClassLevelIdAndSubjectIdAndActiveTrue(
                        id(context.userId()),
                        id(schoolId),
                        id(classLevelId),
                        id(subjectId)
                )
                : teacherAssignmentRepository.existsByTeacherIdAndSchoolIdAndClassLevelIdAndSubjectIdAndSectionIsNullAndActiveTrue(
                        id(context.userId()),
                        id(schoolId),
                        id(classLevelId),
                        id(subjectId)
                ) || teacherAssignmentRepository.existsByTeacherIdAndSchoolIdAndClassLevelIdAndSubjectIdAndSectionIdAndActiveTrue(
                        id(context.userId()),
                        id(schoolId),
                        id(classLevelId),
                        id(subjectId),
                        id(sectionId)
                );
        if (!assigned) {
            throw new ForbiddenException("Teacher is not assigned to this class subject scope.");
        }
    }

    @Transactional(readOnly = true)
    public void requireTeacherAssignedToScope(
            RequestContext context,
            String tenantId,
            String schoolId,
            String classLevelId,
            String sectionId,
            String subjectId
    ) {
        requireTeacherAssignedToScope(
                context,
                uuid(tenantId),
                uuid(schoolId),
                uuid(classLevelId),
                sectionId == null || sectionId.isBlank() ? null : uuid(sectionId),
                uuid(subjectId)
        );
    }

    @Transactional(readOnly = true)
    public void requireStudentRecordVisible(RequestContext context, UUID studentId) {
        Student student = studentRepository.findById(id(studentId))
                .orElseThrow(() -> new NotFoundException("Student was not found."));
        requireTenantScope(context, uuid(student.getTenant().getId()));
        if (context.superAdmin()) {
            return;
        }

        UUID schoolId = uuid(student.getSchool().getId());
        requireSchoolScope(context, schoolId);

        if (userSchoolAccessRepository.existsByUserIdAndSchoolId(id(context.userId()), id(schoolId))
                && context.roles().stream().anyMatch(role -> role.equals("SCHOOL_ADMIN")
                || role.equals("PRINCIPAL")
                || role.equals("OFFICE_STAFF")
                || role.equals("STAFF"))) {
            return;
        }
        if (context.hasRole("PARENT")
                && parentStudentLinkRepository.existsByParentUserIdAndStudentId(id(context.userId()), id(studentId))) {
            return;
        }
        if (context.hasRole("STUDENT")
                && studentUserLinkRepository.existsByUserIdAndStudentIdAndActiveTrue(id(context.userId()), id(studentId))) {
            return;
        }
        if (context.hasRole("TEACHER") && student.getClassLevel() != null
                && teacherAssignmentRepository.existsByTeacherIdAndClassLevelIdAndActiveTrue(
                        id(context.userId()),
                        student.getClassLevel().getId()
                )) {
            return;
        }

        throw new ForbiddenException("User is not allowed to view this student record.");
    }

    @Transactional(readOnly = true)
    public void requireStudentRecordVisible(RequestContext context, String studentId) {
        requireStudentRecordVisible(context, uuid(studentId));
    }

    @Transactional(readOnly = true)
    public void requireFeeDemandVisible(RequestContext context, UUID demandId) {
        FeeDemand demand = feeDemandRepository.findById(id(demandId))
                .orElseThrow(() -> new NotFoundException("Fee demand was not found."));
        requireFinanceOrStudentParty(context, uuid(demand.getTenant().getId()), uuid(demand.getSchool().getId()), uuid(demand.getStudent().getId()));
    }

    @Transactional(readOnly = true)
    public void requireFeePaymentVisible(RequestContext context, UUID paymentId) {
        FeePayment payment = feePaymentRepository.findById(id(paymentId))
                .orElseThrow(() -> new NotFoundException("Fee payment was not found."));
        requireFinanceOrStudentParty(context, uuid(payment.getTenant().getId()), uuid(payment.getSchool().getId()), uuid(payment.getStudent().getId()));
    }

    private void requireFinanceOrStudentParty(RequestContext context, UUID tenantId, UUID schoolId, UUID studentId) {
        requireTenantScope(context, tenantId);
        if (context.superAdmin()) {
            return;
        }
        requireSchoolScope(context, schoolId);
        if (context.hasRole("SCHOOL_ADMIN") || context.hasRole("FINANCE_STAFF")) {
            requireUserSchoolAccess(context, schoolId);
            requireAnyPermission(context, "VIEW_FINANCE_DASHBOARD", "VIEW_FINANCE_REPORTS", "MANAGE_FEE_STRUCTURE");
            return;
        }
        if (context.hasRole("PARENT")
                && parentStudentLinkRepository.existsByParentUserIdAndStudentId(id(context.userId()), id(studentId))) {
            return;
        }
        if (context.hasRole("STUDENT")
                && studentUserLinkRepository.existsByUserIdAndStudentIdAndActiveTrue(id(context.userId()), id(studentId))) {
            return;
        }
        throw new ForbiddenException("User is not allowed to view this fee record.");
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            throw new ForbiddenException("Authorization value is required.");
        }
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private String id(UUID uuid) {
        if (uuid == null) {
            throw new ForbiddenException("Identifier is required.");
        }
        return uuid.toString();
    }

    private UUID uuid(String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException ex) {
            throw new ForbiddenException("Stored identifier is invalid.");
        }
    }
}
