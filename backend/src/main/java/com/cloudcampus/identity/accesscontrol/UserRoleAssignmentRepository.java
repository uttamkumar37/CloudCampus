package com.cloudcampus.identity.accesscontrol;

import java.util.Collection;
import java.util.List;

import com.cloudcampus.identity.auth.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleAssignmentRepository extends JpaRepository<UserRoleAssignment, String> {

    List<UserRoleAssignment> findByUserIdOrderByCreatedAtDesc(String userId);

    List<UserRoleAssignment> findByUserIdAndActiveTrue(String userId);

    List<UserRoleAssignment> findByUserIdIn(Collection<String> userIds);

    boolean existsByUserIdAndRoleAndTenantIdAndSchoolIdAndActiveTrue(
            String userId,
            UserRole role,
            String tenantId,
            String schoolId
    );
}
