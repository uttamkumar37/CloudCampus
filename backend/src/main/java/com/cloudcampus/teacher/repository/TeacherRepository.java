package com.cloudcampus.teacher.repository;

import com.cloudcampus.teacher.entity.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeacherRepository extends JpaRepository<Teacher, UUID> {

    boolean existsByEmployeeNo(String employeeNo);

    Optional<Teacher> findByEmployeeNo(String employeeNo);

    boolean existsByEmail(String email);

    Optional<Teacher> findByIdAndDeletedAtIsNull(UUID id);

    Page<Teacher> findAllByDeletedAtIsNull(Pageable pageable);

    long countByActiveTrue();

    List<Teacher> findTop5ByOrderByCreatedAtDesc();

    long countByCreatedAtAfter(Instant createdAt);

    Optional<Teacher> findByLinkedUser_Id(UUID userId);

    Optional<Teacher> findByEmailIgnoreCase(String email);

    Optional<Teacher> findFirstByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);
}
