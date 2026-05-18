package com.cloudcampus.student.repository;

import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.entity.StudentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Data access for {@link Student}.
 *
 * All methods operate within the active Hibernate tenant filter
 * (enabled by {@code TenantFilterAspect}).
 */
public interface StudentRepository extends JpaRepository<Student, UUID> {

    /** All students in a school, ordered by last name then first name. */
    List<Student> findAllBySchoolIdOrderByLastNameAscFirstNameAsc(UUID schoolId);

    /** Paginated — use for API responses to cap result size (CRIT-20). */
    Page<Student> findAllBySchoolIdOrderByLastNameAscFirstNameAsc(UUID schoolId, Pageable pageable);

    /** Students in a school filtered by status. */
    List<Student> findAllBySchoolIdAndStatusOrderByLastNameAscFirstNameAsc(
            UUID schoolId, StudentStatus status);

    /** Paginated — use for API responses to cap result size (CRIT-20). */
    Page<Student> findAllBySchoolIdAndStatusOrderByLastNameAscFirstNameAsc(
            UUID schoolId, StudentStatus status, Pageable pageable);

    /** Students assigned to a specific class. */
    List<Student> findAllByClassIdOrderByLastNameAscFirstNameAsc(UUID classId);

    /** Paginated — use for API responses to cap result size (CRIT-20). */
    Page<Student> findAllByClassIdOrderByLastNameAscFirstNameAsc(UUID classId, Pageable pageable);

    /** Students assigned to a specific section. */
    List<Student> findAllBySectionIdOrderByLastNameAscFirstNameAsc(UUID sectionId);

    /** Paginated — use for API responses to cap result size (CRIT-20). */
    Page<Student> findAllBySectionIdOrderByLastNameAscFirstNameAsc(UUID sectionId, Pageable pageable);

    /** Students in a class filtered by status. */
    List<Student> findAllByClassIdAndStatusOrderByLastNameAscFirstNameAsc(
            UUID classId, StudentStatus status);

    /** Students in a section filtered by status. */
    List<Student> findAllBySectionIdAndStatusOrderByLastNameAscFirstNameAsc(
            UUID sectionId, StudentStatus status);

    /** Find by unique student number within a school. */
    Optional<Student> findBySchoolIdAndStudentNumber(UUID schoolId, String studentNumber);

    /** Check uniqueness of student number before admission. */
    boolean existsBySchoolIdAndStudentNumber(UUID schoolId, String studentNumber);

    /**
     * Name search — case-insensitive prefix match on first or last name.
     * Used for quick lookup in admission and roster views.
     */
    @Query("""
           SELECT s FROM Student s
           WHERE s.schoolId = :schoolId
             AND (LOWER(s.firstName) LIKE LOWER(CONCAT(:q, '%'))
               OR LOWER(s.lastName)  LIKE LOWER(CONCAT(:q, '%')))
           ORDER BY s.lastName, s.firstName
           """)
    Page<Student> searchByName(@Param("schoolId") UUID schoolId, @Param("q") String query, Pageable pageable);

    /** Count active students per school (dashboard metric). */
    long countBySchoolIdAndStatus(UUID schoolId, StudentStatus status);

    /** Find next student number suffix for auto-generation. */
    @Query("""
           SELECT COUNT(s) FROM Student s
           WHERE s.schoolId = :schoolId
             AND s.studentNumber LIKE CONCAT(:prefix, '%')
           """)
    long countBySchoolIdAndStudentNumberPrefix(
            @Param("schoolId") UUID schoolId,
            @Param("prefix") String prefix);

    /** Students in a specific class+section filtered by status (used for bulk promotion). */
    List<Student> findAllByClassIdAndSectionIdAndStatusOrderByLastNameAscFirstNameAsc(
            UUID classId, UUID sectionId, StudentStatus status);

    /** Look up the student profile linked to a login account (for student self-service). */
    Optional<Student> findBySchoolIdAndUserId(UUID schoolId, UUID userId);

    /** Tenant-scoped lookup — use instead of findById() in authenticated flows. */
    Optional<Student> findByIdAndTenantId(UUID id, UUID tenantId);

    /** School + tenant scoped lookup for document and admin workflows. */
    Optional<Student> findByIdAndSchoolIdAndTenantId(UUID id, UUID schoolId, UUID tenantId);

    /** Look up the student profile by login account across any school (tenant-filtered by Hibernate). */
    Optional<Student> findByUserId(UUID userId);

    // ── Super Admin analytics (native — bypasses tenant filter) ───────────────

    @Query(value = "SELECT COUNT(*) FROM students WHERE status = 'ACTIVE'", nativeQuery = true)
    long countActiveGlobal();

    @Query(value = "SELECT tenant_id::text, COUNT(*) FROM students WHERE status = 'ACTIVE' GROUP BY tenant_id", nativeQuery = true)
    List<Object[]> countActiveGroupedByTenant();
}
