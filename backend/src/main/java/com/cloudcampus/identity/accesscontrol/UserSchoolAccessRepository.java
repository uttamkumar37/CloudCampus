package com.cloudcampus.identity.accesscontrol;

import java.util.List;
import java.util.Optional;

import com.cloudcampus.identity.auth.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSchoolAccessRepository extends JpaRepository<UserSchoolAccess, String> {

    Optional<UserSchoolAccess> findByUserIdAndSchoolId(String userId, String schoolId);

    List<UserSchoolAccess> findByUserId(String userId);

    boolean existsByUserIdAndSchoolId(String userId, String schoolId);

    List<UserSchoolAccess> findBySchoolIdAndRoleOrderByGrantedAtAsc(String schoolId, UserRole role);

    long countBySchoolIdAndRole(String schoolId, UserRole role);
}
