package com.cloudcampus.school.repository;

import com.cloudcampus.school.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, UUID> {

    List<AcademicYear> findAllBySchoolIdOrderByStartDateDesc(UUID schoolId);

    Optional<AcademicYear> findByIdAndTenantId(UUID id, UUID tenantId);

    Optional<AcademicYear> findBySchoolIdAndIsCurrent(UUID schoolId, boolean isCurrent);

    boolean existsBySchoolIdAndName(UUID schoolId, String name);

    /**
     * Clears the is_current flag for all years belonging to the given school.
     * Called before setting a new current year to maintain the single-current invariant.
     */
    @Modifying
    @Query("UPDATE AcademicYear a SET a.isCurrent = false WHERE a.schoolId = :schoolId")
    void clearCurrentForSchool(@Param("schoolId") UUID schoolId);
}
