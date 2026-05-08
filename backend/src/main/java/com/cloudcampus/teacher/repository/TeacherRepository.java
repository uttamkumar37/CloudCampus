package com.cloudcampus.teacher.repository;

import com.cloudcampus.teacher.entity.Teacher;
import com.cloudcampus.teacher.entity.TeacherStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    Page<Teacher> findAllByStatusAndDeletedAtIsNull(TeacherStatus status, Pageable pageable);

    long countByActiveTrue();

    List<Teacher> findTop5ByOrderByCreatedAtDesc();

    long countByCreatedAtAfter(Instant createdAt);

    Optional<Teacher> findByLinkedUser_Id(UUID userId);

    Optional<Teacher> findByEmailIgnoreCase(String email);

    Optional<Teacher> findFirstByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);

    @Query("SELECT t FROM Teacher t WHERE t.deletedAt IS NULL " +
           "AND (LOWER(t.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(t.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(t.employeeNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(t.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Teacher> searchTeachers(@Param("search") String search, Pageable pageable);

    @Query("SELECT t FROM Teacher t WHERE t.deletedAt IS NULL " +
           "AND (LOWER(t.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(t.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(t.employeeNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(t.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND t.status = :status")
    Page<Teacher> searchTeachersWithStatus(
            @Param("search") String search,
            @Param("status") TeacherStatus status,
            Pageable pageable
    );
}
