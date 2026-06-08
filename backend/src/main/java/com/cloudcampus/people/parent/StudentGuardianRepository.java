package com.cloudcampus.people.parent;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentGuardianRepository extends JpaRepository<StudentGuardian, String> {

    boolean existsByGuardianUserIdAndStudentIdAndActiveTrue(String guardianUserId, String studentId);

    Optional<StudentGuardian> findByGuardianUserIdAndStudentId(String guardianUserId, String studentId);

    List<StudentGuardian> findByStudentIdOrderByCreatedAtDesc(String studentId);

    List<StudentGuardian> findByGuardianUserIdAndActiveTrue(String guardianUserId);
}
