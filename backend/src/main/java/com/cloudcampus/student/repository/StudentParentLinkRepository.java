package com.cloudcampus.student.repository;

import com.cloudcampus.student.entity.StudentParentLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Data access for {@link StudentParentLink}.
 *
 * All methods operate within the active Hibernate tenant filter.
 */
public interface StudentParentLinkRepository extends JpaRepository<StudentParentLink, UUID> {

    /** All parent links for a student (ordered for deterministic display). */
    List<StudentParentLink> findAllByStudentIdOrderByIsPrimaryDescCreatedAtAsc(UUID studentId);

    long countByStudentId(UUID studentId);

    /** All student links for a parent (parent portal — "my children"). */
    List<StudentParentLink> findAllByParentUserIdOrderByCreatedAtAsc(UUID parentUserId);

    /** Look up a specific link between a student and a parent user. */
    Optional<StudentParentLink> findByStudentIdAndParentUserId(UUID studentId, UUID parentUserId);

    Optional<StudentParentLink> findByIdAndTenantId(UUID id, UUID tenantId);

    /** Check if a parent is already linked to a student. */
    boolean existsByStudentIdAndParentUserId(UUID studentId, UUID parentUserId);

    /**
     * Clear primary flag for all existing links of a student before marking a
     * new one as primary (ensures the partial unique index in V18 is satisfied).
     */
    @Modifying
    @Query("UPDATE StudentParentLink l SET l.isPrimary = false WHERE l.studentId = :studentId")
    void clearPrimaryForStudent(@Param("studentId") UUID studentId);
}
