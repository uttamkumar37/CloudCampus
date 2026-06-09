package com.cloudcampus.identity.accesscontrol;

import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.identity.auth.UserRole;

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
        UserSchoolAccess access = userSchoolAccessRepository.findByUserIdAndSchoolId(userId, schoolId)
                .orElseThrow(() -> new ForbiddenException("User is not allowed to access this school."));

        if (access.getRole() != UserRole.SCHOOL_ADMIN) {
            throw new ForbiddenException("User is not allowed to administer this school.");
        }

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

    @Transactional(readOnly = true)
    public SchoolAccessGrant requireSchoolLeadershipAccess(String userId, String schoolId) {
        UserSchoolAccess access = userSchoolAccessRepository.findByUserIdAndSchoolId(userId, schoolId)
                .orElseThrow(() -> new ForbiddenException("User is not allowed to access this school."));

        if (access.getRole() != UserRole.SCHOOL_ADMIN && access.getRole() != UserRole.PRINCIPAL) {
            throw new ForbiddenException("User is not allowed to review this school.");
        }

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

    @Transactional(readOnly = true)
    public SchoolAccessGrant requireSchoolFinanceAccess(String userId, String schoolId) {
        UserSchoolAccess access = userSchoolAccessRepository.findByUserIdAndSchoolId(userId, schoolId)
                .orElseThrow(() -> new ForbiddenException("User is not allowed to access this school."));

        if (access.getRole() != UserRole.SCHOOL_ADMIN && access.getRole() != UserRole.FINANCE_STAFF) {
            throw new ForbiddenException("User is not allowed to manage school finance.");
        }

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
