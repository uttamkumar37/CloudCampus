package com.cloudcampus.people.staff;

import java.util.List;
import java.util.Optional;

import com.cloudcampus.identity.auth.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffProfileRepository extends JpaRepository<StaffProfile, String> {

    Optional<StaffProfile> findBySchoolIdAndUserId(String schoolId, String userId);

    List<StaffProfile> findBySchoolIdOrderByFullNameAsc(String schoolId);

    List<StaffProfile> findBySchoolIdAndRoleOrderByFullNameAsc(String schoolId, UserRole role);

    boolean existsBySchoolIdAndEmployeeNumberIgnoreCase(String schoolId, String employeeNumber);

    long countByTenantId(String tenantId);

    long countBySchoolIdAndActiveTrue(String schoolId);
}
