package com.cloudcampus.identity.accesscontrol;

import java.util.Set;

import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.school.School;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SchoolAccessService {

    private final UserSchoolAccessRepository userSchoolAccessRepository;

    public SchoolAccessService(UserSchoolAccessRepository userSchoolAccessRepository) {
        this.userSchoolAccessRepository = userSchoolAccessRepository;
    }

    @Transactional(readOnly = true)
    public SchoolAccessGrant requireSchoolAdminAccess(String userId, String schoolId) {
        return requireSchoolAccessForRoles(
                userId,
                schoolId,
                Set.of(UserRole.SCHOOL_ADMIN),
                "User is not allowed to administer this school."
        );
    }

    @Transactional(readOnly = true)
    public SchoolAccessGrant requireSchoolLeadershipAccess(String userId, String schoolId) {
        return requireSchoolAccessForRoles(
                userId,
                schoolId,
                Set.of(UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL),
                "User is not allowed to review this school."
        );
    }

    @Transactional(readOnly = true)
    public SchoolAccessGrant requireSchoolStudentRecordAccess(String userId, String schoolId) {
        return requireSchoolAccessForRoles(
                userId,
                schoolId,
                Set.of(UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.OFFICE_STAFF, UserRole.STAFF),
                "User is not allowed to review student records for this school."
        );
    }

    @Transactional(readOnly = true)
    public SchoolAccessGrant requireSchoolDocumentAccess(String userId, String schoolId) {
        return requireSchoolAccessForRoles(
                userId,
                schoolId,
                Set.of(UserRole.SCHOOL_ADMIN, UserRole.OFFICE_STAFF, UserRole.STAFF),
                "User is not allowed to manage school documents."
        );
    }

    @Transactional(readOnly = true)
    public SchoolAccessGrant requireSchoolTeacherAccess(String userId, String schoolId) {
        return requireSchoolAccessForRoles(
                userId,
                schoolId,
                Set.of(UserRole.TEACHER),
                "Teacher access is required for this school."
        );
    }

    @Transactional
    public SchoolAccessGrant grantTeacherAccessIfMissing(School school, UserAccount teacher) {
        if (teacher.getRole() != UserRole.TEACHER) {
            throw new ForbiddenException("User is not a teacher.");
        }
        if (!teacher.getTenant().getId().equals(school.getTenant().getId())) {
            throw new ForbiddenException("Teacher and school must belong to the same tenant.");
        }

        return userSchoolAccessRepository.findByUserIdAndSchoolId(teacher.getId(), school.getId())
                .map(access -> {
                    if (access.getRole() != UserRole.TEACHER) {
                        throw new ForbiddenException("Existing school access is not a teacher grant.");
                    }
                    return toGrant(access);
                })
                .orElseGet(() -> {
                    boolean primaryAccess = userSchoolAccessRepository.findByUserId(teacher.getId()).isEmpty();
                    UserSchoolAccess access = userSchoolAccessRepository.save(new UserSchoolAccess(
                            school.getTenant(),
                            school,
                            teacher,
                            UserRole.TEACHER,
                            primaryAccess
                    ));
                    return toGrant(access);
                });
    }

    @Transactional(readOnly = true)
    public SchoolAccessGrant requireSchoolFinanceAccess(String userId, String schoolId) {
        return requireSchoolAccessForRoles(
                userId,
                schoolId,
                Set.of(UserRole.SCHOOL_ADMIN, UserRole.FINANCE_STAFF),
                "User is not allowed to manage school finance."
        );
    }

    private SchoolAccessGrant requireSchoolAccessForRoles(
            String userId,
            String schoolId,
            Set<UserRole> allowedRoles,
            String forbiddenMessage
    ) {
        UserSchoolAccess access = userSchoolAccessRepository.findByUserIdAndSchoolId(userId, schoolId)
                .orElseThrow(() -> new ForbiddenException("User is not allowed to access this school."));

        if (!allowedRoles.contains(access.getRole())) {
            throw new ForbiddenException(forbiddenMessage);
        }

        return toGrant(access);
    }

    private SchoolAccessGrant toGrant(UserSchoolAccess access) {
        String accessTenantId = access.getTenant().getId();
        String userTenantId = access.getUser().getTenant().getId();
        String schoolTenantId = access.getSchool().getTenant().getId();

        if (!accessTenantId.equals(userTenantId) || !accessTenantId.equals(schoolTenantId)) {
            throw new ForbiddenException("School access grant tenant scope is invalid.");
        }

        return new SchoolAccessGrant(
                accessTenantId,
                access.getSchool().getId(),
                access.getUser().getId(),
                access.getRole(),
                access.isPrimaryAccess()
        );
    }
}
