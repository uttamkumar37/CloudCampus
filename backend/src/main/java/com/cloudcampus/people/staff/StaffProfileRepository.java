package com.cloudcampus.people.staff;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffProfileRepository extends JpaRepository<StaffProfile, String> {

    Optional<StaffProfile> findBySchoolIdAndUserId(String schoolId, String userId);

    boolean existsBySchoolIdAndEmployeeNumberIgnoreCase(String schoolId, String employeeNumber);
}
