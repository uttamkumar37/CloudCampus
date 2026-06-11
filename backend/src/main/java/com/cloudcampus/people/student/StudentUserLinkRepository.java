package com.cloudcampus.people.student;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentUserLinkRepository extends JpaRepository<StudentUserLink, String> {

    boolean existsByUserIdAndStudentIdAndActiveTrue(String userId, String studentId);

    Optional<StudentUserLink> findByUserIdAndStudentId(String userId, String studentId);

    Optional<StudentUserLink> findByUserIdAndActiveTrue(String userId);
}
