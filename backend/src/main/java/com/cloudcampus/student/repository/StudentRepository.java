package com.cloudcampus.student.repository;

import com.cloudcampus.student.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    boolean existsByAdmissionNo(String admissionNo);

    Optional<Student> findByAdmissionNo(String admissionNo);

    Optional<Student> findByIdAndDeletedAtIsNull(UUID id);

    Page<Student> findAllByDeletedAtIsNull(Pageable pageable);

    long countByActiveTrue();

    List<Student> findTop5ByOrderByCreatedAtDesc();

    long countByCreatedAtAfter(Instant createdAt);

    Optional<Student> findByLinkedUser_Id(UUID userId);

    Optional<Student> findByEmailIgnoreCase(String email);

    Optional<Student> findFirstByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);
}
