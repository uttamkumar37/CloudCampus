package com.cloudcampus.people.student;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, String> {

    boolean existsBySchoolIdAndAdmissionNumber(String schoolId, String admissionNumber);

    Optional<Student> findBySchoolIdAndAdmissionNumber(String schoolId, String admissionNumber);

    Optional<Student> findByUserId(String userId);

    Optional<Student> findBySchoolIdAndUserId(String schoolId, String userId);

    List<Student> findBySchoolIdOrderByAdmissionNumberAsc(String schoolId);

    long countByTenantId(String tenantId);
}
