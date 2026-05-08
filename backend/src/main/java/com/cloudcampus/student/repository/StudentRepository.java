package com.cloudcampus.student.repository;

import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.entity.StudentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    boolean existsByAdmissionNo(String admissionNo);

    Optional<Student> findByAdmissionNo(String admissionNo);

    Optional<Student> findByIdAndDeletedAtIsNull(UUID id);

    Page<Student> findAllByDeletedAtIsNull(Pageable pageable);

    Page<Student> findAllByStatusAndDeletedAtIsNull(StudentStatus status, Pageable pageable);

    long countByActiveTrue();

    List<Student> findTop5ByOrderByCreatedAtDesc();

    long countByCreatedAtAfter(Instant createdAt);

    Optional<Student> findByLinkedUser_Id(UUID userId);

    Optional<Student> findByEmailIgnoreCase(String email);

    Optional<Student> findFirstByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);

    @Query("SELECT s FROM Student s WHERE s.deletedAt IS NULL " +
           "AND (LOWER(s.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(s.admissionNo) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Student> searchStudents(@Param("search") String search, Pageable pageable);

    @Query("SELECT s FROM Student s WHERE s.deletedAt IS NULL " +
           "AND (LOWER(s.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(s.admissionNo) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND s.status = :status")
    Page<Student> searchStudentsWithStatus(
            @Param("search") String search,
            @Param("status") StudentStatus status,
            Pageable pageable
    );
}
