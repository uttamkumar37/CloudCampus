package com.cloudcampus.identity.accesscontrol;

import java.time.Instant;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import com.cloudcampus.academic.TeacherAssignmentRepository;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.parent.StudentGuardianRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.people.student.StudentUserLinkRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthorizationService {

    private final UserRoleAssignmentRepository userRoleAssignmentRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserPermissionOverrideRepository userPermissionOverrideRepository;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final SchoolRepository schoolRepository;
    private final StudentRepository studentRepository;
    private final StudentUserLinkRepository studentUserLinkRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final StudentGuardianRepository studentGuardianRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final UserAccountRepository userAccountRepository;

    public AuthorizationService(
            UserRoleAssignmentRepository userRoleAssignmentRepository,
            RolePermissionRepository rolePermissionRepository,
            UserPermissionOverrideRepository userPermissionOverrideRepository,
            UserSchoolAccessRepository userSchoolAccessRepository,
            SchoolRepository schoolRepository,
            StudentRepository studentRepository,
            StudentUserLinkRepository studentUserLinkRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            StudentGuardianRepository studentGuardianRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            UserAccountRepository userAccountRepository
    ) {
        this.userRoleAssignmentRepository = userRoleAssignmentRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userPermissionOverrideRepository = userPermissionOverrideRepository;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.schoolRepository = schoolRepository;
        this.studentRepository = studentRepository;
        this.studentUserLinkRepository = studentUserLinkRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.studentGuardianRepository = studentGuardianRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional(readOnly = true)
    public boolean hasRole(UserAccount user, UserRole role) {
        return rolesFor(user).contains(role);
    }

    @Transactional(readOnly = true)
    public boolean hasAnyRole(UserAccount user, Set<UserRole> roles) {
        return rolesFor(user).stream().anyMatch(roles::contains);
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(UserAccount user, String permissionCode) {
        return hasPermission(user, permissionCode, null, null);
    }

    @Transactional(readOnly = true)
    public boolean hasPermissionInTenant(UserAccount user, String permissionCode, String tenantId) {
        return hasPermission(user, permissionCode, tenantId, null);
    }

    @Transactional(readOnly = true)
    public boolean hasPermissionInSchool(UserAccount user, String permissionCode, String schoolId) {
        School school = schoolRepository.findById(schoolId).orElse(null);
        return school != null && hasPermission(user, permissionCode, school.getTenant().getId(), schoolId);
    }

    @Transactional(readOnly = true)
    public void requirePermissionInTenant(UserAccount user, String permissionCode, String tenantId) {
        if (!hasPermissionInTenant(user, permissionCode, tenantId)) {
            throw new ForbiddenException("User does not have permission " + permissionCode + " in this tenant.");
        }
    }

    @Transactional(readOnly = true)
    public void requirePermissionInSchool(UserAccount user, String permissionCode, String schoolId) {
        if (!hasPermissionInSchool(user, permissionCode, schoolId)) {
            throw new ForbiddenException("User does not have permission " + permissionCode + " in this school.");
        }
    }

    @Transactional(readOnly = true)
    public boolean canAccessTenant(UserAccount user, String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            return false;
        }
        if (rolesFor(user).contains(UserRole.SUPER_ADMIN)) {
            return true;
        }
        if (!user.getTenant().getId().equals(tenantId)) {
            return false;
        }
        return activeAssignments(user).stream()
                .anyMatch(assignment -> tenantMatches(assignment, tenantId))
                || user.getRole() == UserRole.TENANT_ADMIN
                || user.getRole() == UserRole.SCHOOL_ADMIN
                || user.getRole() == UserRole.PRINCIPAL
                || user.getRole() == UserRole.TEACHER
                || user.getRole() == UserRole.FINANCE_STAFF
                || user.getRole() == UserRole.OFFICE_STAFF
                || user.getRole() == UserRole.STAFF
                || user.getRole() == UserRole.STUDENT
                || user.getRole() == UserRole.PARENT;
    }

    @Transactional(readOnly = true)
    public boolean canAccessSchool(UserAccount user, String schoolId) {
        if (schoolId == null || schoolId.isBlank()) {
            return false;
        }
        School school = schoolRepository.findById(schoolId).orElse(null);
        if (school == null || !canAccessTenant(user, school.getTenant().getId())) {
            return false;
        }
        if (rolesFor(user).contains(UserRole.SUPER_ADMIN) || user.getRole() == UserRole.TENANT_ADMIN) {
            return true;
        }
        if (userSchoolAccessRepository.existsByUserIdAndSchoolId(user.getId(), schoolId)) {
            return true;
        }
        return activeAssignments(user).stream()
                .anyMatch(assignment -> schoolMatches(assignment, school.getTenant().getId(), schoolId));
    }

    @Transactional(readOnly = true)
    public boolean canAccessStudent(UserAccount user, String studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) {
            return false;
        }
        if (canAccessSchoolAsAdministrator(user, student.getSchool().getId())) {
            return true;
        }
        if (rolesFor(user).contains(UserRole.STUDENT)
                && student.getUser() != null
                && student.getUser().getId().equals(user.getId())) {
            return true;
        }
        if (rolesFor(user).contains(UserRole.STUDENT)
                && studentUserLinkRepository.existsByUserIdAndStudentIdAndActiveTrue(user.getId(), studentId)) {
            return true;
        }
        if (rolesFor(user).contains(UserRole.PARENT)
                && (studentGuardianRepository.existsByGuardianUserIdAndStudentIdAndActiveTrue(user.getId(), studentId)
                || parentStudentLinkRepository.existsByParentUserIdAndStudentId(user.getId(), studentId))) {
            return true;
        }
        return rolesFor(user).contains(UserRole.TEACHER)
                && student.getClassLevel() != null
                && teacherAssignmentRepository.existsByTeacherIdAndClassLevelIdAndActiveTrue(
                        user.getId(),
                        student.getClassLevel().getId()
                );
    }

    @Transactional(readOnly = true)
    public boolean canManageStudent(UserAccount user, String studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        return student != null && (
                hasPermissionInSchool(user, "MANAGE_SCHOOL", student.getSchool().getId())
                        || hasPermissionInSchool(user, "MANAGE_STUDENT_DOCUMENTS", student.getSchool().getId())
        );
    }

    @Transactional(readOnly = true)
    public boolean canAccessClassSection(UserAccount user, String classId, String sectionId) {
        if (rolesFor(user).contains(UserRole.SUPER_ADMIN) || rolesFor(user).contains(UserRole.TENANT_ADMIN)) {
            return true;
        }
        if (sectionId == null || sectionId.isBlank()) {
            return teacherAssignmentRepository.existsByTeacherIdAndClassLevelIdAndActiveTrue(user.getId(), classId)
                    || activeAssignments(user).stream().anyMatch(assignment -> "CLASS".equalsIgnoreCase(assignment.getScopeType())
                    && classId.equals(assignment.getScopeId()));
        }
        return teacherAssignmentRepository.existsByTeacherIdAndClassLevelIdAndSectionIdAndActiveTrue(user.getId(), classId, sectionId)
                || activeAssignments(user).stream().anyMatch(assignment -> "SECTION".equalsIgnoreCase(assignment.getScopeType())
                && sectionId.equals(assignment.getScopeId()));
    }

    @Transactional(readOnly = true)
    public boolean canViewFinance(UserAccount user, String tenantId, String schoolId) {
        if (schoolId != null && !schoolId.isBlank()) {
            return hasPermission(user, "VIEW_FINANCE_DASHBOARD", tenantId, schoolId);
        }
        return hasPermissionInTenant(user, "VIEW_FINANCE_DASHBOARD", tenantId);
    }

    @Transactional(readOnly = true)
    public boolean canApproveAiRecommendation(UserAccount user, String tenantId, String schoolId, String riskLevel) {
        if (!hasPermission(user, "APPROVE_AI_RECOMMENDATIONS", tenantId, schoolId)) {
            return false;
        }
        if ("CRITICAL".equalsIgnoreCase(riskLevel) || "HIGH".equalsIgnoreCase(riskLevel)) {
            return hasAnyRole(user, EnumSet.of(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.FINANCE_STAFF));
        }
        return true;
    }

    @Transactional(readOnly = true)
    public boolean canRunAutomation(UserAccount user, String tenantId, String schoolId) {
        return hasPermission(user, "RUN_AI_AUTOMATION", tenantId, schoolId)
                || hasPermission(user, "MANAGE_AI_POLICY", tenantId, schoolId);
    }

    private boolean hasPermission(UserAccount user, String permissionCode, String tenantId, String schoolId) {
        String normalizedPermission = normalizeCode(permissionCode);
        Set<UserRole> roles = rolesFor(user);
        if (roles.contains(UserRole.SUPER_ADMIN)) {
            return true;
        }
        Instant now = Instant.now();
        List<UserPermissionOverride> overrides = userPermissionOverrideRepository
                .findByUserIdAndPermissionCodeAndActiveTrue(user.getId(), normalizedPermission)
                .stream()
                .filter(override -> override.currentlyActive(now))
                .filter(override -> overrideMatches(override, tenantId, schoolId))
                .toList();
        if (overrides.stream().anyMatch(override -> !override.isAllowed())) {
            return false;
        }
        if (overrides.stream().anyMatch(UserPermissionOverride::isAllowed)) {
            return true;
        }
        Set<UserRole> scopedRoles = scopedRolesFor(user, tenantId, schoolId);
        return !scopedRoles.isEmpty() && rolePermissionRepository.existsByRoleInAndPermissionCode(scopedRoles, normalizedPermission);
    }

    private Set<UserRole> rolesFor(UserAccount user) {
        Set<UserRole> roles = new HashSet<>();
        roles.add(user.getRole());
        Instant now = Instant.now();
        userRoleAssignmentRepository.findByUserIdAndActiveTrue(user.getId())
                .stream()
                .filter(assignment -> assignment.currentlyActive(now))
                .map(UserRoleAssignment::getRole)
                .forEach(roles::add);
        return roles;
    }

    private Set<UserRole> scopedRolesFor(UserAccount user, String tenantId, String schoolId) {
        Set<UserRole> roles = new HashSet<>();
        if (scopeAllowsLegacyRole(user, tenantId, schoolId)) {
            roles.add(user.getRole());
        }
        activeAssignments(user).stream()
                .filter(assignment -> assignmentMatches(assignment, tenantId, schoolId))
                .map(UserRoleAssignment::getRole)
                .forEach(roles::add);
        return roles;
    }

    private List<UserRoleAssignment> activeAssignments(UserAccount user) {
        Instant now = Instant.now();
        return userRoleAssignmentRepository.findByUserIdAndActiveTrue(user.getId())
                .stream()
                .filter(assignment -> assignment.currentlyActive(now))
                .toList();
    }

    private boolean assignmentMatches(UserRoleAssignment assignment, String tenantId, String schoolId) {
        return tenantMatches(assignment, tenantId) && schoolMatches(assignment, tenantId, schoolId);
    }

    private boolean tenantMatches(UserRoleAssignment assignment, String tenantId) {
        return tenantId == null
                || assignment.getTenant() == null
                || assignment.getTenant().getId().equals(tenantId);
    }

    private boolean schoolMatches(UserRoleAssignment assignment, String tenantId, String schoolId) {
        if (schoolId == null || schoolId.isBlank()) {
            return true;
        }
        if (assignment.getSchool() != null) {
            return assignment.getSchool().getId().equals(schoolId);
        }
        return "TENANT".equalsIgnoreCase(assignment.getScopeType()) && tenantMatches(assignment, tenantId);
    }

    private boolean overrideMatches(UserPermissionOverride override, String tenantId, String schoolId) {
        if (tenantId != null && override.getTenant() != null && !override.getTenant().getId().equals(tenantId)) {
            return false;
        }
        return schoolId == null || override.getSchool() == null || override.getSchool().getId().equals(schoolId);
    }

    private boolean scopeAllowsLegacyRole(UserAccount user, String tenantId, String schoolId) {
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            return true;
        }
        if (tenantId != null && !user.getTenant().getId().equals(tenantId)) {
            return false;
        }
        return schoolId == null || userSchoolAccessRepository.existsByUserIdAndSchoolId(user.getId(), schoolId);
    }

    private boolean canAccessSchoolAsAdministrator(UserAccount user, String schoolId) {
        if (!canAccessSchool(user, schoolId)) {
            return false;
        }
        Set<UserRole> roles = scopedRolesFor(user, null, schoolId);
        return roles.contains(UserRole.SUPER_ADMIN)
                || roles.contains(UserRole.TENANT_ADMIN)
                || roles.contains(UserRole.SCHOOL_ADMIN)
                || roles.contains(UserRole.PRINCIPAL)
                || roles.contains(UserRole.OFFICE_STAFF)
                || roles.contains(UserRole.STAFF);
    }

    private String normalizeCode(String permissionCode) {
        if (permissionCode == null || permissionCode.isBlank()) {
            throw new ForbiddenException("Permission code is required.");
        }
        return permissionCode.trim().toUpperCase(Locale.ROOT);
    }

    @Transactional(readOnly = true)
    public UserAccount requireUser(String userId) {
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new ForbiddenException("User was not found."));
    }
}
