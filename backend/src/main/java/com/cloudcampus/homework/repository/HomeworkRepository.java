package com.cloudcampus.homework.repository;

import com.cloudcampus.homework.entity.HomeworkAssignment;
import com.cloudcampus.homework.entity.HomeworkStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface HomeworkRepository extends JpaRepository<HomeworkAssignment, UUID> {

    /** Paginated list filtered by school + academic year, with optional class/section/status. */
    @Query("""
            SELECT h FROM HomeworkAssignment h
             WHERE h.schoolId = :schoolId
               AND h.academicYearId = :academicYearId
               AND (:classId   IS NULL OR h.classId   = :classId)
               AND (:sectionId IS NULL OR h.sectionId = :sectionId)
               AND (:status    IS NULL OR h.status    = :status)
             ORDER BY h.dueDate ASC, h.createdAt DESC
            """)
    Page<HomeworkAssignment> findFiltered(
            @Param("schoolId") UUID schoolId,
            @Param("academicYearId") UUID academicYearId,
            @Param("classId") UUID classId,
            @Param("sectionId") UUID sectionId,
            @Param("status") HomeworkStatus status,
            Pageable pageable);

    Optional<HomeworkAssignment> findBySchoolIdAndId(UUID schoolId, UUID id);
}
