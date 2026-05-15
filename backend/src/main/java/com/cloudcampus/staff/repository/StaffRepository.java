package com.cloudcampus.staff.repository;

import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.entity.StaffStatus;
import com.cloudcampus.staff.entity.StaffType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Data access for {@link Staff}.
 *
 * All methods operate within the active Hibernate tenant filter
 * (enabled by {@code TenantFilterAspect}).
 */
public interface StaffRepository extends JpaRepository<Staff, UUID> {

    /** All staff in a school ordered by last name, first name. */
    List<Staff> findAllBySchoolIdOrderByLastNameAscFirstNameAsc(UUID schoolId);

    /** Staff filtered by status. */
    List<Staff> findAllBySchoolIdAndStatusOrderByLastNameAscFirstNameAsc(
            UUID schoolId, StaffStatus status);

    /** Staff filtered by type (e.g. all TEACHER rows for timetabling). */
    List<Staff> findAllBySchoolIdAndStaffTypeOrderByLastNameAscFirstNameAsc(
            UUID schoolId, StaffType staffType);

    /** Staff in a specific department. */
    List<Staff> findAllByDepartmentIdOrderByLastNameAscFirstNameAsc(UUID departmentId);

    /** Staff in a department filtered by status. */
    List<Staff> findAllByDepartmentIdAndStatusOrderByLastNameAscFirstNameAsc(
            UUID departmentId, StaffStatus status);

    /** Lookup by unique employee number within a school. */
    Optional<Staff> findBySchoolIdAndEmployeeNumber(UUID schoolId, String employeeNumber);

    /** Uniqueness check before creating a new employee record. */
    boolean existsBySchoolIdAndEmployeeNumber(UUID schoolId, String employeeNumber);

    /**
     * Name-prefix search — case-insensitive on first or last name.
     * Used for quick lookup in the admin staff roster and timetable builder.
     */
    @Query("""
           SELECT s FROM Staff s
           WHERE s.schoolId = :schoolId
             AND (LOWER(s.firstName) LIKE LOWER(CONCAT(:q, '%'))
               OR LOWER(s.lastName)  LIKE LOWER(CONCAT(:q, '%')))
           ORDER BY s.lastName, s.firstName
           """)
    List<Staff> searchByName(@Param("schoolId") UUID schoolId, @Param("q") String query);

    /** Count for dashboard metric (e.g. total active teachers). */
    long countBySchoolIdAndStatus(UUID schoolId, StaffStatus status);

    /** Count for auto-generating employee numbers with a year prefix. */
    @Query("""
           SELECT COUNT(s) FROM Staff s
           WHERE s.schoolId = :schoolId
             AND s.employeeNumber LIKE CONCAT(:prefix, '%')
           """)
    long countBySchoolIdAndEmployeeNumberPrefix(
            @Param("schoolId") UUID schoolId,
            @Param("prefix") String prefix);

    /** Look up the staff profile linked to a login account (for teacher self-service). */
    Optional<Staff> findBySchoolIdAndUserId(UUID schoolId, UUID userId);

    // ── Super Admin analytics (native — bypasses tenant filter) ───────────────

    @Query(value = "SELECT COUNT(*) FROM staff WHERE status = 'ACTIVE'", nativeQuery = true)
    long countActiveGlobal();

    @Query(value = "SELECT tenant_id::text, COUNT(*) FROM staff WHERE status = 'ACTIVE' GROUP BY tenant_id", nativeQuery = true)
    List<Object[]> countActiveGroupedByTenant();
}
