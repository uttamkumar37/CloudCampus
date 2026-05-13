package com.cloudcampus.assignment.repository;

import com.cloudcampus.assignment.entity.Assignment;
import com.cloudcampus.assignment.entity.AssignmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

    @Query("""
            SELECT a FROM Assignment a
             WHERE a.schoolId = :schoolId
               AND (:academicYearId IS NULL OR a.academicYearId = :academicYearId)
               AND (:classId   IS NULL OR a.classId   = :classId)
               AND (:sectionId IS NULL OR a.sectionId = :sectionId)
               AND (:status    IS NULL OR a.status    = :status)
             ORDER BY a.dueDate ASC, a.createdAt DESC
            """)
    Page<Assignment> findFiltered(
            @Param("schoolId") UUID schoolId,
            @Param("academicYearId") UUID academicYearId,
            @Param("classId") UUID classId,
            @Param("sectionId") UUID sectionId,
            @Param("status") AssignmentStatus status,
            Pageable pageable);

    Optional<Assignment> findBySchoolIdAndId(UUID schoolId, UUID id);
}
