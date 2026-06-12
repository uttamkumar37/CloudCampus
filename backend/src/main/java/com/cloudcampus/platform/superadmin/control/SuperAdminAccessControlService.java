package com.cloudcampus.platform.superadmin.control;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.cloudcampus.academic.ClassSubjectAssignment;
import com.cloudcampus.academic.ClassSubjectAssignmentRepository;
import com.cloudcampus.academic.Section;
import com.cloudcampus.academic.SectionRepository;
import com.cloudcampus.academic.TeacherAssignment;
import com.cloudcampus.academic.TeacherAssignmentRepository;
import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.Permission;
import com.cloudcampus.identity.accesscontrol.PermissionRepository;
import com.cloudcampus.identity.accesscontrol.RolePermission;
import com.cloudcampus.identity.accesscontrol.RolePermissionRepository;
import com.cloudcampus.identity.accesscontrol.UserPermissionOverride;
import com.cloudcampus.identity.accesscontrol.UserPermissionOverrideRepository;
import com.cloudcampus.identity.accesscontrol.UserRoleAssignment;
import com.cloudcampus.identity.accesscontrol.UserRoleAssignmentRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.people.parent.StudentGuardian;
import com.cloudcampus.people.parent.StudentGuardianRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SuperAdminAccessControlService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<UserRole> SCHOOL_SCOPED_ROLES = EnumSet.of(
            UserRole.SCHOOL_ADMIN,
            UserRole.PRINCIPAL,
            UserRole.TEACHER,
            UserRole.STUDENT,
            UserRole.PARENT,
            UserRole.FINANCE_STAFF,
            UserRole.OFFICE_STAFF
    );
    private static final Set<UserRole> MFA_REQUIRED_ROLES = EnumSet.of(
            UserRole.SUPER_ADMIN,
            UserRole.TENANT_ADMIN,
            UserRole.SCHOOL_ADMIN,
            UserRole.PRINCIPAL,
            UserRole.FINANCE_STAFF
    );

    private final UserAccountRepository userAccountRepository;
    private final TenantRepository tenantRepository;
    private final SchoolRepository schoolRepository;
    private final UserRoleAssignmentRepository userRoleAssignmentRepository;
    private final UserPermissionOverrideRepository userPermissionOverrideRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final StudentRepository studentRepository;
    private final StudentGuardianRepository studentGuardianRepository;
    private final ClassSubjectAssignmentRepository classSubjectAssignmentRepository;
    private final SectionRepository sectionRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final AuditLogService auditLogService;

    public SuperAdminAccessControlService(
            UserAccountRepository userAccountRepository,
            TenantRepository tenantRepository,
            SchoolRepository schoolRepository,
            UserRoleAssignmentRepository userRoleAssignmentRepository,
            UserPermissionOverrideRepository userPermissionOverrideRepository,
            PermissionRepository permissionRepository,
            RolePermissionRepository rolePermissionRepository,
            UserSchoolAccessRepository userSchoolAccessRepository,
            StudentRepository studentRepository,
            StudentGuardianRepository studentGuardianRepository,
            ClassSubjectAssignmentRepository classSubjectAssignmentRepository,
            SectionRepository sectionRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            AuditLogService auditLogService
    ) {
        this.userAccountRepository = userAccountRepository;
        this.tenantRepository = tenantRepository;
        this.schoolRepository = schoolRepository;
        this.userRoleAssignmentRepository = userRoleAssignmentRepository;
        this.userPermissionOverrideRepository = userPermissionOverrideRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.studentRepository = studentRepository;
        this.studentGuardianRepository = studentGuardianRepository;
        this.classSubjectAssignmentRepository = classSubjectAssignmentRepository;
        this.sectionRepository = sectionRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminAccessControlUserResponse> users(AuthenticatedUser actor, AccessControlUserQuery query) {
        requireSuperAdmin(actor);
        Page<UserAccount> users = userAccountRepository.findAll(userSpec(query), pageable(query.page(), query.size()));
        return page(users, users.getContent().stream().map(this::userSummary).toList());
    }

    @Transactional(readOnly = true)
    public SuperAdminAccessControlUserResponse user(AuthenticatedUser actor, String userId) {
        requireSuperAdmin(actor);
        return userDetail(requireUser(userId));
    }

    @Transactional(readOnly = true)
    public List<SuperAdminUserRoleAssignmentResponse> roles(AuthenticatedUser actor, String userId) {
        requireSuperAdmin(actor);
        requireUser(userId);
        return userRoleAssignmentRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::roleResponse)
                .toList();
    }

    @Transactional
    public SuperAdminUserRoleAssignmentResponse assignRole(
            AuthenticatedUser authenticatedUser,
            String userId,
            RoleAssignmentRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        UserAccount target = requireUser(userId);
        RoleScope scope = validateRoleScope(target, request);
        if (request.primaryRole() == Boolean.TRUE) {
            if (scope.role() == UserRole.SYSTEM || scope.role() == UserRole.AI_AGENT) {
                throw new BadRequestException("SYSTEM and AI_AGENT cannot be made a human user's primary login role.");
            }
            target.changeRole(scope.role());
        }
        UserRoleAssignment assignment = userRoleAssignmentRepository.save(new UserRoleAssignment(
                target,
                scope.role(),
                scope.tenant(),
                scope.school(),
                scope.scopeType(),
                scope.scopeId(),
                request.startsAt(),
                request.expiresAt(),
                blankToNull(request.reason()),
                actor
        ));
        syncSchoolAccess(scope, target);
        audit(
                actor,
                scope.school() == null ? null : scope.school().getId(),
                AuditAction.ROLE_ASSIGNED,
                "UserRoleAssignment",
                assignment.getId(),
                "User role assigned by Super Admin.",
                Map.of(
                        "targetUserId", target.getId(),
                        "role", scope.role().name(),
                        "tenantId", scope.tenant() == null ? "" : scope.tenant().getId(),
                        "schoolId", scope.school() == null ? "" : scope.school().getId(),
                        "scopeType", scope.scopeType()
                )
        );
        return roleResponse(assignment);
    }

    @Transactional
    public SuperAdminUserRoleAssignmentResponse updateRole(
            AuthenticatedUser authenticatedUser,
            String userId,
            String assignmentId,
            RoleAssignmentUpdateRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        requireUser(userId);
        UserRoleAssignment assignment = requireRoleAssignment(userId, assignmentId);
        boolean wasActive = assignment.isActive();
        assignment.update(request.active(), request.startsAt(), request.expiresAt(), request.reason(), actor);
        AuditAction action = wasActive && request.active() == Boolean.FALSE ? AuditAction.ROLE_DEACTIVATED : AuditAction.ROLE_UPDATED;
        audit(
                actor,
                assignment.getSchool() == null ? null : assignment.getSchool().getId(),
                action,
                "UserRoleAssignment",
                assignment.getId(),
                action == AuditAction.ROLE_DEACTIVATED ? "User role assignment deactivated." : "User role assignment updated.",
                Map.of("targetUserId", userId, "role", assignment.getRole().name(), "active", assignment.isActive())
        );
        return roleResponse(assignment);
    }

    @Transactional
    public void deactivateRole(AuthenticatedUser authenticatedUser, String userId, String assignmentId) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        requireUser(userId);
        UserRoleAssignment assignment = requireRoleAssignment(userId, assignmentId);
        assignment.deactivate("Deactivated from Super Admin Access Control.", actor);
        audit(
                actor,
                assignment.getSchool() == null ? null : assignment.getSchool().getId(),
                AuditAction.ROLE_DEACTIVATED,
                "UserRoleAssignment",
                assignment.getId(),
                "User role assignment deactivated.",
                Map.of("targetUserId", userId, "role", assignment.getRole().name())
        );
    }

    @Transactional(readOnly = true)
    public List<SuperAdminPermissionResponse> permissions(AuthenticatedUser actor) {
        requireSuperAdmin(actor);
        return permissionRepository.findByActiveTrueOrderByCategoryAscCodeAsc().stream()
                .map(this::permissionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SuperAdminPermissionResponse> rolePermissions(AuthenticatedUser actor, UserRole role) {
        requireSuperAdmin(actor);
        return rolePermissionRepository.findByRoleOrderByPermissionCategoryAscPermissionCodeAsc(role).stream()
                .map(RolePermission::getPermission)
                .map(this::permissionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SuperAdminPermissionOverrideResponse> overrides(AuthenticatedUser actor, String userId) {
        requireSuperAdmin(actor);
        requireUser(userId);
        return userPermissionOverrideRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::overrideResponse)
                .toList();
    }

    @Transactional
    public SuperAdminPermissionOverrideResponse createOverride(
            AuthenticatedUser authenticatedUser,
            String userId,
            PermissionOverrideRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        UserAccount target = requireUser(userId);
        if (request.allowed() == null) {
            throw new BadRequestException("Override allowed flag is required.");
        }
        String reason = normalizeRequired(request.reason(), "Permission override reason is required.");
        Permission permission = permissionRepository.findByCode(normalizeCode(request.permissionCode()))
                .orElseThrow(() -> new NotFoundException("Permission was not found."));
        Scope scope = validateScope(target, request.tenantId(), request.schoolId(), request.scopeType(), request.scopeId());
        UserPermissionOverride override = userPermissionOverrideRepository.save(new UserPermissionOverride(
                target,
                permission,
                request.allowed(),
                scope.tenant(),
                scope.school(),
                scope.scopeType(),
                scope.scopeId(),
                reason,
                request.startsAt(),
                request.expiresAt(),
                actor
        ));
        audit(
                actor,
                scope.school() == null ? null : scope.school().getId(),
                request.allowed() ? AuditAction.PERMISSION_OVERRIDE_GRANTED : AuditAction.PERMISSION_OVERRIDE_DENIED,
                "UserPermissionOverride",
                override.getId(),
                request.allowed() ? "Permission override granted." : "Permission override denied.",
                Map.of(
                        "targetUserId", target.getId(),
                        "permissionCode", permission.getCode(),
                        "allowed", request.allowed(),
                        "reason", reason
                )
        );
        return overrideResponse(override);
    }

    @Transactional
    public SuperAdminPermissionOverrideResponse updateOverride(
            AuthenticatedUser authenticatedUser,
            String userId,
            String overrideId,
            PermissionOverrideUpdateRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        requireUser(userId);
        UserPermissionOverride override = requireOverride(userId, overrideId);
        boolean wasActive = override.isActive();
        override.update(request.active(), request.expiresAt(), request.reason(), actor);
        AuditAction action = wasActive && request.active() == Boolean.FALSE
                ? AuditAction.PERMISSION_OVERRIDE_REVOKED
                : (override.isAllowed() ? AuditAction.PERMISSION_OVERRIDE_GRANTED : AuditAction.PERMISSION_OVERRIDE_DENIED);
        audit(
                actor,
                override.getSchool() == null ? null : override.getSchool().getId(),
                action,
                "UserPermissionOverride",
                override.getId(),
                action == AuditAction.PERMISSION_OVERRIDE_REVOKED ? "Permission override revoked." : "Permission override updated.",
                Map.of("targetUserId", userId, "permissionCode", override.getPermission().getCode(), "active", override.isActive())
        );
        return overrideResponse(override);
    }

    @Transactional
    public void deactivateOverride(AuthenticatedUser authenticatedUser, String userId, String overrideId) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        requireUser(userId);
        UserPermissionOverride override = requireOverride(userId, overrideId);
        override.deactivate("Revoked from Super Admin Access Control.", actor);
        audit(
                actor,
                override.getSchool() == null ? null : override.getSchool().getId(),
                AuditAction.PERMISSION_OVERRIDE_REVOKED,
                "UserPermissionOverride",
                override.getId(),
                "Permission override revoked.",
                Map.of("targetUserId", userId, "permissionCode", override.getPermission().getCode())
        );
    }

    @Transactional
    public SuperAdminStudentGuardianResponse linkGuardian(
            AuthenticatedUser authenticatedUser,
            String studentId,
            StudentGuardianRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        Student student = requireStudent(studentId);
        UserAccount guardian = requireUser(normalizeRequired(request.guardianUserId(), "Guardian user is required."));
        if (!guardian.getTenant().getId().equals(student.getTenant().getId())) {
            throw new BadRequestException("Guardian must belong to the same tenant as the student.");
        }
        StudentGuardian link = studentGuardianRepository.save(new StudentGuardian(
                student,
                guardian,
                normalizeRequired(request.relation(), "Guardian relation is required."),
                blankToNull(request.contactEmail()),
                blankToNull(request.contactMobile()),
                request.primaryContact() == Boolean.TRUE,
                request.canPickup() == Boolean.TRUE,
                request.emergencyContact() == Boolean.TRUE,
                actor
        ));
        audit(
                actor,
                student.getSchool().getId(),
                AuditAction.STUDENT_GUARDIAN_LINKED,
                "StudentGuardian",
                link.getId(),
                "Student guardian linked.",
                Map.of("studentId", student.getId(), "guardianUserId", guardian.getId(), "relation", link.getRelation())
        );
        return guardianResponse(link);
    }

    @Transactional
    public SuperAdminStudentGuardianResponse updateGuardian(
            AuthenticatedUser authenticatedUser,
            String studentId,
            String guardianLinkId,
            StudentGuardianUpdateRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        StudentGuardian link = requireGuardian(studentId, guardianLinkId);
        boolean wasActive = link.isActive();
        link.update(request.relation(), request.primaryContact(), request.canPickup(), request.emergencyContact(), request.active(), actor);
        audit(
                actor,
                link.getSchool().getId(),
                wasActive && request.active() == Boolean.FALSE ? AuditAction.STUDENT_GUARDIAN_DEACTIVATED : AuditAction.STUDENT_GUARDIAN_UPDATED,
                "StudentGuardian",
                link.getId(),
                "Student guardian link updated.",
                Map.of("studentId", studentId, "guardianUserId", link.getGuardianUser().getId(), "active", link.isActive())
        );
        return guardianResponse(link);
    }

    @Transactional
    public void deactivateGuardian(AuthenticatedUser authenticatedUser, String studentId, String guardianLinkId) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        StudentGuardian link = requireGuardian(studentId, guardianLinkId);
        link.deactivate(actor);
        audit(
                actor,
                link.getSchool().getId(),
                AuditAction.STUDENT_GUARDIAN_DEACTIVATED,
                "StudentGuardian",
                link.getId(),
                "Student guardian link deactivated.",
                Map.of("studentId", studentId, "guardianUserId", link.getGuardianUser().getId())
        );
    }

    @Transactional
    public SuperAdminTeacherAssignmentResponse createTeacherAssignment(
            AuthenticatedUser authenticatedUser,
            String teacherUserId,
            TeacherAssignmentGovernanceRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        UserAccount teacher = requireUser(teacherUserId);
        ClassSubjectAssignment classSubject = classSubjectAssignmentRepository.findById(
                normalizeRequired(request.classSubjectAssignmentId(), "Class-subject assignment is required.")
        ).orElseThrow(() -> new NotFoundException("Class-subject assignment was not found."));
        if (!teacher.getTenant().getId().equals(classSubject.getTenant().getId())) {
            throw new BadRequestException("Teacher must belong to the same tenant as the class assignment.");
        }
        Section section = resolveSection(request.sectionId(), classSubject);
        TeacherAssignment assignment = teacherAssignmentRepository.save(new TeacherAssignment(teacher, classSubject));
        assignment.updateScope(section, blankDefault(request.roleType(), "SUBJECT_TEACHER"), request.active() != Boolean.FALSE, actor);
        audit(
                actor,
                classSubject.getSchool().getId(),
                AuditAction.TEACHER_ASSIGNMENT_CREATED,
                "TeacherAssignment",
                assignment.getId(),
                "Teacher assignment created.",
                Map.of(
                        "teacherUserId", teacher.getId(),
                        "classLevelId", classSubject.getClassLevel().getId(),
                        "subjectId", classSubject.getSubject().getId(),
                        "sectionId", section == null ? "" : section.getId()
                )
        );
        return teacherAssignmentResponse(assignment);
    }

    @Transactional
    public SuperAdminTeacherAssignmentResponse updateTeacherAssignment(
            AuthenticatedUser authenticatedUser,
            String teacherUserId,
            String assignmentId,
            TeacherAssignmentGovernanceRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        requireUser(teacherUserId);
        TeacherAssignment assignment = requireTeacherAssignment(teacherUserId, assignmentId);
        Section section = request.sectionId() == null ? assignment.getSection() : resolveSection(request.sectionId(), assignment.getClassSubjectAssignment());
        boolean nextActive = request.active() == null ? assignment.isActive() : request.active();
        assignment.updateScope(section, request.roleType(), nextActive, actor);
        audit(
                actor,
                assignment.getSchool().getId(),
                nextActive ? AuditAction.TEACHER_ASSIGNMENT_UPDATED : AuditAction.TEACHER_ASSIGNMENT_DEACTIVATED,
                "TeacherAssignment",
                assignment.getId(),
                "Teacher assignment updated.",
                Map.of("teacherUserId", teacherUserId, "active", assignment.isActive())
        );
        return teacherAssignmentResponse(assignment);
    }

    @Transactional
    public void deactivateTeacherAssignment(AuthenticatedUser authenticatedUser, String teacherUserId, String assignmentId) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        TeacherAssignment assignment = requireTeacherAssignment(teacherUserId, assignmentId);
        assignment.deactivate(actor);
        audit(
                actor,
                assignment.getSchool().getId(),
                AuditAction.TEACHER_ASSIGNMENT_DEACTIVATED,
                "TeacherAssignment",
                assignment.getId(),
                "Teacher assignment deactivated.",
                Map.of("teacherUserId", teacherUserId)
        );
    }

    private Specification<UserAccount> userSpec(AccessControlUserQuery query) {
        String needle = query.search() == null || query.search().isBlank()
                ? null
                : "%" + query.search().trim().toLowerCase(Locale.ROOT) + "%";
        String tenantId = blankToNull(query.tenantId());
        String schoolId = blankToNull(query.schoolId());
        UserRole role = query.role();
        UserStatus status = query.status();
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (needle != null) {
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), needle),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("displayName")), needle)
                ));
            }
            if (tenantId != null) {
                predicates.add(criteriaBuilder.equal(root.get("tenant").get("id"), tenantId));
            }
            if (role != null) {
                predicates.add(criteriaBuilder.equal(root.get("role"), role));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (schoolId != null) {
                var subquery = criteriaQuery.subquery(String.class);
                var access = subquery.from(UserSchoolAccess.class);
                subquery.select(access.get("user").get("id"))
                        .where(criteriaBuilder.equal(access.get("school").get("id"), schoolId));
                predicates.add(root.get("id").in(subquery));
            }
            return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private RoleScope validateRoleScope(UserAccount target, RoleAssignmentRequest request) {
        if (request.role() == null) {
            throw new BadRequestException("Role is required.");
        }
        if (request.role() == UserRole.STAFF) {
            throw new BadRequestException("Use OFFICE_STAFF for new office staff assignments; STAFF is a legacy alias.");
        }
        if (request.role() == UserRole.SUPER_ADMIN) {
            return new RoleScope(request.role(), null, null, "PLATFORM", null);
        }

        String tenantId = blankDefault(request.tenantId(), target.getTenant().getId());
        Tenant tenant = requireTenant(tenantId);
        School school = null;
        if (!target.getTenant().getId().equals(tenant.getId())) {
            throw new BadRequestException("Role assignment tenant must match the user's tenant.");
        }
        if (SCHOOL_SCOPED_ROLES.contains(request.role())) {
            String schoolId = normalizeRequired(request.schoolId(), "School-scoped roles require schoolId.");
            school = requireSchool(schoolId);
            if (!school.getTenant().getId().equals(tenant.getId())) {
                throw new BadRequestException("School must belong to the selected tenant.");
            }
            return new RoleScope(request.role(), tenant, school, "SCHOOL", school.getId());
        }
        if (request.role() == UserRole.TENANT_ADMIN) {
            return new RoleScope(request.role(), tenant, null, "TENANT", tenant.getId());
        }
        String scopeType = blankDefault(request.scopeType(), "TENANT").toUpperCase(Locale.ROOT);
        return new RoleScope(request.role(), tenant, null, scopeType, blankDefault(request.scopeId(), tenant.getId()));
    }

    private Scope validateScope(UserAccount target, String rawTenantId, String rawSchoolId, String rawScopeType, String rawScopeId) {
        String tenantId = blankDefault(rawTenantId, target.getTenant().getId());
        Tenant tenant = requireTenant(tenantId);
        if (!target.getTenant().getId().equals(tenant.getId())) {
            throw new BadRequestException("Override tenant must match the user's tenant.");
        }
        School school = null;
        if (rawSchoolId != null && !rawSchoolId.isBlank()) {
            school = requireSchool(rawSchoolId);
            if (!school.getTenant().getId().equals(tenant.getId())) {
                throw new BadRequestException("Override school must belong to the selected tenant.");
            }
        }
        String scopeType = blankDefault(rawScopeType, school == null ? "TENANT" : "SCHOOL").toUpperCase(Locale.ROOT);
        String scopeId = blankDefault(rawScopeId, school == null ? tenant.getId() : school.getId());
        return new Scope(tenant, school, scopeType, scopeId);
    }

    private void syncSchoolAccess(RoleScope scope, UserAccount target) {
        if (scope.school() == null || scope.role() == UserRole.PARENT || scope.role() == UserRole.STUDENT) {
            return;
        }
        if (!userSchoolAccessRepository.existsByUserIdAndSchoolId(target.getId(), scope.school().getId())) {
            userSchoolAccessRepository.save(new UserSchoolAccess(scope.tenant(), scope.school(), target, scope.role(), false));
        }
    }

    private SuperAdminAccessControlUserResponse userSummary(UserAccount user) {
        return new SuperAdminAccessControlUserResponse(
                user.getId(),
                user.getTenant().getId(),
                user.getTenant().getName(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name(),
                user.getStatus().name(),
                MFA_REQUIRED_ROLES.contains(user.getRole()),
                user.getActivatedAt(),
                List.of(),
                List.of(),
                List.of()
        );
    }

    private SuperAdminAccessControlUserResponse userDetail(UserAccount user) {
        return new SuperAdminAccessControlUserResponse(
                user.getId(),
                user.getTenant().getId(),
                user.getTenant().getName(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name(),
                user.getStatus().name(),
                MFA_REQUIRED_ROLES.contains(user.getRole()),
                user.getActivatedAt(),
                userRoleAssignmentRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::roleResponse).toList(),
                userPermissionOverrideRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::overrideResponse).toList(),
                userSchoolAccessRepository.findByUserId(user.getId()).stream()
                        .map(access -> new SuperAdminSchoolAccessResponse(
                                access.getSchool().getId(),
                                access.getSchool().getName(),
                                access.getRole().name(),
                                access.isPrimaryAccess()
                        ))
                        .toList()
        );
    }

    private SuperAdminUserRoleAssignmentResponse roleResponse(UserRoleAssignment assignment) {
        return new SuperAdminUserRoleAssignmentResponse(
                assignment.getId(),
                assignment.getRole().name(),
                assignment.getTenant() == null ? null : assignment.getTenant().getId(),
                assignment.getTenant() == null ? null : assignment.getTenant().getName(),
                assignment.getSchool() == null ? null : assignment.getSchool().getId(),
                assignment.getSchool() == null ? null : assignment.getSchool().getName(),
                assignment.getScopeType(),
                assignment.getScopeId(),
                assignment.isActive(),
                assignment.getStartsAt(),
                assignment.getExpiresAt(),
                assignment.getReason(),
                assignment.getCreatedAt()
        );
    }

    private SuperAdminPermissionResponse permissionResponse(Permission permission) {
        return new SuperAdminPermissionResponse(
                permission.getCode(),
                permission.getName(),
                permission.getDescription(),
                permission.getCategory(),
                permission.getRiskLevel().name(),
                permission.getScopeType(),
                permission.isActive()
        );
    }

    private SuperAdminPermissionOverrideResponse overrideResponse(UserPermissionOverride override) {
        return new SuperAdminPermissionOverrideResponse(
                override.getId(),
                override.getUser().getId(),
                override.getPermission().getCode(),
                override.getPermission().getName(),
                override.isAllowed(),
                override.getTenant() == null ? null : override.getTenant().getId(),
                override.getTenant() == null ? null : override.getTenant().getName(),
                override.getSchool() == null ? null : override.getSchool().getId(),
                override.getSchool() == null ? null : override.getSchool().getName(),
                override.getScopeType(),
                override.getScopeId(),
                override.isActive(),
                override.getReason(),
                override.getExpiresAt(),
                override.getCreatedAt()
        );
    }

    private SuperAdminStudentGuardianResponse guardianResponse(StudentGuardian link) {
        return new SuperAdminStudentGuardianResponse(
                link.getId(),
                link.getStudent().getId(),
                link.getGuardianUser().getId(),
                link.getGuardianUser().getDisplayName(),
                link.getGuardianUser().getEmail(),
                link.getRelation(),
                link.isPrimaryContact(),
                link.isCanPickup(),
                link.isEmergencyContact(),
                link.isActive(),
                link.getCreatedAt()
        );
    }

    private SuperAdminTeacherAssignmentResponse teacherAssignmentResponse(TeacherAssignment assignment) {
        return new SuperAdminTeacherAssignmentResponse(
                assignment.getId(),
                assignment.getTeacher().getId(),
                assignment.getTeacher().getDisplayName(),
                assignment.getTenant().getId(),
                assignment.getSchool().getId(),
                assignment.getSchool().getName(),
                assignment.getClassLevel() == null ? null : assignment.getClassLevel().getId(),
                assignment.getClassLevel() == null ? null : assignment.getClassLevel().getName(),
                assignment.getSection() == null ? null : assignment.getSection().getId(),
                assignment.getSection() == null ? null : assignment.getSection().getName(),
                assignment.getSubject() == null ? null : assignment.getSubject().getId(),
                assignment.getSubject() == null ? null : assignment.getSubject().getName(),
                assignment.getRoleType(),
                assignment.isActive(),
                assignment.getCreatedAt()
        );
    }

    private UserRoleAssignment requireRoleAssignment(String userId, String assignmentId) {
        UserRoleAssignment assignment = userRoleAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NotFoundException("Role assignment was not found."));
        if (!assignment.getUser().getId().equals(userId)) {
            throw new NotFoundException("Role assignment was not found for this user.");
        }
        return assignment;
    }

    private UserPermissionOverride requireOverride(String userId, String overrideId) {
        UserPermissionOverride override = userPermissionOverrideRepository.findById(overrideId)
                .orElseThrow(() -> new NotFoundException("Permission override was not found."));
        if (!override.getUser().getId().equals(userId)) {
            throw new NotFoundException("Permission override was not found for this user.");
        }
        return override;
    }

    private StudentGuardian requireGuardian(String studentId, String guardianLinkId) {
        StudentGuardian link = studentGuardianRepository.findById(guardianLinkId)
                .orElseThrow(() -> new NotFoundException("Guardian link was not found."));
        if (!link.getStudent().getId().equals(studentId)) {
            throw new NotFoundException("Guardian link was not found for this student.");
        }
        return link;
    }

    private TeacherAssignment requireTeacherAssignment(String teacherUserId, String assignmentId) {
        TeacherAssignment assignment = teacherAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NotFoundException("Teacher assignment was not found."));
        if (!assignment.getTeacher().getId().equals(teacherUserId)) {
            throw new NotFoundException("Teacher assignment was not found for this teacher.");
        }
        return assignment;
    }

    private Section resolveSection(String sectionId, ClassSubjectAssignment classSubject) {
        if (sectionId == null || sectionId.isBlank()) {
            return null;
        }
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("Section was not found."));
        if (!section.getClassLevel().getId().equals(classSubject.getClassLevel().getId())) {
            throw new BadRequestException("Section must belong to the assignment class.");
        }
        return section;
    }

    private UserAccount requireSuperAdmin(AuthenticatedUser authenticatedUser) {
        UserAccount actor = authenticatedUser.user();
        if (actor.getRole() != UserRole.SUPER_ADMIN) {
            throw new ForbiddenException("Only SUPER_ADMIN can manage platform access control.");
        }
        return actor;
    }

    private UserAccount requireUser(String userId) {
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User was not found."));
    }

    private Tenant requireTenant(String tenantId) {
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NotFoundException("Tenant was not found."));
    }

    private School requireSchool(String schoolId) {
        return schoolRepository.findById(schoolId)
                .orElseThrow(() -> new NotFoundException("School was not found."));
    }

    private Student requireStudent(String studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student was not found."));
    }

    private Pageable pageable(int page, int size) {
        return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE), Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private <S, T> SuperAdminPageResponse<T> page(Page<S> source, List<T> items) {
        return new SuperAdminPageResponse<>(
                items,
                source.getNumber(),
                source.getSize(),
                source.getTotalElements(),
                source.getTotalPages()
        );
    }

    private void audit(UserAccount actor, String schoolId, AuditAction action, String entityType, String entityId, String summary, Map<String, ?> metadata) {
        auditLogService.record(actor.getTenant().getId(), schoolId, actor.getRole().name(), actor.getId(), action, entityType, entityId, summary, metadata);
    }

    private String normalizeCode(String code) {
        return normalizeRequired(code, "Permission code is required.").toUpperCase(Locale.ROOT);
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(message);
        }
        return value.trim();
    }

    private String blankDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private record RoleScope(UserRole role, Tenant tenant, School school, String scopeType, String scopeId) {
    }

    private record Scope(Tenant tenant, School school, String scopeType, String scopeId) {
    }
}
